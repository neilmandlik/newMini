const net = require('net');

// Replace with the IP address of the server laptop
const serverIP = '172.27.93.23'; // Server IP address
const port = 9999;

// Create a socket client
const client = new net.Socket();
client.connect(port, serverIP, function() {
    console.log(`Connected to server at ${serverIP}:${port}`);
});

client.on('data', function(data) {
    // Convert the received data (Buffer) to string
    const jsonData = data.toString();

    // Parse the JSON string into an array of objects
    const dataframe = JSON.parse(jsonData);

    // Print the received dataframe
    console.log("Received Dataframe:", dataframe);

    // Close the connection
    client.destroy();
});

client.on('close', function() {
    console.log('Connection closed');
});