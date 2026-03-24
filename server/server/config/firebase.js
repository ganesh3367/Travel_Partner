const admin = require('firebase-admin');

try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin Initialized Successfully');
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
