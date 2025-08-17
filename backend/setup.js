#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up SwiftCause Backend Server...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file from template...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully!');
  } else {
    console.log('❌ env.example file not found. Creating basic .env file...');
    
    const basicEnvContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
`;
    
    fs.writeFileSync(envPath, basicEnvContent);
    console.log('✅ Basic .env file created successfully!');
  }
} else {
  console.log('✅ .env file already exists!');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Dependencies installed successfully!');
  } catch (error) {
    console.log('❌ Failed to install dependencies. Please run "npm install" manually.');
  }
} else {
  console.log('✅ Dependencies already installed!');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Edit the .env file with your Stripe API keys');
console.log('2. Get your keys from: https://dashboard.stripe.com/apikeys');
console.log('3. Run "npm run dev" to start the server');
console.log('4. The server will be available at: http://localhost:3001');
console.log('\n📚 For more information, see: STRIPE_INTEGRATION.md');
