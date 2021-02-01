$(document).ready(function()
{
  prepareAppBucketTree();
  $('#refreshBuckets').click(function()
  {
    $('#appBuckets').jstree(true).refresh();
  });

  $('#createNewBucket').click(function()
  {
    createNewBucket();
  });

  $('#createBucketModal').on('shown.bs.modal', function()
  {
    $("#newBucketKey").focus();
  })

  $('#hiddenUploadField').change(function()
  {
    var node = $('#appBuckets').jstree(true).get_selected(true)[0];
    var _this = this;
    if (_this.files.length == 0) return;
    var file = _this.files[0];
    switch (node.type)
    {
      case 'bucket':
        var formData = new FormData();
        formData.append('fileToUpload', file);
        formData.append('bucketKey', node.id);

        let uid = localStorage.getItem('uid');
        let token = localStorage.getItem('token');


        $.ajax(
        {
          url: `/api/forge/oss/objects?uid=${uid}&token=${token}`,
          data: formData,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function(data)
          {
            $('#appBuckets').jstree(true).refresh_node(node);
            _this.value = '';
          }
        });
        break;
    }
  });
});

function createNewBucket()
{
  var bucketKey = $('#newBucketKey').val();
  jQuery.post(
  {
    url: '/api/forge/oss/buckets',
    contentType: 'application/json',
    data: JSON.stringify(
    {
      'bucketKey': bucketKey
    }),
    success: function(res)
    {
      $('#appBuckets').jstree(true).refresh();
      $('#createBucketModal').modal('toggle');
    },
    error: function(err)
    {
      if (err.status == 409)
        alert('Bucket already exists - 409: Duplicated')
      console.log(err);
    }
  });
}

//TODO - Add reference to the user's uid
// - send link shown files to the autodesk database

function prepareAppBucketTree()
{
  let storageRef = storage.ref('Users/A47GMtgyM2aoFDArAzBTt4greVF3');
  // console.log(allImages);
  const data = []
  storageRef
    .listAll()
    .then(function(res)
    {
      res.items.forEach((imageRef) =>
      {

        //  imageRef.getDownloadURL().then((url) => {
        //      console.log("==========url", url)
        //  data.push({
        //    name: imageRef.name,
        //    url,
        //    id: imageRef.name
        //  })
        data.push(imageRef.name);
        // if (allImages.indexOf(url) === -1) {
        //   setImages((allImages) => [...allImages, url]);
        // }
        //});
      });

      $('#appBuckets').jstree(
      {
        'core':
        {
          'themes':
          {
            "icons": true
          },
          'check_callback': true,
          'data': [
          {
            text: 'A47GMtgyM2aoFDArAzBTt4greVF3',
            'icon': 'glyphicon glyphicon-folder-open',
            'type': 'bucket',
            children: data.map((text) => (
            {
              text,
              'icon': 'glyphicon glyphicon-file',
              type: 'object'
            }))
          }]
          //  {
          //   "url": '/api/forge/oss/buckets',
          //   "dataType": "json",
          //   'multiple': false,
          //   "data": function (node) {
          //     console.log("===node", node)
          //     return { "id": node.id };
          //   }
          // }
        },
       
        "plugins": ["types", "state", "sort", "contextmenu"],
        contextmenu:
        {
          items: autodeskCustomMenu
        }
      }).on('loaded.jstree', function()
      {
        $('#appBuckets').jstree('open_all');
      }).bind("activate_node.jstree", function(evt, data)
      {
        if (data != null && data.node != null && data.node.type == 'object')
        {


          // $("#forgeViewer").empty();
          // var urn = data.node.id;
          // getForgeToken(function (access_token) {
          //   jQuery.ajax({
          //     url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest',
          //     headers: { 'Authorization': 'Bearer ' + access_token },
          //     success: function (res) {
          //       if (res.status === 'success') launchViewer(urn);
          //       else $("#forgeViewer").html('The translation job still running: ' + res.progress + '. Please try again in a moment.');
          //     },
          //     error: function (err) {
          //       var msgButton = 'This file is not translated yet! ' +
          //         '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' +
          //         'Start translation</button>'
          //       $("#forgeViewer").html(msgButton);
        }
        // });
      })

    })
    .catch(function(error)
    {
      console.log(error);
    });


  // });
}

function autodeskCustomMenu(autodeskNode)
{
  console.log(autodeskNode)
  var items;

  switch (autodeskNode.type)
  {
    case "bucket":
      items = {
        uploadFile:
        {
          label: "Upload file",
          action: function()
          {
            uploadFile();
          },
          icon: 'glyphicon glyphicon-cloud-upload'
        }
      };
      break;
    case "object":
      items = {
        translateFile:
        {
          label: "Translate",
          action: function()
          {
            var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
            translateObject(treeNode);
          },
          icon: 'glyphicon glyphicon-eye-open'
        }
      };
      break;
  }

  return items;
}

function uploadFile()
{
  $('#hiddenUploadField').click();
}

function translateObject(node)
{
  $("#forgeViewer").empty();
  if (node == null) node = $('#appBuckets').jstree(true).get_selected(true)[0];
  console.log(node)
  var bucketKey = node.parents[0];
  var objectKey = node.id;
  // jQuery.post({
  //   url: '/api/forge/modelderivative/jobs',
  //   contentType: 'application/json',
  //   data: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey }),
  //   success: function (res) {
  //     $("#forgeViewer").html('Translation started! Please try again in a moment.');
  //   },
  // });
}