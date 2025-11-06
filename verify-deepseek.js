/**
 * Script para verificar la configuración de DeepSeek
 */

require('dotenv').config({ path: './server/.env' });

console.log('🔍 VERIFICACIÓN DE DEEPSEEK AI');
console.log('================================');
console.log();

// Verificar variables de entorno
const requiredVars = [
  'DEEPSEEK_API_KEY',
  'DEEPSEEK_BASE_URL', 
  'DEEPSEEK_MODEL'
];

let allConfigured = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName === 'DEEPSEEK_API_KEY' ? value.substring(0, 10) + '...' : value}`);
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`);
    allConfigured = false;
  }
});

console.log();

if (allConfigured) {
  console.log('🎉 ¡Todas las variables están configuradas correctamente!');
  
  // Probar conexión con DeepSeek
  testDeepSeekConnection();
} else {
  console.log('⚠️  Faltan variables por configurar');
  console.log('💡 Ejecuta: configure-deepseek.bat');
}

async function testDeepSeekConnection() {
  console.log('🧪 Probando conexión con DeepSeek...');
  
  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'user', content: 'Hola, ¿funcionas correctamente?' }
        ],
        max_tokens: 50
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Conexión exitosa con DeepSeek');
      console.log('📝 Respuesta de prueba:', data.choices[0].message.content);
    } else {
      console.log('❌ Error de conexión:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('❌ Error de red:', error.message);
  }
}
