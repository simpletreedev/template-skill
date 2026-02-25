#!/bin/bash

# Helper script to upload template ZIP to cloud server
# Usage: ./scripts/upload-to-cloud.sh <zip-file-path>
#
# Returns:
#   0 - Success (DOWNLOAD_URL variable contains the URL)
#   1 - Failed (check UPLOAD_RESPONSE for details)

set -e

ZIP_FILE="$1"

if [[ -z "${ZIP_FILE}" ]]; then
  echo "❌ Error: ZIP file path required"
  echo "Usage: $0 <zip-file-path>"
  exit 1
fi

if [[ ! -f "${ZIP_FILE}" ]]; then
  echo "❌ Error: File not found: ${ZIP_FILE}"
  exit 1
fi

echo "📤 Uploading $(basename ${ZIP_FILE}) to cloud server..."

# Upload to cloud server and get URL
UPLOAD_RESPONSE=$(curl -s -X POST \
  -F "file=@${ZIP_FILE}" \
  https://nfknprk0-8000.asse.devtunnels.ms/api/v1/triggers/upload)

# Extract URL from JSON response
DOWNLOAD_URL=$(echo ${UPLOAD_RESPONSE} | jq -r '.url')

if [[ "${DOWNLOAD_URL}" != "null" && -n "${DOWNLOAD_URL}" ]]; then
  echo "✅ Upload successful!"
  echo "📦 Cloud URL: ${DOWNLOAD_URL}"
  echo "${DOWNLOAD_URL}"
  exit 0
else
  echo "❌ Upload failed. Response: ${UPLOAD_RESPONSE}"
  echo ""
  echo "❌ Error: Failed to upload template to server"
  echo ""
  echo "There was an error while creating the template export. Server response:"
  echo "${UPLOAD_RESPONSE}"
  echo ""
  echo "Would you like me to try again? (say 'retry' to attempt upload again)"
  exit 1
fi
