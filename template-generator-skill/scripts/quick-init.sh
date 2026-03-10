#!/bin/bash
# ⚡ Ultra-fast template initializer - Single command, clean output with multi-user support
# Usage: bash scripts/quick-init.sh [--quiet] <slug> "<name>" "<description>"
#
# Environment Variables:
#   CLAUDE_SESSION_ID or SESSION_ID - Optional session ID for multi-user support (default: 123)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANAGER="${SCRIPT_DIR}/core.py"

# Parse quiet flag
if [[ "${1:-}" == "--quiet" ]] || [[ "${1:-}" == "-q" ]]; then
    QUIET=true
    shift
else
    QUIET=false
fi

SLUG="${1:-}"
NAME="${2:-}"
DESCRIPTION="${3:-}"

# Validate
if [[ -z "$SLUG" ]] || [[ -z "$NAME" ]] || [[ -z "$DESCRIPTION" ]]; then
    echo "❌ Usage: $0 [--quiet] <slug> <name> <description>" >&2
    echo "   Environment: CLAUDE_SESSION_ID (optional, for multi-user support)" >&2
    exit 1
fi

# Show session info if not quiet
if [[ "$QUIET" == false ]]; then
    SESSION_ID="${CLAUDE_SESSION_ID:-${SESSION_ID:-123}}"
    echo "🔐 Session: sid-${SESSION_ID}"
fi

# Initialize (silently)
OUTPUT=$(python3 "$MANAGER" init "$SLUG" "$NAME" "$DESCRIPTION" 2>&1) || {
    echo "❌ Init failed" >&2
    exit 1
}

# Create metadata files (optimized batch operation)
python3 "$MANAGER" init_metadata >/dev/null 2>&1 || {
    echo "❌ Metadata creation failed" >&2
    exit 1
}

# Output
if [[ "$QUIET" == true ]]; then
    # Just template directory
    echo "$OUTPUT" | grep "^TEMPLATE_DIR=" | cut -d'=' -f2-
else
    # Output env vars for AI to use
    echo "$OUTPUT" | grep -E "^(TEMPLATE_DIR|SLUG|NAME|DESCRIPTION|SESSION_ID|SESSION_FILE)=" | sed 's/^/export /'
    echo ""
    echo "✅ Setup complete. Load references/steps/01-init.md"
    echo "📁 Session file: $(echo "$OUTPUT" | grep '^SESSION_FILE=' | cut -d'=' -f2-)"
fi
