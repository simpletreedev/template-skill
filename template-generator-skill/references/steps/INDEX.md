# Guide Index - Quick Reference

**Available Guides:**

| Step | Guide File            | Purpose                         | Pattern              |
| ---- | --------------------- | ------------------------------- | -------------------- |
| 0    | `quick-init.sh`       | Create foundation               | EXECUTE IMMEDIATELY  |
| 1    | `01-init.md`          | Confirm foundation ready        | EXECUTE IMMEDIATELY  |
| 2    | `02-lists.md`         | Configure lists & boards        | SHOW → ASK → EXECUTE |
| 2b   | `02b-automations.md`  | Per-list automations (optional) | SHOW → ASK → EXECUTE |
| 3    | `03-documents.md`     | Add documents (optional)        | SHOW → ASK → EXECUTE |
| 4    | `04-files.md`         | Add file folders (optional)     | SHOW → ASK → EXECUTE |
| 5    | `05-automations.md`   | Global automations (optional)   | SHOW → ASK → EXECUTE |
| 6    | `06-chat-agents.md`   | AI chat agents (optional)       | SHOW → ASK → EXECUTE |
| 7    | `07-ai-workspaces.md` | AI workspaces (optional)        | SHOW → ASK → EXECUTE |
| 8    | `08-package.md`       | Package & export                | SHOW → ASK → EXECUTE |

**Note:** Step 0 (quick-init.sh) and Step 1 execute immediately. Steps 2-8 follow SHOW → ASK → EXECUTE pattern.

**Response Templates:**

```markdown
# Step Completion

✅ {section} are ready!

📊 We've added:

• {count} {item_type}

• {summary}

📍 What's next: {next_section} (optional)

{description}

👉 Continue to add {next_section_lower}

⏭️ Skip {next_section_lower}
```

```markdown
# Step Skip (when user skips)

⏭️ {section} skipped

📍 What's next: {next_section} (optional)

{description}

👉 Continue to add {next_section_lower}

⏭️ Skip {next_section_lower} too
```

**Auto-fill Variables:**

- `{section}` - Current section name
- `{item_type}` - Type of item (lists, documents, etc.)
- `{count}` - Number of items created
- `{summary}` - Brief summary of what was created
- `{next_section}` - Next section name
- `{next_section_lower}` - Next section in lowercase
- `{description}` - Brief description of next section
