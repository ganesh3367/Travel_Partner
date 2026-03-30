const admin = require('firebase-admin');

let db, auth;

try {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin Initialized Successfully');
    db = admin.firestore();
    auth = admin.auth();
  } else {
    console.warn('Firebase environment variables missing. Firebase Admin not initialized.');
    // Set to dummy objects or null to prevent immediate crashes, but 
    // real calls will still need handling.
    db = null;
    auth = null;
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

module.exports = { admin, db, auth };

