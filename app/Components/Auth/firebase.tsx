import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyAB_4W-MdQ3LDz2lBTjK4QNMrP-8cNgqys",
  authDomain: "swift-cause-web.firebaseapp.com",
  projectId: "swift-cause-web",
  storageBucket: "swift-cause-web.firebasestorage.app",
  messagingSenderId: "1014307338439",
  appId: "1:1014307338439:web:6dedefcb4e2948f543a6e2",
  measurementId: "G-61MP035G3D"
};


export const app = initializeApp(firebaseConfig);