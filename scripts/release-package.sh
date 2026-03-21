#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

require_command() {
	local command_name="$1"

	if ! command -v "${command_name}" >/dev/null 2>&1; then
		echo "Error: '${command_name}' is required but not installed." >&2
		exit 1
	fi
}

require_command git
require_command npm
require_command node

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
	echo "Usage: ./scripts/release-package.sh"
	echo
	echo "Prompts for a version bump and commit message, then:"
	echo "1. bumps package.json/package-lock.json"
	echo "2. stages all files"
	echo "3. commits the release"
	echo "4. pushes the current branch to origin"
	echo "5. runs npm publish"
	exit 0
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
	echo "Error: this script must be run inside the repository." >&2
	exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [ -z "${CURRENT_BRANCH}" ]; then
	echo "Error: you are not currently on a branch." >&2
	exit 1
fi

PACKAGE_NAME="$(node -p "require('./package.json').name")"
CURRENT_VERSION="$(node -p "require('./package.json').version")"

echo "Package: ${PACKAGE_NAME}"
echo "Current version: v${CURRENT_VERSION}"
echo

read -r -p "Version bump (patch/minor/major/prepatch/preminor/premajor/prerelease or x.y.z) [patch]: " VERSION_BUMP
VERSION_BUMP="${VERSION_BUMP:-patch}"

echo "Bumping version..."
npm version --no-git-tag-version "${VERSION_BUMP}" >/dev/null

NEW_VERSION="$(node -p "require('./package.json').version")"
DEFAULT_COMMIT_MESSAGE="chore: release v${NEW_VERSION}"

echo "New version: v${NEW_VERSION}"
read -r -p "Commit message [${DEFAULT_COMMIT_MESSAGE}]: " COMMIT_MESSAGE
COMMIT_MESSAGE="${COMMIT_MESSAGE:-$DEFAULT_COMMIT_MESSAGE}"

echo
echo "Staging all changes..."
git add -A

if git diff --cached --quiet; then
	echo "Error: there are no staged changes to commit." >&2
	exit 1
fi

echo "Creating commit..."
git commit -m "${COMMIT_MESSAGE}"

echo "Pushing '${CURRENT_BRANCH}' to origin..."
git push origin "${CURRENT_BRANCH}"

echo "Publishing ${PACKAGE_NAME}@${NEW_VERSION}..."
npm publish

echo
echo "Release complete: ${PACKAGE_NAME}@${NEW_VERSION}"
