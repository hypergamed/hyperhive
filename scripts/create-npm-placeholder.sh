#!/usr/bin/env bash

# Script to create and publish npm package placeholders for OIDC trusted publishing setup
# Usage: ./scripts/create-npm-placeholder.sh @hyperhive/colony @hyperhive/plugin-fastify

set -e

REPO_URL="https://github.com/Hypergamed/Hyperhive"

if [ $# -eq 0 ]; then
  echo "Usage: $0 <package-name> [package-name...]"
  echo "Example: $0 @hyperhive/colony @hyperhive/plugin-fastify"
  exit 1
fi

# Check if logged in to npm
if ! npm whoami &> /dev/null; then
  echo "❌ Not logged in to npm. Please run 'npm login' first."
  exit 1
fi

echo "📦 Creating placeholder packages for OIDC trusted publishing setup"
echo ""

for PACKAGE_NAME in "$@"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📦 Package: $PACKAGE_NAME"

  # Check if package already exists on npm
  if npm view "$PACKAGE_NAME" &> /dev/null; then
    echo "⚠️  Package already exists on npm, skipping..."
    echo ""
    continue
  fi

  # Create temp directory
  TEMP_DIR=$(mktemp -d)
  echo "📁 Temp directory: $TEMP_DIR"

  # Create package.json
  cat > "$TEMP_DIR/package.json" << EOF
{
  "name": "$PACKAGE_NAME",
  "version": "0.0.1",
  "description": "Placeholder for OIDC trusted publishing setup. Real version coming soon.",
  "repository": {
    "type": "git",
    "url": "$REPO_URL"
  },
  "license": "MIT",
  "keywords": ["placeholder", "oidc-setup"]
}
EOF

  # Create README
  cat > "$TEMP_DIR/README.md" << EOF
# $PACKAGE_NAME

> **This is a placeholder package for OIDC trusted publishing setup.**

The real package will be published soon via GitHub Actions with proper provenance.

## Repository

$REPO_URL
EOF

  # Publish
  echo "📤 Publishing to npm..."
  if (cd "$TEMP_DIR" && npm publish --access public --provenance=false); then
    echo "✅ Successfully published: $PACKAGE_NAME"

    # Extract package name without scope for URL
    PACKAGE_URL_NAME=$(echo "$PACKAGE_NAME" | sed 's/@//' | sed 's/\//%2F/')
    echo ""
    echo "👉 Next step: Configure trusted publishing at:"
    echo "   https://www.npmjs.com/package/$PACKAGE_NAME/access"
  else
    echo "❌ Failed to publish: $PACKAGE_NAME"
  fi

  # Cleanup
  rm -rf "$TEMP_DIR"
  echo ""
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Done! Now configure trusted publishing for each package:"
echo ""
echo "   Provider:    GitHub Actions"
echo "   Owner:       Hypergamed"
echo "   Repository:  Hyperhive"
echo "   Workflow:    release.yml"
echo "   Environment: npm-publish"
echo ""
