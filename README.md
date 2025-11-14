# TradeDecode Auto Blog

Fully automated AI-powered blog using Astro + GitLab CI/CD + Google Gemini API.

## How automation works:

1. GitLab CI/CD runs every 4 hours
2. scripts/bot.js generates a new Markdown file using Gemini AI
3. Commit → push → Netlify deploys automatically

## Setup:

- Get free Gemini API key: https://makersuite.google.com/app/apikey
- Add GitLab Variable: GEMINI_API_KEY
- Connect repo to Netlify
- Edit topics.txt to control content
