#!/usr/bin/env node

/**
 * 🔄 Git Account Change Helper
 * Step-by-step guide to change your Git/GitHub account
 */

console.log(`
🔄 CHANGE GIT/GITHUB ACCOUNT GUIDE

📋 OPTION 1: Change Git Configuration Only
Run these commands with YOUR NEW account details:

git config --global user.name "Your New Name"
git config --global user.email "your.new.email@gmail.com"

📋 OPTION 2: Complete Account Switch (Recommended)

1️⃣ UPDATE GIT CONFIGURATION
git config --global user.name "Your New Name"
git config --global user.email "your.new.email@gmail.com"

2️⃣ CLEAR GITHUB CREDENTIALS (Windows)
# Open Credential Manager:
# Windows Key → Search "Credential Manager" → Windows Credentials
# Find "git:https://github.com" and DELETE it
# Next time you push, it will ask for new credentials

3️⃣ OR CLEAR VIA COMMAND LINE
git config --global --unset credential.helper
git config --global credential.helper manager-core

4️⃣ VERIFY CHANGES
git config --global user.name
git config --global user.email

5️⃣ TEST WITH GITHUB
# When you push to GitHub, it will prompt for new credentials
# Use your NEW GitHub username and password/token

🔐 GITHUB PERSONAL ACCESS TOKEN (Recommended)
Instead of password, use a Personal Access Token:
1. Go to GitHub.com → Settings → Developer settings
2. Personal access tokens → Generate new token
3. Select scopes: repo, workflow, user
4. Use this token as your password when prompted

✅ VERIFICATION
After changing, run:
git config --global --list

Your new account should be shown!

💡 Pro Tips:
• Make sure your new email matches your GitHub account
• If you have GitHub CLI: gh auth logout && gh auth login
• Clear browser cookies for github.com if needed
`);
