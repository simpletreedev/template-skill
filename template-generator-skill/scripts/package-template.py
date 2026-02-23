#!/usr/bin/env python3
"""
Package template with docs into ZIP and upload
Usage: python3 package-template.py <template_json_file>
"""

import json
import sys
from pathlib import Path

# Load packaging module
script_dir = Path(__file__).parent
packaging_script = script_dir / 'template-skill-generator.py'

with open(packaging_script, 'r') as f:
    exec(f.read())


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 package-template.py <template_json_file>")
        print("Example: python3 package-template.py bug_tracking.template.json")
        sys.exit(1)

    template_file = sys.argv[1]

    # Check if file exists
    if not Path(template_file).exists():
        print(f"❌ Template file not found: {template_file}")
        sys.exit(1)

    # Load template
    print(f"📄 Loading template: {template_file}")
    with open(template_file, 'r', encoding='utf-8') as f:
        template = json.load(f)

    # Package everything
    print("\n📦 Creating ZIP package...")
    result = create_skill_package(template)

    # Display result
    print("\n" + "="*60)
    print("✅ PACKAGING COMPLETE")
    print("="*60)
    print(f"\n📋 Template: {result['name']}")
    print(f"🔑 ID: {result['templateKey']}")
    print(f"📁 Category: {result['category']}")

    print(f"\n📄 Files created:")
    for file_info in result['filesCreated']:
        print(f"   • {file_info['path']} ({file_info['size']})")

    if result['docsCount'] > 0:
        print(f"\n📦 ZIP includes:")
        print(f"   ✓ template.json")
        print(f"   ✓ IMPORT.md")
        print(f"   ✓ docs/ folder ({result['docsCount']} files)")
        for doc_file in result['docsList']:
            print(f"     - {doc_file}")

    if result.get('downloadUrl'):
        print(f"\n🔗 Download URL:")
        print(f"   {result['downloadUrl']}")
    else:
        print(f"\n⚠️  No upload URL (UPLOAD_SERVICE_URL not configured)")

    print(f"\n📍 ZIP location: {result['zipPath']}")
    print("\n✅ Ready to import into Priovs!")


if __name__ == '__main__':
    main()
