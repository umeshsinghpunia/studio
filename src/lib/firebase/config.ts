import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-Mh6xiyfI07YZQwNhMlLOFhq4g-Zc_8Y",
  authDomain: "abctest-e9908.firebaseapp.com",
  databaseURL: "https://abctest-e9908.firebaseio.com",
  projectId: "abctest-e9908",
  storageBucket: "abctest-e9908.firebasestorage.app",
  messagingSenderId: "690971181416",
  appId: "1:690971181416:web:0383e888538ad434e8d6dd"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
