---
name: template-generator
description: Generate template following data structure format for any industry based on user requirements
version: 2.0.0
---

# Template Generator Skill

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

## Architecture

```
template-generator-skill/
├── SKILL.md                        # Main orchestrator (this file)
├── references/
│   ├── steps/                      # Step-by-step instructions
│   │   ├── 00-init.md              # Requirements & explanation
│   │   ├── 01-base-structure.md    # Folder structure
│   │   ├── 02-lists.md             # Lists & boards
│   │   ├── 03-documents.md         # Documents (optional)
│   │   ├── 04-files.md             # File attachments (optional)
│   │   ├── 05-automations.md       # Automations (optional)
│   │   ├── 06-chat-agents.md       # AI chat agents (optional)
│   │   ├── 07-ai-workspaces.md     # AI workspaces (optional)
│   │   └── 08-package.md           # Package & export
│   └── template-structure.md       # Data format reference
└── scripts/
    ├── upload-to-cloud.sh
    └── validate-state.sh           # State validation
```

---

## State Management (CRITICAL)

### State File

**File:** `.template-generator-state.json` (in working directory)

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

### State Operations

**START:**
```bash
if [[ -f .template-generator-state.json ]]; then
  cat .template-generator-state.json | jq '{currentStep, templateName, steps}'
  echo "Continue from where we left off? (yes/progress)"
fi
```

**AFTER EACH STEP:**
```bash
jq '.currentStep = N | .steps["N_NAME"].status = "completed" | .summary.{key} = ${COUNT} | .lastUpdated = "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"' \
  .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json
```

**PROGRESS OVERVIEW:**
```
📋 Template: {templateName}
📍 Current: STEP {currentStep}/8
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Completed steps...
🔄 Current step...
⏳ Pending steps...
```

---

## Workflow

### 1. Start or Resume

**No state:** Load `references/steps/00-init.md`

**Has state:** Show progress → Ask user → Load current step

### 2. Execute Steps

For each step (0-8):
```bash
STEP_FILE="references/steps/$(printf '%02d' ${STEP})-*.md"
cat ${STEP_FILE}
# Follow instructions
# Update state
# Show PAUSE prompt
# Wait for "continue"
```

### 3. Handle Commands

| Command | Action |
|---------|--------|
| `continue` | Load next step |
| `skip` | Mark as `skipped`, move to next |
| `go back` | Reload previous step |
| `progress` | Show overview |

### 4. Final Package (Step 8)

Load `references/steps/08-package.md` → ZIP template → Delete state

---

## Step Reference

| Step | File | Purpose | Optional |
|------|------|---------|----------|
| 0 | `00-init.md` | Requirements gathering | No |
| 1 | `01-base-structure.md` | Folder structure | No |
| 2 | `02-lists.md` | Lists configuration | No |
| 3 | `03-documents.md` | Documents | Yes |
| 4 | `04-files.md` | File attachments | Yes |
| 5 | `05-automations.md` | Automation rules | Yes |
| 6 | `06-chat-agents.md` | AI chat agents | Yes |
| 7 | `07-ai-workspaces.md` | AI workspaces | Yes |
| 8 | `08-package.md` | Package & export | No |

---

## Best Practices

**AI MUST:**
- ✅ Read state file at START of every response
- ✅ Update state IMMEDIATELY after each step
- ✅ Show PAUSE prompts and wait for user
- ✅ Validate results before continuing
- ✅ Handle "skip", "go back", "progress" commands

**AI MUST NOT:**
- ❌ Continue automatically without user confirmation
- ❌ Skip steps without asking user
- ❌ Run multiple steps at once
- ❌ Assume state - always read from file

---

## Quick Reference

```bash
# Check progress
cat .template-generator-state.json | jq '{currentStep, templateName, steps}'

# Load specific step
cat references/steps/02-lists.md

# Skip a step
jq '.steps["3_DOCUMENTS"].status = "skipped"' .template-generator-state.json > .tmp && mv .tmp .template-generator-state.json

# Validate state
bash scripts/validate-state.sh
```

---

**Data format reference:** `references/template-structure.md`
