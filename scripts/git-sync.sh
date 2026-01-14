#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get commit message from argument or prompt
COMMIT_MSG="$1"

if [ -z "$COMMIT_MSG" ]; then
	echo -e "${RED}Error: Commit message required${NC}"
	echo "Usage: bun run sync \"type: message\""
	echo "Example: bun run sync \"feat: add new feature\""
	exit 1
fi

# Get current branch
BRANCH=$(git branch --show-current)
echo -e "${YELLOW}Branch:${NC} $BRANCH"

# Check if there are changes to commit
if [ -z "$(git status --porcelain)" ]; then
	echo -e "${YELLOW}No changes to commit${NC}"
	exit 0
fi

# Stash current changes
echo -e "${YELLOW}Stashing changes...${NC}"
git stash push -m "sync-temp-stash"

# Pull with rebase
echo -e "${YELLOW}Pulling with rebase...${NC}"
if git pull --rebase origin "$BRANCH" 2>/dev/null; then
	echo -e "${GREEN}Pull successful${NC}"
else
	echo -e "${YELLOW}No remote branch or nothing to pull${NC}"
fi

# Pop stash
echo -e "${YELLOW}Restoring changes...${NC}"
git stash pop || true

# Add all changes
echo -e "${YELLOW}Staging changes...${NC}"
git add -A

# Commit
echo -e "${YELLOW}Committing...${NC}"
git commit -m "$COMMIT_MSG"

# Push
echo -e "${YELLOW}Pushing to origin/$BRANCH...${NC}"
if git push origin "$BRANCH" 2>/dev/null; then
	echo -e "${GREEN}Push successful${NC}"
else
	echo -e "${YELLOW}Setting upstream and pushing...${NC}"
	git push -u origin "$BRANCH"
fi

echo -e "${GREEN}✓ Sync complete!${NC}"
