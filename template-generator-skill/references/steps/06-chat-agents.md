# Step: STEP 6 - CHAT AGENTS (OPTIONAL)

## Purpose

Configure AI chat agents (AI assistants for specific tasks).

---

## What To Do

### 1. Ask User

Use `templates/common-user-prompts.md` → Chat Agents

---

### 2. If User Skips

```bash
skip_state 6
```

**Show skip prompt:**
Use `templates/common-responses.md` → Chat Agents

---

### 3. For EACH Agent, Gather Requirements

**Ask user:**

```
Let's create your AI agent: **{Agent Name}**

I need to know:

1. **What's the agent's role?**
   Examples: Project Assistant, Code Reviewer, Customer Support, Data Analyst

2. **What should it help with?** (description)
   Examples: Help manage tasks, review code quality, answer customer questions, analyze data

3. **Which AI workspace should it use?** (optional)
   If you created AI workspaces in step 7, this agent can use them.
   If not, I can skip this or we can create a workspace first.

4. **Any slash commands?** (optional)
   Examples: /summary, /tasks, /analyze - These are quick actions users can trigger

Tell me about this agent and I'll put it together for you.
```

**Gather information FIRST, don't create anything yet.**

---

### 4. Show Preview (BEFORE Creating)

```
Perfect! Here's what I'll create:

🤖 **{Agent Name}**
   Role: {Role description}
   Purpose: {What it helps with}
   AI Workspace: {workspace key (if applicable)}
   Commands: {list of commands (if any)}

This agent will {benefit/use case}.

Ready to create this agent? (say **"yes"** to proceed)
```

---

### 5. Create Agent Flow Using flow skill

**IMPORTANT: Always use the `flow` skill to generate agent flow JSON.**

**Step 5a: Invoke flow skill**

Use the Skill tool to call the flow skill:

```
flow skill: create agent flow for {Agent Name}

Context:
- Agent role: {role from step 3}
- Description: {what it helps with from step 3}
- AI workspace: {workspace key from step 3}
- Commands: {list of commands from step 3}

The flow should handle user messages and provide appropriate responses based on the agent's role.
```

**Step 5b: Receive flow JSON**

The flow skill will return a complete flow JSON. Save this as `FLOW_JSON`.

**Step 5c: Create agent data file**

```bash
AGENT_KEY="{agent-key}"

ensure_dir "template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}"

cat > template-${SLUG}/flows/chat-agents/data/${AGENT_KEY}/data.json << 'EOF'
{
  "flowId": "flow-${AGENT_KEY}",
  "name": "{Agent Name}",
  "flow": ${FLOW_JSON},
  "claudeWs": "claude-ws-{key}",
  "agentPrompt": "{System prompt for the agent}",
  "commands": [
    {
      "name": "/{command}",
      "description": "{What this command does}",
      "skill": "skill-file.md"
    }
  ],
  "description": "{Description}"
}
EOF
```

**Best Practices:**

✅ **CORRECT:**

```
flow skill: create agent flow for Code Reviewer
Context:
- Role: Review code for quality, bugs, and best practices
- Description: Helps developers review code before merging
- Workspace: claude-ws-dev
- Commands: /review, /suggest

[Save flow skill output → use in data.json]
```

❌ **WRONG:**

```json
{
  "flow": {
    "nodes": [
      { "typeId": 1, "inputs": { ... } }  // Don't manually create this!
    ]
  }
}
```

---

### 6. Update \_agents.json

```bash
AGENT_KEY="{agent-key}"
NAME="{Agent Name}"
DESC="{Description}"

add_to_index "${SLUG}" "flows/chat-agents/_agents.json" "agent-${AGENT_KEY}" "${NAME}" "${DESC}" "data/agent-${AGENT_KEY}/data.json"
```

---

### 7. Update State & Show Completion

```bash
update_step_state 6 "chatAgents" "flows/chat-agents/_agents.json"
```

**Show completion prompt:**
Use `templates/common-responses.md` → Chat Agents

---

## Data Format References

See `../references/template-structure.md` for complete chat agent data structure.

**Key points:**

- Always use `flow` skill to generate flow JSON
- Never manually create flow nodes
- `flow` field contains the complete flow from flow skill
- `commands` array defines slash commands for quick actions
- `claudeWs` references AI workspace from step 7 (if created)

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/07-ai-workspaces.md`

If user says "skip", this is already handled above.
