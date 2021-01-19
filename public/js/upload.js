// // const ForgeOSS = require('./oss'); // OSS

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


const doForge = () =>{

  console.log(fileButton.files)
  var myHeaders = new Headers();
myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:84.0) Gecko/20100101 Firefox/84.0");
myHeaders.append("Accept-Language", "en-GB,en;q=0.5");
myHeaders.append("Referer", "http://localhost:3000/view");
myHeaders.append("Origin", "http://localhost:3000");
myHeaders.append("Connection", "keep-alive");
myHeaders.append("Cookie", "user={\"id\":\"659064c0-0e26-11eb-ae4d-970921f036ee\",\"deviceId\":\"659064c0-0e26-11eb-ae4d-970921f036ee\"}; amp_5ea02d=SGW5UiA4llrkJgo7xIEeen.NjU5MDY0YzAtMGUyNi0xMWViLWFlNGQtOTcwOTIxZjAzNmVl..1en5n43fc.1en5n43t6.13.3.16; _csrf=Akbij6wankFdRKHjqCGVmV5L; XSRF-TOKEN=amJWXycY-64VQZlTCERF5AJD8tN5ZuJcsgj8; session=eyJhbGciOiJSUzI1NiIsImtpZCI6InRCME0yQSJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9vYml2aXNpb24tNzY0NWQiLCJhdWQiOiJvYml2aXNpb24tNzY0NWQiLCJhdXRoX3RpbWUiOjE2MTEwNTQ5MDIsInVzZXJfaWQiOiJBNDdHTXRneU0yYW9GREFyQXpCVHQ0Z3JlVkYzIiwic3ViIjoiQTQ3R010Z3lNMmFvRkRBckF6QlR0NGdyZVZGMyIsImlhdCI6MTYxMTA1NDkwMywiZXhwIjoxNjExNDg2OTAzLCJlbWFpbCI6InRlc3RAMTIzLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ0ZXN0QDEyMy5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.A6Rz4hoH5qywcFi1px7T56Z6_MdxvlVxtW3mnd6JrsjzKfRluFrHh5MRX-4oK2KHyrECF7T8Qc1Cvtg_LcD2x_IfQFNgP0lL42dY83vdqDlaMX7IduHgzKDH1UZ8tn1u-7R3mN-TGxBMUhbJwyPcnNcW8OkzuR_JZoSBnC_aQU-osYa_d975Lc-UMaplIgbrlEREFGSY9G2fcGxmCTgnTogaSFYJvzT0o1MilnS-iZ0aWNxQIuJlLygd45NBq_Msr3Ntpv8I5slJzzTdNKXCIt9nJNpltRFk-wxhra_wy-7zE-5GtxFT0XHa1RqQ7dkQhZx4-YorYs5wDoOn0WzCEw; _csrf=8v_9daaF6jH4sNdub8ol30_V");
myHeaders.append("Pragma", "no-cache");
myHeaders.append("Cache-Control", "no-cache");

var formdata = new FormData();
formdata.append("bucketKey", "zmzmzm");
formdata.append("fileToUpload", fileButton.files[0], fileButton.files[0].name);

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: formdata,
  redirect: 'follow'
};

fetch("/api/forge/oss/objects", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

}


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