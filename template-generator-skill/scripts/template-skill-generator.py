#!/usr/bin/env python3
"""
Template Skill Packager

Takes a template JSON and creates a ZIP package
Usage: Call this from AI with template JSON data
"""

import json
import os
import zipfile
from pathlib import Path
from typing import Dict, Any, Optional
import urllib.request
import urllib.error
import time


def generate_import_md(template: Dict[str, Any]) -> str:
    """Generate IMPORT.md content from template"""

    lists_info = "\n".join([
        f"""
- **{lst['name']}**
  - Fields: {len(lst.get('fieldDefinitions', []))}
  - Stages: {len(lst.get('stages', []))}
"""
        for lst in template.get('lists', [])
    ])

    documents = template.get('documents', [])
    docs_info = "\n".join([f"- {doc['title']}" for doc in documents]) if documents else "No documents included"

    return f"""# Import Template: {template['name']}

## Overview
{template['description']}

## Template Structure

**Template Key:** `{template['templateKey']}`
**Category:** {template.get('metadata', {}).get('category', 'General')}
**Version:** {template.get('metadata', {}).get('version', '1.0.0')}

### Lists
{lists_info}

### Documents
{docs_info}

## How to Import

1. Upload this ZIP file to your Priovs system
2. The system will automatically:
   - Extract the template.json
   - Create the template structure
   - Set up all fields and stages
   - Add documentation

## Technical Details

- **Format:** JSON
- **Structure:** Lists → Stages → Items
- **Items:** Nested inside stages (no stageKey)
- **All keys:** snake_case format

Ready to import!
"""


def upload_zip_to_service(zip_path: str) -> Optional[str]:
    """Upload ZIP file to service and return download URL"""

    upload_url = os.environ.get('UPLOAD_SERVICE_URL')
    if not upload_url:
        print("⚠️  No UPLOAD_SERVICE_URL found, skipping upload")
        return None

    try:
        # Read file content
        with open(zip_path, 'rb') as f:
            file_content = f.read()

        # Create multipart form data
        filename = os.path.basename(zip_path)
        boundary = f'----WebKitFormBoundary{int(time.time() * 1000)}'

        # Build multipart body
        header = f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: application/zip\r\n\r\n'
        footer = f'\r\n--{boundary}--\r\n'

        body = header.encode() + file_content + footer.encode()

        # Create request
        req = urllib.request.Request(
            upload_url,
            data=body,
            headers={
                'Content-Type': f'multipart/form-data; boundary={boundary}',
                'Content-Length': str(len(body))
            },
            method='POST'
        )

        # Send request
        with urllib.request.urlopen(req, timeout=30) as response:
            if 200 <= response.status < 300:
                try:
                    result = json.loads(response.read().decode('utf-8'))
                    return result.get('url') or result.get('downloadUrl')
                except:
                    return None

        return None

    except Exception as e:
        print(f"⚠️  Upload failed: {e}")
        return None


def create_skill_package(template: Dict[str, Any], output_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Create a skill package from template

    Args:
        template: Template dictionary
        output_path: Optional custom output path for ZIP file

    Returns:
        Result dictionary with file paths and metadata
    """

    template_key = template['templateKey']
    zip_path = output_path or f"{template_key}.zip"
    json_path = f"{template_key}.template.json"

    # Write JSON file
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(template, f, indent=2, ensure_ascii=False)

    # Generate IMPORT.md
    import_md = generate_import_md(template)

    # Create ZIP
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        # Add template.json
        zf.write(json_path, 'template.json')

        # Add IMPORT.md
        zf.writestr('IMPORT.md', import_md)

        # Add files from docs/ folder if it exists
        docs_dir = Path('docs')
        if docs_dir.exists() and docs_dir.is_dir():
            for file_path in docs_dir.rglob('*'):
                if file_path.is_file():
                    # Get relative path from docs/
                    rel_path = file_path.relative_to('.')
                    zf.write(file_path, str(rel_path))

    # Get file sizes
    json_size_kb = os.path.getsize(json_path) / 1024
    zip_size_kb = os.path.getsize(zip_path) / 1024

    # Get absolute paths
    abs_json_path = os.path.abspath(json_path)
    abs_zip_path = os.path.abspath(zip_path)

    # Count docs files
    docs_count = 0
    docs_list = []
    if docs_dir.exists():
        docs_files = [f for f in docs_dir.rglob('*') if f.is_file()]
        docs_count = len(docs_files)
        docs_list = [f.name for f in docs_files]

    # Upload to service if configured
    print("📤 Uploading to service...")
    download_url = upload_zip_to_service(abs_zip_path)

    if download_url:
        print("✅ Upload successful!\n")

    # Return result
    return {
        'success': True,
        'jsonPath': abs_json_path,
        'zipPath': abs_zip_path,
        'downloadUrl': download_url,
        'templateKey': template_key,
        'name': template['name'],
        'category': template.get('metadata', {}).get('category', 'General'),
        'filesCreated': [
            {'path': json_path, 'size': f"{json_size_kb:.2f} KB"},
            {'path': zip_path, 'size': f"{zip_size_kb:.2f} KB"}
        ],
        'docsCount': docs_count,
        'docsList': docs_list
    }
