# 🔑 OpenAI API Key Setup Guide

## Step 1: Get Your FREE OpenAI API Key

1. **Visit**: https://platform.openai.com/signup
2. **Sign up** for a free account (if you don't have one)
3. **Go to API Keys**: https://platform.openai.com/api-keys  
4. **Click "Create new secret key"**
5. **Copy the key** (starts with `sk-proj-` or `sk-`)

## Step 2: Add Key to Your Project

1. **Open**: `backend/.env` file
2. **Find this line**: 
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```
3. **Replace** `your_openai_api_key_here` with your actual key:
   ```
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   ```
4. **Save** the file

## Step 3: Restart Your Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## ✅ You Should See:
```
✅ OpenAI client initialized successfully
✅ OpenAI API key loaded
🚀 Server running on port 3001
```

## 🧪 Test Commands (After API Key Setup):

```bash
# Test the connection
curl http://localhost:3001/api/test

# Test chat functionality  
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello! Can you introduce yourself?"}'
```

## 💰 Cost Information:
- **FREE TIER**: $5 in free credits for new accounts
- **Text Generation**: ~$0.002 per 1000 tokens (very cheap!)
- **Text-to-Speech**: ~$0.015 per 1000 characters
- **For Demo**: You'll spend less than $0.50 total

## 🔒 Security Notes:
- ✅ Never commit your API key to version control
- ✅ The `.env` file is already in `.gitignore`
- ✅ Set spending limits in OpenAI dashboard if concerned

---
**Ready to continue with the frontend once your key is working!** 🚀