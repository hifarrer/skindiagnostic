// Global polyfills that must run BEFORE the Metro runtime (HMRClient)
// This file is executed as a polyfill, so it must be synchronous and immediate
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Polyfill setImmediate
  if (!window.setImmediate) {
    window.setImmediate = function(callback) {
      return window.setTimeout(callback, 0);
    };
  }
  if (!window.clearImmediate) {
    window.clearImmediate = function(id) {
      window.clearTimeout(id);
    };
  }
  
  // CRITICAL: Set global.WebSocket BEFORE anything else runs
  if (typeof global !== 'undefined') {
    if (!global.setImmediate) {
      global.setImmediate = window.setImmediate;
    }
    if (!global.clearImmediate) {
      global.clearImmediate = window.clearImmediate;
    }
    // Force set WebSocket - this MUST be a constructor function
    if (window.WebSocket && typeof window.WebSocket === 'function') {
      global.WebSocket = window.WebSocket;
    }
    if (window.URL && typeof window.URL === 'function') {
      global.URL = window.URL;
    }
    if (window.URLSearchParams && typeof window.URLSearchParams === 'function') {
      global.URLSearchParams = window.URLSearchParams;
    }
  }
  
  // Also set on globalThis for maximum compatibility
  if (typeof globalThis !== 'undefined') {
    if (window.WebSocket && typeof window.WebSocket === 'function') {
      globalThis.WebSocket = window.WebSocket;
    }
    if (window.setImmediate) {
      globalThis.setImmediate = window.setImmediate;
      globalThis.clearImmediate = window.clearImmediate;
    }
  }
})();
