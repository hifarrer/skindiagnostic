#!/bin/bash
# Build wrapper script for Render deployment
# This script ensures EXPO_ROUTER_APP_ROOT is set correctly before building

set -e

# Get the absolute path of the mobile directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export EXPO_ROUTER_APP_ROOT="$SCRIPT_DIR"

echo "Build script: Setting EXPO_ROUTER_APP_ROOT to $EXPO_ROUTER_APP_ROOT"
echo "Build script: Current directory: $(pwd)"

# Run pre-build script if it exists
if [ -f "$SCRIPT_DIR/scripts/pre-build.js" ]; then
  echo "Build script: Running pre-build script..."
  node "$SCRIPT_DIR/scripts/pre-build.js"
fi

# Run the actual build command
# This will work whether Render uses 'expo export:web' or 'expo export --platform web'
echo "Build script: Running expo export..."
npx expo export --platform web

echo "Build script: Build complete!"
