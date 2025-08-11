import { HBRS_KNOWLEDGE_BASE, HBRS_SYSTEM_PROMPT } from './hbrs-knowledge';

interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file');
    }
  }

  private formatMessagesForGemini(messages: { sender: 'user' | 'bot'; content: string }[]): GeminiMessage[] {
    const formattedMessages: GeminiMessage[] = [];
    
    // Add system prompt as the first message
    formattedMessages.push({
      role: 'user',
      parts: [{ text: HBRS_SYSTEM_PROMPT + '\n\n' + HBRS_KNOWLEDGE_BASE }]
    });
    
    formattedMessages.push({
      role: 'model',
      parts: [{ text: 'I understand. I am now your HBRS assistant and will only answer questions related to Hochschule Bonn-Rhein-Sieg. How can I help you with HBRS-related questions today?' }]
    });

    // Add conversation history
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        formattedMessages.push({
          role: 'user',
          parts: [{ text: msg.content }]
        });
      } else if (msg.sender === 'bot') {
        formattedMessages.push({
          role: 'model',
          parts: [{ text: msg.content }]
        });
      }
    });

    return formattedMessages;
  }

  private isHBRSRelated(message: string): boolean {
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

  async generateResponse(
    userMessage: string,
    conversationHistory: { sender: 'user' | 'bot'; content: string }[] = []
  ): Promise<string> {
    if (!this.apiKey) {
      return 'Sorry, the chatbot is not configured properly. Please contact the administrator to set up the Gemini API key.';
    }

    // Check if the message is HBRS-related
    if (!this.isHBRSRelated(userMessage)) {
      return 'I\'m specifically designed to help with questions about HBRS (Hochschule Bonn-Rhein-Sieg). Please ask me about HBRS programs, campus life, admissions, student services, or any other HBRS-related topics!';
    }

    try {
      const messages = this.formatMessagesForGemini(conversationHistory);
      
      // Add the current user message
      messages.push({
        role: 'user',
        parts: [{ text: userMessage }]
      });

      const requestBody = {
        contents: messages,
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

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment, or contact HBRS student services directly for immediate assistance.';
    }
  }
}

export const geminiService = new GeminiService();
