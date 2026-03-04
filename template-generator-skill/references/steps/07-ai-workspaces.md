# Step: STEP 7 - AI WORKSPACES (OPTIONAL)

## Purpose

Add skills, commands, and agents to existing ClaudeWS servers.

**⚠️ IMPORTANT:** This step does NOT create new ClaudeWS servers. It only adds content to servers you already have configured.

---

## What To Do

### 1. Check ClaudeWS Servers

```bash
# Get list of ClaudeWS servers (cached for 5 seconds)
SERVERS_JSON=$(check_claudews_servers)

# Count servers using helper function
if [[ -z "${SERVERS_JSON}" ]] || [[ "${SERVERS_JSON}" == "Error:"* ]]; then
  SERVER_COUNT=0
else
  SERVER_COUNT=$(get_claudews_server_count "$SERVERS_JSON")
fi
```

---

### 2. Ask User (Based on Server Availability)

**If SERVER_COUNT = 0:**

```
⚠️ No ClaudeWS servers found

AI Workspaces require ClaudeWS servers to be configured first.

To set up servers:
  1. Go to PrivOs settings
  2. Configure at least one ClaudeWS server
  3. Add PRIVOS_API_URL to .env file

What would you like to do?
👉 Configure servers now and continue
⏭️ Skip this step for now
```

**If user skips:**

```bash
skip_state 7
```

**Show skip prompt:**
Use `templates/common-responses.md` → AI Workspaces

**If SERVER_COUNT > 0:**

```
🔧 Found ${SERVER_COUNT} ClaudeWS server(s):

$(list_claudews_servers "$SERVERS_JSON")

Do you want to add AI workspace content (skills, commands, agents) to any of these servers?

Type 'skip' to continue, or tell me which server(s) you want to configure.
```

---

### 3. For EACH Selected Server, Gather Requirements

**Ask user:**

```
Let's configure server: **{Server Name}**

What content do you want to add?

1. **Skills?** (optional)
   Examples: Code review, data analysis, document summarization

2. **Commands?** (optional)
   Examples: /summary, /analyze, /report

3. **Agents?** (optional)
   Examples: Code reviewer, data analyst, support assistant

Tell me what you need for this server.
```

**Gather information FIRST, don't create anything yet.**

---

### 4. Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll add to **{Server Name}**:

📚 Skills: {list of skills}
🔧 Commands: {list of commands}
🤖 Agents: {list of agents}

Ready to create? (say **"yes"** to proceed)
```

---

### 5. Create Workspace Content

```bash
# Get server ID from name using helper function
SERVER_NAME="{server-name-selected-by-user}"
SERVER_ID=$(get_claudews_server_id "$SERVERS_JSON" "$SERVER_NAME")

# Create directory structure
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/agents"
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/skills"
ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/commands"
```

**5a. Add Skills** (if user wants)

```bash
SKILL_NAME="{skill-name}"
SKILL_SLUG=$(echo "${SKILL_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/skills/${SKILL_SLUG}"

cat > template-${SLUG}/claude-ws/data/${SERVER_ID}/skills/${SKILL_SLUG}/SKILL.md << EOF
# ${SKILL_NAME}

{Instructions for this skill}

## When to use

{Describe when this skill should be used}
EOF
```

**5b. Add Commands** (if user wants)

```bash
COMMAND_NAME="{command-name}"
COMMAND_SLUG=$(echo "${COMMAND_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/commands/${COMMAND_SLUG}"

cat > template-${SLUG}/claude-ws/data/${SERVER_ID}/commands/${COMMAND_SLUG}/COMMAND.md << EOF
# /${COMMAND_NAME}

{Instructions for this command}

## Usage

${COMMAND_NAME} {parameters}
EOF
```

**5c. Add Agents** (if user wants)

```bash
AGENT_NAME="{agent-name}"
AGENT_SLUG=$(echo "${AGENT_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g')

ensure_dir "template-${SLUG}/claude-ws/data/${SERVER_ID}/agents/${AGENT_SLUG}"

cat > template-${SLUG}/claude-ws/data/${SERVER_ID}/agents/${AGENT_SLUG}/PROMPT.md << EOF
# ${AGENT_NAME}

{Instructions for this specialized agent}

## Role

{Describe the agent's role}

## Capabilities

- {Capability 1}
- {Capability 2}
EOF
```

---

### 6. Update \_workspaces.json

```bash
# Get server description using helper function
SERVER_DESC=$(get_claudews_server_desc "$SERVERS_JSON" "$SERVER_ID")

# Add to index
add_to_index "${SLUG}" "claude-ws/_workspaces.json" "${SERVER_ID}" "${SERVER_NAME}" "${SERVER_DESC}" "data/${SERVER_ID}"
```

---

### 7. Update State & Show Completion

```bash
update_step_state 7 "claudeWorkspaces" "claude-ws/_workspaces.json"
```

**Show completion prompt:**
Use `templates/common-responses.md` → AI Workspaces

---

## Data Format References

See `../references/template-structure.md` for complete AI workspace data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/08-package.md`

If user says "skip", this is already handled above.
