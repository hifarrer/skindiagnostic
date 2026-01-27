// Web shim for setUpXHR (partial no-op)
// We only want to skip the parts that polyfill native browser features
const {polyfillGlobal} = require('react-native/Libraries/Utilities/PolyfillFunctions');

// Only polyfill things that might be missing or useful
// But skip URL, WebSocket, fetch, etc.

module.exports = {};
