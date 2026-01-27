#!/bin/bash
# Build wrapper script for Render deployment
# This script ensures EXPO_ROUTER_APP_ROOT is set correctly before building

set -e

# Get the absolute path of the mobile directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# If the script is in a 'mobile' subdirectory, use that; otherwise use current directory
if [ -f "$SCRIPT_DIR/package.json" ] && [ -f "$SCRIPT_DIR/app.json" ]; then
  MOBILE_DIR="$SCRIPT_DIR"
else
  # Try to find mobile directory from current location
  if [ -d "mobile" ] && [ -f "mobile/package.json" ]; then
    MOBILE_DIR="$(cd mobile && pwd)"
  else
    MOBILE_DIR="$SCRIPT_DIR"
  fi
fi

export EXPO_ROUTER_APP_ROOT="$MOBILE_DIR"

echo "Build script: Setting EXPO_ROUTER_APP_ROOT to $EXPO_ROUTER_APP_ROOT"
echo "Build script: Current directory: $(pwd)"
echo "Build script: Mobile directory: $MOBILE_DIR"

# Change to mobile directory if we're not already there
cd "$MOBILE_DIR"

# Run pre-build script if it exists
if [ -f "$MOBILE_DIR/scripts/pre-build.js" ]; then
  echo "Build script: Running pre-build script..."
  node "$MOBILE_DIR/scripts/pre-build.js"
fi

# Run expo-router patch script if it exists
if [ -f "$MOBILE_DIR/scripts/patch-expo-router.js" ]; then
  echo "Build script: Running expo-router patch script..."
  node "$MOBILE_DIR/scripts/patch-expo-router.js"
fi

# Run the actual build command
# Use expo export:web for webpack bundler (configured in app.json)
echo "Build script: Running expo export:web..."
npx expo export:web

echo "Build script: Build complete!"
