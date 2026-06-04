import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// As configurações do seu projeto Asteres
const firebaseConfig = {
  apiKey: "AIzaSyBb4VQxNX81kKOc4leFnFK1E6BkPJ6Aed0",
  authDomain: "asteres-7c5bb.firebaseapp.com",
  projectId: "asteres-7c5bb",
  storageBucket: "asteres-7c5bb.firebasestorage.app",
  messagingSenderId: "375341578875",
  appId: "1:375341578875:web:54660b68ac2552b0fb00de",
};

// Inicializa o Firebase no seu aplicativo
const app = initializeApp(firebaseConfig);

// Exporta as ferramentas para podermos usar nas telas do app
export const auth = getAuth(app);
export const db = getFirestore(app);
