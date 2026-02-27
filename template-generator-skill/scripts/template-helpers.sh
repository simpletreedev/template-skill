#!/bin/bash
# Template Generator Helper Functions
# Source: source scripts/template-helpers.sh

MANAGER="${BASH_SOURCE%/*}/template-manager.py"

# State
get_state_val() { python3 "${MANAGER}" get "$1"; }
get_slug() { get_state_val "slug"; }
get_name() { get_state_val "name"; }
get_description() { get_state_val "description"; }
get_progress_json() { python3 "${MANAGER}" progress; }
update_state() { python3 "${MANAGER}" update "$@"; }
skip_state() { python3 "${MANAGER}" skip "$@"; }

# Index
add_to_index() { python3 "${MANAGER}" add_to_index "$@"; }
add_agent_to_index() { python3 "${MANAGER}" add_to_index "$1" "$2" "$3" "$4" "$5" "$6"; }
get_count() { python3 "${MANAGER}" get_count "$@"; }

# Utils
ensure_dir() { python3 "${MANAGER}" ensure_dir "$@"; }
upload_to_cloud() { python3 "${MANAGER}" upload "$@"; }

# Init
init_step() {
  [[ -f ".env" ]] && { set -a; source .env; set +a; }
  eval $(python3 "${MANAGER}" export_vars)
}
