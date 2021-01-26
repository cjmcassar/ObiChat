const admin = require("firebase-admin");
// const fbAuth = require('./routes/fbAuth');

const firebase = require('firebase');

const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:  "https://obivision-7645d-default-rtdb.firebaseio.com",
});



/* require("firebase/auth");
const firebase = require('firebase');
const admin = require('firebase-admin');
// const serviceAccount = require("../serviceAccountKey.json"); */

var firebaseConfig = { 
    apiKey: "AIzaSyBhdymNUMHIMZqKKCLIfzeyQ3vV7Fl8cf8",
    authDomain: "obivision-7645d.firebaseapp.com",
    databaseURL: "https://obivision-7645d-default-rtdb.firebaseio.com",
    projectId: "obivision-7645d",
    storageBucket: "obivision-7645d.appspot.com",
    messagingSenderId: "809563515817",
    appId: "1:809563515817:web:a06de894ebd9115cbd72b8",
    measurementId: "G-BL2T39VTVF"

};
firebase.initializeApp(firebaseConfig);
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://obivision-7645d-default-rtdb.firebaseio.com",
// }); 

module.exports = {  admin, firebase }; 