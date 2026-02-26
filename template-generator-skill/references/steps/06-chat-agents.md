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

### 4. Create Agent Flow Using flow-generator-skill

**IMPORTANT:** Use the `flow-generator-skill` to create agent flow JSON.

```bash
# Invoke flow-generator-skill
SKILL="flow" PROMPT="create agent flow for {Agent Name} with description: {description}" \
  WORKSPACE="{claudeWs}" COMMANDS="{comma-separated list of /commands}"
```

The flow-generator-skill will:
1. Clarify requirements (if needed)
2. Generate proper flow JSON with nodes and edges
3. Return formatted JSON compatible with Flowise Agent Flow

**Save the output:**
```bash
AGENT_KEY="{agent-key}"

ensure_dir "template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}"

# Save flow JSON returned by flow-generator-skill
cat > template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}/data.json << 'EOF'
{
  "flowId": "flow-${AGENT_KEY}",
  "flow": { /* flow JSON from flow-generator-skill */ },
  "name": "{Agent Name}",
  "description": "{Agent Description}",
  "claudeWs": "claude-ws-{key}",
  "agentPrompt": "agent-${AGENT_KEY}.md",
  "commands": [
    {
      "name": "/{command}",
      "description": "{What it does}",
      "skill": "{command}.md"
    }
  ]
}
EOF
```

**Note:** `claudeWs` must reference a workspace created in step 7 (AI Workspaces).

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

## Data Format References

See `../references/template-structure.md` for complete chat agent data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/07-ai-workspaces.md`

If user says "skip", this is already handled above.
