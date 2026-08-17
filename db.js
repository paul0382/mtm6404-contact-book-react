import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDvfDxzPG06WDGVZSx6AV-M68521JLsX7c",
  authDomain: "contacts-app-paul0382.firebaseapp.com",
  projectId: "contacts-app-paul0382",
  storageBucket: "contacts-app-paul0382.firebasestorage.app",
  messagingSenderId: "195160566480",
  appId: "1:195160566480:web:deadd3239b4f243f6cccd5",
  measurementId: "G-8VES4818F3"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export default db;