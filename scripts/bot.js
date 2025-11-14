import fetch from "node-fetch";
import fs from "fs";
import slugify from "slugify";

const HF_KEY = process.env.HF_API_KEY;
// Using a more reliable model that's always available
const MODEL = "meta-llama/Llama-3.2-3B-Instruct";
const USED_TOPICS_FILE = "used_topics.txt";
const MIN_CONTENT_LENGTH = 800; // Minimum character count for quality control

if (!HF_KEY) {
  console.error("Error: HF_API_KEY environment variable is not defined");
  process.exit(1);
}

function getUsedTopics() {
  if (!fs.existsSync(USED_TOPICS_FILE)) {
    fs.writeFileSync(USED_TOPICS_FILE, "");
    return [];
  }
  return fs.readFileSync(USED_TOPICS_FILE, "utf8")
    .split("\n")
    .filter(line => line.trim() !== "");
}

function markTopicAsUsed(topic) {
  const used = getUsedTopics();
  used.push(topic);
  fs.writeFileSync(USED_TOPICS_FILE, used.join("\n") + "\n");
}

function getRandomTopic() {
  const allTopics = fs.readFileSync("topics.txt", "utf8")
    .split("\n")
    .filter(line => line.trim() !== "");
  
  const usedTopics = getUsedTopics();
  const availableTopics = allTopics.filter(topic => !usedTopics.includes(topic));
  
  // If all topics used, reset
  if (availableTopics.length === 0) {
    console.log("All topics used, resetting...");
    fs.writeFileSync(USED_TOPICS_FILE, "");
    return allTopics[Math.floor(Math.random() * allTopics.length)];
  }
  
  return availableTopics[Math.floor(Math.random() * availableTopics.length)];
}

function extractMetadata(text) {
  // Try to extract title and description from AI output
  const titleMatch = text.match(/TITLE:\s*(.+?)(?:\n|$)/i);
  const descMatch = text.match(/META_DESCRIPTION:\s*(.+?)(?:\n|$)/i);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : null,
    description: descMatch ? descMatch[1].trim() : null,
    content: text.replace(/TITLE:.*?\n/gi, "").replace(/META_DESCRIPTION:.*?\n/gi, "").trim()
  };
}

async function generateContent(topic) {
  const prompt = `You are a professional trading and cryptocurrency content writer. Write a comprehensive, SEO-optimized article in English.

IMPORTANT: Start your response with these exact lines:
TITLE: [Write an engaging, SEO-friendly title here]
META_DESCRIPTION: [Write a compelling 150-160 character meta description here]

Then write the full article about: ${topic}

Article Requirements:
- 1000 to 1500 words minimum
- Use proper H1, H2, H3 markdown headings (# ## ###)
- Include an engaging introduction
- Provide actionable insights and real value
- Use bullet points and lists where appropriate
- Include a strong conclusion
- Write in a professional yet accessible tone
- Focus on practical information
- No fluff or filler content
- Ensure content is unique and valuable

Write the article now:`;

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + HF_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.7,
          top_p: 0.95
        }
      }),
    });

    if (!res.ok) {
      console.error(`API request failed with status ${res.status}`);
      process.exit(1);
    }

    const data = await res.json();
    return data[0]?.generated_text || "";
  } catch (error) {
    console.error("Error calling HuggingFace API:", error.message);
    process.exit(1);
  }
}

async function main() {
  try {
    const topic = getRandomTopic();
    console.log(`Generating content for: ${topic}`);
    
    const rawText = await generateContent(topic);
    
    // Quality check
    if (rawText.length < MIN_CONTENT_LENGTH) {
      console.warn(`Content too short (${rawText.length} chars). Skipping this generation.`);
      process.exit(0);
    }
    
    // Extract metadata
    const { title, description, content } = extractMetadata(rawText);
    
    const finalTitle = title || topic;
    const finalDescription = description || `Comprehensive guide about ${topic} - trading insights and strategies`;
    const slug = slugify(finalTitle, { lower: true, strict: true });
    const date = new Date().toISOString().split("T")[0];

    const output = `---
title: "${finalTitle}"
description: "${finalDescription}"
date: "${date}"
slug: "${slug}"
author: "TradeDecode AI"
tags: ["trading", "cryptocurrency", "finance"]
---

${content}`;

    const filePath = `src/content/posts/${date}-${slug}.md`;
    fs.writeFileSync(filePath, output);
    
    // Mark topic as used
    markTopicAsUsed(topic);
    
    console.log("✓ Post generated successfully:", filePath);
    console.log(`  Title: ${finalTitle}`);
    console.log(`  Length: ${content.length} characters`);
  } catch (error) {
    console.error("Error in main function:", error.message);
    process.exit(1);
  }
}

main();
