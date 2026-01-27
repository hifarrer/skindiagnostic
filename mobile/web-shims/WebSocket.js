// Web shim for WebSocket
if (typeof global !== 'undefined' && typeof global.WebSocket === 'undefined' && typeof window !== 'undefined') {
  global.WebSocket = window.WebSocket;
}
module.exports = typeof window !== 'undefined' ? window.WebSocket : null;
