# Step: STEP 6 - CHAT AGENTS (OPTIONAL)

## Purpose

Configure AI chat agents (AI assistants for specific tasks).

---

## What To Do

### 0. Initialize Step Variables

```bash
# Load common variables (helpers already loaded by SKILL.md)
init_step
# Now: SLUG, NAME, DESCRIPTION, TIMESTAMP are available
```

---

### 1. Ask User

"Do you need any **AI chat agents** in this template?
Chat agents are AI assistants that can help with specific tasks.

Type 'skip' to continue, or tell me what agents you need."

---

### 2. If User Skips

```bash
skip_state 6 "CHAT_AGENTS"
```

**Show skip prompt:**

```
⏭️  Skipping chat agents

📊 Progress:
   • Chat agents: skipped

📍 What's next: AI Workspaces (optional)

What's next?
• Continue to AI workspaces? (say "continue")
• See detailed progress? (say "progress")

Your call! 🧠
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

### 3. For EACH Agent, Ask

- "What's the agent's role? (e.g., Project Assistant, Code Reviewer)"
- "What should it help with? (description)"
- "Which AI workspace should it use? (from previously created workspaces)"
- "Any slash commands? (e.g., /summary, /tasks)"

---

### 4. Create Agent Flow Using flow skill

**IMPORTANT: Always use the `flow` skill to generate agent flow JSON.**

**Step 4a: Invoke flow skill**

Use the Skill tool to call the flow skill:

```
flow skill: create agent flow for {Agent Name}

Context:
- Agent role: {role from step 3}
- Description: {what it helps with from step 3}
- AI workspace: {workspace key from step 3}
- Slash commands: {commands from step 3}

Example:
"create agent flow for Project Assistant that helps with project management,
uses claude-ws-1, with commands /summary and /tasks"
```

**The flow skill will:**
1. Ask clarifying questions (if needed)
2. Generate proper flow JSON with `nodes[]` and `edges[]`
3. Return the complete flow structure

**Step 4b: Save the output**

```bash
AGENT_KEY="{agent-key}"
AGENT_NAME="{Agent Name}"
AGENT_DESC="{Agent Description}"
WS_KEY="{workspace-key}"
COMMANDS="{commands from step 3}"

ensure_dir "template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}"

# Create data.json with flow from flow skill
cat > template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}/data.json << EOF
{
  "flowId": "flow-${AGENT_KEY}",
  "name": "${AGENT_NAME}",
  "flow": $FLOW_JSON,
  "description": "${AGENT_DESC}",
  "claudeWs": "claude-ws-${WS_KEY}",
  "agentPrompt": "agent-${AGENT_KEY}.md",
  "commands": [
EOF

# Add commands
if [[ -n "${COMMANDS}" ]]; then
  IFS=',' read -ra CMD_ARRAY <<< "${COMMANDS}"
  for i in "${!CMD_ARRAY[@]}"; do
    cmd="${CMD_ARRAY[$i]}"
    cmd_name="${cmd#/}"
    cat >> template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}/data.json << EOF
    {"name": "${cmd}", "description": "Execute ${cmd_name}", "skill": "${cmd_name}.md"}$(if [[ $i -lt $((${#CMD_ARRAY[@]} - 1)) ]]; then echo ","; fi)
EOF
  done
fi

cat >> template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}/data.json << EOF
  ]
}
EOF
```

**Where `$FLOW_JSON` is the output from flow skill (contains `{"nodes": [...], "edges": [...]}`).**

---

### 5. Update _agents.json

```bash
AGENT_KEY="{agent-key}"
NAME="{Agent Name}"
DESC="{Agent Description}"
WS_KEY="claude-ws-{key}"

add_agent_to_index "${SLUG}" "flows/chat-agents/_agents.json" "agent-${AGENT_KEY}" "${NAME}" "${DESC}" "data/agent-${AGENT_KEY}/data.json" "${WS_KEY}"
```

---

### 6. Update State File

**CRITICAL: Update state after completing agents:**

```bash
AGENT_COUNT=$(get_count "${SLUG}" "flows/chat-agents/_agents.json" "agents")
update_state 6 "CHAT_AGENTS" "chatAgents" ${AGENT_COUNT}
```

---

### 7. Show PAUSE Prompt

```
✅ Chat agents configured!

📊 We've added:
   • {count} AI chat agents

📍 What's next: AI Workspaces (optional)
   AI workspaces provide custom AI prompts, skills, and commands.
   Also optional - only if you need custom AI behavior.

What's next?
• Add AI workspaces? (say "continue" or tell me how many)
• Skip AI workspaces? (say "skip")
• Go back and change agents? (say "go back")
• See detailed progress? (say "progress")

Your call! 🧠
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

## Best Practices

**AI MUST:**
- ✅ Use flow skill for agent flow generation
- ✅ Copy flow JSON output from flow skill exactly as returned

**AI MUST NOT:**
- ❌ Manually create or guess flow JSON structure
- ❌ Generate flow JSON without using flow skill
- ❌ Use other flow formats (e.g., id/type/position format)
- ❌ Modify flow skill output format

**⚠️ CRITICAL: Flow skill output format**

**CORRECT (from flow skill):**
```json
{
  "nodes": [
    {"index": 1, "typeId": 1, "inputs": {...}},
    {"index": 2, "typeId": 9, "inputs": {...}}
  ],
  "edges": ["1-2", "2-3"]
}
```

**WRONG (other format):**
```json
{
  "nodes": [
    {"id": "input-node", "type": "textInput", "position": [...], "data": {...}},
    {"id": "fetch-node", "type": "apiCall", "position": [...]}
  ],
  "edges": [
    {"id": "e1", "source": "input-node", "target": "fetch-node"}
  ]
}
```

**The flow skill handles:**
- Node types (typeId 1-29 mappings)
- Edge connections ("1-2", "2-3" format)
- Variable syntax (`$1`, `$2`, `$form`, `$flow.state`)
- Proper Flowise Agent Flow structure

**If flow skill is not available, skip chat agents or ask user to provide flow JSON.**

---

## Data Format References

See `../references/template-structure.md` for complete chat agent data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/07-ai-workspaces.md`

If user says "skip", this is already handled above.
