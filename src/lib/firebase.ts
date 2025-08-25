// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "quiz-arena-6qy85",
  "appId": "1:221054451214:web:9c1325acf25dc1f532065f",
  "storageBucket": "quiz-arena-6qy85.firebasestorage.app",
  "apiKey": "AIzaSyDUcPDVQx9rY8HlAp6yHHNNiZn-i7NVr6c",
  "authDomain": "quiz-arena-6qy85.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "221054451214"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export { app, db, auth };
