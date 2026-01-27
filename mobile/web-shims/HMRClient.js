// Wrapper for HMRClient that ensures global.WebSocket is set before instantiation
// This runs BEFORE HMRClient tries to use global.WebSocket

if (typeof window !== 'undefined') {
  // CRITICAL: Set global.WebSocket IMMEDIATELY
  if (typeof global !== 'undefined' && window.WebSocket && typeof window.WebSocket === 'function') {
    global.WebSocket = window.WebSocket;
  }
  if (typeof globalThis !== 'undefined' && window.WebSocket && typeof window.WebSocket === 'function') {
    globalThis.WebSocket = window.WebSocket;
  }
  
  // Also set setImmediate
  if (!window.setImmediate) {
    window.setImmediate = function(callback) {
      return window.setTimeout(callback, 0);
    };
  }
  if (typeof global !== 'undefined' && !global.setImmediate) {
    global.setImmediate = window.setImmediate;
  }
}

// Now require the actual HMRClient - the resolver will NOT intercept this because
// we're coming from our shim (isFromOurShim check prevents circular resolution)
const HMRClient = require('metro-runtime/src/modules/HMRClient');

// Export as both default and named export for compatibility
module.exports = HMRClient;
module.exports.default = HMRClient;
module.exports.MetroHMRClient = HMRClient;
