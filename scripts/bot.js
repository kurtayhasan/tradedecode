import fetch from "node-fetch";
import fs from "fs";
import slugify from "slugify";

const HF_KEY = process.env.HF_API_KEY;
const MODEL = "mistralai/Mixtral-8x7B-Instruct-v0.1";

if (!HF_KEY) {
  console.error("Error: HF_API_KEY environment variable is not defined");
  process.exit(1);
}

function getRandomTopic() {
  const topics = fs.readFileSync("topics.txt", "utf8").split("\n").filter(line => line.trim() !== "");
  return topics[Math.floor(Math.random() * topics.length)];
}

async function generateContent(topic) {
  const prompt = `Write a high-quality SEO optimized article in English about: ${topic}

Rules:
- 900 to 1500 words
- Use H1, H2, H3 headings
- Provide real value, avoid fluff
- Include an introduction and conclusion
- Create short meta description
- No plagiarism`;

  try {
    const res = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + HF_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
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
    const text = await generateContent(topic);
    const slug = slugify(topic, { lower: true });
    const date = new Date().toISOString().split("T")[0];

    const output = `---
title: "${topic}"
description: "AI Generated — ${topic}"
date: "${date}"
slug: "${slug}"
---

${text}`;

    const filePath = `src/content/posts/${date}-${slug}.md`;
    fs.writeFileSync(filePath, output);
    console.log("Post generated:", filePath);
  } catch (error) {
    console.error("Error in main function:", error.message);
    process.exit(1);
  }
}

main();
