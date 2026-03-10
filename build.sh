#!/usr/bin/env bash
set -euo pipefail

# Build script for HTB Academy PowerToys
# Concatenates src/ modules into a single userscript.
#
# Usage:
#   ./build.sh              # builds with version from package.json
#   ./build.sh 1.2.3        # builds with explicit version

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$SCRIPT_DIR/academy-powertoys.user.js"

# Determine version
if [[ -n "${1:-}" ]]; then
  VERSION="$1"
elif command -v node &>/dev/null && [[ -f "$SCRIPT_DIR/package.json" ]]; then
  VERSION="$(node -p "require('./package.json').version")"
else
  VERSION="0.0.0-dev"
fi

# Source file order — this defines the concatenation sequence.
# Early features must come before the early runner.
# UI must come before runner (runner references buildSettingsPanel/addSettingsButton).
FILES=(
  src/header.js

  src/core/registry.js
  src/core/settings.js
  src/core/scope.js

  # Early features (run at document-start)
  src/features/early/lazy-load-images.js
  src/features/early/preconnect-hints.js
  src/features/early/defer-fonts.js
  src/features/early/dedupe-requests.js
  src/features/early/block-telemetry.js
  src/features/early/_runner.js

  # Global features
  src/features/global/dismiss-adblock.js
  src/features/global/theme-mode.js
  src/features/global/hover-prefetch.js
  src/features/global/unstick-navbar.js

  # Dashboard features
  src/features/dashboard/default-enrolled-path-tab.js
  src/features/dashboard/sort-completed-last.js
  src/features/dashboard/expand-path-modules.js
  src/features/dashboard/rename-job-section.js
  src/features/dashboard/grid-carousels.js

  # Module features
  src/features/module/widen-content.js
  src/features/module/toc-sidebar.js
  src/features/module/static-bottom-bar.js
  src/features/module/slim-bottom-bar.js
  src/features/module/green-inline-code.js
  src/features/module/toc-real-links.js
  src/features/module/expand-menu.js
  src/features/module/fix-collapse-all.js
  src/features/module/expand-current-module-info.js
  src/features/module/expand-questions.js
  src/features/module/hide-solutions-promo.js
  src/features/module/label-toolbar-buttons.js

  # UI
  src/ui/settings-panel.js
  src/ui/settings-button.js

  # Runner + init
  src/runner.js
  src/footer.js
)

# Concatenate
{
  for file in "${FILES[@]}"; do
    # Skip comment-only lines (lines starting with #)
    [[ "$file" =~ ^# ]] && continue
    [[ -z "$file" ]] && continue

    filepath="$SCRIPT_DIR/$file"
    if [[ ! -f "$filepath" ]]; then
      echo "ERROR: Missing source file: $file" >&2
      exit 1
    fi
    cat "$filepath"
    echo ""
  done
} | sed "s/{{VERSION}}/$VERSION/g" > "$OUT"

echo "Built $OUT (v$VERSION, $(wc -l < "$OUT") lines)"
