// Constants
const logsTextarea = document.getElementById('logs');
const codeInput = document.getElementById('codeField');
const container = document.querySelector('.container');
const peerListContainer = document.getElementById('peersContainer');
const peerList = document.getElementById('peersList');

const peerBranch = "JayKKumar01-Voice_Chat_Web-";

// Variables
let peer, myId, connections = [], peers = {}, isHost = true, myName;
let localStream;

// Event listener
document.addEventListener('DOMContentLoaded', function () {
    setRandomName();
});

// Utility functions
function getRandomCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

function appendLog(log) {
    logsTextarea.value += `${log}\n`;
    logsTextarea.scrollTop = logsTextarea.scrollHeight;
}

function setRandomName() {
    const names = ["Tom Cruise", "Angelina Jolie", "Brad Pitt", "Jennifer Aniston", "Leonardo DiCaprio", "Scarlett Johansson", "Johnny Depp", "Jennifer Lawrence", "Will Smith", "Natalie Portman", "George Clooney", "Meryl Streep", "Robert Downey Jr.", "Emma Stone", "Matt Damon", "Julia Roberts", "Chris Hemsworth", "Sandra Bullock", "Dwayne Johnson", "Anne Hathaway"];
    const randomIndex = Math.floor(Math.random() * names.length);
    const randomName = names[randomIndex];
    document.getElementById('nameField').value = randomName;
}

function openPeer() {
    const nameInput = document.getElementById('nameField').value;
    if (nameInput.length === 0) {
        appendLog('Please enter your Name...');
        return;
    }
    myName = nameInput;
    const peerId = `${peerBranch}${getRandomCode()}`;
    peer = new Peer(peerId);
    peer.on('open', onPeerOpen);
    peer.on('connection', onPeerConnection);
    peer.on('call', function (call) {

        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
        getUserMedia({ video: false, audio: true }, function (stream) {
            localStream = stream;
            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', function (remoteStream) {
                createAudioElement(remoteStream);
            });
        }, function (err) {
            appendLog('Failed to get local stream: '+ err);
        });
    });

}

function onPeerOpen(id) {
    myId = id.replace(peerBranch, '');
    togglePeerListVisibility();
    appendLog('Connected to PeerJS server. Your ID is: ' + myId);
    if (!isHost) {
        connect(codeInput.value);
    }
}

function onPeerConnection(connection) {
    connection.on('open', () => setupConnection(connection));
}



function connect(otherId) {
    let connection = peer.connect(peerBranch + otherId, { reliable: true });
    connection.on('open', () => setupConnection(connection));

    var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    getUserMedia({ video: false, audio: true }, function (stream) {
        localStream = stream;
        var call = peer.call(peerBranch + otherId, stream);
        call.on('stream', function (remoteStream) {
            createAudioElement(remoteStream);
        });
    }, function (err) {
        appendLog('Failed to get local stream: ' + err);
    });


    // navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    //     .then((stream) => {
    //         localStream = stream;
    //         const call = peer.call(otherId, stream);
    //         call.on('stream', (remoteStream) => {
    //             createAudioElement(remoteStream);
    //         });
    //     })
    //     .catch((error) => {
    //         appendLog('Error accessing media devices: ' + error);
    //     });


}

function setupConnection(connection) {
    connections.push(connection);
    const remoteId = connection.peer.replace(peerBranch, '');
    appendLog(`Connected to ${remoteId}`);
    connection.on('data', handleData);
    connection.on('error', (err) => appendLog(`Connection error: ${err}`));
    connection.send({
        type: 'askName',
        peerId: myId,
        name: myName
    });
    if (isHost) {
        connection.send({
            type: 'userlist',
            data: peers
        });
        peers[remoteId] = peers[remoteId] || null;
    }
}

function handleData(data) {
    switch (data.type) {
        case 'userlist':
            const userlist = data.data;
            for (const remoteId in userlist) {
                connect(remoteId);
            }
            break;
        case 'askName':
            peers[data.peerId] = data.name;
            appendLog(data.peerId + ": " + data.name);
            updatePeerList();
            break;
        default:
            break;
    }
}
function togglePeerListVisibility() {
    container.style.display = 'none';
    peerListContainer.style.display = 'block';
    updatePeerList();
}

function updatePeerList() {

    // Clear previous peer list
    peerList.innerHTML = '';

    const listItem = document.createElement('li');
    listItem.textContent = `${myId}: ${myName}`;
    peerList.appendChild(listItem);
    // Add new list items for each peer
    for (const peerId in peers) {
        const peerName = peers[peerId];
        const listItem = document.createElement('li');
        listItem.textContent = `${peerId}: ${peerName}`;
        peerList.appendChild(listItem);
    }
}

function createAudioElement(stream) {
    const audioContainer = document.getElementById('audioContainer');
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    audioContainer.appendChild(audioElement);
    audioElement.srcObject = stream;
    audioElement.play();
}

function checkCode() {
    var codeInput = document.getElementById('codeField');
    var joinButton = document.getElementById('joinButton');
    codeInput.value = codeInput.value.replace(/\D/g, '');
    if (codeInput.value === '') {
        codeInput.style.backgroundColor = '';
        joinButton.innerHTML = "HOST";
        isHost = true;
        return;
    }
    codeInput.style.backgroundColor = '#800000';
    if (/^\d{6}$/.test(codeInput.value)) {
        joinButton.innerHTML = "JOIN";
        codeInput.style.backgroundColor = '';
        isHost = false;
        appendLog("Ready to Join " + codeInput.value);
    } else {
        joinButton.innerHTML = "HOST";
        isHost = true;
    }
}
