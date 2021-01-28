window.addEventListener("DOMContentLoaded", () =>
{
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

  firebase.initializeApp(firebaseConfig);

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);

  // The /sessionlogout already does this. Should clean this up later.
  document
    .getElementById("logout")
    .addEventListener("click", (event) =>
    {
      event.preventDefault();
      firebase.auth().signOut()
        .then(() =>
        {
          localStorage.removeItem('uid');
          localStorage.removeItem('token');
          // return fetch("/sessionLogout");
          //   console.log("logged out");
          window.location.assign("/login");
        });

    });

});