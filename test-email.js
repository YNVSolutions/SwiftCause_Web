// Test script to send verification email
// Run this with: node test-email.js

const { initializeApp } = require('firebase/app');
const { getFunctions, httpsCallable } = require('firebase/functions');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBfU0qWYdW1zr7gPpNANMv8wjhFcOVo6s8",
  authDomain: "swiftcause-app.firebaseapp.com",
  projectId: "swiftcause-app",
  storageBucket: "swiftcause-app.firebasestorage.app",
  messagingSenderId: "373490483164",
  appId: "1:373490483164:web:262ab335b78858ce555919"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

async function testVerificationEmail() {
  try {
    console.log('Sending verification email to ayushbhatia456@gmail.com...');
    
    const sendEmailFn = httpsCallable(functions, 'sendEmail');
    const result = await sendEmailFn({
      to: 'ayushbhatia456@gmail.com',
      templateId: 'd-23aac70d71724b859684e7933eed46f7',
      templateData: {
        year: new Date().getFullYear()
      },
    });
    
    console.log('✅ Success!');
    console.log('Response:', result.data);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Code:', error.code);
    console.error('Message:', error.message);
    console.error('Details:', error.details);
  }
}

testVerificationEmail();
