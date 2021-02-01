




const getFromFirebase = () => {
    let storageRef = storage.ref('Users/A47GMtgyM2aoFDArAzBTt4greVF3');
   // console.log(allImages);
    storageRef
      .listAll()
      .then(function (res) {
        res.items.forEach((imageRef) => {
          imageRef.getDownloadURL().then((url) => {
              console.log("==========url", url)
            // if (allImages.indexOf(url) === -1) {
            //   setImages((allImages) => [...allImages, url]);
            // }
          });
        });
      })
      .catch(function (error) {
        console.log(error);
      });
  };