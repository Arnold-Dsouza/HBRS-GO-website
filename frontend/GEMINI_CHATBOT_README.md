# HBRS Gemini Chatbot Setup Guide

This chatbot is powered by Google's Gemini AI and is specifically trained to answer questions about Hochschule Bonn-Rhein-Sieg (HBRS). It runs entirely in the frontend without requiring a backend database.

## Features

- ✅ Frontend-only implementation (no backend database required)
- ✅ Powered by Google Gemini AI
- ✅ Specifically trained on HBRS information
- ✅ Filters out non-HBRS related questions
- ✅ Maintains conversation context
- ✅ Modern, responsive UI

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key

### 2. Configure Environment Variables

1. Open the file `frontend/.env.local`
2. Replace `your_gemini_api_key_here` with your actual Gemini API key:
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies (if needed)

The chatbot uses existing dependencies, but make sure you have all required packages:

```bash
cd frontend
npm install
```

### 4. Run the Application

```bash
npm run dev
```

The chatbot will be available as a floating button in the bottom-right corner of your application.

## How It Works

### Knowledge Base
The chatbot uses a comprehensive knowledge base about HBRS including:
- Academic programs and departments
- Campus facilities and services
- Student life and activities
- Admission requirements
- Academic calendar
- Research opportunities
- Contact information

### Smart Filtering
The chatbot automatically:
- Identifies HBRS-related questions
- Redirects off-topic questions back to HBRS matters
- Maintains conversation context
- Provides helpful and accurate information

### File Structure

```
frontend/
├── .env.local                           # Environment variables (API key)
├── src/
│   ├── components/
│   │   └── Chatbot.tsx                  # Main chatbot component
│   └── services/
│       ├── gemini.ts                    # Gemini AI service
│       └── hbrs-knowledge.ts            # HBRS knowledge base
└── pages/
    └── api/
        └── gemini-chatbot.js            # API route for Gemini
```

## Customization

### Adding More HBRS Information
Edit `frontend/src/services/hbrs-knowledge.ts` to add more specific information about HBRS.

### Modifying AI Behavior
Adjust the system prompt in `hbrs-knowledge.ts` to change how the AI responds to questions.

### UI Customization
Modify `frontend/src/components/Chatbot.tsx` to change the appearance and behavior of the chat interface.

## Troubleshooting

### API Key Issues
- Make sure your Gemini API key is correctly set in `.env.local`
- Ensure the key has the necessary permissions
- Check the browser console for any API-related errors

### Questions Not Working
- The chatbot only answers HBRS-related questions
- Try rephrasing your question to include HBRS-specific terms
- Check that your question is related to university matters

### Technical Issues
- Restart the development server after changing environment variables
- Clear browser cache if experiencing strange behavior
- Check browser console for error messages

## Security Notes

- The API key is exposed in the frontend (NEXT_PUBLIC_ prefix)
- Consider implementing rate limiting for production use
- Monitor API usage to avoid unexpected charges
- For production, consider using a backend proxy to hide the API key

## Support

For technical issues with the chatbot implementation, check:
1. Browser developer console for errors
2. Network tab for failed API requests
3. Environment variable configuration

For HBRS-specific information, the chatbot will direct users to official HBRS resources when appropriate.
