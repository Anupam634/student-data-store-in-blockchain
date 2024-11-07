// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDqfjdgu3nnA-5fTfAwvwWUbrGJ6O1KOzs",
  authDomain: "student-data-in-blockchain.firebaseapp.com",
  databaseURL: "",  // Leave empty if not using Realtime Database
  projectId: "student-data-in-blockchain",
  storageBucket: "gs://student-data-in-blockchain.appspot.com",
  messagingSenderId: "1067397554187",
  appId: "1:1067397554187:web:f4a311bb11bc62a2ffe70e"
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

export default firebaseApp;
