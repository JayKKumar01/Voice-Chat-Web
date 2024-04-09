const logsTextarea = document.getElementById('logs');
const peerBranch = "JayKKumar01-Voice_Chat_Web-";
const randomId = getRandomCode();

let peer;
let myId;
let connections = [];
let peers = {};
let isHost = true;
let myName;

document.addEventListener('DOMContentLoaded', function () {
    setRandomName();
});




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

    // Create a PeerJS instance

    const peerId = `${peerBranch}${randomId}`;

    peer = new Peer(peerId);

    peer.on('open', function (id) {
        myId = id.replace(peerBranch, '');
        appendLog('Connected to PeerJS server. Your ID is: ' + myId);
        if (!isHost) {
            connectPeer();
        }
    });

    peer.on('connection', function (connection) {
        connection.on('open', () => setupConnection(connection));
    });
}

function connectPeer() {
    const codeInput = document.getElementById('codeField').value;
    connect(codeInput);
}

function connect(otherId) {
    let connection = peer.connect(peerBranch + otherId, { reliable: true });
    connection.on('open', () => setupConnection(connection));
    // connection.on('close', onDataConnectionClose);
    // connection.on('error', onDataConnectionError);
}

function setupConnection(connection) {
    connections.push(connection);
    const remoteId = connection.peer.replace(peerBranch, '');

    appendLog(`Connected to ${remoteId}`);
    connection.on('data', handleData);
    connection.on('error', (err) => appendLog(`Connection error: ${err}`));

    connection.send({
        type: 'askName',
        peerId: randomId,
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
    // Check the type of data received
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
            break;
        default:
            // Handle other types of data if needed
            break;
    }
}














function checkCode() {
    var codeInput = document.getElementById('codeField');
    var joinButton = document.getElementById('joinButton');

    codeInput.value = codeInput.value.replace(/\D/g, '');

    // Check if the input field is empty
    if (codeInput.value === '') {
        codeInput.style.backgroundColor = ''; // Revert back to default background color
        joinButton.innerHTML = "HOST";
        isHost = true;
        return; // Exit the function early if input is empty
    }



    // Change background color to red
    codeInput.style.backgroundColor = '#800000';

    // Check if codeInput contains exactly 6 digits
    if (/^\d{6}$/.test(codeInput.value)) {
        joinButton.innerHTML = "JOIN";
        codeInput.style.backgroundColor = ''; // Revert back to default background color
        isHost = false;
        appendLog("Ready to Join " + codeInput.value);
    } else {
        joinButton.innerHTML = "HOST";
        isHost = true;
    }
}
