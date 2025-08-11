// Test file for Gemini service
// You can run this to test the Gemini integration

import { geminiService } from '../src/services/gemini';

async function testGeminiService() {
  console.log('Testing Gemini Service...');
  
  // Test HBRS-related question
  const testQuestion = "What programs does HBRS offer in computer science?";
  console.log(`Question: ${testQuestion}`);
  
  try {
    const response = await geminiService.generateResponse(testQuestion);
    console.log(`Response: ${response}`);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Test non-HBRS question
  const offTopicQuestion = "What's the weather like today?";
  console.log(`\nOff-topic Question: ${offTopicQuestion}`);
  
  try {
    const response = await geminiService.generateResponse(offTopicQuestion);
    console.log(`Response: ${response}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Uncomment to run the test
// testGeminiService();
