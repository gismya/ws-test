const axios = require('axios');
const WebSocket = require('ws');

const FTRACK_SERVER = process.env.FTRACK_SERVER.replace('https://', '');
const FTRACK_API_USER = process.env.FTRACK_API_USER;
const FTRACK_API_KEY = process.env.FTRACK_API_KEY;
// Function to get the ID
async function getId() {
    try {
      const response = await axios.get(`https://${FTRACK_SERVER}/socket.io/1/`, {
        headers: {
          'ftrack-api-user': FTRACK_API_USER,
          'ftrack-api-key': FTRACK_API_KEY,
        },
        params: {
          api_user: FTRACK_API_USER,
        },
      });
  
      return response.data.split(':')[0];
    } catch (error) {
      console.error('Error getting ID:', error);
      return null;
    }
  }
  
  // Function to connect to the WebSocket server
  async function connectToWebSocket() {
    const id = await getId();
  
    if (id) {
      const ws = new WebSocket(`wss://${FTRACK_SERVER}/socket.io/1/websocket/${id}`);
  
      ws.on('open', () => {
        console.log('Connected to the WebSocket server.');
      });
  
ws.on('message', (data) => {
  const message = data.toString('utf-8');
  console.log('Received message:', message);
});
  
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
  
      ws.on('close', () => {
        console.log('WebSocket connection closed.');
      });
    } else {
      console.error('Failed to get ID.');
    }
  }
  
  connectToWebSocket();