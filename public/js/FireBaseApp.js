var firebase = require("firebase/app");
require('firebase/analytics');
require('firebase/auth');
require('firebase/database');
require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyBhdymNUMHIMZqKKCLIfzeyQ3vV7Fl8cf8",
  authDomain: "obivision-7645d.firebaseapp.com",
  databaseURL: "https://obivision-7645d-default-rtdb.firebaseio.com",
  projectId: "obivision-7645d",
  storageBucket: "obivision-7645d.appspot.com",
  messagingSenderId: "809563515817",
  appId: "1:809563515817:web:a06de894ebd9115cbd72b8",
  measurementId: "G-BL2T39VTVF"
};

// TODO try to bundle the firebaseapp.js file with the login.js file

function initFirebase()
{
  firebase.initializeApp({firebaseConfig});
  firebase.analytics();
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
  return firebase;
}

const FirebaseApp = initFirebase();

