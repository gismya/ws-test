const axios = require("axios");
const WebSocket = require("ws");

const FTRACK_SERVER = process.env.FTRACK_SERVER.replace("https://", "");
const FTRACK_API_USER = process.env.FTRACK_API_USER;
const FTRACK_API_KEY = process.env.FTRACK_API_KEY;
// Function to get the ID

async function getId() {
  try {
    const response = await axios.get(`https://${FTRACK_SERVER}/socket.io/1/`, {
      headers: {
        "ftrack-api-user": FTRACK_API_USER,
        "ftrack-api-key": FTRACK_API_KEY,
      },
      params: {
        api_user: FTRACK_API_USER,
      },
    });

    return response.data.split(":")[0];
  } catch (error) {
    console.error("Error getting ID:", error);
    return null;
  }
}

async function subscribe(ws, id) {
  const data = {
    data: {
      subscriber: {
        id: id,
      },
      subscription: "topic=ftrack.location.request-resolve",
    },
    topic: "ftrack.meta.subscribe",
    source: {
      id: id,
      user: {
        username: FTRACK_API_USER,
      },
    },
  };

  const eventData = JSON.stringify({
    name: "ftrack.event",
    args: [data],
  });

  const packet = `5:::${eventData}`;
  ws.send(packet);
}
function heartbeat(ws) {
  const packet = "2::";
  ws.send(packet);
}

async function connectToWebSocket() {
  const id = await getId();

  if (id) {
    const ws = new WebSocket(
      `wss://${FTRACK_SERVER}/socket.io/1/websocket/${id}`
    );

    ws.on("open", () => {
      console.log("Connected to the WebSocket server.");
      subscribe(ws, id);
      // Send heartbeat every 25 seconds
      setInterval(() => {
        heartbeat(ws);
      }, 25000);
    });

    ws.on("message", (data) => {
      const message = data.toString("utf-8");
      console.log("Received message:", message);
      // Check for heartbeat message from server
      if (message.startsWith("2::")) {
        heartbeat(ws);
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed.");
    });
  } else {
    console.error("Failed to get ID.");
  }
}

connectToWebSocket();
