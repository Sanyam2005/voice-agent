// frontend/src/utils/websocketDebug.js

// Helper function to log and format WebSocket messages
export const logWebSocketMessage = (direction, message) => {
    const timestamp = new Date().toISOString().substr(11, 8);
    
    if (typeof message === 'string') {
      try {
        // Try to parse as JSON for better formatting
        const parsedMessage = JSON.parse(message);
        console.group(`[${timestamp}] WebSocket ${direction}:`);
        console.log('Type:', parsedMessage.type);
        
        // For audio data, just show length instead of the full data
        if (parsedMessage.type === 'audio' && parsedMessage.audio) {
          const audioLength = parsedMessage.audio.length;
          console.log(`Audio data: [Base64 string of ${audioLength} chars]`);
        } else {
          console.log('Data:', parsedMessage);
        }
        console.groupEnd();
        
        return parsedMessage;
      } catch (e) {
        // Not JSON, log as is
        console.log(`[${timestamp}] WebSocket ${direction}: ${message}`);
        return message;
      }
    } else {
      console.log(`[${timestamp}] WebSocket ${direction}:`, message);
      return message;
    }
  };
  
  // Function to create a debug-enabled WebSocket
  export const createDebugWebSocket = (url) => {
    const ws = new WebSocket(url);
    
    // Store the original send method
    const originalSend = ws.send;
    
    // Override send method to log outgoing messages
    ws.send = function(data) {
      logWebSocketMessage('OUT', data);
      return originalSend.call(this, data);
    };
    
    // Add event listener to log incoming messages
    ws.addEventListener('message', (event) => {
      logWebSocketMessage('IN', event.data);
    });
    
    return ws;
  };
  
  // Add this to your WebSocket handling code in the VoiceAgent component:
  /*
  import { createDebugWebSocket } from '../utils/websocketDebug';
  
  // Replace
  const ws = new WebSocket(wsUrl);
  
  // With 
  const ws = createDebugWebSocket(wsUrl);
  */