import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyC8L03k7LYZLZKFkx-4wPNAq_Z7cnIBOfw",
  authDomain: "deviser-b05ce.firebaseapp.com",
  projectId: "deviser-b05ce",
  storageBucket: "deviser-b05ce.firebasestorage.app",
  messagingSenderId: "152962782800",
  appId: "1:152962782800:web:4817e5f3b903c879162355",
  measurementId: "G-GN3XYYQVXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app); 
export const storage = getStorage(app); 