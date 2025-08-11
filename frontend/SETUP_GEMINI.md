# Quick Setup for HBRS Gemini Chatbot

## Step 1: Get your Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create new API key
4. Copy the key

## Step 2: Add API Key to Environment
1. Open: `frontend/.env.local`
2. Replace `your_gemini_api_key_here` with your actual key
3. Save the file

## Step 3: Run the Application
```bash
cd frontend
npm run dev
```

The chatbot will appear as a floating HBRS logo button in the bottom-right corner.

## Features
- Frontend-only (no backend needed)
- HBRS-specific knowledge
- Powered by Google Gemini AI
- Conversation memory
- Smart topic filtering

## Note
The chatbot only answers questions related to HBRS (Hochschule Bonn-Rhein-Sieg). 
It will politely redirect off-topic questions back to HBRS matters.
