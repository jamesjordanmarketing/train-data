#!/bin/bash

# --- Config ---
REQUIRED_BRANCH="main"
REQUIRED_FOLDER="pmc"
COMMIT_REPORT_DIR="system/management/commits"
# ---------------

# Step 1: Check current working folder
CURRENT_FOLDER=$(basename "$PWD")
if [ "$CURRENT_FOLDER" != "$REQUIRED_FOLDER" ]; then
  echo "❌ Error: You must be standing inside $REQUIRED_FOLDER to run this script. Aborting."
  exit 1
fi

# Step 2: Check current Git branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "$REQUIRED_BRANCH" ]; then
  echo "❌ Error: You are on branch '$CURRENT_BRANCH'. Must be on '$REQUIRED_BRANCH' branch to commit safely."
  exit 1
fi

# Step 3: Move to Git root (up one level)
cd ..

# Step 4: Prepare commit message
if [ -z "$1" ]; then
  COMMIT_MSG="Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "ℹ️  No commit message provided. Using auto-message: '$COMMIT_MSG'"
else
  COMMIT_MSG="$1"
fi

# Step 5: Perform Git commands
git add -A
git commit -m "$COMMIT_MSG"
git push

# Step 6: Save commit report
# Prepare commit report filename
CLEAN_FILENAME=$(echo "$COMMIT_MSG" | tr ' ' '-' | tr ':' '-')
REPORT_PATH="pmc/$COMMIT_REPORT_DIR/$CLEAN_FILENAME.txt"

# Make sure commit report folder exists
mkdir -p "pmc/$COMMIT_REPORT_DIR"

# Save the report
git show --name-only --oneline HEAD > "$REPORT_PATH"

echo
echo "✅ Safe commit completed successfully!"
echo "📝 Commit details saved to: $REPORT_PATH"