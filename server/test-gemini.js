// Test script para verificar Google Gemini AI
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    console.log('🔍 Probando conexión con Google Gemini AI...');
    
    if (!process.env.GOOGLE_API_KEY) {
      console.error('❌ No se encontró GOOGLE_API_KEY en .env');
      return;
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Primero listar modelos disponibles
    console.log('📋 Listando modelos disponibles...');
    try {
      const models = await genAI.listModels();
      console.log('Modelos disponibles:');
      models.forEach(model => {
        console.log(`- ${model.name} (${model.displayName})`);
      });
    } catch (listError) {
      console.log('No se pudieron listar modelos, probando con modelos comunes...');
    }
    
    // Probar diferentes modelos
    const modelsToTry = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
      'models/gemini-pro',
      'models/gemini-1.5-pro',
      'models/gemini-1.5-flash'
    ];
    
    for (const modelName of modelsToTry) {
      try {
        console.log(`🧪 Probando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = `Eres un tutor especializado en integrales triples. 
        Explica brevemente qué es el Jacobiano en coordenadas cilíndricas.
        Responde en español y de forma educativa.`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`✅ ¡Modelo ${modelName} funciona!`);
        console.log('─'.repeat(50));
        console.log(text);
        console.log('─'.repeat(50));
        console.log('🎉 ¡Google Gemini AI funciona correctamente!');
        return; // Salir si encontramos un modelo que funciona
        
      } catch (modelError) {
        console.log(`❌ Modelo ${modelName} no funciona: ${modelError.message}`);
      }
    }
    
    console.error('❌ Ningún modelo funcionó');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

testGemini();
