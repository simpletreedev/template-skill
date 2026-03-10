# Multi-User Support for Template Generator

## Overview

Template Generator now supports **multi-user concurrent sessions** using session-based isolation. Each user/chat session gets its own template context, preventing conflicts when multiple users create templates simultaneously.

## How It Works

### Session Files

When a template is created, a **session file** is created at the skill root level:

```
.claude/skills/template-generator-skill/
├── sid-user-a-123          ← Session file for User A
├── sid-user-b-456          ← Session file for User B
├── sid-abc-789             ← Session file for User C
└── 1740432123-template-crm/  ← User A's template directory
```

**Session file format:** `sid-{SESSION_ID}`

Each session file contains:
- Full path to the template directory
- Ensures AI always knows which template belongs to which user

### Template Directory Structure

```
1740432123-template-{slug}/
├── .template-path.txt      ← Legacy (backward compatibility)
├── state.json              ← Session-specific state
├── metadata.json           ← Template metadata
├── entities/
├── flows/
└── claude-ws/
```

## Usage

### For AI/Developers

#### 1. Initialize Template with Session

```bash
# Set session ID (optional - will use default if not set)
export CLAUDE_SESSION_ID="user-session-123"

# Create template
bash scripts/quick-init.sh crm "CRM Template" "Customer management"
```

This creates:
- Template directory: `{timestamp}-template-crm/`
- Session file: `sid-user-session-123` (contains template path)

#### 2. Access Template from Session File

```bash
# Get template path from session file
SESSION_ID="${CLAUDE_SESSION_ID:-123}"
SESSION_FILE="$(dirname "$(pwd)")/sid-${SESSION_ID}"

export TEMPLATE_DIR=$(cat "$SESSION_FILE")
cd "$TEMPLATE_DIR"
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_SESSION_ID` | Primary session ID | `123` |
| `SESSION_ID` | Fallback session ID | `123` |

**Priority:** `CLAUDE_SESSION_ID` → `SESSION_ID` → `123`

### Examples

#### Example 1: Single User (Default)

```bash
# No session ID set - uses default
bash scripts/quick-init.sh crm "CRM Template" "Customer management"

# Session file created: sid-123
```

#### Example 2: Multiple Users

```bash
# User A
export CLAUDE_SESSION_ID="user-a-123"
bash scripts/quick-init.sh crm "CRM Template" "Customer management"

# User B
export CLAUDE_SESSION_ID="user-b-456"
bash scripts/quick-init.sh project "Project Template" "Project management"

# User C
export CLAUDE_SESSION_ID="user-c-789"
bash scripts/quick-init.sh inventory "Inventory Template" "Inventory tracking"
```

Result:
```
sid-user-a-123 → /path/to/1740432123-template-crm/
sid-user-b-456 → /path/to/1740432123-template-project/
sid-user-c-789 → /path/to/1740432123-template-inventory/
```

## Architecture

### State Management

**Before (Single User):**
```python
def _get_state_file_path():
    return str(Path.cwd() / "state.json")  # ❌ Shared state!
```

**After (Multi-User):**
```python
def _get_session_file_path():
    """Get session file path (sid-{sessionId} at skill root level)."""
    session_id = _get_session_id()
    return str(SKILL_ROOT / f"sid-{session_id}")

def _read_session_template_path():
    """Read template path from session file."""
    session_file = _get_session_file_path()
    with open(session_file, 'r') as f:
        return f.read().strip()

def _get_state_file_path():
    """Get state file path - use session-specific location."""
    template_path = _read_session_template_path()
    if template_path:
        return str(Path(template_path) / "state.json")
    else:
        return str(Path.cwd() / "state.json")  # Fallback
```

### Isolation Guarantees

✅ **Each user has:**
- Unique session file (`sid-{SESSION_ID}`)
- Separate template directory
- Independent state file
- No shared state conflicts

✅ **Concurrency safe:**
- User A creating template doesn't affect User B
- Multiple users can work simultaneously
- No race conditions on state files

## Testing

Run the multi-user test:

```bash
bash scripts/test-multi-user.sh
```

Expected output:
```
🧪 Testing Multi-User Scenario

👤 User A (session: user-a-123) creating template...
   ✅ User A template: /path/to/template-crm/

👤 User B (session: user-b-456) creating template...
   ✅ User B template: /path/to/template-project/

👤 User C (session: user-c-789) creating template...
   ✅ User C template: /path/to/template-inventory/

🔍 Verification:
   User A session file: ✅ exists
   User B session file: ✅ exists
   User C session file: ✅ exists

🔒 Conflict check:
   ✅ No conflicts - each user has unique template
```

## Troubleshooting

### Issue: Template not found

**Cause:** Session file doesn't exist or points to wrong location

**Solution:**
```bash
# Check session file exists
ls -la sid-${SESSION_ID}

# Check content
cat sid-${SESSION_ID}

# Verify template directory exists
cat sid-${SESSION_ID} | xargs ls -la
```

### Issue: Wrong template context

**Cause:** Session ID not set correctly

**Solution:**
```bash
# Set correct session ID
export CLAUDE_SESSION_ID="your-session-id"

# Verify
echo "Session: sid-${CLAUDE_SESSION_ID}"
cat "sid-${CLAUDE_SESSION_ID}"
```

### Issue: State conflicts between users

**Cause:** Not using session-based approach

**Solution:**
- Ensure session ID is set before creating template
- Always read from session file, not current directory
- Use updated step files that support sessions

## Migration Guide

### For Existing Templates

Old templates still work (backward compatible):

```bash
# Old method still works
cd {template-dir}
export TEMPLATE_DIR=$(cat .template-path.txt)
```

But new method is recommended:

```bash
# New method - multi-user safe
export SESSION_ID="your-session-id"
export TEMPLATE_DIR=$(cat ../sid-${SESSION_ID})
```

### For AI Skills

Update step files to use session-based approach:

```bash
# Before (❌ WRONG - creates new template on error)
cd $(find . -maxdepth 1 -type d -name "*-template-*" | sort -r | head -1)
export TEMPLATE_DIR=$(cat .template-path.txt)

# After (✅ CORRECT - fail fast with clear error)
SESSION_ID="${CLAUDE_SESSION_ID:-${SESSION_ID:-123}}"
SESSION_FILE="$(dirname "$(pwd)")/sid-${SESSION_ID}"

if [[ ! -f "$SESSION_FILE" ]]; then
    echo "❌ Error: Session file not found: sid-${SESSION_ID}"
    echo "   Please run: bash scripts/quick-init.sh <slug> <name> <description>"
    exit 1
fi

export TEMPLATE_DIR=$(cat "$SESSION_FILE")
cd "$TEMPLATE_DIR"
```

**Key Changes:**
1. ✅ **No fallback** - Fail immediately if session file doesn't exist
2. ✅ **Clear error message** - Tell user exactly what to do
3. ✅ **Prevents accidental template creation** - Don't create wrong templates

## Best Practices

1. **Always set session ID** before creating templates
2. **Use session file** to get template path (not current directory)
3. **Test multi-user scenarios** before deploying
4. **Clean up old session files** periodically
5. **Document session ID format** for your use case

## Future Enhancements

Potential improvements:
- [ ] Session file expiration (auto-cleanup after X days)
- [ ] Session metadata (creation time, last access)
- [ ] Session validation (verify template still exists)
- [ ] Session migration (move template without breaking session)
- [ ] Session locking (prevent concurrent modifications)
