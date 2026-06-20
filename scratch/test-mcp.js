// Test script to verify the Render MCP Server and its Vercel integration.
// Run with: node scratch/test-mcp.js

async function run() {
  const mcpServerUrl = "http://localhost:3001";
  const apiKey = "3Hxyqky8d6hx0XOWxpBlKJUZIesxJzpi";
  const slug = process.argv[2] || "gorkha";

  console.log(`Connecting to MCP Server at ${mcpServerUrl}...`);

  const sseUrl = `${mcpServerUrl}/sse?slug=${slug}`;
  const response = await fetch(sseUrl, {
    headers: {
      "Authorization": `Bearer ${apiKey}`
    }
  });

  if (!response.ok) {
    console.error(`Failed to connect. Status: ${response.status}`);
    const text = await response.text();
    console.error("Response:", text);
    process.exit(1);
  }

  console.log("Connected! Processing SSE stream...");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let postUrl = '';
  let postUrlResolved = false;

  // Run the reader loop in the background so the SSE connection stays active
  const readPromise = (async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("SSE Stream closed by server.");
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.replace('data:', '').trim();
            
            if (currentEvent === 'endpoint') {
              const endpointUrl = new URL(dataStr, mcpServerUrl).toString();
              console.log(`Got session endpoint: ${endpointUrl}`);
              postUrl = endpointUrl;
              postUrlResolved = true;
            } else if (currentEvent === 'message') {
              try {
                const parsed = JSON.parse(dataStr);
                handleMcpMessage(parsed);
              } catch (e) {
                console.error("Error parsing message event data:", e);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error reading SSE stream:", err);
    }
  })();

  // Helper to wait until postUrl is resolved
  while (!postUrlResolved) {
    await new Promise(r => setTimeout(r, 100));
  }

  // Send tools/list request
  console.log("\nSending tools/list request...");
  const listToolsPayload = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
  };

  await sendPost(postUrl, listToolsPayload);

  // Wait a bit to receive tools/list response
  await new Promise(r => setTimeout(r, 2000));
  
  // Call get_restaurant_info tool
  console.log("\nSending tools/call (get_restaurant_info) request...");
  const callToolPayload = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "get_restaurant_info",
      arguments: {}
    }
  };

  await sendPost(postUrl, callToolPayload);

  // Wait a bit to receive tool response
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("\nDone. Exiting.");
  process.exit(0);
}

async function sendPost(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    console.error(`POST request failed. Status: ${res.status}`);
    const text = await res.text();
    console.error(text);
  } else {
    console.log(`POST request sent successfully. Status: ${res.status}`);
  }
}

function handleMcpMessage(message) {
  if (message.id === 1) {
    console.log("\n--- Received Tools List ---");
    console.log(JSON.stringify(message.result, null, 2));
  } else if (message.id === 2) {
    console.log("\n--- Received Tool Execution Result ---");
    console.log(JSON.stringify(message.result, null, 2));
  } else {
    console.log("\n--- Received Message ---");
    console.log(JSON.stringify(message, null, 2));
  }
}

run().catch(console.error);
