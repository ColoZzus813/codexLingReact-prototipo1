const clients = new Set();

function sendEvent(res, event) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

export function realtimeEvents(req, res) {
  res.set({
    "Cache-Control": "no-cache",
    "Content-Type": "text/event-stream",
    Connection: "keep-alive"
  });
  res.flushHeaders?.();

  sendEvent(res, {
    type: "connected",
    timestamp: new Date().toISOString()
  });

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
    res.end();
  });
}

export function broadcastUpdate(type, payload = {}) {
  const event = {
    type,
    payload,
    timestamp: new Date().toISOString()
  };

  clients.forEach((client) => {
    sendEvent(client, event);
  });
}
