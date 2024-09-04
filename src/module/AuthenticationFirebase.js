import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyCnpNJQ8oeIMDxcz6kqrsGivV0FVzFEQPI",
    authDomain: "hackathon-37983.firebaseapp.com",
    projectId: "hackathon-37983",
    storageBucket: "hackathon-37983.appspot.com",
    messagingSenderId: "78726578886",
    appId: "1:78726578886:web:382a058f90451271098dc7",
    measurementId: "G-844TR8M2FG"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);
export {auth , db}