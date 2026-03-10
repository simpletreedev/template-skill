#!/bin/bash
# 🧪 Test multi-user scenario with different session IDs

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🧪 Testing Multi-User Scenario"
echo "================================"
echo ""

# Test 1: User A creates template
echo "👤 User A (session: user-a-123) creating template..."
export CLAUDE_SESSION_ID="user-a-123"
bash "${SCRIPT_DIR}/quick-init.sh" --quiet "crm" "CRM Template" "Customer management for User A"
USER_A_TEMPLATE=$(cat "${SKILL_ROOT}/sid-user-a-123")
echo "   ✅ User A template: ${USER_A_TEMPLATE}"
echo ""

# Test 2: User B creates template
echo "👤 User B (session: user-b-456) creating template..."
export CLAUDE_SESSION_ID="user-b-456"
bash "${SCRIPT_DIR}/quick-init.sh" --quiet "project" "Project Template" "Project management for User B"
USER_B_TEMPLATE=$(cat "${SKILL_ROOT}/sid-user-b-456")
echo "   ✅ User B template: ${USER_B_TEMPLATE}"
echo ""

# Test 3: User C creates template
echo "👤 User C (session: user-c-789) creating template..."
export CLAUDE_SESSION_ID="user-c-789"
bash "${SCRIPT_DIR}/quick-init.sh" --quiet "inventory" "Inventory Template" "Inventory tracking for User C"
USER_C_TEMPLATE=$(cat "${SKILL_ROOT}/sid-user-c-789")
echo "   ✅ User C template: ${USER_C_TEMPLATE}"
echo ""

# Test 4: Verify each user has their own template
echo "🔍 Verification:"
echo "   User A session file: $(test -f "${SKILL_ROOT}/sid-user-a-123" && echo "✅ exists" || echo "❌ missing")"
echo "   User B session file: $(test -f "${SKILL_ROOT}/sid-user-b-456" && echo "✅ exists" || echo "❌ missing")"
echo "   User C session file: $(test -f "${SKILL_ROOT}/sid-user-c-789" && echo "✅ exists" || echo "❌ missing")"
echo ""

# Test 5: Verify state files are separate
echo "📊 State files:"
echo "   User A state: $(test -f "${USER_A_TEMPLATE}/state.json" && echo "✅ exists" || echo "❌ missing")"
echo "   User B state: $(test -f "${USER_B_TEMPLATE}/state.json" && echo "✅ exists" || echo "❌ missing")"
echo "   User C state: $(test -f "${USER_C_TEMPLATE}/state.json" && echo "✅ exists" || echo "❌ missing")"
echo ""

# Test 6: Verify no conflicts
echo "🔒 Conflict check:"
if [[ "${USER_A_TEMPLATE}" != "${USER_B_TEMPLATE}" ]] && \
   [[ "${USER_B_TEMPLATE}" != "${USER_C_TEMPLATE}" ]] && \
   [[ "${USER_A_TEMPLATE}" != "${USER_C_TEMPLATE}" ]]; then
    echo "   ✅ No conflicts - each user has unique template"
else
    echo "   ❌ CONFLICT DETECTED!"
fi
echo ""

echo "🎉 Multi-user test complete!"
echo ""
echo "📁 Session files created:"
ls -1 "${SKILL_ROOT}"/sid-* 2>/dev/null || echo "   (none)"
