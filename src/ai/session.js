const WebSocket = require("ws");

function createRealtimeSession() {
  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2.1";
  const socket = new WebSocket(
    `wss://api.openai.com/v1/realtime?model=${encodeURIComponent(model)}`,
    { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
  );

  return socket;
}

module.exports = { createRealtimeSession };
