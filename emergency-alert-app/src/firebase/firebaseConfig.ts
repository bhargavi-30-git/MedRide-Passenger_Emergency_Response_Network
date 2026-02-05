import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

// 🔥 Firebase config (unchanged)
const firebaseConfig = {
  apiKey: "AIzaSyAXGiKGtJGfMVyYwu8gkXuP8dP0sy75VJY",
  authDomain: "medride-5b2d9.firebaseapp.com",
  projectId: "medride-5b2d9",
  storageBucket: "medride-5b2d9.firebasestorage.app",
  messagingSenderId: "24057609536",
  appId: "1:24057609536:web:1331ea937dfe0da7ddcea5",


  databaseURL: "https://medride-5b2d9-default-rtdb.asia-southeast1.firebasedatabase.app",

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ SAFE FOR EXPO (web + iOS + Android)
export const auth = getAuth(app);

// Realtime Database
export const db = getDatabase(app);
