# Step 1: Foundation Ready

## What We're Creating

Confirm foundation is ready and set up initial state.

## Preview

```
✅ Foundation is ready!
📊 Template structure created
📍 Next: Lists & Boards
```

## Let's Complete This

### Step 0: Set up context

```bash
# Session file format: sid-{SESSION_ID} at skill root level
SESSION_ID="${CLAUDE_SESSION_ID:-${SESSION_ID:-123}}"
SESSION_FILE="$(dirname "$(pwd)")/sid-${SESSION_ID}"

# Validate session file exists
if [[ ! -f "$SESSION_FILE" ]]; then
    echo "❌ Error: Session file not found: sid-${SESSION_ID}"
    echo "   Please run: bash scripts/quick-init.sh <slug> <name> <description>"
    exit 1
fi

# Read template path from session file
export TEMPLATE_DIR=$(cat "$SESSION_FILE")
cd "$TEMPLATE_DIR"

# Now $TEMPLATE_DIR is set, and you're already in the directory
# Session file ensures each user/chat gets their own template context
```

### Step 1: Update State

```bash
# Update state to mark foundation complete
python3 scripts/core.py update 1 "foundation" 1
```

### Step 2: Show Success & STOP

```
✅ Foundation is ready!

📊 We've created:
• Template structure
• Metadata files
• Empty index files

📍 What's next: Lists & Boards

   Define what you want to track and how it moves through your workflow.

👉 Continue to set up lists
```

**⚠️ CRITICAL: STOP HERE!**
- DO NOT load Step 2 automatically
- WAIT for user to say "continue", "yes", or "ready"
- ONLY after user confirms, THEN load: `references/steps/02-lists.md`
