# Step: STEP 6 - CHAT AGENTS (OPTIONAL)

## Purpose

Configure AI chat agents (AI assistants for specific tasks).

---

## What To Do

### 0. Read State File

**ALWAYS start by reading current state:**

```bash
cat .template-generator-state.json
```

This ensures you're working with the latest data.

---

### 1. Ask User

"Do you need any **AI chat agents** in this template?
Chat agents are AI assistants that can help with specific tasks.

Type 'skip' to continue, or tell me what agents you need."

---

### 2. If User Skips

**Update state file:**

```bash
jq '.currentStep = 6 | .steps["6_CHAT_AGENTS"].status = "skipped" | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
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

### 4. Create Agent Data File

For each agent, create:

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
AGENT_KEY="{agent-key}"

mkdir -p template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}

cat > template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}/data.json << 'EOF'
{
  "flowId": "flow-${AGENT_KEY}",
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

**Note:** `claudeWs` must reference a workspace created in step 7.

---

### 5. Update _agents.json

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
AGENT_KEY="{agent-key}"
NAME="{Agent Name}"
DESC="{Agent Description}"
WS_KEY="claude-ws-{key}"

jq --arg key "agent-${AGENT_KEY}" \
   --arg name "${NAME}" \
   --arg desc "${DESC}" \
   --arg ws "${WS_KEY}" \
   '.agents += [{
     "key": $key,
     "name": $name,
     "description": $desc,
     "file": "data/agent-'${AGENT_KEY}'/data.json",
     "claudeWs": $ws,
     "order": (.agents | length)
   }]' \
   template-${SLUG}/flows/chat-agents/_agents.json > .tmp && mv .tmp template-${SLUG}/flows/chat-agents/_agents.json
```

---

### 6. Update State File

**CRITICAL: Update state after completing agents:**

```bash
SLUG=$(jq -r '.templateSlug' .template-generator-state.json)
AGENT_COUNT=$(jq '.agents | length' template-${SLUG}/flows/chat-agents/_agents.json)

jq '.currentStep = 6 | .steps["6_CHAT_AGENTS"].status = "completed" | .summary.chatAgents = '${AGENT_COUNT}' | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
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
