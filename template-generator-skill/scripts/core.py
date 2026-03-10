#!/usr/bin/env python3
"""Template Manager - Simplified core script with multi-user support

Usage: python3 scripts/core.py <command> [args]
"""

import json
import sys
import os
from pathlib import Path
import urllib.request
import time

# =============================================================================
# CONFIGURATION
# =============================================================================

DEFAULT_UPLOAD_URL = os.getenv("CLOUD_UPLOAD_URL", "https://nfknprk0-8000.asse.devtunnels.ms/api/v1/triggers/upload")

# Get skill root from script location
SCRIPT_DIR = Path(__file__).parent.parent
SKILL_ROOT = SCRIPT_DIR

# =============================================================================
# SESSION MANAGEMENT
# =============================================================================

def _get_session_id():
    """Get session ID from environment or use default."""
    return os.getenv("CLAUDE_SESSION_ID", os.getenv("SESSION_ID", "123"))

def _get_session_file_path():
    """Get session file path (sid-{sessionId} at skill root level)."""
    session_id = _get_session_id()
    return str(SKILL_ROOT / f"sid-{session_id}")

def _read_session_template_path():
    """Read template path from session file."""
    session_file = _get_session_file_path()
    try:
        with open(session_file, 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        return None

def _write_session_template_path(template_path):
    """Write template path to session file."""
    session_file = _get_session_file_path()
    with open(session_file, 'w') as f:
        f.write(template_path)

# =============================================================================
# STATE MANAGEMENT
# =============================================================================

def _get_state_file_path():
    """Get state file path - use session-specific location."""
    template_path = _read_session_template_path()
    if template_path:
        # State file inside template directory
        return str(Path(template_path) / "state.json")
    else:
        # Fallback to current directory (for backward compatibility)
        return str(Path.cwd() / "state.json")

def _get_template_dir(slug):
    """Get template directory path (TIMESTAMP-template-slug format)."""
    timestamp = str(int(time.time()))
    template_dir_name = f"{timestamp}-template-{slug}"
    template_dir = SKILL_ROOT / template_dir_name
    return str(template_dir)

def _load_state():
    """Load state from file."""
    state_file = _get_state_file_path()
    try:
        with open(state_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def _save_state(state):
    """Save state to file."""
    state_file = Path(_get_state_file_path())
    state_file.parent.mkdir(parents=True, exist_ok=True)
    with open(state_file, 'w') as f:
        json.dump(state, f, indent=2)

# =============================================================================
# COMMANDS
# =============================================================================

def cmd_init(args):
    """Initialize template directory with session tracking."""
    slug, name, description = args[0], args[1], args[2]
    template_dir = _get_template_dir(slug)
    template_path = Path(template_dir)

    # Create directory structure
    template_path.mkdir(parents=True, exist_ok=True)
    for subdir in ["entities/lists/data", "entities/documents/data", "entities/files/data",
                    "flows/automations/data", "flows/chat-agents/data", "claude-ws/data"]:
        (template_path / subdir).mkdir(parents=True, exist_ok=True)

    # Create .template-path.txt (legacy, for backward compatibility)
    with open(template_path / ".template-path.txt", "w") as f:
        f.write(template_dir)

    # ⭐ NEW: Create/Update session file at skill root
    _write_session_template_path(template_dir)
    session_id = _get_session_id()
    session_file = _get_session_file_path()

    # Initialize state
    state = {
        "version": "2.0",
        "step": 0,
        "slug": slug,
        "name": name,
        "description": description,
        "template_dir": template_dir,
        "session_id": session_id,
        "summary": {
            "lists": 0, "documents": 0, "files": 0,
            "automations": 0, "chatAgents": 0, "claudeWorkspaces": 0
        }
    }
    _save_state(state)

    # Output
    print(f"TEMPLATE_DIR={template_dir}")
    print(f"SLUG={slug}")
    print(f"NAME={name}")
    print(f"DESCRIPTION={description}")
    print(f"SESSION_ID={session_id}")
    print(f"SESSION_FILE={session_file}")

def cmd_init_metadata(args):
    """Initialize metadata files."""
    state = _load_state()
    template_dir = state.get("template_dir", args[0] if args else "")
    template_path = Path(template_dir)

    # Create metadata.json
    metadata = {
        "name": state.get("name", "Template"),
        "version": "1.0.0",
        "description": state.get("description", ""),
        "icon": "📦",
        "author": "AI Template Generator",
        "exports": {
            "lists": 0, "documents": 0, "files": 0,
            "automations": 0, "chatAgents": 0, "claudeWorkspaces": 0
        }
    }

    with open(template_path / "metadata.json", 'w') as f:
        json.dump(metadata, f, indent=2)

    # Create index files
    index_files = {
        "entities/lists/_lists.json": {"version": "1.0", "lists": []},
        "entities/documents/_documents.json": {"version": "1.0", "documents": []},
        "entities/files/_manifest.json": {"version": "1.0", "files": {}},
        "flows/automations/_automations.json": {"version": "1.0", "automations": []},
        "flows/chat-agents/_agents.json": {"version": "1.0", "agents": []},
        "claude-ws/_workspaces.json": {"version": "1.0", "workspaces": []},
    }

    for file_path, content in index_files.items():
        full_path = template_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, 'w') as f:
            json.dump(content, f, indent=2)

    # Update state
    state["step"] = 1
    _save_state(state)

def cmd_get(args):
    """Get state values."""
    state = _load_state()
    template_dir = state.get("template_dir", "")

    if template_dir:
        print(f"TEMPLATE_DIR={template_dir}")
        print(f"SLUG={state.get('slug', '')}")
        print(f"NAME={state.get('name', '')}")
        print(f"DESCRIPTION={state.get('description', '')}")
        print(f"SESSION_ID={state.get('session_id', _get_session_id())}")

def cmd_update(args):
    """Update step and summary."""
    state = _load_state()
    state["step"] = int(args[0])
    state["summary"][args[1]] = int(args[2])
    _save_state(state)

def cmd_skip(args):
    """Skip to step."""
    state = _load_state()
    state["step"] = int(args[0])
    _save_state(state)

def cmd_progress(args):
    """Get progress."""
    state = _load_state()
    print(json.dumps({
        "step": state.get("step", 0),
        "name": state.get("name", ""),
        "summary": state.get("summary", {})
    }))

def cmd_update_metadata(args):
    """Update metadata with final counts."""
    template_dir = os.environ.get("TEMPLATE_DIR", args[0] if args else "")
    metadata_file = f"{template_dir}/metadata.json"

    with open(metadata_file, 'r') as f:
        metadata = json.load(f)

    state = _load_state()
    summary = state.get("summary", {})

    metadata["exports"] = {
        "lists": summary.get("lists", 0),
        "documents": summary.get("documents", 0),
        "files": summary.get("files", 0),
        "automations": summary.get("automations", 0),
        "chatAgents": summary.get("chatAgents", 0),
        "claudeWorkspaces": summary.get("claudeWorkspaces", 0)
    }

    with open(metadata_file, 'w') as f:
        json.dump(metadata, f, indent=2)

def cmd_upload(args):
    """Upload ZIP to cloud."""
    zip_file = args[0]
    upload_url = args[1] if len(args) > 1 else DEFAULT_UPLOAD_URL

    with open(zip_file, 'rb') as f:
        import io
        boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

        body = io.BytesIO()
        body.write(f'--{boundary}\r\n'.encode())
        body.write(f'Content-Disposition: form-data; name="file"; filename="{Path(zip_file).name}"\r\n'.encode())
        body.write('Content-Type: application/octet-stream\r\n\r\n'.encode())
        body.write(f.read())
        body.write('\r\n'.encode())
        body.write(f'--{boundary}--\r\n'.encode())

        req = urllib.request.Request(upload_url, data=body.getvalue(), method='POST')
        req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode())

    if result.get('url'):
        print(result['url'])

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)

    commands = {
        "init": cmd_init,
        "init_metadata": cmd_init_metadata,
        "get": cmd_get,
        "update": cmd_update,
        "skip": cmd_skip,
        "progress": cmd_progress,
        "update_metadata": cmd_update_metadata,
        "upload": cmd_upload,
    }

    cmd, args = sys.argv[1], sys.argv[2:]

    if cmd in commands:
        try:
            commands[cmd](args)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        sys.exit(1)
