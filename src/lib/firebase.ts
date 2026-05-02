import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { initializeApp, FirebaseApp } from 'firebase/app';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const getFirebase = async () => {
  if (app) return { app, auth, db };

  try {
    const configPath = '/firebase-applet-config.json';
    const response = await fetch(configPath);
    if (response.ok) {
      const firebaseConfig = await response.json();
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    }
  } catch (e) {
    console.warn("Firebase config not found or invalid. Auth features restricted.");
  }

  return { app, auth, db };
};

// Re-exporting for legacy compatibility, but they will be null until getFirebase is called
export { auth, db };
