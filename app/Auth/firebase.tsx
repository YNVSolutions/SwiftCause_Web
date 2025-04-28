import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfU0qWYdW1zr7gPpNANMv8wjhFcOVo6s8",
  authDomain: "swiftcause-app.firebaseapp.com",
  projectId: "swiftcause-app",
  storageBucket: "swiftcause-app.firebasestorage.app", 
  messagingSenderId: "373490483164",
  appId: "1:373490483164:web:262ab335b78858ce555919",
  measurementId: "G-5WPFP88SST"
};

export const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
