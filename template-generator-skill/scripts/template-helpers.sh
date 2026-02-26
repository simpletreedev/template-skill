#!/bin/bash
# Template Generator Helper Functions
# Source this file at the beginning of each step: source scripts/template-helpers.sh

# State file path
STATE_FILE=".template-generator-state.json"

# Cache timestamp to avoid multiple date calls
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# =============================================================================
# STATE MANAGEMENT FUNCTIONS
# =============================================================================

# Get value from state file
# Usage: get_state_val <jq_query>
# Example: get_state_val '.templateSlug'
get_state_val() {
  local jq_query="$1"
  jq -r "${jq_query}" "${STATE_FILE}"
}

# Get template slug (cached)
get_slug() {
  get_state_val '.templateSlug'
}

# Get template name
get_name() {
  get_state_val '.templateName'
}

# Get template description
get_description() {
  get_state_val '.templateDescription // ""'
}

# =============================================================================
# STATE UPDATE FUNCTIONS
# =============================================================================

# Update state file after completing a step
# Usage: update_state <step_number> <step_name> <summary_key> <count>
# Example: update_state 2 "LISTS" "lists" 3
update_state() {
  local step_num="$1"
  local step_name="$2"
  local summary_key="$3"
  local count="$4"

  jq ".currentStep = ${step_num} | \
      .steps[\"${step_num}_${step_name}\"].status = \"completed\" | \
      .summary.${summary_key} = ${count} | \
      .lastUpdated = \"${TIMESTAMP}\"" \
    "${STATE_FILE}" > .tmp && mv .tmp "${STATE_FILE}"
}

# Mark step as skipped
# Usage: skip_state <step_number> <step_name>
# Example: skip_state 3 "DOCUMENTS"
skip_state() {
  local step_num="$1"
  local step_name="$2"

  jq ".currentStep = ${step_num} | \
      .steps[\"${step_num}_${step_name}\"].status = \"skipped\" | \
      .lastUpdated = \"${TIMESTAMP}\"" \
    "${STATE_FILE}" > .tmp && mv .tmp "${STATE_FILE}"
}

# =============================================================================
# INDEX MANAGEMENT FUNCTIONS
# =============================================================================

# Add item to _index.json file (lists, documents, automations, agents)
# Usage: add_to_index <slug> <index_file> <key> <name> <description> [file_path]
# Example for lists:
#   add_to_index "my-slug" "entities/lists/_lists.json" "list-tasks" "Tasks" "Task list" "data/list-tasks/data.json"
# Example for documents:
#   add_to_index "my-slug" "entities/documents/_documents.json" "doc-guide" "Guide" "User guide" "data/doc-guide/data.json"
add_to_index() {
  local slug="$1"
  local index_file="$2"
  local key="$3"
  local name="$4"
  local desc="$5"
  local file_path="${6:-}"

  if [[ -n "$file_path" ]]; then
    jq --arg key "${key}" \
       --arg name "${name}" \
       --arg desc "${desc}" \
       --arg file "${file_path}" \
       '. += [{"key": $key, "name": $name, "description": $desc, "file": $file, "order": (. | length)}]' \
      "template-${slug}/${index_file}" > .tmp && mv .tmp "template-${slug}/${index_file}"
  else
    jq --arg key "${key}" \
       --arg name "${name}" \
       --arg desc "${desc}" \
       '. += [{"key": $key, "name": $name, "description": $desc, "order": (. | length)}]' \
      "template-${slug}/${index_file}" > .tmp && mv .tmp "template-${slug}/${index_file}"
  fi
}

# Add chat agent to _agents.json with claudeWs reference
# Usage: add_agent_to_index <slug> <agent_key> <name> <desc> <ws_key>
add_agent_to_index() {
  local slug="$1"
  local agent_key="$2"
  local name="$3"
  local desc="$4"
  local ws_key="$5"

  jq --arg key "agent-${agent_key}" \
     --arg name "${name}" \
     --arg desc "${desc}" \
     --arg ws "${ws_key}" \
     '.agents += [{
       "key": $key,
       "name": $name,
       "description": $desc,
       "file": "data/agent-'${agent_key}'/data.json",
       "claudeWs": $ws,
       "order": (.agents | length)
     }]' \
    "template-${slug}/flows/chat-agents/_agents.json" > .tmp && mv .tmp "template-${slug}/flows/chat-agents/_agents.json"
}

# =============================================================================
# DIRECTORY MANAGEMENT
# =============================================================================

# Create directory if not exists
# Usage: ensure_dir <path>
# Example: ensure_dir "template-${SLUG}/entities/lists/data/${LIST_KEY}"
ensure_dir() {
  local dir="$1"
  mkdir -p "${dir}"
}

# =============================================================================
# COUNT FUNCTIONS
# =============================================================================

# Get count from _index.json
# Usage: get_count <slug> <index_file> <field_name>
# Example: get_count "${SLUG}" "entities/lists/_lists.json" "lists"
get_count() {
  local slug="$1"
  local index_file="$2"
  local field="$3"

  jq ".${field} | length" "template-${slug}/${index_file}"
}

# =============================================================================
# PROGRESS DISPLAY
# =============================================================================

# Print progress overview
# Usage: show_progress <step_number> <step_name>
show_progress() {
  local step_num="$1"
  local step_name="$2"

  echo "📋 Template: $(get_name)"
  echo "📍 Current: STEP ${step_num}/8 - ${step_name}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  # Show completed steps
  jq -r '.steps | to_entries[] | select(.value.status == "completed") | "✅ \(.key | split("_")[1])"' "${STATE_FILE}" 2>/dev/null

  # Show current step
  echo "🔄 ${step_name}"

  # Show pending steps
  jq -r '.steps | to_entries[] | select(.value.status == "pending") | "⏳ \(.key | split("_")[1])"' "${STATE_FILE}" 2>/dev/null
}

# =============================================================================
# CONFIGURATION FUNCTIONS
# =============================================================================

# Get cloud upload URL from env or default
# Usage: get_upload_url
# Returns: Upload URL string
get_upload_url() {
  echo "${CLOUD_UPLOAD_URL:-http://localhost:3000/api/v1/upload}"
}

# =============================================================================
# INITIALIZATION FUNCTION (Call at start of each step)
# =============================================================================

# Initialize step - loads common variables
# Usage: init_step
# Exported variables: SLUG, NAME, DESCRIPTION, TIMESTAMP
# Also loads .env file if exists
init_step() {
  # Load .env file if exists
  if [[ -f ".env" ]]; then
    set -a
    source .env
    set +a
  fi

  export SLUG=$(get_slug)
  export NAME=$(get_name)
  export DESCRIPTION=$(get_description)
  export TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
}
