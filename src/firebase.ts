import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue, update, remove, push, child } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyAIITWC1wKMvpN_2GzWnRmDN1f5vTEJ1XQ",
    authDomain: "cotuong-4e2d0.firebaseapp.com",
    databaseURL: "https://cotuong-4e2d0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "cotuong-4e2d0",
    storageBucket: "cotuong-4e2d0.firebasestorage.app",
    messagingSenderId: "707151130040",
    appId: "1:707151130040:web:4df3eea474e1c9d91e734d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
export const database = getDatabase(app);

// Database references
export const roomsRef = ref(database, 'rooms');

// Helper functions
export const createRoomRef = (roomId: string) => ref(database, `rooms/${roomId}`);
export const createGameRef = (roomId: string) => ref(database, `rooms/${roomId}/game`);

export { ref, set, get, onValue, update, remove, push, child };
