import fetch from "node-fetch";
import fs from "fs";
import slugify from "slugify";

const HF_KEY = process.env.HF_API_KEY;
// Using GPT-2 which is always available on HuggingFace free tier
const MODEL = "openai-community/gpt2-large";
const USED_TOPICS_FILE = "used_topics.txt";
const MIN_CONTENT_LENGTH = 500; // Lowered for GPT-2's shorter outputs

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
  const prompt = `Write a detailed article about ${topic}.

# ${topic}

## Introduction

${topic} is an important topic in trading and cryptocurrency. Here's what you need to know:

## Key Points

`;

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
          max_length: 800,
          temperature: 0.8,
          top_p: 0.9,
          do_sample: true
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
