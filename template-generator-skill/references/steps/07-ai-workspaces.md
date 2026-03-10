# Step 7: AI Workspaces (Optional)

## What We're Creating

Add skills, commands, and agents to existing ClaudeWS servers.

**⚠️ IMPORTANT:** This step does NOT create new ClaudeWS servers. It only adds content to servers you already have configured.

## Preview

```
🧠 AI Workspace: {Server Name}
├── 📚 Skills: {list of skills}
├── 🔧 Commands: {list of commands}
└── 🤖 Agents: {list of agents}
```

Each workspace enhances ClaudeWS servers with specialized capabilities.

## Let's Create This

### Step 0: Set up context

```bash
# Validate session file and get template path
SESSION_ID="${CLAUDE_SESSION_ID:-${SESSION_ID:-123}}"
SESSION_FILE="$(dirname "$(pwd)")/sid-${SESSION_ID}"

if [[ ! -f "$SESSION_FILE" ]]; then
    echo "❌ Error: Session file not found: sid-${SESSION_ID}"
    echo "   Please run: bash scripts/quick-init.sh <slug> <name> <description>"
    exit 1
fi

# Read and verify template path
export TEMPLATE_DIR=$(cat "$SESSION_FILE")
echo "📍 Template: $TEMPLATE_DIR"
```

### Step 1: Check ClaudeWS Servers

```bash
# Get API URL from .env or use default
API_URL="${PRIVOS_API_URL:-https://nfknprk0-8000.asse.devtunnels.ms/api/v1/triggers}"

# Try to get servers list
SERVERS_JSON=$(curl -s "${API_URL}/api/v1/claudews-servers" 2>/dev/null || echo "[]")

# Count servers
if [[ -z "${SERVERS_JSON}" ]] || [[ "${SERVERS_JSON}" == "Error:"* ]] || [[ "${SERVERS_JSON}" == "[]" ]]; then
  SERVER_COUNT=0
else
  SERVER_COUNT=$(echo "$SERVERS_JSON" | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null || echo "0")
fi
```

### Step 2: Ask User (Based on Server Availability)

**⚠️ CRITICAL: When SERVER_COUNT=0, SHOW message below and ASK user what to do. DO NOT auto-skip.**

**If SERVER_COUNT = 0:**

```
⚠️ No ClaudeWS servers found

I couldn't detect any ClaudeWS servers in your environment.
AI Workspaces need ClaudeWS servers to add skills, commands, and agents.

Here's how to configure:
  1. Open PrivOs settings
  2. Navigate to ClaudeWS configuration
  3. Add your ClaudeWS server URL(s)

💡 After configuring your servers, just type **"done"** or **"check again"** and I'll verify the setup.
⏭️ Skip AI workspaces for now
```

**⚠️ CRITICAL: WAIT FOR USER RESPONSE!**

- **DO NOT** automatically skip this step
- **DO NOT** proceed to step 8
- **MUST WAIT** for user to explicitly say:
  - "skip" OR "skip this step" → THEN run skip command
  - "configured" OR "check again" OR "done" → THEN re-run the server check from Step 1
  - Any other response → Address their concern first

**If user explicitly chooses to skip:**

```bash
python3 scripts/core.py skip 7
```

**Show skip response:**

```
⏭️ AI workspaces skipped

📍 What's next: Package & Export
We'll finalize your template and create a downloadable ZIP file.

👉 Continue to package
```

**If SERVER_COUNT > 0:**

```bash
# List servers with descriptions
SERVER_LIST=$(echo "$SERVERS_JSON" | python3 -c "
import sys, json
servers = json.load(sys.stdin)
for i, s in enumerate(servers, 1):
    name = s.get('name', 'Unnamed')
    desc = s.get('description', 'No description')
    print(f\"  {i}. **{name}**\")
    print(f\"     {desc}\")
" 2>/dev/null || echo "  • Error listing servers")
```

```
🔧 Found ${SERVER_COUNT} ClaudeWS server(s):

${SERVER_LIST}

Which server(s) would you like to add AI workspace content to?

💡 You can add:

   • 📚 Skills - Specialized AI capabilities

   • 🔧 Commands - Quick slash commands

   • 🤖 Agents - AI assistants

👉 Tell me which server(s) you want to configure

⏭️ Skip AI workspaces
```

### Step 3: For EACH Selected Server, Gather Requirements

**⚠️ IMPORTANT: Handle one server at a time.**

```
🔧 Configuring: **{Server Name}**

What AI workspace content would you like to add to this server?

📚 **Skills** (optional)

   Specialized capabilities like code review, data analysis, etc.
   
   Which skills do you need?

🔧 **Commands** (optional)

   Quick slash commands like /summary, /analyze, etc.

   Which commands would be helpful?

🤖 **Agents** (optional)

   AI assistants for specific tasks

   Which agents do you want?

💡 Tell me what you need, or say "all" to add everything relevant to this template.
```

### Step 4: Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll add to **{Server Name}**:

📚 Skills: {list of skills}

🔧 Commands: {list of commands}

🤖 Agents: {list of agents}

Ready to create? (say **"yes"** to proceed)
```

### Step 5: Create Workspace Content

```bash
SERVER_ID="{server-id}"

# Create directory structure
mkdir -p "${TEMPLATE_DIR}/claude-ws/data/${SERVER_ID}/agents"
mkdir -p "${TEMPLATE_DIR}/claude-ws/data/${SERVER_ID}/skills"
mkdir -p "${TEMPLATE_DIR}/claude-ws/data/${SERVER_ID}/commands"
```

**Add content based on what user wants:**

- **Skills** - Create `skills/{slug}/SKILL.md` with instructions
- **Commands** - Create `commands/{slug}/COMMAND.md` with usage
- **Agents** - Create `agents/{slug}/PROMPT.md` with role & capabilities

### Step 6: Update \_workspaces.json

```bash
SERVER_ID="{server-id}"

# Read existing index
INDEX_FILE="${TEMPLATE_DIR}/claude-ws/_workspaces.json"
INDEX=$(cat "$INDEX_FILE")

# Add new workspace entry
python3 << PYTHON
import json
index = $INDEX
index['workspaces'].append({
    "key": "${SERVER_ID}",
    "name": "{Server Name}",
    "description": "{Description}",
    "dataPath": "data/${SERVER_ID}"
})
with open('$INDEX_FILE', 'w') as f:
    json.dump(index, f, indent=2)
PYTHON
```

### Step 7: After Completion

```bash
# Count workspaces
WS_COUNT=$(python3 -c "import json; print(len(json.load(open('${TEMPLATE_DIR}/claude-ws/_workspaces.json'))['workspaces']))")

# Update state
python3 scripts/core.py update 7 "claudeWorkspaces" ${WS_COUNT}
```

## ✅ AI Workspaces Ready!

**See `INDEX.md` for response template.**
