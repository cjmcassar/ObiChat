const fs = require('fs');
const express = require('express');
const multer = require('multer');
const axios = require('axios');
// const firebase = require("firebase/app");
// const admin = require("firebase-admin");
const storage = require("firebase/storage");
// const auth = require("firebase/auth");
const fbAuth = require('./fbAuth');
const
{
  firebase,
  admin
} = require('../routes/fbConfig');


const
{
  BucketsApi,
  ObjectsApi,
  PostBucketsPayload,
  DerivativesApi,
  JobPayload,
  JobPayloadInput,
  JobPayloadOutput,
  JobSvfOutputPayload
} = require('forge-apis');

const
{
  getClient,
  getInternalToken
} = require('./common/oauth');
const config = require('../config');

let router = express.Router();

// Middleware for obtaining a token for each request.
router.use(async (req, res, next) =>
{
  const token = await getInternalToken();
  req.oauth_token = token;
  req.oauth_client = getClient();
  next();
});



// GET /api/forge/oss/buckets - expects a query param 'id'; if the param is '#' or empty,
// returns a JSON with list of buckets, otherwise returns a JSON with list of objects in bucket with given name.
router.get('/buckets', async (req, res, next) =>
{
  const bucket_name = req.query.id;
  if (!bucket_name || bucket_name === '#')
  {
    try
    {
      // Retrieve buckets from Forge using the [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#getBuckets)
      const buckets = await new BucketsApi().getBuckets(
      {
        limit: 64
      }, req.oauth_client, req.oauth_token);
      res.json(buckets.body.items.map((bucket) =>
      {
        return {
          id: bucket.bucketKey,
          // Remove bucket key prefix that was added during bucket creation
          text: bucket.bucketKey.replace(config.credentials.client_id.toLowerCase() + '-', ''),
          type: 'bucket',
          children: true
        };
      }));
    }
    catch (err)
    {
      next(err);
    }
  }
  else
  {
    try
    {
      // Retrieve objects from Forge using the [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#getObjects)
      const objects = await new ObjectsApi().getObjects(bucket_name,
      {}, req.oauth_client, req.oauth_token);
      res.json(objects.body.items.map((object) =>
      {
        return {
          id: Buffer.from(object.objectId).toString('base64'),
          text: object.objectKey,
          type: 'object',
          children: false
        };
      }));
    }
    catch (err)
    {
      next(err);
    }
  }
});

// POST /api/forge/oss/buckets - creates a new bucket.
// Request body must be a valid JSON in the form of { "bucketKey": "<new_bucket_name>" }.
router.post('/buckets', async (req, res, next) =>
{
  let payload = new PostBucketsPayload();
  payload.bucketKey = config.credentials.client_id.toLowerCase() + '-' + req.body.bucketKey;
  payload.policyKey = 'transient'; // expires in 24h
  try
  {
    // Create a bucket using [BucketsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/BucketsApi.md#createBucket).
    await new BucketsApi().createBucket(payload,
    {}, req.oauth_client, req.oauth_token);
    res.status(200).end();
  }
  catch (err)
  {
    next(err);
  }
});

router.get('/files/:uid', async (req, res, next) =>
{
  try
  {

    const uid = req.params.uid;
    var docRef = admin.firestore().collection("Files").where('userID', 'array-contains', uid);
    const data = [];
    docRef.get().then(function(docs)
    {
      docs.forEach(function(doc)
      {
        data.push(doc.data());
      });
      return res.status(200).send(data);
    }).catch(function(error)
    {
      next(error);
    });
  }
  catch (err)
  {
    next(err);
  }

});

router.post('/objects/share', async (req, res, next) =>
{
  try
  {
    const
    {
      email,
      designName
    } = req.body;

    admin.auth().getUserByEmail(email)
      .then((userRecord) =>
      {
        const owner = req.query.uid;
        const remove = req.query.remove;
        const userToShare = userRecord.toJSON().uid;
        admin.firestore().collection('Files')
          .where('owner', '==', owner)
          .where('designName', '==', designName)
          .get()
          .then((data) =>
          {
            const files = [];
            data.forEach((obj) =>
            {
              files.push(
              {
                ...obj.data(),
                id: obj.id
              });
            });

            if (!files.length)
            {
              return res.status(404).send(
              {
                message: `you do not own any file called ${designName}`,
              });
            }

            const ref = admin.firestore().collection('Files')
              .doc(files[0].id);

            ref.update(
            {
              ...files[0],
              userID: remove ? files[0].userID.filter((user) => user !== userToShare) : [...files[0].userID, userToShare].filter((x, index, self) => self.indexOf(x) === index)
            });

            return res.status(201).send()


          })
          .catch((err) =>
          {
            next(err);
          });



      });

  }
  catch (err)
  {
    next(err);
  }

})

// POST /api/forge/oss/objects - uploads new object to given bucket.
// Request body must be structured as 'form-data' dictionary
// with the uploaded file under "fileToUpload" key, and the bucket name under "bucketKey".
router.post('/objects', multer(
{
  dest: 'uploads/'
}).single('fileToUpload'), async (req, res, next) =>
{

  fs.readFile(req.file.path, async (err, data) =>
  {
    if (err)
    {
      next(err);
    }
    try
    {
      let uid = req.query.uid;
      let idToken = req.query.token;
      let email = req.query.email;

      // Upload an object to bucket using [ObjectsApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/ObjectsApi.md#uploadObject).
      const response = await new ObjectsApi().uploadObject(req.body.bucketKey, req.file.originalname, data.length, data,
      {}, req.oauth_client, req.oauth_token);
      if (response.statusCode === 200)
      {
        let buff = Buffer(response.body.objectId);
        let job = new JobPayload();
        job.input = new JobPayloadInput();
        job.input.urn = buff.toString('base64');
        job.output = new JobPayloadOutput([
          new JobSvfOutputPayload()
        ]);
        job.output.formats[0].type = 'svf';
        job.output.formats[0].views = ['2d', '3d'];
        try
        {
          console.log('translating');
          const token = req.oauth_token.access_token;

          // Submit a translation job using [DerivativesApi](https://github.com/Autodesk-Forge/forge-api-nodejs-client/blob/master/docs/DerivativesApi.md#translate).
          await new DerivativesApi().translate(job,
          {}, req.oauth_client, req.oauth_token);
          // setInterval(function()
          // {
          console.log('polling');
          var config = {
            method: 'get',
            url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + buff.toString('base64') + '/manifest',
            headers:
            {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:84.0) Gecko/20100101 Firefox/84.0',
              'Accept': '*/*',
              'Accept-Language': 'en-GB,en;q=0.5',
              'Authorization': 'Bearer ' + token,
              'Origin': 'http://localhost:3000',
              'Connection': 'keep-alive',
              'Referer': 'http://localhost:3000/view',
              'Pragma': 'no-cache',
              'Cache-Control': 'no-cache'
            }
          };

          //user logs in on frontend using username and password
          // backend verifies user is logged in and redirects them to the view page
          //you can save the user id to local storage or using session storage / cookies
          //when making any request to the backend, pass in the id as a query parameter/ param, and then use it to upload 

          axios(config)
            .then(function(response)
            {
              response = response.data;
              console.log(response.progress, response.status);
              if (response.progress === "complete")
              {
                if (response.status === "success")
                {
                  console.log("JOB COMPLETE", job);
                  // upload to firebase here
                  try
                  {
                    var file = job.output;
                    var fileName = req.file.originalname;
                    var urn = job.input.urn;

                    const userDocRef = admin.firestore().collection(`Files`).doc();

                    userDocRef.set(
                    {
                      bucketKey: req.body.bucketKey,
                      owner: uid,
                      userID: [uid],
                      designName: fileName,
                      objectID: urn,
                      userEmail: email
                    });

                  }
                  catch (err)
                  {
                    next(err);
                    return;
                  }
                }
                else
                {
                  console.log("Failed");
                }

              }
              else
              {
                console.log("Failed");
              }

            })
            .catch(function(error)
            {
              console.log(error);
              return;
            });
          res.status(200).end();
        }
        catch (err)
        {
          next(err);
          return;
        }
      }
      else
      {
        console.log('bad')
        res.status(response.statusCode).end(response);
      }
    }
    catch (err)
    {
      next(err);
      return;
    }

  });
});

module.exports = router;