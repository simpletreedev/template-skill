# Step: STEP 7 - AI WORKSPACES (OPTIONAL)

## Purpose

Configure AI workspaces (customize AI with your knowledge).

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

"Do you need any **AI workspaces** in this template?
AI workspaces provide custom AI prompts, skills, and commands.

Type 'skip' to continue, or tell me what workspaces you need."

---

### 2. If User Skips

```bash
skip_state 7
```

**Show skip prompt:**

```
⏭️  Skipping AI workspaces

📊 Progress:
   • AI workspaces: skipped

📍 What's next: Package & Export (final step)

What's next?
• Continue to package? (say "continue")
• See detailed progress? (say "progress")

Your call! 📦
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

### 3. For EACH Workspace, Ask

- "Workspace name? (e.g., 'Project AI Workspace')"
- "What's its purpose? (description)"
- "Model preference? (default: claude-3-5-sonnet)"
- "System prompt? (main instructions for the AI)"
- "Any skills? (specific capabilities)"
- "Any commands? (slash commands with prompts)"

---

### 4. Create Workspace Structure

```bash
WS_KEY="{ws-key}"

ensure_dir "template-${SLUG}/claude-ws/data/${WS_KEY}/agents"
ensure_dir "template-${SLUG}/claude-ws/data/${WS_KEY}/skills"
ensure_dir "template-${SLUG}/claude-ws/data/${WS_KEY}/commands"
```

---

### 5. Create Workspace Files

**_config.json:**

```bash
NAME="{Workspace Name}"
DESC="{Description}"

cat > template-${SLUG}/claude-ws/data/${WS_KEY}/_config.json << EOF
{
  "name": "${NAME}",
  "description": "${DESC}",
  "model": "claude-3-5-sonnet",
  "temperature": 0.7,
  "maxTokens": 4096
}
EOF
```

**system-prompt.md:**

```bash
cat > template-${SLUG}/claude-ws/data/${WS_KEY}/system-prompt.md << 'EOF'
# System Prompt

{User-provided system prompt}
EOF
```

**skills/{skill}.md and commands/{command}.md** (if any):

```bash
# Example skill file
cat > template-${SLUG}/claude-ws/data/${WS_KEY}/skills/{skill-name}.md << 'EOF'
# {Skill Name}

{Instructions for this skill}
EOF

# Example command file
cat > template-${SLUG}/claude-ws/data/${WS_KEY}/commands/{command-name}.md << 'EOF'
# /{command-name}

{Instructions for this command}
EOF
```

---

### 6. Update _workspaces.json

```bash
WS_KEY="{ws-key}"
NAME="{Workspace Name}"
DESC="{Description}"

add_to_index "${SLUG}" "claude-ws/_workspaces.json" "claude-ws-${WS_KEY}" "${NAME}" "${DESC}" "data/claude-ws-${WS_KEY}"
```

---

### 7. Update State File

**CRITICAL: Update state after completing workspaces:**

```bash
WS_COUNT=$(get_count "${SLUG}" "claude-ws/_workspaces.json" "workspaces")
update_state 7 "claudeWorkspaces" ${WS_COUNT}
```

---

### 8. Show PAUSE Prompt

```
✅ AI workspaces configured!

📊 We've added:
   • {count} AI workspaces
   • {skills_count} custom skills
   • {commands_count} slash commands

📍 What's next: Package & Export (final step)
   We'll package everything into a ZIP file ready for import.

What's next?
• Continue to package? (say "continue")
• Go back and change workspaces? (say "go back")
• See detailed progress? (say "progress")

Your call! 📦
```

**⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

---

## Data Format References

See `../references/template-structure.md` for complete AI workspace data structure.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/08-package.md`

If user says "skip", this is already handled above.
