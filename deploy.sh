#!/bin/bash
# SI Group — deployment helper script
# Run: bash deploy.sh [main|shop|school|portal|all]

set -e
APP=${1:-all}

build_next() {
  local name=$1
  echo "→ Building $name..."
  cd apps/$name
  npm install --production=false
  npm run build
  cd ../..
  echo "✓ $name built"
}

if [ "$APP" = "all" ] || [ "$APP" = "main" ]; then build_next main; fi
if [ "$APP" = "all" ] || [ "$APP" = "shop" ]; then build_next shop; fi
if [ "$APP" = "all" ] || [ "$APP" = "school" ]; then build_next school; fi
if [ "$APP" = "all" ] || [ "$APP" = "portal" ]; then build_next portal; fi

echo ""
echo "✅ Build complete. Push to GitHub and Vercel auto-deploys."
echo ""
echo "Next steps:"
echo "  git add . && git commit -m 'deploy' && git push"
