# Step: STEP 7 - AI WORKSPACES (OPTIONAL)

## Purpose

Configure AI workspaces with custom skills, commands, and agents for existing ClaudeWS servers.

**⚠️ IMPORTANT:** This step does NOT create new ClaudeWS servers. It only adds content (skills, commands, agents) to servers you already have configured.

---

## What To Do

### 1. Check ClaudeWS Servers

```bash
# Check if user has ClaudeWS servers configured
# Note: check_claudews_servers auto-loads .env file
SERVERS_JSON=$(check_claudews_servers)

# Validate that we got valid JSON
if [[ -z "${SERVERS_JSON}" ]] || [[ "${SERVERS_JSON}" == "Error:"* ]]; then
  HAS_ERROR=1
else
  HAS_ERROR=0
  # Count servers using Python
  SERVER_COUNT=$(python3 -c "import sys, json; print(len(json.load(sys.stdin)))" <<< "$SERVERS_JSON")
fi

# Check if we have any servers
if [[ ${HAS_ERROR} -eq 1 ]] || [[ ${SERVER_COUNT} -eq 0 ]]; then
  HAS_SERVERS=0
else
  HAS_SERVERS=1
fi
```

---

### 2. If No Servers - Inform User

**⚠️ IMPORTANT: If HAS_SERVERS=0, show this message to user and ASK what they want to do:**

```
⚠️ No ClaudeWS servers found

AI Workspaces require ClaudeWS servers to be configured first.

To set up servers:
  1. Go to PrivOs settings
  2. Configure at least one ClaudeWS server
  3. Add PRIVOS_API_URL to .env file in this skill directory

What would you like to do?
👉 Configure servers now and continue
⏭️ Skip this step for now
```

**If user wants to skip:**

```bash
skip_state 7
```

**Then show skip prompt:**

```
⏭️ AI Workspaces skipped

📍 What's next: Package & Export (final step)
   Package everything into a ZIP file ready for import.

👉 Continue to package
```

**⚠️ CRITICAL: The code below (steps 3+) only runs if HAS_SERVERS=1**

---

### 3. Show Available Servers

```bash
# Display server summary (show name, not ID)
echo "🔧 Available ClaudeWS Servers:"
python3 -c "import sys, json; servers = json.load(sys.stdin); [print(f'  • {s.get(\"name\", \"Unnamed\")}: {s.get(\"description\", \"No description\")}') for s in servers]" <<< "$SERVERS_JSON"
echo ""
```

**Ask user:**

"Do you want to add **AI workspace content** (skills, commands, agents) to any of your ClaudeWS servers?

You have ${SERVER_COUNT} ClaudeWS server(s) available:
$(python3 -c "import sys, json; servers = json.load(sys.stdin); [print(f' - {s.get(\"name\", \"Unnamed\")}') for s in servers]" <<< "$SERVERS_JSON")

---

### 4. If User Skips (Has Servers but Doesn't Want to Add)

```bash
skip_state 7
```

**Show skip prompt:**

```
⏭️ AI Workspaces skipped

📍 What's next: Package & Export (final step)
   Package everything into a ZIP file ready for import.

👉 Continue to package
```

---

### 5. For EACH Selected Server, Configure

**IMPORTANT:**

- User sees and selects by **server name**
- Folder name uses **server ID** (e.g., "719d50a4-e22a-4913-83ad-acfdd4597aef")
- This ID is used internally, not shown to user

Ask user for each server by **name**:

- "Server: **{server-name}** - What content do you want to add?"
  - Skills? (specific capabilities for the AI)
  - Commands? (slash commands like /summary, /analyze)
  - Agents? (specialized assistant prompts)

---

### 6. Create Workspace Structure

```bash
# Get server ID from name (user selected by name, we need ID for folder)
SERVER_NAME="{server-name-selected-by-user}"
SERVER_ID=$(python3 -c "import sys, json; servers = json.load(sys.stdin); server = next((s for s in servers if s.get('name') == '${SERVER_NAME}'), None); print(server['id'] if server else '')" <<< "$SERVERS_JSON")

if [[ -z "${SERVER_ID}" ]]; then
  echo "❌ Error: Could not find server ID for '${SERVER_NAME}'"
  exit 1
fi

# Create directory structure for this server
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/agents"
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/skills"
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/commands"
```

---

### 7. Create Skills (if user wants)

Skills require a **subfolder** with `SKILL.md` file:

```bash
# For each skill
SKILL_NAME="{skill-name}"
SKILL_SLUG=$(echo "${SKILL_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Create skill subfolder
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/skills/${SKILL_SLUG}"

# Create main SKILL.md
cat > template-${SLUG}/claude-ws/data/${SERVER_ID}/skills/${SKILL_SLUG}/SKILL.md << EOF
# ${SKILL_NAME}

{Instructions for this skill}

## When to use

{Describe when this skill should be used}

## How it works

{Explain how this skill works}
EOF

# Optional: Add references/ and scripts/ subfolders
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/skills/${SKILL_SLUG}/references"
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/skills/${SKILL_SLUG}/scripts"
```

---

### 8. Create Commands (if user wants)

Commands require a **subfolder** with `COMMAND.md` file:

```bash
# For each command
COMMAND_NAME="{command-name}"  # e.g., "summary", "analyze"
COMMAND_SLUG=$(echo "${COMMAND_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Create command subfolder
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/commands/${COMMAND_SLUG}"

# Create COMMAND.md
cat > template-${SLUG}/claude-ws/data/${SERVER_ID}/commands/${COMMAND_SLUG}/COMMAND.md << EOF
# /${COMMAND_NAME}

{Instructions for this command}

## Usage

${COMMAND_NAME} {parameters}

## Examples

\`\`\`
/${COMMAND_NAME} example
\`\`\`
EOF
```

---

### 9. Create Agents (if user wants)

Agents require a **subfolder** with `PROMPT.md` file:

```bash
# For each agent
AGENT_NAME="{agent-name}"
AGENT_SLUG=$(echo "${AGENT_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

# Create agent subfolder
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/agents/${AGENT_SLUG}"

# Create PROMPT.md
cat > template-${SLUG}/claude-ws/data/${SERVER_ID}/agents/${AGENT_SLUG}/PROMPT.md << EOF
# ${AGENT_NAME}

{Instructions for this specialized agent}

## Role

{Describe the agent's role}

## Capabilities

- {Capability 1}
- {Capability 2}
- {Capability 3}

## Guidelines

{Additional guidelines for the agent}
EOF
```

---

### 10. Update \_workspaces.json

```bash
# Get server description
SERVER_DESC=$(python3 -c "import sys, json; servers = json.load(sys.stdin); server = next((s for s in servers if s['id'] == '${SERVER_ID}'), {}); print(server.get('description', ''))" <<< "$SERVERS_JSON")

# Add to workspaces index
add_to_index "${SLUG}" "claude-ws/_workspaces.json" "${SERVER_ID}" "${SERVER_NAME}" "${SERVER_DESC}" "data/${SERVER_ID}"
```

---

### 11. After Completion

```bash
WS_COUNT=$(get_count "${SLUG}" "claude-ws/_workspaces.json" "workspaces")
update_state 7 "claudeWorkspaces" ${WS_COUNT}
```

**Show completion prompt:**

```
✅ AI Workspaces are ready!

📊 We've added:

   • {count} AI workspaces
   • {list of workspace names}

📍 What's next: Package & Export (final step)
   Package everything into a ZIP file ready for import.

• Continue to package
```

**Note: This is the LAST optional step. After this, only Step 8 (Package) remains.**

---

## Data Format References

See `../references/template-structure.md` for complete AI workspace data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/08-package.md`

If user says "skip", this is already handled above.
