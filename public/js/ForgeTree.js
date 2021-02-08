let firebaseData = []
$(document).ready(function()
{

  prepareAppBucketTree();
  $('#refreshBuckets').click(function()
  {
    $('#appBuckets').jstree(true).refresh();
  });

  // $('#createNewBucket').click(function()
  // {
  //   createNewBucket();
  // });

  // $('#createBucketModal').on('shown.bs.modal', function()
  // {
  //   $("#newBucketKey").focus();
  // });

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
        formData.append('bucketKey', "zmzmzm");

        let uid = localStorage.getItem('uid');
        let token = localStorage.getItem('token');
        let email = localStorage.getItem('email');


        $.ajax(
        {
          url: `/api/forge/oss/objects?uid=${uid}&token=${token}&email=${email}`,
          data: formData,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function(data)
          {
            firebaseData = []
            setTimeout(() =>
            {
              fetchFirebaseData()
                .then((data) =>
                {
                  $('#appBuckets').jstree(true).refresh_node(node);
                  _this.value = '';
                });
            }, 3000);
          }
        });
        break;
    }
  });
});


// function createNewBucket()
// {
//   var bucketKey = $('#newBucketKey').val();
//   jQuery.post(
//   {
//     url: '/api/forge/oss/buckets',
//     contentType: 'application/json',
//     data: JSON.stringify(
//     {
//       'bucketKey': bucketKey
//     }),
//     success: function(res)
//     {
//       $('#appBuckets').jstree(true).refresh();
//       $('#createBucketModal').modal('toggle');
//     },
//     error: function(err)
//     {
//       if (err.status == 409)
//         alert('Bucket already exists - 409: Duplicated')
//       console.log(err);
//     }
//   });
// }

//TO DO - Add sharing function based on object ID and userID

// $( "#InviteClient" ).submit(function( event ) {
//   console.log( $( this ).serialize() );
//   event.preventDefault();
// });


$('#invite').click(function(event)
{
  event.preventDefault();
  var values = {
    email: $('#DropdownFormEmail').val(),
    designName: $('#DropdownFormDesignName').val()
  };

  uid = localStorage.getItem('uid');
  $.ajax(
  {

    url: `/api/forge/oss/objects/share?uid=${uid}`,
    data: JSON.stringify(values),
    contentType: 'application/json',
    type: 'POST',
    success: (res) =>
    {
      console.log("====res", res)
    },
    error: (error) =>
    {
      console.log("====error", error)
    }
  }, );

  var emailSub = "Invitation to view a design";
  var emailBody = "I'm inviting you to view a CAD design on Obi. %0A%0AObi is a quick, easy way of viewing CAD designs in your web browser and sharing them with others. %0A%0A- Sign up to view design at http://localhost:3000/signup %0A%0A- Or log in at http://localhost:3000/login %0A"

  window.open("mailto:"+values.email + "?subject=" + emailSub + "&body=" + emailBody);


});


$('#remove').click(function(event)
{
  event.preventDefault();
  var values = {
    email: $('#DropdownFormEmail').val(),
    designName: $('#DropdownFormDesignName').val()
  };

  uid = localStorage.getItem('uid');
  $.ajax(
  {
    url: `/api/forge/oss/objects/share?uid=${uid}&remove=true`,
    data: JSON.stringify(values),
    contentType: 'application/json',
    type: 'POST',
    success: (res) =>
    {
      console.log("====res", res)
    },
    error: (error) =>
    {
      console.log("====error", error)
    }
  }, );


});


function fetchFirebaseData()
{
  return new Promise((resolve, reject) =>
  {
    // console.log(localStorage.getItem('uid'));
    uid = localStorage.getItem('uid');
    $.ajax(
    {
      url: `/api/forge/oss/files/${uid}`,
      contentType: 'application/json',
      type: 'GET',
      success: (res) =>
      {
        firebaseData = res;
        resolve(firebaseData);
        firebaseData.forEach((file)=> {
          $('#DropdownFormDesignName').append(`<option value=${file.designName}> ${file.designName}</option>`)
        })
       
        // console.log("====res", res)
      },
      error: (error) =>
      {
        reject(error);
      }
    }, );

  })
}

function prepareAppBucketTree()
{
  fetchFirebaseData()
    .then(() =>
    {
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
            text: "My Designs" /* localStorage.getItem('uid') */ ,
            'icon': 'glyphicon glyphicon-folder-open',
            type: 'bucket',
            children: firebaseData.map((doc) => (
            {
              text: doc.designName,
              'icon': 'glyphicon glyphicon-file',
              type: 'object',
              ...doc,
            }))
          }]
        },
        'types':
        {
          'default':
          {
            'icon': 'glyphicon glyphicon-question-sign'
          },
          '#':
          {
            'icon': 'glyphicon glyphicon-cloud'
          },
          'bucket':
          {
            'icon': 'glyphicon glyphicon-folder-open'
          },
          'object':
          {
            'icon': 'glyphicon glyphicon-file'
          }
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
          // console.log(data);
          $("#forgeViewer").empty();
          var urn = data.node.original.objectID;
          // console.log(urn);
          getForgeToken(function(access_token)
          {
            jQuery.ajax(
            {
              url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest',
              headers:
              {
                'Authorization': 'Bearer ' + access_token
              },
              success: function(res)
              {
                if (res.status === 'success') launchViewer(urn);
                else $("#forgeViewer").html('The translation job still running: ' + res.progress + '. Please try again in a moment.');
              },
              error: function(err)
              {
                var msgButton = 'This file is not translated yet! ' +
                  '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' +
                  'Start translation</button>'
                $("#forgeViewer").html(msgButton);
              }
            });
          })
        }
      })
    })
    .catch(function(error)
    {
      console.log(error);
    });
}




function autodeskCustomMenu(autodeskNode)
{
  // console.log(autodeskNode)
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
    // case "object":
    //   items = {
    //     copyFileName:
    //     {
    //       label: "Copy",
    //       action: function()
    //       {
    //         //TODO - add design name from firebase and copy that
    //         // $.ajax(
    //         //   {
    //         //     let uid = localStorage.getItem('uid');

    //         //     url: `/api/forge/oss/objects/share?uid=${uid}`,
    //         //     data: JSON.stringify(values),
    //         //     contentType: 'application/json',
    //         //     type: 'POST',
    //         //     success: (res) =>
    //         //     {
    //         //       console.log("====res", res)
    //         //     },
    //         //     error: (error) =>
    //         //     {
    //         //       console.log("====error", error)
    //         //     }
    //         //   }, );


    //         var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
    //         var copyText = document.querySelector("#text");

    //         copyText.select();
    //         console.log(copyText);
    //         document.execCommand("copy");
    //         // translateObject(treeNode);
    //       },
    //       icon: 'glyphicon glyphicon-eye-open'
    //     }
    //   };
    //   break;
  }

  return items;
}

function uploadFile()
{
  $('#hiddenUploadField').click();
}

// function translateObject(node)
// {
//   $("#forgeViewer").empty();
//   if (node == null) node = $('#appBuckets').jstree(true).get_selected(true)[0];
//   // console.log(node)
//   var bucketKey = node.parents[0];
//   var objectKey = node.id;
//   // jQuery.post({
//   //   url: '/api/forge/modelderivative/jobs',
//   //   contentType: 'application/json',
//   //   data: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey }),
//   //   success: function (res) {
//   //     $("#forgeViewer").html('Translation started! Please try again in a moment.');
//   //   },
//   // });
// }