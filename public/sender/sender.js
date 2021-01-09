
var HOST = location.origin.replace(/^http/, 'ws')
var webSocket = new WebSocket(HOST);

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
            peerConn.setRemoteDescription(data.answer)
            break
        case "offer":
            peerConnj.setRemoteDescription(data.offer)
            createAndSendAnswerj()
            break
        case "candidate":
            if(data.from == 'receiver')
                peerConn.addIceCandidate(data.candidate)
            else
                peerConnj.addIceCandidate(data.candidate)
    }
}

function sendData(data) {
    data.username = username
    data.from = 'sender'
    webSocket.send(JSON.stringify(data))
}

let localStream
let peerConn
let username

/*
This 'startCall' function takes the user ID of the person who starts the call.
And this function is soul function require this function in another module and call it, then it starts a call with user ID as room name.
*/
function startCall() {
    username = document.getElementById('username-input').value;
    sendData({
        type: "store_user"
    })
    document.getElementById("video-call-div")
    .style.display = "inline"
    //navigator.getWebcam = (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    })
    .then((stream) => {
        localStream = stream
        console.log('here');
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

        peerConn = new RTCPeerConnection(configuration)
        localStream.getTracks().forEach(function(track) {
            peerConn.addTrack(track, localStream);
          });

        peerConn.ontrack = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.streams[0];
            console.log(e.streams[0]);
        }

        peerConn.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    })
    .catch((error) => {
        console.log(error)
    })
}

function createAndSendOffer() {
    peerConn.createOffer((offer) => {
        sendData({
            type: "store_offer",
            offer: offer
        })

        peerConn.setLocalDescription(offer)
    }, (error) => {
        console.log(error)
    })
}


/*
require these two functions and mute and unmute video and audio 
*/
var isAudio=true;
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
    if(isAudio==true)
        document.getElementById('audio-btn').textContent = 'Mute Audio'
    else
        document.getElementById('audio-btn').textContent = 'Unmute Audio'
}

var isVideo=true;
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
    if(isVideo==true)
        document.getElementById('video-btn').textContent = 'Mute Video'
    else
        document.getElementById('video-btn').textContent = 'Unmute Video'
}








function createAndSendAnswerj () {
    peerConnj.createAnswer((answer) => {
        peerConnj.setLocalDescription(answer)
        sendDataj({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

function sendDataj(data) {
    data.username = usernamej
    data.from = 'receiver'
    webSocket.send(JSON.stringify(data))
}


let peerConnj
let usernamej


/*
This 'joinCall' function takes the user ID of the person who starts the call.
And this function is soul function. Require this function in another module and call it, then it join the room having room name as the user ID.
*/

function joinCall() {

    usernamej = document.getElementById('username-input').value;
    

    document.getElementById("video-call-div")
    .style.display = "inline"

    //navigator.getWebcam = (navigator.mediaDevices.getUserMedia || navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    navigator.mediaDevices.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    })
    .then((stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]
                }
            ]
        }

        peerConnj = new RTCPeerConnection(configuration)
        localStream.getTracks().forEach(function(track) {
            peerConnj.addTrack(track, localStream);
          });

        peerConnj.ontrack = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.streams[0]
        }

        peerConnj.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            
            sendDataj({
                type: "send_candidate",
                candidate: e.candidate
            })
        })

        sendDataj({
            type: "join_call"
        })

    })
    .catch((error) => {
        console.log(error)
    })
}
