/*jshint esversion: 6 */

const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const path = require('path');
const bodyParser = require("body-parser");
const express = require('express');
const ejs = require("ejs");
const admin = require("firebase-admin");

const csrfMiddleware = csrf(
{
  cookie: true
});


var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp(
{
  credential: admin.credential.cert(serviceAccount),
});


const PORT = process.env.PORT || 3000;
const config = require('./config');


if (config.credentials.client_id == null || config.credentials.client_secret == null)
{
  console.error('Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables.');
  return;
}

const app = express();


app.use('/public', express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrfMiddleware);

app.use(express.json(
{
  limit: '50mb'
}));
app.use('/api/forge/oauth', require('./routes/oauth'));
app.use('/api/forge/oss', require('./routes/oss'));
app.use('/api/forge/modelderivative', require('./routes/modelderivative'));
app.use((err, req, res, next) =>
{
  console.error(err);
  res.status(err.statusCode).json(err);
});

app.all("*", (req, res, next) =>
{
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});


app.get("/", function(req, res)
{
  res.render("login");
});

app.get("/register", function(req, res)
{
  res.render("register");
});

app.get("/view", function(req, res)
{
  const sessionCookie = req.cookies.session || "";

  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */ )
    .then(() =>
    {
      res.render("view");
    })
    .catch((error) =>
    {
      res.render("login");
    });
});

app.post("/sessionLogin", (req, res) =>
{
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .createSessionCookie(idToken,
    {
      expiresIn
    })
    .then(
      (sessionCookie) =>
      {
        const options = {
          maxAge: expiresIn,
          httpOnly: true
        };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify(
        {
          status: "success"
        }));
      },
      (error) =>
      {
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );
});

app.get("/sessionLogout", (req, res) =>
{
  res.clearCookie("session");
  res.redirect("/login");
});


app.listen(PORT, () =>
{
  console.log(`Server listening on port ${PORT}`);
});