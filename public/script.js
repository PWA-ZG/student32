let player = document.getElementById("player");
let canvas = document.getElementById("cnv");
let beforeSnap = document.getElementById("beforeSnap");
let afterSnap = document.getElementById("afterSnap");
let snapName = document.getElementById("snapName");
let btnSnap = document.getElementById("btnSnap");
let fileInput = document.getElementById("fileInput");
let btnFileUpload = document.getElementById("fileUpload");
let uploadFileCaption = document.getElementById("uploadFile");

let initialize = function () {
    beforeSnap.style.display = 'block';
    afterSnap.style.display = 'none';

    navigator.mediaDevices
             .getUserMedia({ video: true, audio: false })
             .then(stream => {
                player.srcObject = stream;
                btnSnap.style.display = 'block';
                btnFileUpload.style.display = 'none';
                uploadFileCaption.style.display = 'none'
             })
             .catch(err => {
                btnSnap.style.display = 'none';
                btnFileUpload.style.display = 'block';
                uploadFileCaption.style.display = 'block'
             });
};

initialize();

let snap = function () {
    beforeSnap.style.display = 'none';
    afterSnap.style.display = 'block';

    player.srcObject.getVideoTracks().forEach(function (track) {
        track.stop();
    });
};

document.getElementById("btnSnap").addEventListener("click", function (event) {
    canvas.width = player.getBoundingClientRect().width;
    canvas.height = player.getBoundingClientRect().height;
    canvas.getContext("2d")
          .drawImage(player, 0, 0, canvas.width, canvas.height);
    
    snap();
});

document.getElementById("btnUpload").addEventListener("click", function (event) {
    event.preventDefault();

    let imageDataUrl = canvas.toDataURL();

    alert('Uploading photo. You will be redirected soon');

    fetch('/upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageDataUrl, caption: snapName.value }),
    })
    .then(response => response.json())
    .then(data => {
        if(data.redirect){
            window.location.href = data.redirect;
        }
    });
});

btnFileUpload.addEventListener("click", function (event) {
    if(fileInput.files.length > 0){
        let fileReader = new FileReader();
        fileReader.onload = function (e) {
            let imageDataUrl = e.target.result;

            alert('Uploading photo. You will be redirected soon');

            fetch('/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageDataUrl, caption: snapName.value }),
            })
            .then(response => response.json())
            .then(data => {
                if(data.redirect){
                    window.location.href = data.redirect;
                }
            });
        }
        
        fileReader.readAsDataURL(fileInput.files[0]);
    }
    else{
        alert("Please select a file to upload");
    }
});