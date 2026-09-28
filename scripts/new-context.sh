#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: pnpm context:new -- <workstream-slug>"
  echo "Example: pnpm context:new -- care-insights-sidebar"
  exit 1
fi

SLUG="$1"

if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Invalid slug: $SLUG"
  echo "Use kebab-case only (letters, numbers, hyphens)."
  exit 1
fi

TEMPLATES_DIR="docs/templates"
SESSIONS_DIR="sessions/$SLUG"

if [[ ! -d "$TEMPLATES_DIR" ]]; then
  echo "Missing templates directory: $TEMPLATES_DIR"
  exit 1
fi

mkdir -p "$SESSIONS_DIR"

CONTEXT_FILE="$SESSIONS_DIR/context.md"
DECISION_FILE="$SESSIONS_DIR/decision-log.md"
SESSION_FILE="$SESSIONS_DIR/latest.md"

for FILE in "$CONTEXT_FILE" "$DECISION_FILE" "$SESSION_FILE"; do
  if [[ -f "$FILE" ]]; then
    echo "File already exists: $FILE"
    exit 1
  fi
done

TITLE=$(echo "$SLUG" | sed 's/-/ /g' | awk '{
  for (i = 1; i <= NF; i++) {
    $i = toupper(substr($i, 1, 1)) substr($i, 2)
  }
  print
}')

cp "$TEMPLATES_DIR/context-master-template.md" "$CONTEXT_FILE"
cp "$TEMPLATES_DIR/decision-log-template.md" "$DECISION_FILE"
cp "$TEMPLATES_DIR/session-handoff-template.md" "$SESSION_FILE"

sed -i "s/<Workstream Name>/$TITLE/g" "$CONTEXT_FILE" "$DECISION_FILE"
sed -i "s|<YYYY-MM-DD>|$(date +%F)|g" "$SESSION_FILE" "$DECISION_FILE"

echo "Created context files:"
echo "- $CONTEXT_FILE"
echo "- $DECISION_FILE"
echo "- $SESSION_FILE"
