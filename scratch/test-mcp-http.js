// Test script using native Node.js HTTP module to prevent connection closure.
const http = require('http');

const mcpServerHost = 'localhost';
const mcpServerPort = 3001;
const apiKey = '3Hxyqky8d6hx0XOWxpBlKJUZIesxJzpi';
const slug = process.argv[2] || 'gorkha';

console.log(`Connecting to http://${mcpServerHost}:${mcpServerPort}/sse?slug=${slug}...`);

const sseRequest = http.request({
  hostname: mcpServerHost,
  port: mcpServerPort,
  path: `/sse?slug=${slug}`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Accept': 'text/event-stream'
  }
}, (sseResponse) => {
  console.log(`Connected! Status: ${sseResponse.statusCode}`);
  
  let buffer = '';
  let postUrl = '';

  sseResponse.on('data', async (chunk) => {
    const text = chunk.toString();
    buffer += text;
    
    // Parse SSE lines
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    let currentEvent = '';
    for (const line of lines) {
      if (line.startsWith('event:')) {
        currentEvent = line.replace('event:', '').trim();
      } else if (line.startsWith('data:')) {
        const dataStr = line.replace('data:', '').trim();
        
        if (currentEvent === 'endpoint') {
          // Resolve message post URL
          // Relative to the server host/port
          postUrl = dataStr;
          console.log(`Got session endpoint: ${postUrl}`);
          
          // Send tools/list request in parallel
          sendToolsList(postUrl);
        } else if (currentEvent === 'message') {
          try {
            const parsed = JSON.parse(dataStr);
            handleMcpMessage(postUrl, parsed);
          } catch (e) {
            console.error("Error parsing message event data:", e);
          }
        }
      }
    }
  });

  sseResponse.on('end', () => {
    console.log("SSE Connection closed by server.");
    process.exit(0);
  });
});

sseRequest.on('error', (e) => {
  console.error(`SSE Connection error: ${e.message}`);
  process.exit(1);
});

sseRequest.end();

function sendToolsList(postUrl) {
  console.log("\nSending tools/list request...");
  const listToolsPayload = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  });

  const postReq = http.request({
    hostname: mcpServerHost,
    port: mcpServerPort,
    path: postUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(listToolsPayload)
    }
  }, (res) => {
    console.log(`POST tools/list response status: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      res.on('data', (d) => console.log("Error details:", d.toString()));
    }
  });

  postReq.on('error', (e) => {
    console.error(`POST error: ${e.message}`);
  });

  postReq.write(listToolsPayload);
  postReq.end();
}

function handleMcpMessage(postUrl, message) {
  if (message.id === 1) {
    console.log("\n--- Received Tools List ---");
    console.log(JSON.stringify(message.result, null, 2));
    
    // Call get_restaurant_info tool
    sendCallTool(postUrl);
  } else if (message.id === 2) {
    console.log("\n--- Received Tool Execution Result ---");
    console.log(JSON.stringify(message.result, null, 2));
    console.log("\nTest Completed Successfully! Exiting in 1 second...");
    setTimeout(() => process.exit(0), 1000);
  } else {
    console.log("\n--- Received Message ---");
    console.log(JSON.stringify(message, null, 2));
  }
}

function sendCallTool(postUrl) {
  console.log("\nSending tools/call (get_restaurant_info) request...");
  const callToolPayload = JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_restaurant_info",
      arguments: {}
    }
  });

  const postReq = http.request({
    hostname: mcpServerHost,
    port: mcpServerPort,
    path: postUrl,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(callToolPayload)
    }
  }, (res) => {
    console.log(`POST tools/call response status: ${res.statusCode}`);
  });

  postReq.on('error', (e) => {
    console.error(`POST call error: ${e.message}`);
  });

  postReq.write(callToolPayload);
  postReq.end();
}
