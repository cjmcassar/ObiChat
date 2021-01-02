/*jshint esversion: 6 */

const path = require('path');
const express = require('express');
const ejs = require("ejs");

const PORT = process.env.PORT || 3000;
const config = require('./config');
if (config.credentials.client_id == null || config.credentials.client_secret == null) {
    console.error('Missing FORGE_CLIENT_ID or FORGE_CLIENT_SECRET env. variables.');
    return;
}

const app = express();


app.use('/public', express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");


app.use(express.json({ limit: '50mb' }));
app.use('/api/forge/oauth', require('./routes/oauth'));
app.use('/api/forge/oss', require('./routes/oss'));
app.use('/api/forge/modelderivative', require('./routes/modelderivative'));
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode).json(err);
});

app.get("/", function(req, res)
{
  res.render("login");
});


app.listen(PORT, () => { console.log(`Server listening on port ${PORT}`); });
