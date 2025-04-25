// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzpFha6BVnpeYnIbKfIonjnPIBMlbPumg",
  authDomain: "grad-chat.firebaseapp.com",
  projectId: "grad-chat",
  storageBucket: "grad-chat.firebasestorage.app",
  messagingSenderId: "42401289879",
  appId: "1:42401289879:web:905a8f39a2c9eaffdcfbd2",
  measurementId: "G-MPEEM0MQF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Enable persistence with AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);