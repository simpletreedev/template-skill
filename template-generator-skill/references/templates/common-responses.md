# Common Response Templates

This file contains reusable templates for common responses across all steps.

**Auto-fill mapping:**

| Step        | section       | item_type            | next_section  | description                          |
| ----------- | ------------- | -------------------- | ------------- | ------------------------------------ |
| Documents   | Documents     | document templates   | Files         | Organize files in folders            |
| Files       | Files         | file folders         | Automations   | Smart rules to automate tasks        |
| Automations | Automations   | automation rules     | Chat Agents   | AI assistants for tasks              |
| Chat Agents | Chat Agents   | AI agents            | AI Workspaces | Customize AI with knowledge          |
| AI Workspaces | AI Workspaces | AI workspaces      | Package & Export | Package everything into ZIP file |

---

## Step Completion Template

**Use this for ALL optional steps:**

```
✅ {section} are ready!

📊 We've added:

   • {count} {item_type}
   • {summary}

📍 What's next: {next_section} (optional)
   {description}

👉 Continue to add {next_section_lower}
⏭️ Skip {next_section_lower}
```

---

## Step Skip Template

**Use when user skips an optional step:**

```
⏭️ {section} skipped

📍 What's next: {next_section} (optional)
   {description}

👉 Continue to add {next_section_lower}
⏭️ Skip {next_section_lower} too
```
