import fetch from "node-fetch";
import fs from "fs";
import slugify from "slugify";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using gemini-2.5-flash-lite model with v1beta API
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const USED_TOPICS_FILE = "used_topics.txt";
const MIN_CONTENT_LENGTH = 800;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not defined");
  console.error("Get your free API key from: https://makersuite.google.com/app/apikey");
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
TITLE: [Write an engaging, SEO-friendly title about ${topic}]
META_DESCRIPTION: [Write a compelling 150-160 character meta description]

Then write the full article about: ${topic}

Article Requirements:
- 800 to 100 words
- Use proper markdown headings (# ## ###)
- Include an engaging introduction
- Provide actionable insights and real value
- Use bullet points and lists where appropriate
- Include a strong conclusion
- Write in a professional yet accessible tone
- Focus on practical information for traders
- No fluff or filler content
- Ensure content is unique and valuable

Write the complete article now:`;

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Gemini API request failed with status ${res.status}`);
      console.error(`Error details: ${errorText}`);
      process.exit(1);
    }

    const data = await res.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    if (!generatedText) {
      console.error("No content generated from Gemini API");
      process.exit(1);
    }
    
    return generatedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error.message);
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
