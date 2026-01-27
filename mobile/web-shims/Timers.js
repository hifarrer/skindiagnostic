// Web shim for Timers
// Browsers have native timers, but we need to polyfill setImmediate for RN compatibility

if (typeof window !== 'undefined') {
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
}

if (typeof global !== 'undefined') {
  if (!global.setImmediate && typeof window !== 'undefined') {
    global.setImmediate = window.setImmediate;
  }
  if (!global.clearImmediate && typeof window !== 'undefined') {
    global.clearImmediate = window.clearImmediate;
  }
}

module.exports = {};
