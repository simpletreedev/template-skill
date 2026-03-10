#!/bin/bash
# Template Generator Helper Functions - Simplified
# Usage: source scripts/helpers.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(dirname "${SCRIPT_DIR}")"

# =============================================================================
# STATE MANAGEMENT - Load variables from state.json
# =============================================================================

load_state_vars() {
    local state_json
    state_json=$(python3 scripts/core.py get 2>/dev/null) || return 1

    # Extract variables from output
    local template_dir=$(echo "$state_json" | grep "^TEMPLATE_DIR=" | cut -d'=' -f2-)
    local slug=$(echo "$state_json" | grep "^SLUG=" | cut -d'=' -f2-)
    local name=$(echo "$state_json" | grep "^NAME=" | cut -d'=' -f2-)
    local description=$(echo "$state_json" | grep "^DESCRIPTION=" | cut -d'=' -f2-)

    # Export variables
    [[ -n "$template_dir" ]] && export TEMPLATE_DIR="$template_dir"
    [[ -n "$slug" ]] && export SLUG="$slug"
    [[ -n "$name" ]] && export NAME="$name"
    [[ -n "$description" ]] && export DESCRIPTION="$description"
}

update_state() {
    python3 scripts/core.py update "$@" >/dev/null 2>&1
}

skip_state() {
    python3 scripts/core.py skip "$@" >/dev/null 2>&1
}

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

# Count items in JSON array
get_count() {
    local index_file="$1" item_type="$2"
    python3 -c "import sys,json; data=json.load(open('$index_file')); print(len(data.get('$item_type', [])))"
}

# Ensure directory exists
ensure_dir() {
    mkdir -p "$1" 2>/dev/null
}

# Upload file to cloud
upload_to_cloud() {
    python3 scripts/core.py upload "$@"
}

# =============================================================================
# INITIALIZATION
# =============================================================================

init_step() {
    # Export skill root
    export SKILL_ROOT

    # Load .env if exists
    [[ -f ".env" ]] && { set -a; source .env; set +a; }

    # Load state variables
    load_state_vars
}
