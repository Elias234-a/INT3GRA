/**
 * Script de Verificación de Groq AI
 * Verifica si la API key de Groq está configurada y funcional
 */

require('dotenv').config();
const Groq = require('groq-sdk');

console.log('\n🔍 VERIFICACIÓN DE GROQ AI\n');
console.log('='.repeat(50));

// Verificar si la variable de entorno existe
if (!process.env.GROQ_API_KEY) {
  console.log('❌ GROQ_API_KEY no está configurada');
  console.log('\n📝 Para configurar:');
  console.log('1. Abre el archivo: server\\.env');
  console.log('2. Agrega la línea: GROQ_API_KEY=gsk_tu_key_aqui');
  console.log('3. Obtén tu key en: https://console.groq.com/keys');
  console.log('\n💡 El sistema funcionará con respuestas locales gratuitas.');
  process.exit(0);
}

// Verificar formato de la key
const apiKey = process.env.GROQ_API_KEY;
if (!apiKey.startsWith('gsk_')) {
  console.log('⚠️  La API key no parece válida (debe comenzar con "gsk_")');
  console.log(`   Key actual: ${apiKey.substring(0, 10)}...`);
  console.log('\n📝 Verifica que copiaste la key completa de Groq.');
  process.exit(1);
}

console.log('✅ GROQ_API_KEY encontrada');
console.log(`   Formato: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);

// Intentar conectar con Groq
console.log('\n🚀 Probando conexión con Groq...');

const groqClient = new Groq({
  apiKey: apiKey
});

async function testGroq() {
  try {
    const startTime = Date.now();
    
    const completion = await groqClient.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: '¿Qué es el Jacobiano en integrales triples? Responde en máximo 50 palabras.'
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.7,
      max_tokens: 150,
    });
    
    const endTime = Date.now();
    const responseTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('✅ Conexión exitosa con Groq AI');
    console.log(`   Modelo: Llama 3 70B`);
    console.log(`   Tiempo de respuesta: ${responseTime}s`);
    console.log('\n📝 Respuesta de prueba:');
    console.log('─'.repeat(50));
    console.log(completion.choices[0].message.content);
    console.log('─'.repeat(50));
    
    console.log('\n🎉 ¡GROQ AI ESTÁ FUNCIONANDO CORRECTAMENTE!');
    console.log('\n✨ Características habilitadas:');
    console.log('   • Respuestas inteligentes y contextuales');
    console.log('   • Explicaciones paso a paso personalizadas');
    console.log('   • Análisis avanzado de métodos');
    console.log('   • Detección de errores comunes');
    console.log('   • Sugerencias de estrategias óptimas');
    
    console.log('\n💰 Costo: $0 (100% Gratis)');
    console.log('⚡ Velocidad: Muy rápida (1-2 segundos)');
    console.log('🧠 Modelo: Llama 3 70B (70 mil millones de parámetros)');
    
  } catch (error) {
    console.log('❌ Error al conectar con Groq:');
    console.log(`   ${error.message}`);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('\n🔑 La API key parece ser inválida o expirada.');
      console.log('   Solución:');
      console.log('   1. Ve a: https://console.groq.com/keys');
      console.log('   2. Genera una nueva API key');
      console.log('   3. Actualiza GROQ_API_KEY en server\\.env');
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      console.log('\n⏱️  Has alcanzado el límite de uso.');
      console.log('   Solución: Espera unos minutos e intenta de nuevo.');
      console.log('   Revisa límites en: https://console.groq.com/settings/limits');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 Problema de conexión a internet.');
      console.log('   Solución: Verifica tu conexión y vuelve a intentar.');
    } else {
      console.log('\n💡 El sistema usará respuestas locales gratuitas como fallback.');
    }
    
    process.exit(1);
  }
}

// Ejecutar prueba
testGroq().catch(err => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
