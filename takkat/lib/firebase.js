import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWItVEaVtMWAxk4WiN7T2ckCarVxTv-0c",
  authDomain: "takkat-b577a.firebaseapp.com",
  projectId: "takkat-b577a",
  storageBucket: "takkat-b577a.firebasestorage.app",
  messagingSenderId: "1078036138053",
  appId: "1:1078036138053:web:5a521696087682f0473b2c"
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Initialize Google Auth Provider
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" }); // Ensure account selection

export { auth, db, storage, provider }; // Export the provider as well
