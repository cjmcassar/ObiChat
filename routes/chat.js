const express = require('express');
const
{
  URLSearchParams
} = require('url');
const fetch = require('node-fetch');
const
{
  getClient,
  getInternalToken
} = require('./common/oauth');

let router = express.Router();

const encodedParams = new URLSearchParams();

///Middleware for obtaining a token for each request.
router.use(async (req, res, next) =>
{
  const token = await getInternalToken();
  req.oauth_token = token;
  req.oauth_client = getClient();
  next();
});


router.post(`/add-friend`, async (req, res, next) =>
{
  const
  {
    email,
    userEmail
  } = req.body;
  //   console.log("===heere")

  encodedParams.set('UID', userEmail);
  encodedParams.set('friendsUID', email);
  encodedParams.set('clearExisting', 'false');

  const url = 'https://api.cometondemand.net/api/v2/addFriends';

  const options = {
    method: 'POST',
    headers:
    {
      'api-key': '56012x414ca746f2cb210859ba0dbecf84d17f',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodedParams
  };

  return fetch(url, options)
    .then(res => res.json())
    .then(json => res.json(json))
    .catch(err => console.error('error:' + err));


});

router.post(`/delete-friend`, async (req, res, next) =>
{
  const
  {
    email,
    userEmail
  } = req.body;
  //   console.log("===heere")

  encodedParams.set('UID', userEmail);
  encodedParams.set('friendsUID', email);

  const url = 'https://api.cometondemand.net/api/v2/deleteFriends';

  const options = {
    method: 'POST',
    headers:
    {
      'api-key': '56012x414ca746f2cb210859ba0dbecf84d17f',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: encodedParams
  };

  return fetch(url, options)
    .then(res => res.json())
    .then(json => res.json(json))
    .catch(err => console.error('error:' + err));


});

module.exports = router;