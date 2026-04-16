import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";


const firebaseConfig = {
  apiKey: "AIzaSyA6l3TOciTHngfcElA35ruOG8M54GBxZBQ",
  authDomain: "synapse-73a62.firebaseapp.com",
  projectId: "synapse-73a62",
  messagingSenderId: "603354082490",
  appId: "1:603354082490:web:c3b0bac8c15392bbb6e683",
};


const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

export async function getDeviceToken() {
  const token = await getToken(messaging, {
    vapidKey: "YOUR_VAPID_KEY"
  });

  return token;
}