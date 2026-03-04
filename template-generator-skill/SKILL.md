---
name: template-generator
description: Generate template following data structure format for any industry based on user requirements
version: 3.0.0
---

# Template Generator Skill

## Overview

Generates **complete template packages** that follow the standard data structure for any industry/workflow.

**User-Centric Workflow:** Guide users through understanding requirements → introduce structure → build step-by-step with confirmations.

---

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
│   │   ├── 01-init.md              # Requirements + create foundation
│   │   ├── 02-lists.md             # Lists & boards
│   │   ├── 02b-automation-lists.md # List automations (optional, per-list)
│   │   ├── 03-documents.md         # Documents (optional)
│   │   ├── 04-files.md             # File attachments (optional)
│   │   ├── 05-automations.md       # Global automations (optional)
│   │   ├── 06-chat-agents.md       # AI chat agents (optional)
│   │   ├── 07-ai-workspaces.md     # AI workspaces (optional)
│   │   └── 08-package.md           # Package & export
│   ├── templates/
│   │   ├── common-responses.md     # Completion & skip templates
│   │   └── common-user-prompts.md  # Step introduction prompts
│   └── template-structure.md       # Data format reference
└── scripts/
    ├── template-helpers.sh         # Helper functions for steps
    └── template-manager.py         # Unified Python script
```

---

## User-Centric Workflow

### Phase 1: Understand Requirements

**When user asks to create template:**

1. **Check for existing progress:**
   - If user has started before, show what they've built
   - Ask if they want to continue or start fresh

2. **Ask clarifying questions using AskUserQuestion tool:**

   **⚠️ CRITICAL: MUST use AskUserQuestion tool for all questions**

   Use this format:

   ```
   <AskUserQuestion>
   questions: [
     {
       question: "What industry are you in?",
       header: "Industry",
       options: [
         { label: "Tech/IT", description: "Software development, startups" },
         { label: "Sales", description: "Sales teams, leads, deals" },
         { label: "Marketing", description: "Campaigns, content, ads" },
         { label: "HR/Recruiting", description: "Hiring, candidates, interviews" },
         { label: "Other", description: "Tell me more" }
       ],
       multiSelect: false
     }
   ]
   </AskUserQuestion>
   ```

   **Ask 3-5 questions total to understand:**
   - Industry/domain
   - Main activity (what they're tracking/managing)
   - Scale/volume (low/medium/high - affects workflow complexity)
   - Main pain points (disorganized, slow, inconsistent, etc.)
   - Current process (how they're doing it now)

   **⚠️ DO NOT show all questions as text** - MUST use AskUserQuestion tool
   **⚠️ PAUSE HERE - WAIT FOR USER RESPONSE**

3. **Introduce template structure:**

   ```
   Great! Let me explain what your template will include:

   📦 **Template Structure:**

   📋 **Lists & Boards** (required)
      Track items through customizable workflow stages

   📄 **Documents** (optional)
      Reference guides and templates

   📁 **File Attachments** (optional)
      Resources organized in folders

   ⚙️ **Automations** (optional)
      Smart rules to automate tasks

   🤖 **AI Chat Agent** (optional)
      Assistant for screening and analysis

   🧠 **AI Workspace** (optional)
      Custom AI trained on your knowledge

   We'll go through each section together. You can skip any optional parts.
   ```

   **⚠️ CRITICAL:** Keep this GENERIC - explain what each section does, NOT how it applies to their specific situation.

4. **Ask for confirmation:**

   ```
   Ready to get started? I'll guide you through each step.

   Just say "ready" when you want to begin!
   ```

---

### Phase 2: Initialize & Build Step-by-Step

**When user confirms ready:**

Load Step 1: `references/steps/01-init.md`

**⚠️ CRITICAL: Step 1 loads helper scripts and initializes variables. All subsequent steps inherit these:**

- Variables: SLUG, NAME, DESCRIPTION, TIMESTAMP
- Helper functions: update_state, get_count, add_to_index, ensure_dir, update_step_state

**For each step:**

1. **Load step file** (AI internal operation)
2. **Show what will be created** (user-friendly description) - **EXCEPT Step 1, which executes immediately**
3. **Ask for confirmation** - **EXCEPT Step 1, which needs no confirmation**
4. **Only create files after user confirms**
5. **Show what was created** - Use templates from `references/templates/common-responses.md`
6. **Ask if user wants to continue to next step**
7. **⚠️ PAUSE HERE - WAIT FOR USER RESPONSE** (unless final step)

---

### Phase 3: User Commands

| Command            | Action                                |
| ------------------ | ------------------------------------- |
| `ready` / `start`  | Begin building template               |
| `continue` / `yes` | Confirm & proceed to next step        |
| `skip`             | Skip this optional section            |
| `go back`          | Return to previous step               |
| `progress`         | Show current progress overview        |
| `change`           | Modify current step before continuing |

---

### Phase 4: Package & Export

**After all steps complete:**

Load Step 8: `references/steps/08-package.md`

- Create ZIP package
- Upload to cloud
- Show download link
- Clean up temporary files

---

## Step Reference (For AI Internal Use)

| Step | File                      | Purpose                          | User Sees This As   |
| ---- | ------------------------- | -------------------------------- | ------------------- |
| 1    | `01-init.md`              | Requirements + create foundation | "Getting Started"   |
| 2    | `02-lists.md`             | Configure lists & boards         | "Set Up Your Lists" |
| 2b   | `02b-automation-lists.md` | Per-list automations             | "Add Automations"   |
| 3    | `03-documents.md`         | Add documents                    | "Add Documents"     |
| 4    | `04-files.md`             | Add file attachments             | "Add Files"         |
| 5    | `05-automations.md`       | Global automations               | "Add Automations"   |
| 6    | `06-chat-agents.md`       | AI chat agents                   | "Add AI Assistants" |
| 7    | `07-ai-workspaces.md`     | AI workspaces                    | "Customize AI"      |
| 8    | `08-package.md`           | Package & export                 | "Finish & Download" |

---

## Best Practices

### ✅ AI MUST:

1. **User-First Approach:**
   - Ask questions to understand requirements FIRST
   - Explain structure BEFORE building
   - Show preview BEFORE creating files
   - Get confirmation BEFORE writing files

2. **Step-by-Step:**
   - Only work on ONE step at a time
   - Wait for user confirmation after each step
   - Show progress after each completion

3. **Communication:**
   - Use friendly, conversational language
   - **Keep it SIMPLE and SHORT - avoid long explanations**
   - Show what will happen BEFORE doing it
   - Celebrate progress with emojis 🎉
   - **NEVER mention files, state, bash, or technical terms to user**

**⚠️ CRITICAL: Use Intermediate Responses**

**When executing multiple bash commands after user confirmation:**

```
User: "Yes, create it"

AI: "Great! Let me set that up for you..."     ← IMMEDIATE response
    [Then execute bash commands]
```

**Pattern:**

1. **User confirms** → **IMMEDIATELY respond** (don't run bash yet)
2. **Then execute** bash commands (silent background)
3. **Show result** when done

**Acceptable intermediate responses:**

- "Great! Let me set that up for you..."
- "Perfect! Creating that now..."
- "Alright! Setting things up..."
- "Got it! Working on that..."

**Language Style Guidelines:**

- ✅ **SIMPLE**: Short sentences, easy words, clear meaning
- ✅ **FRIENDLY**: Conversational tone, like talking to a friend
- ✅ **CONCISE**: Get to the point, avoid fluff
- ❌ **NOT FORMAL**: No "I would like to inquire", "Please be advised"
- ❌ **NOT LONG**: No paragraphs of text, break into bullets
- ❌ **NOT TECHNICAL**: No jargon, no implementation details

**Examples:**

```
✅ GOOD: "Great! Let me create that for you."
❌ BAD: "I would now like to proceed with creating the requested configuration for your template."

✅ GOOD: "What's next?"
❌ BAD: "Please let me know what additional components you would like to include in the next phase of the template creation process."

✅ GOOD: "✅ Done! Your list is ready."
❌ BAD: "The list has been successfully created with all the specified configurations and is now ready for use."
```

4. **State Management (AI Internal):**
   - Track progress after each step
   - Use helper functions to update status
   - Remember what's been created

5. **Follow Exact Formats:**
   - Use templates from `references/templates/common-responses.md`
   - Use user prompts from `references/templates/common-user-prompts.md`
   - Preserve formatting EXACTLY as shown

**⚠️ CRITICAL: Text Formatting Rules**

**When step files show formatted text, AI MUST preserve formatting:**

```
Template shows:                AI MUST output:
**Bold text**              →   **Bold text** (with bold)
*Italic text*              →   *Italic text* (with italic)
Normal text               →   Normal text (no formatting)
```

**Examples:**

❌ WRONG:

```
Template: "✅ **Lists are ready!**"
AI outputs: "✅ Lists are ready!" (missing bold)
```

✅ CORRECT:

```
Template: "✅ **Lists are ready!**"
AI outputs: "✅ **Lists are ready!**" (with bold preserved)
```

**⚠️ This applies to ALL text in code blocks - preserve formatting EXACTLY as shown!**

---

### ❌ AI MUST NOT:

1. **DON'T assume requirements:**
   - Ask if unclear about user needs
   - Don't skip clarification questions

2. **DON'T rush ahead:**
   - Don't create files without confirmation
   - Don't do multiple steps at once
   - Don't skip explanation

3. **DON'T be technical:**
   - **NEVER show bash commands to user**
   - **NEVER mention file paths to user**
   - **NEVER talk about state files to user**
   - **NEVER explain internal implementation**
   - Focus on WHAT they're getting, not HOW it works

4. **DON'T auto-continue:**
   - Always wait for user to say "continue"
   - Never assume user wants to proceed

---

## Template References

**All step completion and skip templates are in:**

- 📋 `references/templates/common-responses.md` - Completion & skip templates

**All step introduction prompts are in:**

- 📋 `references/templates/common-user-prompts.md` - User prompt templates

**⚠️ CRITICAL: When a step references a template, read the template file and output it EXACTLY as shown.**
