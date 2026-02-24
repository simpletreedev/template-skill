---
name: template-generator
description: Generate template following data structure format for any industry based on user requirements
version: 2.0.0
---

# Template Generator Skill (Main Orchestrator)

## Overview

Generates **complete template packages** that follow the standard data structure for any industry/workflow.

**Announce at start:** "I'll help you build a template step by step. Let's start with the basics and then build each section together."

## When to Use

- User wants to create a template for tracking ANY type of workflow/tasks
- User needs to organize and track items/processes in their work
- User asks to generate task/workflow management templates

**NOT for creating:**
- ❌ Web application templates
- ❌ Document templates (PDF/Markdown)
- ❌ Code templates
- ❌ Templates for other systems (Jira, Trello, Asana, etc.)

---

## How This Works

### 🤖 AI-Driven Orchestration System

This is **NOT an automated script** - it's an **instruction-based workflow** where the AI actively:

1. ✅ **Reads** the current state from `.template-generator-state.json`
2. ✅ **Loads** the appropriate step instruction from `steps/XX-name.md`
3. ✅ **Follows** the instructions to complete that step
4. ✅ **Updates** the state file when done
5. ✅ **Waits** for user confirmation
6. ✅ **Repeats** until all steps complete

### Key Responsibilities

**AI (You) MUST:**
- Read and understand each step instruction
- Execute commands manually
- Update state file correctly
- Show PAUSE prompts and wait for user
- Handle special commands (skip, go back, progress)
- Validate results before continuing

**AI (You) MUST NOT:**
- Continue automatically without user confirmation
- Skip steps without asking user
- Assume state - always read from file
- Run multiple steps at once

---

## Architecture

```
template-generator-skill/
├── SKILL.md                     # This file - main orchestration guide
├── steps/                       # Step-by-step instructions (renamed from "sub-skills")
│   ├── 00-init.md              # Gather requirements & explain template
│   ├── 01-base-structure.md    # Create folder structure
│   ├── 02-lists.md             # Configure lists & boards
│   ├── 03-documents.md         # Add documents (optional)
│   ├── 04-files.md             # Add file attachments (optional)
│   ├── 05-automations.md       # Add automations (optional)
│   ├── 06-chat-agents.md       # Add AI chat agents (optional)
│   ├── 07-ai-workspaces.md     # Add AI workspaces (optional)
│   └── 08-package.md           # Package & export ZIP
├── references/
│   └── template-structure.md    # Data format reference
└── helpers/
    └── validate-state.sh        # State file validation (optional)
```

**Why "steps" instead of "sub-skills"?**
- These are **instruction files**, not executable skills
- Each step contains **human-readable instructions** for the AI
- No automatic invocation - AI reads and follows manually
- Clearer naming avoids confusion with actual skills

---

## State Management (CRITICAL)

### State File

**File:** `.template-generator-state.json` (in working directory)

**Structure:**

```json
{
  "version": "1.0",
  "currentStep": 0,
  "totalSteps": 8,
  "templateSlug": "project-management",
  "templateName": "Project Management Template",
  "startedAt": "2026-02-24T10:00:00Z",
  "lastUpdated": "2026-02-24T10:15:00Z",

  "steps": {
    "0_INIT": { "status": "completed" },
    "1_BASE_STRUCTURE": { "status": "pending" },
    "2_LISTS": { "status": "pending" },
    "3_DOCUMENTS": { "status": "pending" },
    "4_FILES": { "status": "pending" },
    "5_AUTOMATIONS": { "status": "pending" },
    "6_CHAT_AGENTS": { "status": "pending" },
    "7_AI_WORKSPACES": { "status": "pending" },
    "8_PACKAGE": { "status": "pending" }
  },

  "summary": {
    "lists": 0,
    "documents": 0,
    "files": 0,
    "automations": 0,
    "chatAgents": 0,
    "claudeWorkspaces": 0
  }
}
```

**Status values:** `pending` | `in_progress` | `completed` | `skipped`

### Critical: State File Operations

**🔵 START OF EVERY RESPONSE:**

```bash
# 1. Check if state file exists
if [[ -f .template-generator-state.json ]]; then
  # 2. Read and show progress
  cat .template-generator-state.json
  # 3. Ask user
  echo "Continue from where we left off? (type 'yes' or 'progress')"
fi
```

**🟢 AFTER EVERY STEP:**

```bash
# 1. Update step status to "completed"
# 2. Increment currentStep
# 3. Update summary counts
# 4. Update lastUpdated timestamp
# 5. Save IMMEDIATELY

jq '.currentStep = N | .steps["N_NAME"].status = "completed" | .summary.{key} = ${COUNT} | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

**🟡 IF USER SAYS "PROGRESS":**

```
📊 Template Generation Progress

📋 Template: {templateName}
📍 Current: STEP {currentStep}/8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ STEP 0: INIT
✅ STEP 1: BASE STRUCTURE
🔄 STEP 2: LISTS (in progress)
⏳ STEP 3: DOCUMENTS
⏳ STEP 4: FILES
⏳ STEP 5: AUTOMATIONS
⏳ STEP 6: CHAT AGENTS
⏳ STEP 7: AI WORKSPACES
⏳ STEP 8: PACKAGE & EXPORT

📁 Working folder: template-{slug}
⏱️  Started: {timestamp}
📊 Items so far: {summary}
```

---

## The Complete Workflow

### Phase 1: Check for Existing State

**Step 1: Check if state file exists**

```bash
if [[ -f .template-generator-state.json ]]; then
  # Show progress and ask user
  echo "🔄 Resuming template generation..."
  jq -r '"📋 Template: \(.templateName)\n📍 Current: STEP \(.currentStep)/8"' .template-generator-state.json
  echo ""
  echo "Continue from where we left off? (type 'yes' or 'progress')"
  # WAIT for user response
fi
```

**Step 2: If user confirms, load current step**

```bash
# Read current step
CURRENT_STEP=$(jq -r '.currentStep' .template-generator-state.json)

# Load the step instruction file
STEP_FILE="steps/$(printf '%02d' ${CURRENT_STEP})-*.md"

# Read and display the step
cat ${STEP_FILE}
```

---

### Phase 2: Start New Template (If No State)

**Step 1: Load step 0**

```bash
# Read the init step
cat steps/00-init.md
```

**Step 2: Follow instructions in that step**
- Ask user about requirements
- Explain template structure
- Create state file
- PAUSE and wait for user

---

### Phase 3: Step Completion Loop

For each step from 1 to 8:

**Step 1: Determine next step**

```bash
# Read state file
CURRENT_STEP=$(jq -r '.currentStep' .template-generator-state.json)
NEXT_STEP=$((CURRENT_STEP + 1))

# Check if we're done
if [[ $NEXT_STEP -gt 8 ]]; then
  echo "✅ All steps complete!"
  exit 0
fi
```

**Step 2: Load the step instruction**

```bash
# Find the step file
STEP_FILE=$(ls steps/$(printf '%02d' ${NEXT_STEP})-*.md)

# Read it
cat ${STEP_FILE}
```

**Step 3: Execute instructions**
- Follow the commands in the step file
- Create files as specified
- Update metadata files
- Run validations

**Step 4: Update state file**

```bash
# Mark step as completed
jq '.currentStep = '${NEXT_STEP}' | .steps["'${NEXT_STEP}'_NAME"].status = "completed" | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

**Step 5: Show PAUSE prompt**

```
✅ Step {N} complete!

📊 Progress:
   • Current: STEP {N}/8
   • Next: {Next step name}

What's next?
• Continue to next step? (say "continue")
• See detailed progress? (say "progress")
• Skip next step? (say "skip")
• Go back and change something? (say "go back")

Waiting for you... ⏸️
```

**Step 6: Handle user response**

| User says | AI does |
|-----------|---------|
| "continue" | Load next step file |
| "skip" | Mark next step as "skipped", load step after that |
| "go back" | Decrement currentStep, reload previous step |
| "progress" | Show progress overview |

---

### Phase 4: Final Package (Step 8)

When all steps complete:

1. Load `steps/08-package.md`
2. Follow instructions to:
   - Update metadata.json with final counts
   - Create IMPORT.md
   - Create ZIP package
   - Clean up temporary files
   - Delete state file
3. Show final success message

---

## Step Reference

**Step files in `steps/` directory:**

| Step | File | Purpose | Optional |
|------|------|---------|----------|
| 0 | `00-init.md` | Requirements gathering, template explanation | No |
| 1 | `01-base-structure.md` | Folder structure creation | No |
| 2 | `02-lists.md` | Lists configuration | No |
| 3 | `03-documents.md` | Documents (wiki pages) | Yes |
| 4 | `04-files.md` | File attachments (PDFs, images, etc.) | Yes |
| 5 | `05-automations.md` | Automation rules | Yes |
| 6 | `06-chat-agents.md` | AI chat agents | Yes |
| 7 | `07-ai-workspaces.md` | AI workspaces | Yes |
| 8 | `08-package.md` | Final package & export | No |

**Each step file contains:**
- Purpose and context
- What to do (step-by-step)
- Data structure references
- File creation commands
- PAUSE prompt template
- State update instructions

**Data format reference:** See `references/template-structure.md`

---

## Best Practices

### For AI Orchestrator (You):

✅ **DO:**
- Read state file at START of every response
- Read step instructions carefully
- Execute commands exactly as specified
- Update state file IMMEDIATELY after each step
- Show PAUSE prompts and wait for user
- Validate results before continuing
- Handle "skip", "go back", "progress" commands

❌ **DON'T:**
- Continue automatically without user confirmation
- Skip steps without asking user first
- Run multiple steps at once
- Assume state - always read from file
- Forget to update state file
- Ignore validation errors

### For Step Files:

✅ **Each step MUST:**
- Start with clear purpose
- Include complete context
- Provide exact commands
- Specify state update logic
- End with PAUSE prompt (except step 8)
- Reference template-structure.md

❌ **Each step MUST NOT:**
- Assume previous steps completed
- Skip state update instructions
- Continue to next step automatically

---

## Validation

### State File Validation

Use the helper script to validate state file:

```bash
# Run validation
bash helpers/validate-state.sh

# Output: ✅ State file valid OR ❌ Error details
```

### What Gets Validated:

- ✅ State file exists and is valid JSON
- ✅ All step files exist (00-08)
- ✅ currentStep is within valid range (0-8)
- ✅ All step statuses are valid
- ✅ Timestamp format is correct

---

## Troubleshooting

### Common Issues:

**Issue:** "Step file not found"
```
Solution: Check that steps/XX-name.md files exist
         Use ls steps/ to verify
```

**Issue:** "Invalid state file"
```
Solution: Run helpers/validate-state.sh
         Fix JSON syntax errors
         Restore from backup if needed
```

**Issue:** "Step completed but state not updated"
```
Solution: Manually update state file:
         jq '.steps["N_NAME"].status = "completed"' .template-generator-state.json
```

---

## Quick Reference Commands

```bash
# Check current progress
cat .template-generator-state.json | jq '{currentStep, templateName, steps}'

# Load specific step
cat steps/02-lists.md

# Show progress overview
echo "Progress: $(jq -r '.currentStep' .template-generator-state.json)/8"

# Mark step as skipped
jq '.steps["3_DOCUMENTS"].status = "skipped"' .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json

# Validate state
bash helpers/validate-state.sh
```

---

**End of Main Orchestrator Guide**

Remember: This is an **AI-driven workflow**. You (the AI) are the active orchestrator, not a passive script reader. Stay engaged, validate results, and keep the user informed! 🚀
