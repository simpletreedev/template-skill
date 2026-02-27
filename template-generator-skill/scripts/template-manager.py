#!/usr/bin/env python3
"""
Template Manager - Unified script for all template operations
Usage: python3 scripts/template-manager.py <command> [args]
"""

import json
import sys
from pathlib import Path
import urllib.request
import urllib.parse
import urllib.error

STATE_FILE = ".template-generator-state.json"
DEFAULT_UPLOAD_URL = "https://nfknprk0-8000.asse.devtunnels.ms/api/v1/triggers/upload"

# =============================================================================
# STATE MANAGEMENT
# =============================================================================

def _load_state():
    """Load state from file"""
    try:
        with open(STATE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def _save_state(state):
    """Save state to file"""
    with open(STATE_FILE, 'w') as f:
        json.dump(state, f, indent=2)

def _get_nested(obj, keys):
    """Get nested dict value"""
    for key in keys.split('.'):
        obj = obj.get(key, {})
    return obj if obj != {} else ""

# =============================================================================
# COMMANDS
# =============================================================================

def cmd_init(args):
    """Initialize state file"""
    state = {
        "version": "1.0",
        "step": 0,
        "slug": args[0],
        "name": args[1],
        "description": args[2],
        "summary": {
            "lists": 0,
            "documents": 0,
            "files": 0,
            "automations": 0,
            "chatAgents": 0,
            "claudeWorkspaces": 0
        }
    }
    _save_state(state)
    print(json.dumps(state))

def cmd_get(args):
    """Get state value"""
    state = _load_state()
    if args:
        print(_get_nested(state, args[0]))
    else:
        print(json.dumps(state))

def cmd_update(args):
    """Update step and summary"""
    state = _load_state()
    state["step"] = int(args[0])
    state["summary"][args[1]] = int(args[2])
    _save_state(state)

def cmd_skip(args):
    """Skip to step"""
    state = _load_state()
    state["step"] = int(args[0])
    _save_state(state)

def cmd_progress(args):
    """Get progress info"""
    state = _load_state()
    print(json.dumps({
        "step": state.get("step", 0),
        "name": state.get("name", ""),
        "summary": state.get("summary", {})
    }))

def cmd_add_to_index(args):
    """Add item to index JSON"""
    slug, index_file, key, name, desc = args[0], args[1], args[2], args[3], args[4]
    file_path = args[5] if len(args) > 5 else None

    template_dir = f"template-{slug}"
    full_path = f"{template_dir}/{index_file}"

    try:
        with open(full_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = []

    item = {"key": key, "name": name, "description": desc, "order": len(data)}
    if file_path:
        item["file"] = file_path

    data.append(item)

    with open(full_path, 'w') as f:
        json.dump(data, f, indent=2)

def cmd_get_count(args):
    """Get count from index file"""
    slug, index_file = args[0], args[1]
    full_path = f"template-{slug}/{index_file}"

    try:
        with open(full_path, 'r') as f:
            print(len(json.load(f)))
    except FileNotFoundError:
        print("0")

def cmd_ensure_dir(args):
    """Create directory"""
    Path(args[0]).mkdir(parents=True, exist_ok=True)

def cmd_export_vars(args):
    """Export variables for shell"""
    state = _load_state()
    print(f"export SLUG='{state.get('slug', '')}'")
    print(f"export NAME='{state.get('name', '')}'")
    print(f"export DESCRIPTION='{state.get('description', '')}'")

def cmd_upload(args):
    """Upload ZIP to cloud server"""
    if not args:
        print("Error: ZIP file path required", file=sys.stderr)
        sys.exit(1)

    zip_file = args[0]

    if not Path(zip_file).exists():
        print(f"Error: File not found: {zip_file}", file=sys.stderr)
        sys.exit(1)

    upload_url = args[1] if len(args) > 1 else DEFAULT_UPLOAD_URL

    try:
        with open(zip_file, 'rb') as f:
            files = {'file': f}
            req = urllib.request.Request(upload_url, method='POST', data=urllib.parse.urlencode({}).encode())
            req.add_header('Content-Type', 'multipart/form-data')

            # Multipart upload
            import io
            boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

            body = io.BytesIO()
            for name, (file_obj, _) in files.items():
                body.write(f'--{boundary}\r\n'.encode())
                body.write(f'Content-Disposition: form-data; name="{name}"; filename="{Path(zip_file).name}"\r\n'.encode())
                body.write('Content-Type: application/octet-stream\r\n\r\n'.encode())
                body.write(file_obj.read())
                body.write('\r\n'.encode())

            body.write(f'--{boundary}--\r\n'.encode())

            req = urllib.request.Request(upload_url, data=body.getvalue(), method='POST')
            req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())

        if result.get('url'):
            print(result['url'])
        else:
            print(f"Error: Upload failed - {result}", file=sys.stderr)
            sys.exit(1)

    except Exception as e:
        print(f"Error: Upload failed - {e}", file=sys.stderr)
        sys.exit(1)

# =============================================================================
# MAIN
# =============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)

    commands = {
        "init": cmd_init,
        "get": cmd_get,
        "update": cmd_update,
        "skip": cmd_skip,
        "progress": cmd_progress,
        "add_to_index": cmd_add_to_index,
        "get_count": cmd_get_count,
        "ensure_dir": cmd_ensure_dir,
        "export_vars": cmd_export_vars,
        "upload": cmd_upload,
    }

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd in commands:
        commands[cmd](args)
    else:
        sys.exit(1)
