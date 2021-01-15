window.addEventListener("DOMContentLoaded", () =>
{
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

  const fileButton = document.getElementById("fileButton");

});

fileButton.addEventListener('change', function(e)
{
  // Get file
  var file = e.target.files[0];
  var fileName = file.name;
  var metadata = { contentType: file.type};

  firebase.auth().onAuthStateChanged(function(user)
  {
    if (user)
    {
      // User is signed in.
      console.log(user);
      // get idtoken
      user.getIdToken().then(function(idToken)
      { // <------ Check this line
        console.log(idToken); // It shows the Firebase token now
      });
      console.log(user.uid);
      firebase.storage().ref('users').child(user.uid + "/" + fileName).put(file);
    }
    else
    {
      // No user is signed in.
      console.log("state = definitely signed out");
    }
  });

});