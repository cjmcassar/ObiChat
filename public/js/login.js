
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
  firebase.analytics();

  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
  
  document
    .getElementById("login")
    .addEventListener("submit", (event) =>
    {
      event.preventDefault();
      const login = event.target.login.value;
      const password = event.target.password.value;

      firebase
        .auth()
        .signInWithEmailAndPassword(login, password)
        .then((
        {
          user
        }) =>
        {
          
          localStorage.setItem('uid', user.uid);
          localStorage.setItem('email', user.email);
          
          return user.getIdToken().then((idToken) =>
          {
            localStorage.setItem('token', idToken);
            return fetch("/sessionLogin",
            {
              method: "POST",
              headers:
              {
                Accept: "application/json",
                "Content-Type": "application/json",
                "CSRF-Token": Cookies.get("XSRF-TOKEN"),
              },
              body: JSON.stringify(
              {
                idToken
              }),
            });
          });
        })
        // .then(() =>
        // {
        //   return firebase.auth().signOut();
        // })
        .then(() =>
        {
         
          // console.log(firebase.auth().currentUser);
          window.location.assign("/view");
        });
      return false;
    });
    
});
