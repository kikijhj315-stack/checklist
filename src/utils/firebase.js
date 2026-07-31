import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAHyyQbww5aUIoAx-hJo33caB-E-oPXsEo",
  authDomain: "checklist-26ef2.firebaseapp.com",
  projectId: "checklist-26ef2",
  storageBucket: "checklist-26ef2.firebasestorage.app",
  messagingSenderId: "972381938981",
  appId: "1:972381938981:web:a03f8f1760bf32a560a6cc",
  measurementId: "G-K9VV35JCGC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
