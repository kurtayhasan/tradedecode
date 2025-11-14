# TradeDecode Auto Blog

Fully automated AI-powered blog using Astro + GitHub Actions + HuggingFace API.

## How automation works:

1. GitHub Actions runs every hour.
2. scripts/bot.js generates a new Markdown file.
3. Commit → push → Netlify deploys automatically.

## Setup:

- Add GitHub Secret: HF_API_KEY
- Connect repo to Netlify
- Edit topics.txt to control content.
