  const signupForm = document.querySelector('#signup-form');
  const logout = document.querySelector('#logout');
  const loginForm = document.querySelector('#login-form');

  // listen for auth status changes
  auth.onAuthStateChanged(user =>
  {
    if (user)
    {
      console.log("user logged in:", user);
    }
    else
    {
      console.log("user logged out");
    }

  });


  if (document.querySelector('#signup-form') !== null)
  {
    // register
    signupForm.addEventListener('submit', (e) =>
    {
      e.preventDefault();

      // get user info

      const email = signupForm['signup-email'].value;
      const password = signupForm['signup-password'].value;

      // register the user

      auth.createUserWithEmailAndPassword(email, password).then(cred =>
      {
        // console.log(cred.user);
        signupForm.reset();
      });
    });
  }
  else if (document.querySelector('#login-form') !== null)
  {
    //login
    // loginForm.addEventListener('submit', (e) =>
    // {
    //   e.preventDefault();

    //   //get user info

    //   const loginemail = loginForm['login-email'].value;
    //   const loginpassword = loginForm['login-password'].value;

    //   // register the user

    //   auth.signInWithEmailAndPassword(loginemail, loginpassword).then(cred =>
    //   {
    //     // console.log(cred.user);
    //     // loginForm.reset();
    //   });
    // });
    document
    .getElementById("login-form")
    .addEventListener("submit", (event) =>
    {
      event.preventDefault();
      const login = loginForm['login-email'].value;
      const password = loginForm['login-password'].value;

      firebase
        .auth()
        .signInWithEmailAndPassword(login, password)
        .then((
        {
          user
        }) =>
        {
          return user.getIdToken().then((idToken) =>
          {
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
        .then(() =>
        {
          loginForm.reset();
          return firebase.auth().signOut();
        })
        .then(() =>
        {
          window.location.assign("/view");
        });
      return false;
    });




  }
  //logout

  logout.addEventListener('click', (e) =>
  {
    e.preventDefault();
    auth.signOut().then(() =>
    {
      window.location.assign("/");
    });
  });


