# Step 6: Agent Workflows (Optional)

## What We're Creating

Help users create agent workflows - multi-step AI agent flows that automate complex tasks using specialized agents working together.

## Let's Guide Users

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

### Step 1: Suggest Workflows Based on User Requirements

**Based on the user's initial requirements, suggest relevant agent workflows:**

```
Based on your template for **{Template Name}**, here are some agent workflows that would be useful:

1. **{Workflow Name 1}**
   {Brief description of what it does}

   Why it helps: {Benefit for this specific template}

2. **{Workflow Name 2}**
   {Brief description of what it does}

   Why it helps: {Benefit for this specific template}

3. **{Workflow Name 3}**
   {Brief description of what it does}

   Why it helps: {Benefit for this specific template}

Would you like to add any of these workflows?

👉 Add workflow(s) - tell me which one(s)

🔗 Describe custom workflow - tell me what you need

⏭️ Skip workflows
```

### Step 2: Handle User Response

**If user skips:**

```bash
python3 scripts/core.py skip 6
```

**Show skip response:**

```
⏭️ Agent workflows skipped

📍 What's next: AI Workspaces (optional)
Add skills, commands, and agents to existing ClaudeWS servers.

👉 Continue to add AI workspaces

⏭️ Skip AI workspaces
```

**If user selects workflow(s) from suggestions:**

```
Great choices! The flow generator will ask you a few questions to customize these workflows for your needs.

👉 Ready to continue? (say **"yes"** to launch the flow generator)
```

**If user describes custom workflow:**

```
Perfect! The flow generator will ask you some questions to understand your exact requirements and create the perfect workflow.

👉 Ready to continue? (say **"yes"** to launch the flow generator)
```

### Step 3: Delegate to flow Skill

**⚠️ IMPORTANT: Once user confirms, call the `flow` skill. The flow skill will handle all requirement gathering.**

**Use the Skill tool to call flow skill:**

```
flow skill: create agent workflow for {Workflow Name}

Context:
- Template: {Template Name}
- User's initial request: {what user described or selected}
- Template context: {relevant lists/structures created in previous steps}

The flow skill should:
1. Ask clarifying questions about data sources, inputs, outputs
2. Understand the user's specific requirements
3. Generate the complete flow JSON structure
```

**⚠️ IMPORTANT: Let the flow skill complete its entire interaction loop. DO NOT interrupt or ask additional questions here.**

### Step 4: Save Workflow (if flow skill returns valid JSON)

```bash
# Only proceed if flow skill returned valid flow JSON
WORKFLOW_KEY="{workflow-key}"

# Create directory
mkdir -p "${TEMPLATE_DIR}/flows/chat-agents/data/${WORKFLOW_KEY}"

# Save the flow from flow skill
cat > "${TEMPLATE_DIR}/flows/chat-agents/data/${WORKFLOW_KEY}/data.json" << 'EOF'
{
  "flowId": "flow-${WORKFLOW_KEY}",
  "name": "{Workflow Name}",
  "flow": {FLOW_JSON_FROM_FLOW_SKILL},
  "description": "{Description}"
}
EOF
```

### Step 5: Update Workflows Index

```bash
# Read existing index
INDEX_FILE="${TEMPLATE_DIR}/flows/workflows/_workflows.json"
INDEX=$(cat "$INDEX_FILE" 2>/dev/null || echo '{"workflows":[]}')

# Add new workflow entry
python3 << PYTHON
import json
index = $INDEX
index['workflows'].append({
    "key": "workflow-${WORKFLOW_KEY}",
    "name": "{Workflow Name}",
    "description": "{Description}",
    "dataPath": "data/workflow-${WORKFLOW_KEY}/data.json"
})
with open('$INDEX_FILE', 'w') as f:
    json.dump(index, f, indent=2)
PYTHON
```

### Step 6: After Completion

```bash
# Count workflows
WORKFLOW_COUNT=$(python3 -c "import json; print(len(json.load(open('${TEMPLATE_DIR}/flows/workflows/_workflows.json'))['workflows']))")

# Update state
python3 scripts/core.py update 6 "agentWorkflows" ${WORKFLOW_COUNT}
```

## ✅ Agent Workflows Ready!

**See `INDEX.md` for response template.**
