#!/usr/bin/env python3
"""
Template Manager - Unified script for all template operations
Optimized for production use with caching and batch operations
Usage: python3 scripts/template-manager.py <command> [args]
"""

import json
import sys
import os
from pathlib import Path
import urllib.request
import urllib.parse
import urllib.error
from functools import lru_cache

# =============================================================================
# CONFIGURATION
# =============================================================================

STATE_FILE = ".template-generator-state.json"
STATE_CACHE = {}  # In-memory cache for state
STATE_CACHE_TTL = 5  # Cache TTL in seconds

DEFAULT_UPLOAD_URL = "https://nfknprk0-8000.asse.devtunnels.ms/api/v1/triggers/upload"

# =============================================================================
# STATE MANAGEMENT (Optimized with caching)
# =============================================================================

def _load_state(use_cache=True):
    """Load state from file with caching"""
    if use_cache and STATE_CACHE:
        return STATE_CACHE

    try:
        with open(STATE_FILE, 'r') as f:
            state = json.load(f)
            STATE_CACHE.update(state)
            return state
    except FileNotFoundError:
        return {}

def _save_state(state):
    """Save state to file and update cache"""
    STATE_CACHE.clear()
    STATE_CACHE.update(state)
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
    """Get state value (optimized)"""
    state = _load_state()
    if args:
        print(_get_nested(state, args[0]))
    else:
        print(json.dumps(state))

def cmd_update(args):
    """Update step and summary (optimized - single write)"""
    state = _load_state()
    state["step"] = int(args[0])
    state["summary"][args[1]] = int(args[2])
    _save_state(state)
    # No output needed for faster execution

def cmd_skip(args):
    """Skip to step (optimized)"""
    state = _load_state()
    state["step"] = int(args[0])
    _save_state(state)
    # No output needed

def cmd_progress(args):
    """Get progress info"""
    state = _load_state()
    print(json.dumps({
        "step": state.get("step", 0),
        "name": state.get("name", ""),
        "summary": state.get("summary", {})
    }))

def cmd_add_to_index(args):
    """Add item to index JSON (optimized with minimal I/O)"""
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
    """Get count from index file (optimized)"""
    slug, index_file = args[0], args[1]
    full_path = f"template-{slug}/{index_file}"

    try:
        with open(full_path, 'r') as f:
            print(len(json.load(f)))
    except FileNotFoundError:
        print("0")

def cmd_batch_get_counts(args):
    """Batch get multiple counts in one call (NEW - optimized for multiple calls)"""
    """
    Usage: batch_get_counts <slug> <index_file1> <key1> <index_file2> <key2> ...
    Output: JSON with counts
    """
    if len(args) < 3:
        print("{}")
        return

    slug = args[0]
    result = {}

    # Process pairs of (index_file, key)
    for i in range(1, len(args), 2):
        if i + 1 >= len(args):
            break
        index_file = args[i]
        key = args[i + 1]
        full_path = f"template-{slug}/{index_file}"

        try:
            with open(full_path, 'r') as f:
                result[key] = len(json.load(f))
        except FileNotFoundError:
            result[key] = 0

    print(json.dumps(result))

def cmd_ensure_dir(args):
    """Create directory"""
    Path(args[0]).mkdir(parents=True, exist_ok=True)

def cmd_export_vars(args):
    """Export variables for shell (optimized)"""
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

@lru_cache(maxsize=32)
def _cached_api_request(api_url):
    """Cached API request for ClaudeWS servers"""
    try:
        endpoint = f"{api_url.rstrip('/')}/api/v1/claudews-servers"
        req = urllib.request.Request(endpoint, method='GET')
        req.add_header('Content-Type', 'application/json')

        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())

        # Return the servers list
        servers = data if isinstance(data, list) else data.get('servers', [])
        return json.dumps(servers)

    except urllib.error.HTTPError as e:
        return "[]"
    except urllib.error.URLError as e:
        return "[]"
    except Exception as e:
        return "[]"

def cmd_check_claudews(args):
    """Check ClaudeWS servers from PrivOs API (with caching)"""
    api_url = args[0] if args else None

    if not api_url:
        print("Error: PRIVOS_API_URL required", file=sys.stderr)
        sys.exit(1)

    result = _cached_api_request(api_url)
    print(result)

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
        "batch_get_counts": cmd_batch_get_counts,  # NEW
        "ensure_dir": cmd_ensure_dir,
        "export_vars": cmd_export_vars,
        "upload": cmd_upload,
        "check_claudews": cmd_check_claudews,
    }

    cmd = sys.argv[1]
    args = sys.argv[2:]

    if cmd in commands:
        try:
            commands[cmd](args)
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        sys.exit(1)
