# 📖 Manual Content Generation Guide

## 🚀 Quick Start (Windows)

### Step 1: Set Your API Key (One Time Setup)

Open Command Prompt and run:
```cmd
setx HF_API_KEY "your_huggingface_api_key_here"
```

**Important:** Close and reopen Command Prompt after this!

### Step 2: Generate Content

Simply double-click: **`generate-and-push.bat`**

Or run in Command Prompt:
```cmd
cd tradedecode-auto-blog
generate-and-push.bat
```

That's it! The script will:
1. ✅ Install dependencies
2. ✅ Generate new AI content
3. ✅ Commit changes
4. ✅ Push to GitHub
5. ✅ Netlify auto-deploys

---

## 🐧 For Linux/Mac Users

### Step 1: Set Your API Key
```bash
export HF_API_KEY="your_huggingface_api_key_here"
```

Add to `~/.bashrc` or `~/.zshrc` to make it permanent:
```bash
echo 'export HF_API_KEY="your_key_here"' >> ~/.bashrc
source ~/.bashrc
```

### Step 2: Generate Content
```bash
cd tradedecode-auto-blog
npm install
npm run bot
git add .
git commit -m "Auto content update"
git push origin main
```

---

## 🔑 Getting Your HuggingFace API Key

1. Go to: https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it: "tradedecode-bot"
4. Role: "Read"
5. Click "Generate token"
6. Copy the token

---

## ⏰ Recommended Schedule

Run the script **every 4 hours** or **2-3 times per day**:
- Morning (9 AM)
- Afternoon (2 PM)
- Evening (7 PM)

---

## 🔍 Troubleshooting

### "HF_API_KEY is not set"
- Make sure you ran `setx HF_API_KEY "your_key"`
- Close and reopen Command Prompt
- Check with: `echo %HF_API_KEY%`

### "Content generation failed"
- Check your internet connection
- Verify API key is correct
- Check HuggingFace API status

### "Push failed"
- Make sure you're logged into Git
- Check: `git config --global user.name`
- Check: `git config --global user.email`

### "Nothing to commit"
- Content might be too short (quality check)
- Check console output for details
- Try running again

---

## 📊 Monitoring

After running the script:
1. Check GitHub: https://github.com/kurtayhasan/tradedecode
2. Wait 2-3 minutes for Netlify deploy
3. Visit: https://tradedecode.com

---

## 🎯 Advanced: Windows Task Scheduler

To automate without CI/CD:

1. Open "Task Scheduler"
2. Create Basic Task
3. Name: "TradeDecode Content Generator"
4. Trigger: Daily, repeat every 4 hours
5. Action: Start a program
6. Program: `C:\path\to\tradedecode-auto-blog\generate-and-push.bat`
7. Done!

---

## 💡 Tips

- Run during off-peak hours for faster API responses
- Check `used_topics.txt` to see which topics were used
- All topics will reset automatically when exhausted
- Each run creates one new article
- Quality control ensures minimum 800 characters

---

## 📞 Need Help?

Check the logs in Command Prompt for detailed error messages.
