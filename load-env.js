/**
 * Load environment variables from .env.local
 * This is a workaround for tsx not loading .env.local automatically
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
        process.env[key.trim()] = cleanValue;
      }
    }
  });
  
  console.log('✅ Environment variables loaded from .env.local');
} else {
  console.log('⚠️  .env.local not found, using existing environment variables');
}

