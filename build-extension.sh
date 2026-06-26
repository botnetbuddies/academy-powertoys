#!/usr/bin/env bash
set -euo pipefail

# Build script for the HTB Academy PowerToys browser extensions (MV3).
# Wraps the userscript bundle from build.sh into two builds:
#   dist/chrome-extension/    (Chrome, Edge, Brave, Opera)
#   dist/firefox-extension/   (Firefox 128+)
#
# The bundle runs as a MAIN-world content script so its window.fetch / XHR
# patches reach the page (an isolated content script gets its own copy).
# MAIN-world content scripts need Chrome 111+ / Firefox 128+.
#
# Usage:
#   ./build-extension.sh           # version from package.json
#   ./build-extension.sh 1.2.3     # explicit version

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST="$SCRIPT_DIR/dist"
SHARED="$DIST/.shared"
CHROME_DIR="$DIST/chrome-extension"
FIREFOX_DIR="$DIST/firefox-extension"
BUNDLE="$SCRIPT_DIR/academy-powertoys.user.js"
ICON_SRC="$SCRIPT_DIR/assets/icons"
GECKO_ID="academy-powertoys@botnetbuddies.github.io"

# Determine version (mirrors build.sh)
if [[ -n "${1:-}" ]]; then
  VERSION="$1"
elif command -v node &>/dev/null && [[ -f "$SCRIPT_DIR/package.json" ]]; then
  VERSION="$(node -p "require('./package.json').version")"
else
  VERSION="0.0.0-dev"
fi

# Manifest "version" must be 1-4 dot-separated integers; the full string (with
# any pre-release suffix) goes in "version_name".
MANIFEST_VERSION="$(printf '%s' "$VERSION" | grep -oE '^[0-9]+(\.[0-9]+){0,3}' || true)"
[[ -z "$MANIFEST_VERSION" ]] && MANIFEST_VERSION="0.0.0"

# Build the bundle (single source of truth for feature code).
"$SCRIPT_DIR/build.sh" "$VERSION" >/dev/null

# Stage the files shared by both browsers.
rm -rf "$DIST"
mkdir -p "$SHARED/icons"

# Content script: the bundle, minus the inert ==UserScript== header.
sed '/==UserScript==/,/==\/UserScript==/d' "$BUNDLE" > "$SHARED/academy-powertoys.js"

# Toolbar-icon click -> open settings on the active tab (or open Academy if the
# tab has no content script). `browser ?? chrome` works on both browsers.
cat > "$SHARED/background.js" <<'JS'
const api = globalThis.browser ?? globalThis.chrome;

api.action.onClicked.addListener(async (tab) => {
  if (!tab || tab.id == null) return;
  try {
    await api.tabs.sendMessage(tab.id, { type: 'apt:open-settings' });
  } catch {
    api.tabs.create({ url: 'https://academy.hackthebox.com/app/dashboard' });
  }
});
JS

# Isolated-world bridge: relays the runtime message into the page (the MAIN-world
# bundle has no extension APIs of its own).
cat > "$SHARED/bridge.js" <<'JS'
const api = globalThis.browser ?? globalThis.chrome;

api.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === 'apt:open-settings') {
    window.postMessage({ __aptExt: true, type: 'open-settings' }, '*');
  }
});
JS

for s in 16 32 48 128; do
  cp "$ICON_SRC/icon-$s.png" "$SHARED/icons/icon-$s.png"
done

copy_shared() {
  local dir="$1"
  mkdir -p "$dir"
  cp "$SHARED/academy-powertoys.js" "$SHARED/background.js" "$SHARED/bridge.js" "$dir/"
  cp -r "$SHARED/icons" "$dir/icons"
}

# Manifest fields shared by both builds (IFS='' keeps the leading indentation).
IFS='' read -r -d '' COMMON_HEAD <<JSON || true
  "manifest_version": 3,
  "name": "HTB Academy PowerToys",
  "version": "$MANIFEST_VERSION",
  "version_name": "$VERSION",
  "description": "Unofficial power-user enhancements for HTB Academy. No affiliation with Hack The Box.",
  "permissions": ["activeTab"],
  "icons": {
    "16": "icons/icon-16.png",
    "32": "icons/icon-32.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  },
  "action": {
    "default_title": "Academy PowerToys — Open Settings",
    "default_icon": {
      "16": "icons/icon-16.png",
      "32": "icons/icon-32.png",
      "48": "icons/icon-48.png"
    }
  }
JSON

IFS='' read -r -d '' CONTENT_SCRIPTS <<'JSON' || true
  "content_scripts": [
    {
      "matches": ["https://academy.hackthebox.com/*"],
      "js": ["academy-powertoys.js"],
      "run_at": "document_start",
      "world": "MAIN",
      "all_frames": false
    },
    {
      "matches": ["https://academy.hackthebox.com/*"],
      "js": ["bridge.js"],
      "run_at": "document_idle",
      "world": "ISOLATED",
      "all_frames": false
    }
  ]
JSON

# Chrome: service-worker background.
copy_shared "$CHROME_DIR"
cat > "$CHROME_DIR/manifest.json" <<JSON
{
$COMMON_HEAD,
  "background": {
    "service_worker": "background.js"
  },
$CONTENT_SCRIPTS
}
JSON

# Firefox: event-page background + gecko settings.
copy_shared "$FIREFOX_DIR"
cat > "$FIREFOX_DIR/manifest.json" <<JSON
{
$COMMON_HEAD,
  "background": {
    "scripts": ["background.js"]
  },
$CONTENT_SCRIPTS,
  "browser_specific_settings": {
    "gecko": {
      "id": "$GECKO_ID",
      "strict_min_version": "128.0"
    }
  }
}
JSON

rm -rf "$SHARED"

echo "Built extensions (v$VERSION):"
echo "  Chrome  -> $CHROME_DIR"
echo "  Firefox -> $FIREFOX_DIR"
