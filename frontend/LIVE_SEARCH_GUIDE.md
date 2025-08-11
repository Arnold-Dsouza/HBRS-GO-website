# HBRS Gemini Chatbot with Live Search

Your HBRS chatbot now has **live web search capabilities** that can fetch current information from the internet and combine it with Gemini AI's intelligence!

## 🚀 New Features

### ✅ **Smart Search Detection**
The chatbot automatically detects when you're asking for current information:
- Questions with words like: "current", "latest", "recent", "now", "today", "2025"
- Topics like: "schedule", "deadlines", "admission", "semester dates", "new programs"

### ✅ **Multi-Tier Search Strategy**
1. **Primary**: Professional Search API (if configured)
2. **Fallback**: DuckDuckGo API (free, no key needed)
3. **Guidance**: Helpful directions to official sources

### ✅ **Source Transparency**
- 🌐 Responses clearly indicate when information comes from web search
- 📚 Shows when using knowledge base vs. live data
- Always references official HBRS sources

## 🔧 Setup Options

### Option 1: Basic Setup (Free)
Your chatbot already works with free search using DuckDuckGo:
- No additional setup required
- Works immediately
- Limited search results but functional

### Option 2: Enhanced Search (Recommended)
For better search results, add a search API key:

1. **Get a Free Search API Key:**
   - Visit [Serper.dev](https://serper.dev) (2,500 free searches/month)
   - Or try [SerpAPI](https://serpapi.com) (100 free searches/month)

2. **Add to Environment:**
   ```bash
   # Add this line to your .env.local file
   SEARCH_API_KEY=your_search_api_key_here
   ```

## 🎯 How It Works

### Automatic Search Triggers
The chatbot searches for live information when you ask questions like:
- "What are the current admission deadlines for HBRS?"
- "What new programs does HBRS offer in 2025?"
- "What are the latest semester dates?"
- "Are there any recent announcements from HBRS?"

### Knowledge Base Questions
For general questions, it uses the built-in knowledge:
- "What departments does HBRS have?"
- "Where are the HBRS campuses located?"
- "What is HBRS known for?"

## 🧪 Testing Examples

Try these questions to see the live search in action:

### Current Information (Triggers Search)
```
- "What are the current admission deadlines for HBRS?"
- "What events are happening at HBRS this semester?"
- "What are the latest course offerings in computer science?"
- "Are there any recent news from HBRS?"
```

### General Information (Uses Knowledge Base)
```
- "What programs does HBRS offer?"
- "How many campuses does HBRS have?"
- "What is the history of HBRS?"
```

## 📊 Response Indicators

**Live Search Results:**
> 🌐 *This response includes current information found online.*

**Knowledge Base:**
> 📚 *This response is based on my knowledge base. For the most current information, please check the official HBRS website at h-brs.de*

## 🔍 Search Strategy Details

### What Gets Searched:
- Official HBRS website (h-brs.de)
- HBRS-related content across the web
- Recent announcements and updates
- Academic calendar information

### Search Quality Levels:
1. **Professional API**: High-quality, comprehensive results
2. **DuckDuckGo**: Basic but functional results
3. **Fallback**: Helpful guidance to official sources

## ⚡ Performance Notes

- Search typically adds 1-3 seconds to response time
- Results are prioritized over knowledge base
- Failed searches gracefully fall back to knowledge base
- All searches focus specifically on HBRS content

## 🛠 Troubleshooting

### If Search Isn't Working:
1. Check your internet connection
2. Verify the search API key (if using enhanced search)
3. Try rephrasing with current/recent keywords
4. Check browser console for error messages

### Search Not Triggered:
- Add keywords like "current", "latest", "recent" to your question
- Ask about specific dates or deadlines
- Mention "today" or the current year

## 🔒 Privacy & Security

- No personal data is sent to search APIs
- Only HBRS-related queries are searched
- Search results are processed through Gemini's safety filters
- All searches are logged for debugging purposes only

## 🎯 Best Practices

### For Current Information:
- Be specific about what current info you need
- Mention timeframes (e.g., "this semester", "2025")
- Ask about deadlines, schedules, or recent updates

### For General Information:
- Ask broad questions about HBRS
- Request explanations of programs or services
- Inquire about campus facilities or history

Your HBRS chatbot is now much more powerful and can provide both comprehensive knowledge and up-to-the-minute information!
