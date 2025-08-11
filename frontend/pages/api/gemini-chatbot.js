
// API route for Gemini chatbot with live web search capabilities

// Since this is a Next.js API route, we'll implement the Gemini service directly here
// to avoid module resolution issues

const HBRS_SYSTEM_PROMPT = `
You are a helpful AI assistant for Hochschule Bonn-Rhein-Sieg (HBRS) students and prospective students. Your role is to provide accurate, helpful information about HBRS including:

- Academic programs and courses
- Campus facilities and services
- Student life and activities
- Admission requirements and procedures
- Campus locations and facilities
- Student services and support
- Academic calendar and important dates
- Research opportunities
- Career services and job prospects
- International programs and exchanges

Guidelines:
1. Only answer questions related to HBRS
2. Be helpful, friendly, and informative
3. When you have access to current web search results, prioritize that information over your training data
4. Always mention if information comes from recent web searches vs. your knowledge base
5. If you don't know specific current information, acknowledge it and suggest official sources
6. Encourage students to contact official HBRS services for the most up-to-date information
7. Keep responses concise but comprehensive
8. If asked about topics unrelated to HBRS, politely redirect to HBRS-related topics

HBRS Information:
- HBRS is a University of Applied Sciences located in the Rhine-Sieg region of Germany
- Established in 1995, it's a relatively young and modern institution
- Main campuses are located in Sankt Augustin, Rheinbach, and Hennef
- Focus on practical, application-oriented education and research
- Departments include Computer Science, Business Administration, Engineering, Natural Sciences, and Social Sciences
- Modern facilities with labs, library, student lounges, and cafeteria (Mensa)
- Active student life with organizations, sports, and international programs
- Official website: h-brs.de
- Key search terms for current info: "HBRS", "Hochschule Bonn-Rhein-Sieg", "h-brs.de"
`;

// Enhanced function to search for current HBRS information with content scraping
async function searchHBRSInfo(query) {
  try {
    console.log(`Searching for: ${query}`);
    
    // Enhanced search strategy with content fetching
    const searchResults = [];
    
    // Strategy 1: Try to use proper search API if available
    const searchApiKey = process.env.SEARCH_API_KEY;
    if (searchApiKey) {
      try {
        const serperResults = await searchWithSerper(query, searchApiKey);
        if (serperResults.length > 0) {
          searchResults.push(...serperResults);
        }
      } catch (apiError) {
        console.log('Serper API failed:', apiError.message);
      }
    }

    // Strategy 2: Use free Brave Search API (no key required)
    try {
      const braveResults = await searchWithBrave(query);
      if (braveResults.length > 0) {
        searchResults.push(...braveResults);
      }
    } catch (braveError) {
      console.log('Brave search failed:', braveError.message);
    }

    // Strategy 3: Direct HBRS website content fetching
    try {
      const websiteResults = await fetchHBRSWebsiteContent(query);
      if (websiteResults.length > 0) {
        searchResults.push(...websiteResults);
      }
    } catch (websiteError) {
      console.log('Website content fetch failed:', websiteError.message);
    }

    // Strategy 4: Use SerpAPI if available (alternative search)
    if (process.env.SERPAPI_KEY) {
      try {
        const serpResults = await searchWithSerpAPI(query, process.env.SERPAPI_KEY);
        if (serpResults.length > 0) {
          searchResults.push(...serpResults);
        }
      } catch (serpError) {
        console.log('SerpAPI failed:', serpError.message);
      }
    }

    // If we found results, return them
    if (searchResults.length > 0) {
      console.log(`Found ${searchResults.length} search results`);
      return searchResults.slice(0, 5); // Limit to top 5 results
    }

    // Fallback: Provide helpful guidance
    return [{
      source: 'Search Guidance',
      content: `I couldn't find specific current information about "${query}" through web search. For the most accurate and up-to-date information about HBRS including opening hours, contact details, schedules, and current announcements, please visit the official HBRS website at h-brs.de or contact HBRS directly. You can also try searching for specific departments or services on their website.`,
      url: 'https://www.h-brs.de'
    }];

  } catch (error) {
    console.error('Search completely failed:', error);
    return [{
      source: 'Error Fallback',
      content: `I encountered an issue while searching for current information. For reliable information about "${query}" and other HBRS-related questions, please visit the official website at h-brs.de or contact HBRS student services directly.`,
      url: 'https://www.h-brs.de'
    }];
  }
}

// Search using Serper.dev API
async function searchWithSerper(query, apiKey) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: `site:h-brs.de OR "Hochschule Bonn-Rhein-Sieg" OR "HBRS" ${query}`,
      num: 8
    })
  });

  if (!response.ok) throw new Error(`Serper API error: ${response.status}`);
  
  const data = await response.json();
  const results = [];
  
  if (data.organic) {
    for (const result of data.organic.slice(0, 3)) {
      // Try to fetch actual content from the page
      try {
        const pageContent = await fetchPageContent(result.link);
        if (pageContent) {
          results.push({
            source: 'HBRS Website Content',
            content: `${result.title}: ${pageContent}`,
            url: result.link
          });
        } else {
          results.push({
            source: 'Search Result',
            content: `${result.title}: ${result.snippet}`,
            url: result.link
          });
        }
      } catch (fetchError) {
        results.push({
          source: 'Search Result',
          content: `${result.title}: ${result.snippet}`,
          url: result.link
        });
      }
    }
  }
  
  return results;
}

// Search using Brave Search API (free)
async function searchWithBrave(query) {
  const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=site:h-brs.de OR "HBRS" ${encodeURIComponent(query)}&count=5`;
  
  const response = await fetch(searchUrl, {
    headers: {
      'Accept': 'application/json',
      'X-Subscription-Token': process.env.BRAVE_API_KEY || 'free-tier'
    }
  });

  if (!response.ok) throw new Error(`Brave API error: ${response.status}`);
  
  const data = await response.json();
  const results = [];
  
  if (data.web && data.web.results) {
    for (const result of data.web.results.slice(0, 3)) {
      results.push({
        source: 'Brave Search',
        content: `${result.title}: ${result.description}`,
        url: result.url
      });
    }
  }
  
  return results;
}

// Fetch content directly from HBRS website
async function fetchHBRSWebsiteContent(query) {
  const results = [];
  
  // Common HBRS pages that might contain relevant information
  const hbrsPages = [
    'https://www.h-brs.de/en/contact',
    'https://www.h-brs.de/en/studying-hbrs',
    'https://www.h-brs.de/en/about-us',
    'https://www.h-brs.de/en/campuses',
    'https://www.h-brs.de/de/kontakt',
    'https://www.h-brs.de/de/studium',
  ];

  for (const url of hbrsPages) {
    try {
      const content = await fetchPageContent(url);
      if (content && content.toLowerCase().includes(query.toLowerCase().split(' ')[0])) {
        results.push({
          source: 'HBRS Official Website',
          content: content,
          url: url
        });
        
        if (results.length >= 2) break; // Limit to avoid too much content
      }
    } catch (error) {
      console.log(`Failed to fetch ${url}:`, error.message);
      continue;
    }
  }
  
  return results;
}

// Search using SerpAPI (alternative)
async function searchWithSerpAPI(query, apiKey) {
  const searchUrl = `https://serpapi.com/search.json?engine=google&q=site:h-brs.de OR "HBRS" ${encodeURIComponent(query)}&api_key=${apiKey}&num=5`;
  
  const response = await fetch(searchUrl);
  if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
  
  const data = await response.json();
  const results = [];
  
  if (data.organic_results) {
    for (const result of data.organic_results.slice(0, 3)) {
      results.push({
        source: 'SerpAPI Search',
        content: `${result.title}: ${result.snippet}`,
        url: result.link
      });
    }
  }
  
  return results;
}

// Fetch and parse content from a specific page
async function fetchPageContent(url) {
  try {
    // Only fetch from trusted HBRS domains
    const trustedDomains = ['h-brs.de', 'hochschule-bonn-rhein-sieg.de'];
    const urlObj = new URL(url);
    
    if (!trustedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return null;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HBRS-Chatbot/1.0 (Educational Purpose)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Simple HTML parsing to extract meaningful content
    // Remove scripts, styles, and extract text content
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract relevant sections (first 500 characters that might contain useful info)
    const relevantContent = cleanText.substring(0, 500);
    
    return relevantContent.length > 50 ? relevantContent : null;
    
  } catch (error) {
    console.log(`Failed to fetch content from ${url}:`, error.message);
    return null;
  }
}

// Enhanced function to determine if we should search for current info
function shouldSearchForCurrentInfo(message) {
  const currentInfoKeywords = [
    'current', 'latest', 'recent', 'now', 'today', 'this year', '2025', '2024',
    'schedule', 'calendar', 'deadline', 'application', 'admission', 'enrollment',
    'semester dates', 'exam dates', 'course offerings', 'new programs',
    'events', 'announcements', 'news', 'updates', 'opening hours', 'opening times',
    'contact', 'phone', 'email', 'address', 'location', 'office hours'
  ];
  
  const lowerMessage = message.toLowerCase();
  return currentInfoKeywords.some(keyword => lowerMessage.includes(keyword));
}

function isHBRSRelated(message) {
  // First check if it's a greeting or identity question - these are always allowed
  if (isGreeting(message) || isIdentityQuestion(message)) {
    return true;
  }
  
  const hbrsKeywords = [
    'hbrs', 'hochschule bonn-rhein-sieg', 'sankt augustin', 'rheinbach', 'hennef',
    'computer science', 'informatik', 'business', 'engineering', 'mensa', 'campus',
    'student', 'course', 'program', 'admission', 'enrollment', 'semester', 'exam',
    'library', 'dormitory', 'asta', 'international office', 'career service'
  ];
  
  const lowerMessage = message.toLowerCase();
  return hbrsKeywords.some(keyword => lowerMessage.includes(keyword)) || 
         lowerMessage.includes('university') || 
         lowerMessage.includes('study') ||
         lowerMessage.includes('academic');
}

async function callGeminiAPI(messages, userMessage, searchResults = []) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Prepare the context with search results if available
  let contextualPrompt = HBRS_SYSTEM_PROMPT;
  
  if (searchResults.length > 0) {
    contextualPrompt += `\n\nCURRENT WEB SEARCH RESULTS (prioritize this information):\n`;
    searchResults.forEach((result, index) => {
      contextualPrompt += `\n${index + 1}. Source: ${result.source}\n`;
      contextualPrompt += `Content: ${result.content}\n`;
      if (result.url) {
        contextualPrompt += `URL: ${result.url}\n`;
      }
    });
    contextualPrompt += `\nPlease use this current information to answer the user's question. Mention that you found recent information online.`;
  }

  // Format messages for Gemini
  const formattedMessages = [
    {
      role: 'user',
      parts: [{ text: contextualPrompt }]
    },
    {
      role: 'model',
      parts: [{ text: 'I understand. I am now your HBRS assistant and will prioritize current web search results when available, while also using my knowledge base about Hochschule Bonn-Rhein-Sieg. How can I help you with HBRS-related questions today?' }]
    }
  ];

  // Add conversation history
  messages.forEach(([userMsg, botMsg]) => {
    if (userMsg) {
      formattedMessages.push({
        role: 'user',
        parts: [{ text: userMsg }]
      });
    }
    if (botMsg) {
      formattedMessages.push({
        role: 'model',
        parts: [{ text: botMsg }]
      });
    }
  });

  // Add current message
  formattedMessages.push({
    role: 'user',
    parts: [{ text: userMessage }]
  });

  const requestBody = {
    contents: formattedMessages,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('Gemini API Error:', errorData);
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text;
  } else {
    throw new Error('Invalid response format from Gemini API');
  }
}

// Function to detect greeting messages
function isGreeting(message) {
  const greetings = [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening',
    'greetings', 'howdy', 'what\'s up', 'how are you', 'hola', 'bonjour',
    'guten tag', 'guten morgen', 'hallo'
  ];
  
  const lowerMessage = message.toLowerCase().trim();
  return greetings.some(greeting => 
    lowerMessage === greeting || 
    lowerMessage.startsWith(greeting + ' ') ||
    lowerMessage.startsWith(greeting + '!')
  );
}

// Function to detect identity questions
function isIdentityQuestion(message) {
  const identityPatterns = [
    'who are you', 'what are you', 'who r u', 'what r u',
    'tell me about yourself', 'introduce yourself',
    'what is your name', 'what\'s your name', 'your name',
    'who am i talking to', 'what do you do'
  ];
  
  const lowerMessage = message.toLowerCase().trim();
  return identityPatterns.some(pattern => lowerMessage.includes(pattern));
}

// Function to generate friendly greeting responses
function generateGreetingResponse() {
  const greetingResponses = [
    "Hello! 👋 I'm your HBRS Assistant, here to help you with anything related to Hochschule Bonn-Rhein-Sieg. Whether you need information about programs, campus life, admissions, or student services, I'm here to assist you!",
    
    "Hi there! 😊 Welcome! I'm the HBRS Assistant, your friendly guide to everything about Hochschule Bonn-Rhein-Sieg. Feel free to ask me about courses, campus facilities, student life, or any other HBRS-related questions you might have!",
    
    "Hey! 🎓 Great to meet you! I'm your HBRS Assistant, powered by AI to help you navigate all things related to Hochschule Bonn-Rhein-Sieg. What would you like to know about HBRS today?",
    
    "Hello and welcome! ✨ I'm the HBRS Assistant, here to help you discover everything about Hochschule Bonn-Rhein-Sieg. From academic programs to campus life, I'm ready to answer your questions!",
    
    "Hi! 🌟 I'm your HBRS Assistant, dedicated to helping students and prospective students learn about Hochschule Bonn-Rhein-Sieg. What can I help you with today?"
  ];
  
  // Return a random greeting response
  return greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
}

// Function to generate identity responses
function generateIdentityResponse() {
  const identityResponses = [
    "I'm your HBRS Assistant! 🎓 I'm an AI-powered chatbot specifically designed to help with questions about Hochschule Bonn-Rhein-Sieg (HBRS). I can provide information about academic programs, campus life, admissions, student services, and much more. I'm here to make your HBRS journey easier!",
    
    "Great question! I'm the HBRS Assistant - your dedicated AI helper for everything related to Hochschule Bonn-Rhein-Sieg. 🤖 I'm here to assist students, prospective students, and anyone interested in learning about HBRS programs, facilities, and services. What would you like to know about HBRS?",
    
    "I'm your friendly HBRS Assistant! ✨ I'm an intelligent chatbot created to help you navigate Hochschule Bonn-Rhein-Sieg. Whether you're a current student, prospective student, or just curious about HBRS, I'm here to provide accurate and helpful information about the university.",
    
    "Hello! I'm the HBRS Assistant - your personal AI guide to Hochschule Bonn-Rhein-Sieg! 🌟 My purpose is to help you find information about HBRS programs, campus life, admissions, and student services. I'm powered by advanced AI to give you the most current and helpful responses possible!"
  ];
  
  // Return a random identity response
  return identityResponses[Math.floor(Math.random() * identityResponses.length)];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Handle greetings with friendly responses
    if (isGreeting(message)) {
      const greetingResponse = generateGreetingResponse();
      return res.status(200).json({ response: greetingResponse });
    }

    // Handle identity questions
    if (isIdentityQuestion(message)) {
      const identityResponse = generateIdentityResponse();
      return res.status(200).json({ response: identityResponse });
    }

    // Check if the message is HBRS-related
    if (!isHBRSRelated(message)) {
      return res.status(200).json({ 
        response: 'I\'m specifically designed to help with questions about HBRS (Hochschule Bonn-Rhein-Sieg). Please ask me about HBRS programs, campus life, admissions, student services, or any other HBRS-related topics!' 
      });
    }

    let searchResults = [];
    
    // Check if we should search for current information
    if (shouldSearchForCurrentInfo(message)) {
      console.log('Searching for current HBRS information...');
      try {
        searchResults = await searchHBRSInfo(message);
        console.log(`Found ${searchResults.length} search results`);
      } catch (searchError) {
        console.error('Search failed:', searchError);
        // Continue without search results - will use knowledge base
      }
    }

    // Call Gemini with or without search results
    const response = await callGeminiAPI(history, message, searchResults);

    // Add a note about information source
    let finalResponse = response;
    if (searchResults.length > 0) {
      finalResponse += '\n\n🌐 *This response includes current information found online.*';
    } else if (shouldSearchForCurrentInfo(message)) {
      finalResponse += '\n\n📚 *This response is based on my knowledge base. For the most current information, please check the official HBRS website at h-brs.de*';
    }

    return res.status(200).json({ response: finalResponse });
  } catch (error) {
    console.error('Chatbot API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      response: 'I apologize, but I\'m experiencing technical difficulties. Please try again later or contact HBRS student services directly.'
    });
  }
}
