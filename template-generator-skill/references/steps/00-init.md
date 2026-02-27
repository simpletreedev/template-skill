# Step: STEP 0 - INIT

## Purpose

Gather user requirements and explain the template structure in a friendly, non-technical way.

---

## What To Do

### 1. Understand Requirements

**Ask 4-6 questions about requirements details (if needed):**

- "What would you like to track?" (e.g., bugs, candidates, tasks)
- "What are the main steps in your workflow?" (e.g., New → In Progress → Done)
- "What information do you need for each item?" (e.g., title, priority, assignee)

**Important:** Use simple language, be conversational, focus on understanding - NOT technical details, DON'T ask about data structure and format output.

**⚠️ DO NOT load any scripts in this step** - That happens in step 1.

---

### 2. Explain Template Structure (Simple Terms)

After gathering requirements, explain in friendly, non-technical way:

```
Perfect! Let me explain what your template will include. Think of it like a toolkit:

📋 **Lists & Boards** - Like Trello boards or task lists
   → Track items through steps (To Do → Doing → Done)
   → Add details like priority, who's assigned, due date
   → Add automations per list (e.g., auto-notify when item moves to specific stage)
   → Perfect for: tasks, bugs, features, candidates...

📄 **Documents** - Wiki pages or guides (Optional)
   → Capture knowledge, processes, instructions
   → Great for: project docs, meeting notes, playbooks

📁 **Files** - Attachments organized in folders (Optional)
   → Store reports, templates, images, any resources
   → Keep everything organized and accessible

⚙️ **Automations** - Smart rules that save time (Optional)
   → Automatically do things when something happens
   → Examples: notify team when task is created, auto-assign based on priority

🤖 **AI Chat Agents** - Smart assistants for your team (Optional)
   → AI helpers that understand your context
   → Can answer questions, summarize, help with tasks

🧠 **AI Workspaces** - AI trained on your knowledge (Optional)
   → Teach AI about your processes and expertise
   → Get smarter help that understands your context

We'll go through each part step by step. You can skip any optional parts if you don't need them!
```

---

### 3. Create State File

```bash
python3 scripts/template-manager.py init "{slug}" "{Template Name}" "{Description}"
```

---

### 4. Show PAUSE Prompt

```
✅ Awesome! I've got a good picture of what you need.

📋 Your template: {name}
🎯 Purpose: {purpose}
📝 What we'll build: {sections they want}

We'll go step by step, and you can guide me along the way.

Ready to start building? Just say "continue" when you're ready!
Or if you want to change anything we discussed, just let me know.
```

**⚠️ PAUSE HERE - WAIT FOR USER TO SAY "CONTINUE"**

---

## Data Format References

See `../references/template-structure.md` for complete data structure format.

---

## Return Control

After user says "continue", return to main orchestrator.
Main orchestrator will load next step: `steps/01-base-structure.md`
