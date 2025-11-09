const { GoogleGenerativeAI } = require('@google/generative-ai');

// Replace with your actual API key or use dotenv
const API_KEY = process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log('Fetching available Gemini models...\n');
    
    const models = await genAI.listModels();
    
    console.log('=== AVAILABLE MODELS ===\n');
    
    models.forEach(model => {
      console.log(`Name: ${model.name}`);
      console.log(`Display Name: ${model.displayName || 'N/A'}`);
      console.log(`Description: ${model.description || 'N/A'}`);
      console.log(`Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('---\n');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

listModels();
