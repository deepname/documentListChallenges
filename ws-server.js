// Simple WebSocket test server for demonstration
// Run with: node ws-server.js

import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

console.log('WebSocket server running on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send a test document after 5 seconds
  setTimeout(() => {
    const testDocument = {
      type: 'new_document',
      document: {
        id: crypto.randomUUID(),
        name: 'Real-time Document ' + new Date().toLocaleTimeString(),
        collaborators: [
          {
            id: crypto.randomUUID(),
            name: 'WebSocket User',
            email: 'ws@example.com'
          }
        ],
        version: 1,
        attachments: [
          {
            id: crypto.randomUUID(),
            name: 'realtime-data.json',
            size: 4096,
            type: 'application/json'
          }
        ],
        createdAt: new Date().toISOString()
      }
    };

    ws.send(JSON.stringify(testDocument));
    console.log('Sent test document to client');
  }, 5000);

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
