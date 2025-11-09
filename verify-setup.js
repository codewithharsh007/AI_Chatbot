#!/usr/bin/env node

/**
 * VaaniAI Project Setup Verification Script
 * Run: node verify-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 VaaniAI Setup Verification\n');
console.log('=' .repeat(50));

let allGood = true;
const warnings = [];
const errors = [];

// 1. Check if .env.local exists
console.log('\n📋 Checking environment configuration...');
if (fs.existsSync('.env.local')) {
  console.log('✅ .env.local file found');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  // Check for required variables
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const optionalVars = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'GEMINI_API_KEY'];
  
  requiredVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const value = envContent.match(new RegExp(`${varName}=(.+)`));
      if (value && value[1] && value[1].trim()) {
        console.log(`✅ ${varName} is set`);
      } else {
        errors.push(`❌ ${varName} is empty`);
        allGood = false;
      }
    } else {
      errors.push(`❌ ${varName} is missing`);
      allGood = false;
    }
  });
  
  let hasAtLeastOneAPI = false;
  optionalVars.forEach(varName => {
    if (envContent.includes(varName)) {
      const value = envContent.match(new RegExp(`${varName}=(.+)`));
      if (value && value[1] && value[1].trim()) {
        console.log(`✅ ${varName} is set`);
        hasAtLeastOneAPI = true;
      }
    }
  });
  
  if (!hasAtLeastOneAPI) {
    warnings.push('⚠️  No AI API keys configured. You need at least one.');
  }
  
} else {
  errors.push('❌ .env.local file not found');
  console.log('ℹ️  Create .env.local from .env.example');
  allGood = false;
}

// 2. Check if node_modules exists
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('✅ node_modules folder found');
  
  // Check for key packages
  const requiredPackages = [
    'next',
    'react',
    'mongoose',
    'openai',
    '@anthropic-ai/sdk',
    '@google/generative-ai'
  ];
  
  requiredPackages.forEach(pkg => {
    if (fs.existsSync(path.join('node_modules', pkg))) {
      console.log(`✅ ${pkg} installed`);
    } else {
      errors.push(`❌ ${pkg} not installed`);
      allGood = false;
    }
  });
} else {
  errors.push('❌ node_modules not found');
  console.log('ℹ️  Run: npm install');
  allGood = false;
}

// 3. Check file structure
console.log('\n📁 Checking project structure...');
const requiredDirs = [
  'app/api/auth',
  'app/api/chat',
  'components',
  'models',
  'utils',
  'middlewares',
  'lib'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/ exists`);
  } else {
    errors.push(`❌ ${dir}/ not found`);
    allGood = false;
  }
});

// 4. Check key files
console.log('\n📄 Checking key files...');
const requiredFiles = [
  'app/api/chat/route.js',
  'components/ChatbotEnhanced.jsx',
  'models/User.js',
  'utils/textToSpeech.js',
  'middlewares/auth.js',
  'lib/mongodb.js'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    errors.push(`❌ ${file} not found`);
    allGood = false;
  }
});

// 5. Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:\n');

if (errors.length > 0) {
  console.log('🚨 ERRORS:');
  errors.forEach(err => console.log(err));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(warn => console.log(warn));
  console.log('');
}

if (allGood && warnings.length === 0) {
  console.log('✅ All checks passed! Your project is ready to run.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Start MongoDB: mongod');
  console.log('   2. Run dev server: npm run dev');
  console.log('   3. Visit: http://localhost:3000');
} else if (allGood && warnings.length > 0) {
  console.log('⚠️  Setup is mostly complete but check warnings above.');
  console.log('\n🚀 You can still run the project:');
  console.log('   1. Configure AI API keys in .env.local');
  console.log('   2. Start MongoDB: mongod');
  console.log('   3. Run dev server: npm run dev');
} else {
  console.log('❌ Setup incomplete. Please fix the errors above.');
  console.log('\nQuick fixes:');
  if (!fs.existsSync('.env.local')) {
    console.log('   • Copy .env.example to .env.local');
    console.log('   • Add your API keys to .env.local');
  }
  if (!fs.existsSync('node_modules')) {
    console.log('   • Run: npm install');
  }
}

console.log('\n📚 Documentation:');
console.log('   • Quick Start: QUICKSTART.md');
console.log('   • Full Docs: README_FULL.md');
console.log('   • Features: FEATURES.md');
console.log('');

process.exit(allGood ? 0 : 1);
