#!/bin/bash
# Build orchestration prompt for Claude Code Main Agent (v2)
# Usage: ./scripts/build-orchestration-prompt.sh TICKET_KEY TASK_TYPE
#
# Instead of building a flat prompt from JSON config (v1),
# this builds an orchestration prompt that activates the Main Agent
# from CLAUDE.md with full .claude/agents/ dispatch capabilities.

set -euo pipefail

TICKET=${1:?"Usage: $0 TICKET_KEY TASK_TYPE"}
TASK_TYPE=${2:?"Usage: $0 TICKET_KEY TASK_TYPE"}

TICKET_DATA=$(cat "input/$TICKET/ticket.json" 2>/dev/null || echo "{}")
CHILDREN_DATA=$(cat "input/$TICKET/children.json" 2>/dev/null || echo "[]")
COMMENTS_DATA=$(cat "input/$TICKET/comments.json" 2>/dev/null || echo "[]")

cat <<PROMPT
HEADLESS_MODE: true
TICKET_KEY: $TICKET
TASK_TYPE: $TASK_TYPE

You are the Main Agent from CLAUDE.md. Process Jira ticket $TICKET using the orchestration dispatch loop.

## Ticket Context

### Ticket Data
$TICKET_DATA

### Child Tickets
$CHILDREN_DATA

### Comments
$COMMENTS_DATA
PROMPT

# Include PR review data only for review tasks
if [ "$TASK_TYPE" = "review" ]; then
  PR_REVIEW_DATA=$(cat "input/$TICKET/pr_review.json" 2>/dev/null || echo "")
  if [ -n "$PR_REVIEW_DATA" ]; then
cat <<PROMPT

### PR Review Feedback
$PR_REVIEW_DATA
PROMPT
  fi
fi

cat <<PROMPT

## Processing Instructions

1. Create directories if they don't exist: planning-artifacts/, implementation-artifacts/, outputs/
2. Based on task type "$TASK_TYPE", execute the pipeline defined in CLAUDE.md "Headless CI Mode"
3. Use .claude/agents/ subagents via the Task tool for each pipeline stage
4. Follow the Worker-Reviewer protocol (max 3 cycles) for code tasks
5. Write final summary to outputs/response.md — this is MANDATORY
6. DO NOT create git branches, commit, or push code — PostJS handles delivery
7. If you need more Jira context, DMTOOLS is available:
   - dmtools jira_get_ticket TICKET-KEY fields
   - dmtools jira_search_by_jql "JQL" "fields"
PROMPT
