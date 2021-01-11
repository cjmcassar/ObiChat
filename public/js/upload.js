const uploader = document.getElementById("uploader");
const fileButton = document.getElementById("fileButton");


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
firebase.storage();




fileButton.addEventListener('change', function(e)
{
  // Get file
  var file = e.target.files[0];
  firebase.auth().onAuthStateChanged(user =>
  {
    if (user)
    {
      firebase.storage().ref('users').child(user.uid + "/designs").put(file);
      console.log(user);
    }
  });


});

// const img = document.getElementById('img');

// firebase.auth().onAuthStateChanged(user => {
//   if (user) {
//     firebase
//       .storage()
//       .ref("users")
//       .child(user.uid + "/profile.jpg")
//       .getDownloadURL()
//       .then(imgUrl => {
//         img.src = imgUrl;
//       });
//     console.log(user)
//   }
// })