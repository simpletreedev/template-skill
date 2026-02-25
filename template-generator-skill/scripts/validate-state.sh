#!/bin/bash

#############################################
# Template Generator State File Validator
#############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STATE_FILE=".template-generator-state.json"
STEPS_DIR="references/steps"
TOTAL_STEPS=8

echo -e "${BLUE}🔍 Template Generator State Validator${NC}"
echo "========================================"
echo ""

#############################################
# Function: Print success/error
#############################################

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

#############################################
# Check 1: State file exists
#############################################

echo "Check 1: State file exists"
if [[ ! -f "$STATE_FILE" ]]; then
  print_error "State file not found: $STATE_FILE"
  echo ""
  echo "💡 Tip: Run step 0 (references/steps/00-init.md) to create initial state file"
  exit 1
fi
print_success "State file found"
echo ""

#############################################
# Check 2: Valid JSON
#############################################

echo "Check 2: Valid JSON structure"
if ! jq empty "$STATE_FILE" 2>/dev/null; then
  print_error "Invalid JSON in state file"
  echo "Run: jq '.' $STATE_FILE to see syntax errors"
  exit 1
fi
print_success "Valid JSON structure"
echo ""

#############################################
# Check 3: Required fields exist
#############################################

echo "Check 3: Required fields"
REQUIRED_FIELDS=("version" "currentStep" "totalSteps" "templateSlug" "templateName" "steps" "summary")
ALL_VALID=true

for field in "${REQUIRED_FIELDS[@]}"; do
  if ! jq -e ".${field}" "$STATE_FILE" >/dev/null 2>&1; then
    print_error "Missing field: ${field}"
    ALL_VALID=false
  fi
done

if [[ "$ALL_VALID" == "true" ]]; then
  print_success "All required fields present"
else
  exit 1
fi
echo ""

#############################################
# Check 4: Valid step values
#############################################

echo "Check 4: Valid step values"

# Check currentStep range
CURRENT_STEP=$(jq -r '.currentStep' "$STATE_FILE")
if [[ "$CURRENT_STEP" =~ ^[0-8]+$ ]] && [[ "$CURRENT_STEP" -ge 0 ]] && [[ "$CURRENT_STEP" -le 8 ]]; then
  print_success "currentStep is valid: $CURRENT_STEP"
else
  print_error "Invalid currentStep: $CURRENT_STEP (must be 0-8)"
  exit 1
fi

# Check totalSteps
TOTAL_STEPS_VALUE=$(jq -r '.totalSteps' "$STATE_FILE")
if [[ "$TOTAL_STEPS_VALUE" == "8" ]]; then
  print_success "totalSteps is correct: 8"
else
  print_warning "totalSteps is $TOTAL_STEPS_VALUE (expected 8)"
fi
echo ""

#############################################
# Check 5: All step statuses are valid
#############################################

echo "Check 5: Step statuses"
VALID_STATUSES=("pending" "in_progress" "completed" "skipped")
ALL_VALID=true

for i in {0..8}; do
  STEP_NAME=""
  case $i in
    0) STEP_NAME="0_INIT" ;;
    1) STEP_NAME="1_BASE_STRUCTURE" ;;
    2) STEP_NAME="2_LISTS" ;;
    3) STEP_NAME="3_DOCUMENTS" ;;
    4) STEP_NAME="4_FILES" ;;
    5) STEP_NAME="5_AUTOMATIONS" ;;
    6) STEP_NAME="6_CHAT_AGENTS" ;;
    7) STEP_NAME="7_AI_WORKSPACES" ;;
    8) STEP_NAME="8_PACKAGE" ;;
  esac

  STATUS=$(jq -r ".steps.\"${STEP_NAME}\".status // \"\"" "$STATE_FILE")

  if [[ -z "$STATUS" ]]; then
    print_error "Step $i ($STEP_NAME) has no status"
    ALL_VALID=false
  elif [[ ! " ${VALID_STATUSES[@]} " =~ " ${STATUS} " ]]; then
    print_error "Step $i ($STEP_NAME) has invalid status: $STATUS"
    ALL_VALID=false
  fi
done

if [[ "$ALL_VALID" == "true" ]]; then
  print_success "All step statuses are valid"
else
  exit 1
fi
echo ""

#############################################
# Check 6: Step files exist
#############################################

echo "Check 6: Step instruction files exist"
ALL_VALID=true

for i in {0..8}; do
  STEP_FILE=$(ls "${STEPS_DIR}/$(printf '%02d' $i)"-*.md 2>/dev/null)
  if [[ -z "$STEP_FILE" ]]; then
    print_error "Step $i file not found: ${STEPS_DIR}/$(printf '%02d' $i)-*.md"
    ALL_VALID=false
  else
    STEP_NAME=$(basename "$STEP_FILE")
    # echo "  Found: $STEP_NAME"
  fi
done

if [[ "$ALL_VALID" == "true" ]]; then
  print_success "All step files exist (0-8)"
else
  print_error "Some step files are missing"
  exit 1
fi
echo ""

#############################################
# Check 7: Timestamp format
#############################################

echo "Check 7: Timestamp formats"
ALL_VALID=true

# Check startedAt format
STARTED_AT=$(jq -r '.startedAt // ""' "$STATE_FILE")
if [[ "$STARTED_AT" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]; then
  print_success "startedAt format valid"
else
  print_warning "startedAt format may be invalid: $STARTED_AT"
fi

# Check lastUpdated format
LAST_UPDATED=$(jq -r '.lastUpdated // ""' "$STATE_FILE")
if [[ "$LAST_UPDATED" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$ ]]; then
  print_success "lastUpdated format valid"
else
  print_warning "lastUpdated format may be invalid: $LAST_UPDATED"
fi
echo ""

#############################################
# Check 8: Summary counts are non-negative
#############################################

echo "Check 8: Summary counts"
ALL_VALID=true

SUMMARY_FIELDS=("lists" "documents" "files" "automations" "chatAgents" "claudeWorkspaces")

for field in "${SUMMARY_FIELDS[@]}"; do
  COUNT=$(jq -r ".summary.${field} // -1" "$STATE_FILE")
  if [[ "$COUNT" =~ ^[0-9]+$ ]] && [[ "$COUNT" -ge 0 ]]; then
    # Valid
    : # echo "  $field: $COUNT"
  else
    print_error "Invalid count for summary.${field}: $COUNT"
    ALL_VALID=false
  fi
done

if [[ "$ALL_VALID" == "true" ]]; then
  print_success "All summary counts are non-negative"
else
  exit 1
fi
echo ""

#############################################
# Final Summary
#############################################

echo "========================================"
print_success "🎉 All validations passed!"
echo ""

# Show current progress
TEMPLATE_NAME=$(jq -r '.templateName' "$STATE_FILE")
CURRENT_STEP=$(jq -r '.currentStep' "$STATE_FILE")

echo "📋 Template: $TEMPLATE_NAME"
echo "📍 Progress: Step $CURRENT_STEP/8"
echo ""

# Show step status overview
echo "Step Status Overview:"
for i in {0..8}; do
  case $i in
    0) STEP_NAME="0_INIT" ;;
    1) STEP_NAME="1_BASE_STRUCTURE" ;;
    2) STEP_NAME="2_LISTS" ;;
    3) STEP_NAME="3_DOCUMENTS" ;;
    4) STEP_NAME="4_FILES" ;;
    5) STEP_NAME="5_AUTOMATIONS" ;;
    6) STEP_NAME="6_CHAT_AGENTS" ;;
    7) STEP_NAME="7_AI_WORKSPACES" ;;
    8) STEP_NAME="8_PACKAGE" ;;
  esac

  STATUS=$(jq -r ".steps.\"${STEP_NAME}\".status" "$STATE_FILE")

  case $STATUS in
    "completed")
      echo -e "  ${GREEN}✅${NC} STEP $i: $STEP_NAME"
      ;;
    "skipped")
      echo -e "  ${YELLOW}⏭️ ${NC} STEP $i: $STEP_NAME (skipped)"
      ;;
    "in_progress")
      echo -e "  ${BLUE}🔄${NC} STEP $i: $STEP_NAME (in progress)"
      ;;
    *)
      echo -e "  ⏳ STEP $i: $STEP_NAME (pending)"
      ;;
  esac
done

echo ""
echo "========================================"
