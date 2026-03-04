#!/bin/bash
# Template Generator Helper Functions
# Optimized for production use with minimal subprocess calls
# Usage: source scripts/template-helpers.sh

# Get script directory (works when sourced from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANAGER_SCRIPT="${SCRIPT_DIR}/template-manager.py"

# Cache for expensive operations
declare -A _CACHE
_CACHE_TTL=5  # seconds

# =============================================================================
# INTERNAL UTILITIES
# =============================================================================

# Get current timestamp in seconds
_timestamp() { date +%s; }

# Check if cache entry is valid
_cache_valid() {
    local key="$1"
    local now=$(_timestamp)
    local cached_time="${_CACHE[${key}_time]}"

    [[ -n "$cached_time" ]] && [[ $((now - cached_time)) -lt $_CACHE_TTL ]]
}

# Get cached value
_cache_get() {
    local key="$1"
    if _cache_valid "$key"; then
        echo "${_CACHE[$key]}"
        return 0
    fi
    return 1
}

# Set cache value
_cache_set() {
    local key="$1"
    local value="$2"
    _CACHE[$key]="$value"
    _CACHE[${key}_time]=$(_timestamp)
}

# =============================================================================
# STATE MANAGEMENT (Optimized)
# =============================================================================

# Load all state variables at once (reduce Python calls)
load_state_vars() {
    local state_json
    state_json=$(python3 "${MANAGER_SCRIPT}" get 2>/dev/null) || return 1

    # Export all variables at once
    export SLUG=$(echo "$state_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('slug',''))")
    export NAME=$(echo "$state_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('name',''))")
    export DESCRIPTION=$(echo "$state_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('description',''))")
    export STEP=$(echo "$state_json" | python3 -c "import sys,json; print(json.load(sys.stdin).get('step',0))")
}

# Quick state value getter (cached)
get_state_val() {
    local key="$1"
    local cache_key="state_$key"

    if _cache_get "$cache_key"; then
        return 0
    fi

    local val
    val=$(python3 "${MANAGER_SCRIPT}" get "$key" 2>/dev/null)
    _cache_set "$cache_key" "$val"
    echo "$val"
}

get_slug() { get_state_val "slug"; }
get_name() { get_state_val "name"; }
get_description() { get_state_val "description"; }

# Get progress as JSON (cached for 5 seconds)
get_progress_json() {
    local cache_key="progress_json"
    if _cache_get "$cache_key"; then
        return 0
    fi

    local result
    result=$(python3 "${MANAGER_SCRIPT}" progress 2>/dev/null)
    _cache_set "$cache_key" "$result"
    echo "$result"
}

# Update state (minimal output for speed)
update_state() {
    python3 "${MANAGER_SCRIPT}" update "$@" >/dev/null 2>&1
    # Clear cache
    unset _CACHE[state_*]
}

# Skip to next step
skip_state() {
    python3 "${MANAGER_SCRIPT}" skip "$@" >/dev/null 2>&1
    # Clear cache
    unset _CACHE[state_*]
}

# =============================================================================
# COMBINED OPERATIONS (Optimized - single Python call)
# =============================================================================

# Get count and update state in one efficient call
update_step_state() {
    local step_number=$1
    local item_type=$2
    local index_file=$3

    # Get count
    local count
    count=$(get_count "${SLUG}" "${index_file}" "${item_type}")

    # Update state (suppress output)
    update_state ${step_number} "${item_type}" ${count}
}

# =============================================================================
# INDEX OPERATIONS (Optimized)
# =============================================================================

# Add item to index
add_to_index() {
    python3 "${MANAGER_SCRIPT}" add_to_index "$@" >/dev/null 2>&1
}

# Get count from index file (cached)
get_count() {
    local slug="$1"
    local index_file="$2"
    local cache_key="count_${slug}_${index_file}"

    if _cache_get "$cache_key"; then
        return 0
    fi

    local count
    count=$(python3 "${MANAGER_SCRIPT}" get_count "$slug" "$index_file" 2>/dev/null)
    _cache_set "$cache_key" "$count"
    echo "$count"
}

# =============================================================================
# UTILITIES
# =============================================================================

# Ensure directory exists
ensure_dir() {
    # Use bash built-in for speed (no subprocess needed)
    mkdir -p "$1" 2>/dev/null
}

# Upload to cloud
upload_to_cloud() {
    python3 "${MANAGER_SCRIPT}" upload "$@"
}

# =============================================================================
# CLAUDEWS SERVERS (Optimized with caching)
# =============================================================================

# Check ClaudeWS servers (auto-loads .env from script directory)
# Results cached for 5 seconds to avoid redundant API calls
check_claudews_servers() {
    local cache_key="claudews_servers"

    if _cache_get "$cache_key"; then
        return 0
    fi

    local env_file="${SCRIPT_DIR}/../.env"
    local api_url=""

    if [[ -f "${env_file}" ]]; then
        # Extract PRIVOS_API_URL from .env file using grep
        api_url=$(grep "^PRIVOS_API_URL=" "${env_file}" 2>/dev/null | cut -d'=' -f2-)
        # Remove quotes and whitespace
        api_url=$(echo "$api_url" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"\047')
    fi

    local result
    result=$(python3 "${MANAGER_SCRIPT}" check_claudews "${api_url}" 2>/dev/null)
    _cache_set "$cache_key" "$result"
    echo "$result"
}

# Get ClaudeWS server count from JSON
# Usage: get_claudews_server_count "$SERVERS_JSON"
get_claudews_server_count() {
    local servers_json="$1"
    python3 -c "import sys, json; print(len(json.load(sys.stdin)))" <<< "$servers_json"
}

# List ClaudeWS server names
# Usage: list_claudews_servers "$SERVERS_JSON"
list_claudews_servers() {
    local servers_json="$1"
    python3 -c "import sys, json; servers = json.load(sys.stdin); [print(f'  • {s.get(\"name\", \"Unnamed\")}') for s in servers]" <<< "$servers_json"
}

# Get ClaudeWS server ID by name
# Usage: get_claudews_server_id "$SERVERS_JSON" "$SERVER_NAME"
get_claudews_server_id() {
    local servers_json="$1"
    local server_name="$2"
    python3 -c "import sys, json; servers = json.load(sys.stdin); server = next((s for s in servers if s.get('name') == '${server_name}'), None); print(server['id'] if server else '')" <<< "$servers_json"
}

# Get ClaudeWS server description by ID
# Usage: get_claudews_server_desc "$SERVERS_JSON" "$SERVER_ID"
get_claudews_server_desc() {
    local servers_json="$1"
    local server_id="$2"
    python3 -c "import sys, json; servers = json.load(sys.stdin); server = next((s for s in servers if s['id'] == '${server_id}'), {}); print(server.get('description', ''))" <<< "$servers_json"
}

# =============================================================================
# INITIALIZATION
# =============================================================================

# Initialize step - load all variables at once
init_step() {
    [[ -f ".env" ]] && { set -a; source .env; set +a; }

    # Use optimized batch load
    load_state_vars
}

# =============================================================================
# LEGACY ALIASES (for backward compatibility)
# =============================================================================

add_agent_to_index() { add_to_index "$@"; }
