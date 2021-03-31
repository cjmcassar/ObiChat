let firebaseData = [];

// initialise bucket tree functions
$(document).ready(function()
{

  prepareAppBucketTree();

  $('#refreshBuckets').click(function()
  {
    $('#appBuckets').jstree(true).refresh();
  });

  $('#hiddenUploadField').change(function()
  {
    var node = $('#appBuckets').jstree(true).get_selected(true)[0];
    //console.log("=======triggered", this.files.length, node ? node.type : "bucket");
    var _this = this;
    if (_this.files.length == 0) return;
    var file = _this.files[0];
    switch (node ? node.type : "bucket")
    {
      case 'bucket':
        var formData = new FormData();
        formData.append('fileToUpload', file);
        formData.append('bucketKey', "zmzmzm");

        let uid = localStorage.getItem('uid');
        let token = localStorage.getItem('token');
        let email = localStorage.getItem('email');

        //Progress bar
        var $modal = $('.js-loading-bar'),
          $bar = $modal.find('.progress-bar');
        $modal.modal('show');
        $bar.addClass('animate');

        $.ajax(
        {
          url: `/api/forge/oss/objects?uid=${uid}&token=${token}&email=${email}`,
          data: formData,
          processData: false,
          contentType: false,
          type: 'POST',
          success: function(data)
          {
            firebaseData = [];

            fetchFirebaseData()
              .then((data) =>
              {
                $bar.removeClass('animate');
                $modal.modal('hide');
                location.reload();
                _this.value = '';
              });

          }
        });
        break;

        case 'object':

        alert("Please select the Folder -My Designs- before uploading");

        break;
    }
  });
});

//Invite client to view file from user
$('#invite').click(function(event)
{
  event.preventDefault();
  var values = {
    email: $('#DropdownFormEmail').val(),
    designName: $('#DropdownFormDesignName').val()
  };

  let uid = localStorage.getItem('uid');

  
  $.ajax(
  {

    url: `/api/forge/oss/objects/share?uid=${uid}`,
    data: JSON.stringify(values),
    contentType: 'application/json',
    type: 'POST',
    success: (res) =>
    {
      console.log("====res", res);
    },
    error: (error) =>
    {
      console.log("====error", error);
    }
  }, );

  var email = $('#DropdownFormEmail').val();
  const userEmail = localStorage.getItem('email');
  let token = localStorage.getItem('token');

  $.ajax(
  {
    url: `/api/CometChat/chat/add-friend?uid=${uid}&token=${token}&email=${email}`,
    data: JSON.stringify(
    {
      email,
      userEmail
    }),
    contentType: 'application/json',
    type: 'POST',
    success: (res) =>
    {
      console.log("====res", res);
    },
    error: (error) =>
    {
      console.log("====error", error);
    }
  });

  var emailSub = "Invitation to view a design";
  var emailBody = "I'm inviting you to view a CAD design on Obi. %0A%0AObi is a quick, easy way of viewing CAD designs in your web browser and sharing them with others. %0A%0A- Sign up to view design at https://obi-vision.herokuapp.com/signup %0A%0A- Or log in at https://obi-vision.herokuapp.com/login %0A%0A";

  window.open("mailto:" + values.email + "?subject=" + emailSub + "&body=" + emailBody);


});

//Remove client to view client's file
$('#remove').click(function(event)
{
  event.preventDefault();
  var values = {
    email: $('#DropdownFormEmail').val(),
    designName: $('#DropdownFormDesignName').val()
  };

  let uid = localStorage.getItem('uid');
  $.ajax(
  {
    url: `/api/forge/oss/objects/share?uid=${uid}&remove=true`,
    data: JSON.stringify(values),
    contentType: 'application/json',
    type: 'POST',
    success: (res) =>
    {
      console.log("====res", res);
    },
    error: (error) =>
    {
      console.log("====error", error);
    }
  }, );


  //TODO - need to call the api from the server
  var email = $('#DropdownFormEmail').val();
  const userEmail = localStorage.getItem('email');
  let token = localStorage.getItem('token');

  $.ajax(
  {
    url: `/api/CometChat/chat/delete-friend?uid=${uid}&token=${token}&email=${email}`,
    data: JSON.stringify(
    {
      email,
      userEmail
    }),
    contentType: 'application/json',
    type: 'POST',
    success: (res) =>
    {
      console.log("====res", res);
    },
    error: (error) =>
    {
      console.log("====error", error);
    }
  });


});

//Only show user's files that are listed on Cloud Firestor
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
        firebaseData.forEach((file) =>
        {
          $('#DropdownFormDesignName').append(`<option value="${file.designName}"> ${file.designName}</option>`);
        });

        // console.log("====res", res)
      },
      error: (error) =>
      {
        reject(error);
      }
    }, );

  });
}

//Organise files in bucket tree based on file type
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
          items: rightClickItemCustomMenu
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
                  'Start translation</button>';
                $("#forgeViewer").html(msgButton);
              }
            });
          });
        }
      });
    })
    .catch(function(error)
    {
      console.log(error);
    });
}

//Assign right-click user functions to the items based on file type
function rightClickItemCustomMenu(autodeskNode)
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
    case "object":
      items = {
        copyFileName:
        {
          label: "Delete",
          action: function(item, secondItem)
          {
            let uid = localStorage.getItem('uid');
            let token = localStorage.getItem('token');
            const
            {
              bucketKey,
              designName,
              owner
            } = autodeskNode.original;
            //TODO - add design name from firebase and copy that
            $.ajax(
            {


              url: `/api/forge/oss/delete/objects?uid=${uid}&token=${token}`,
              data: JSON.stringify(
              {
                bucketKey,
                designName,
                owner
              }),
              contentType: 'application/json',
              type: 'POST',
              success: (res) =>
              {
                console.log("====res", res);
                location.reload();
              },
              error: (error) =>
              {
                console.log("====error", error);
              }
            }, );


            // var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
            // var copyText = document.querySelector("#text");

            // copyText.select();
            // console.log(copyText);
            // document.execCommand("copy");
            // translateObject(treeNode);
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