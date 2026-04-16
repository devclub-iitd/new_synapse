importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");


const firebaseConfig = {
  apiKey: "AIzaSyA6l3TOciTHngfcElA35ruOG8M54GBxZBQ",
  authDomain: "synapse-73a62.firebaseapp.com",
  projectId: "synapse-73a62",
  messagingSenderId: "603354082490",
  appId: "1:603354082490:web:c3b0bac8c15392bbb6e683",
};


firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});