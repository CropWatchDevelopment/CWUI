#!/usr/bin/env bash
# ── sync-cw-ui.sh ──────────────────────────────────────────────
# Pull / update the cropwatch-ui library into a consuming app via
# git subtree.  Run from the consuming app's repo root.
#
# Usage:
#   scripts/sync-cw-ui.sh                 # first-time add
#   scripts/sync-cw-ui.sh --pull          # subsequent updates
#   scripts/sync-cw-ui.sh --push          # push local changes back
# ────────────────────────────────────────────────────────────────

set -euo pipefail

REMOTE_NAME="cropwatch-ui"
REMOTE_URL="git@github.com:<your-org>/cropwatch-ui.git"   # ← update
BRANCH="main"
PREFIX="vendor/cropwatch-ui"

# Ensure the remote exists
if ! git remote | grep -q "^${REMOTE_NAME}$"; then
  echo "Adding remote '${REMOTE_NAME}' → ${REMOTE_URL}"
  git remote add "${REMOTE_NAME}" "${REMOTE_URL}"
fi

git fetch "${REMOTE_NAME}" "${BRANCH}"

case "${1:-}" in
  --pull)
    echo "⟳  Pulling subtree updates from ${REMOTE_NAME}/${BRANCH} into ${PREFIX}"
    git subtree pull --prefix="${PREFIX}" "${REMOTE_NAME}" "${BRANCH}" --squash
    ;;
  --push)
    echo "⟴  Pushing local subtree changes back to ${REMOTE_NAME}/${BRANCH}"
    git subtree push --prefix="${PREFIX}" "${REMOTE_NAME}" "${BRANCH}"
    ;;
  *)
    if [ -d "${PREFIX}" ]; then
      echo "Directory ${PREFIX} already exists. Use --pull to update."
      exit 1
    fi
    echo "⊕  Adding subtree from ${REMOTE_NAME}/${BRANCH} at ${PREFIX}"
    git subtree add --prefix="${PREFIX}" "${REMOTE_NAME}" "${BRANCH}" --squash
    ;;
esac

echo ""
echo "✓  Subtree sync complete. Running checks…"

# Validate the sync didn't break anything
cd "${PREFIX}"
npm install --frozen-lockfile 2>/dev/null || npm install
npm run check
echo "✓  All checks passed."
