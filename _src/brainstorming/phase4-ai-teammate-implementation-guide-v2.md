# Phase 4: AI Teammate v2 — Orchestrated Multi-Agent Implementation Guide

**Created:** 2026-02-16
**Supersedes:** phase4-ai-teammate-implementation-guide.md (v1 — flat JSON prompt approach)
**Architecture:** DMTOOLS context engine + Claude Code CLI orchestration kernel + GitHub Actions runner

---

## What Changed from v1

| Aspect | v1 (JSON branch) | v2 (This guide) |
|--------|-------------------|------------------|
| **Brain** | Flat prompt from `agents/*.json` | Claude Code as Main Agent using `.claude/agents/` orchestration |
| **Planning** | None — single-shot execution | Planner decomposes ticket into subtasks |
| **Code Quality** | No self-review | Worker-Reviewer cycles (max 3 rounds) |
| **Testing** | Only if Claude remembers | Dedicated tester agent validates acceptance criteria |
| **Artifact Trail** | Just `outputs/response.md` | Full audit trail in `planning-artifacts/` + `implementation-artifacts/` |
| **Model Selection** | One model for everything | Haiku for research, Sonnet for code, Opus for architecture |
| **Removed** | — | `agents/*.json`, `scripts/build-claude-prompt.js` |
| **Kept** | — | DMTOOLS, PostJS actions, GitHub Actions outer loop, label convention |

### Architecture Diagram

```
GitHub Actions (cron 15min or manual dispatch)
  │
  ├─ DMTOOLS: fetch Jira ticket context → input/TICKET/
  │
  ├─ Claude Code CLI (headless, --dangerously-skip-permissions)
  │   │
  │   │  ╔══════════════════════════════════════════╗
  │   │  ║  CLAUDE.md Orchestration Kernel          ║
  │   │  ║                                          ║
  │   │  ║  Main Agent reads ticket from input/     ║
  │   │  ║    │                                     ║
  │   │  ║    ├─► planner    → task DAG             ║
  │   │  ║    ├─► implementer → code changes        ║
  │   │  ║    ├─► reviewer   → structured feedback  ║
  │   │  ║    │     └─► implementer (fix cycle)     ║
  │   │  ║    ├─► tester     → validation           ║
  │   │  ║    └─► outputs/response.md               ║
  │   │  ╚══════════════════════════════════════════╝
  │   │
  │   └─ Artifacts: planning-artifacts/, implementation-artifacts/
  │
  ├─ PostJS: git branch → commit → push → PR
  │
  └─ DMTOOLS: Jira comment + label update
```

---

## Prerequisites

Same as v1 — all must already be working:

- [x] GitHub repository with remote at github.com
- [x] DMTOOLS installed and connecting to Jira (Steps 0.1–0.2 from v1)
- [x] Claude Code CLI working headless in GitHub Actions (Step 0.3 from v1)
- [x] Combined smoke test passing (Step 0.4 from v1)
- [x] `.claude/agents/` directory with planner, architect, implementer, reviewer, tester, researcher
- [x] `CLAUDE.md` orchestration kernel in repo root

If any prerequisite is not met, follow Steps 0.1–0.4 from v1 guide first. Those are infrastructure validations and remain unchanged.

---

## STEP 1: Add Headless CI Rules to CLAUDE.md

CLAUDE.md is the orchestration kernel that Claude Code auto-loads. It needs rules for headless operation where there is no human to answer questions.

**Action:** Add a new section to `CLAUDE.md` before the `## CLAUDE.md Size Constraint` section.

```markdown
## Headless CI Mode

When running in GitHub Actions (no interactive user):

### Detection
- Environment variable `CI=true` is set by GitHub Actions
- Or prompt contains `HEADLESS_MODE: true`

### Rules
1. NEVER use AskUserQuestion — make best-effort decisions, document assumptions
2. NEVER use EnterPlanMode — plan internally via planner agent dispatch
3. Time budget: complete all work within 45 minutes total
4. If blocked on ambiguity: document the ambiguity in outputs/response.md and proceed with the safest option
5. Git operations: DO NOT create branches, commit, or push — PostJS handles delivery
6. Write final summary to outputs/response.md ALWAYS — this is the handoff to PostJS

### Ticket Processing Flow
When given a Jira ticket context in input/:
1. Read input/{TICKET}/ticket.json — primary requirements
2. Read input/{TICKET}/children.json — subtask context
3. Read input/{TICKET}/comments.json — conversation history
4. Read input/{TICKET}/task_type.txt — determines processing pipeline
5. Dispatch agents per task type (see below)
6. Write summary to outputs/response.md

### Pipeline by Task Type
- **analysis**: planner → researcher (if needed) → write analysis to outputs/response.md
- **code**: planner → implementer → reviewer → [fix cycle max 3] → tester → outputs/response.md
- **review**: read input/{TICKET}/pr_review.json → implementer (address feedback) → reviewer → outputs/response.md
```

---

## STEP 2: Add Headless Awareness to Agent Definitions

Each `.claude/agents/*.md` agent needs to know about the ticket input convention.

### 2.1 Update implementer.md

**Add to the end of the `## Process` section:**

```markdown
### CI/Headless Additions
- When `input/` directory exists, read ticket context from input/{TICKET}/ as primary requirements
- When `outputs/` directory exists, write development summary to outputs/response.md
- DO NOT run git commands — no branch, no commit, no push
- All code changes go directly in the working tree
```

### 2.2 Update reviewer.md

**Add to the end of the `## Process` section:**

```markdown
### CI/Headless Additions
- In CI, review code changes in the working tree (not committed yet)
- Use `git diff` equivalent (read files, compare against ticket requirements)
- Write review to both implementation-artifacts/ AND include summary in outputs/response.md
```

### 2.3 Update planner.md

**Add to the end of the `## Process` section:**

```markdown
### CI/Headless Additions
- When processing a Jira ticket, limit task plan to max 5 tasks
- Each task must be completable within 10 minutes
- Prefer fewer, larger tasks over many small ones in CI (reduces dispatch overhead)
- Read ticket context from input/{TICKET}/ directory
```

### 2.4 Update tester.md

**Add to the end of the `## Process` section:**

```markdown
### CI/Headless Additions
- In CI, focus on verifying acceptance criteria from the ticket
- If no test framework is configured, verify code correctness by reading and analyzing
- Write test results to both implementation-artifacts/ AND outputs/response.md
- DO NOT create bug tasks in CI — include failures in outputs/response.md instead
```

---

## STEP 3: Create the Orchestration Prompt Script

This replaces `scripts/build-claude-prompt.js`. Instead of building a flat prompt from JSON, it builds an orchestration prompt that activates the Main Agent.

**File:** `scripts/build-orchestration-prompt.sh`

```bash
#!/bin/bash
# Build orchestration prompt for Claude Code Main Agent
# Usage: ./scripts/build-orchestration-prompt.sh TICKET_KEY TASK_TYPE

TICKET=$1
TASK_TYPE=$2

TICKET_DATA=$(cat "input/$TICKET/ticket.json" 2>/dev/null || echo "{}")
CHILDREN_DATA=$(cat "input/$TICKET/children.json" 2>/dev/null || echo "[]")
COMMENTS_DATA=$(cat "input/$TICKET/comments.json" 2>/dev/null || echo "[]")
PR_REVIEW_DATA=$(cat "input/$TICKET/pr_review.json" 2>/dev/null || echo "")

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
if [ "$TASK_TYPE" = "review" ] && [ -n "$PR_REVIEW_DATA" ]; then
cat <<PROMPT

### PR Review Feedback
$PR_REVIEW_DATA
PROMPT
fi

cat <<PROMPT

## Processing Instructions

1. Create directories: planning-artifacts/, implementation-artifacts/, outputs/
2. Based on task type "$TASK_TYPE", execute the pipeline defined in CLAUDE.md "Headless CI Mode"
3. Use .claude/agents/ subagents via the Task tool for each pipeline stage
4. Follow the Worker-Reviewer protocol (max 3 cycles)
5. Write final summary to outputs/response.md — this is MANDATORY
6. DO NOT create git branches, commit, or push code — PostJS handles delivery
7. If you need more Jira context, DMTOOLS is available: dmtools jira_get_ticket TICKET fields
PROMPT
```

---

## STEP 4: Update the GitHub Actions Workflow

**File:** `.github/workflows/ai-teammate.yml`

Replace the entire file with the v2 version:

```yaml
name: AI Teammate v2

on:
  schedule:
    # Every 15 min, 8am-6pm UTC, Mon-Fri
    - cron: '*/15 8-18 * * 1-5'
  workflow_dispatch:
    inputs:
      ticket_key:
        description: 'Specific ticket key (leave empty to poll JQL)'
        required: false
        type: string

env:
  JIRA_BASE_PATH: ${{ secrets.JIRA_BASE_PATH }}
  JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
  JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
  JIRA_AUTH_TYPE: Basic
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

jobs:
  process-ticket:
    runs-on: ubuntu-latest
    timeout-minutes: 60  # Increased from 30 — orchestration needs more time

    steps:
      - name: Checkout repo
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install DMTOOLS
        run: |
          curl -fsSL https://raw.githubusercontent.com/IstiN/dmtools/main/install.sh | bash
          echo "$HOME/.dmtools/bin" >> $GITHUB_PATH

      - name: Install Claude Code CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Select ticket
        id: select-ticket
        run: |
          export PATH="$HOME/.dmtools/bin:$PATH"
          if [ -n "${{ inputs.ticket_key }}" ]; then
            echo "ticket_key=${{ inputs.ticket_key }}" >> $GITHUB_OUTPUT
            echo "found=true" >> $GITHUB_OUTPUT
            echo "Selected manually: ${{ inputs.ticket_key }}"
          else
            RESULT=$(dmtools jira_search_by_jql \
              "assignee = currentUser() AND labels in ('AI', 'AI-REVIEW') ORDER BY priority DESC, created ASC" \
              "key,summary,labels,issuetype" \
              --limit 1)

            TICKET_KEY=$(echo "$RESULT" | jq -r '.[0].key // empty')

            if [ -z "$TICKET_KEY" ]; then
              echo "No tickets found with AI label. Exiting."
              echo "found=false" >> $GITHUB_OUTPUT
              exit 0
            fi

            echo "ticket_key=$TICKET_KEY" >> $GITHUB_OUTPUT
            echo "found=true" >> $GITHUB_OUTPUT
            echo "Selected from JQL: $TICKET_KEY"
          fi

      - name: Fetch ticket context
        if: steps.select-ticket.outputs.found != 'false'
        run: |
          export PATH="$HOME/.dmtools/bin:$PATH"
          TICKET=${{ steps.select-ticket.outputs.ticket_key }}
          mkdir -p input/$TICKET outputs planning-artifacts implementation-artifacts

          # Fetch ticket data
          dmtools jira_get_ticket $TICKET \
            summary,description,status,labels,issuetype,priority,acceptance_criteria \
            > input/$TICKET/ticket.json

          # Fetch child tickets
          dmtools jira_search_by_jql "parent = $TICKET" \
            "key,summary,status,description" \
            > input/$TICKET/children.json || echo "[]" > input/$TICKET/children.json

          # Fetch comments
          dmtools jira_get_comments $TICKET \
            > input/$TICKET/comments.json || echo "[]" > input/$TICKET/comments.json

          # Determine task type from labels
          LABELS=$(cat input/$TICKET/ticket.json | jq -r '.fields.labels | join(",")')
          if echo "$LABELS" | grep -qi "AI-REVIEW"; then
            echo "review" > input/$TICKET/task_type.txt

            # For review tasks, fetch PR review comments
            PR_URL=$(gh pr list --head "feature/$TICKET" --json url --jq '.[0].url' || echo "")
            if [ -n "$PR_URL" ]; then
              gh pr view "$PR_URL" --json reviews,comments \
                > input/$TICKET/pr_review.json || echo "{}" > input/$TICKET/pr_review.json
            fi
          else
            ISSUE_TYPE=$(cat input/$TICKET/ticket.json | jq -r '.fields.issuetype.name')
            case "$ISSUE_TYPE" in
              Bug|Story) echo "code" > input/$TICKET/task_type.txt ;;
              Task|Analysis) echo "analysis" > input/$TICKET/task_type.txt ;;
              *) echo "analysis" > input/$TICKET/task_type.txt ;;
            esac
          fi

          echo "Task type: $(cat input/$TICKET/task_type.txt)"

      - name: Run Claude Code (Orchestrated)
        if: steps.select-ticket.outputs.found != 'false'
        run: |
          TICKET=${{ steps.select-ticket.outputs.ticket_key }}
          TASK_TYPE=$(cat input/$TICKET/task_type.txt)

          # Build orchestration prompt
          chmod +x scripts/build-orchestration-prompt.sh
          PROMPT=$(bash scripts/build-orchestration-prompt.sh "$TICKET" "$TASK_TYPE")

          # Run Claude Code as Main Agent — CLAUDE.md auto-loads
          claude -p "$PROMPT" --dangerously-skip-permissions

      - name: Route output
        if: steps.select-ticket.outputs.found != 'false'
        run: |
          export PATH="$HOME/.dmtools/bin:$PATH"
          TICKET=${{ steps.select-ticket.outputs.ticket_key }}
          TASK_TYPE=$(cat input/$TICKET/task_type.txt)

          # Verify outputs/response.md exists
          if [ ! -f "outputs/response.md" ]; then
            echo "ERROR: outputs/response.md not found. Claude may have failed."
            dmtools jira_post_comment $TICKET "AI Teammate v2: No output produced. Check GitHub Actions logs."
            dmtools jira_remove_label $TICKET "AI"
            dmtools jira_add_label $TICKET "AI_FAILED"
            exit 1
          fi

          case "$TASK_TYPE" in
            analysis)
              RESPONSE=$(cat outputs/response.md)
              dmtools jira_post_comment $TICKET "$RESPONSE"
              dmtools jira_remove_label $TICKET "AI"
              dmtools jira_add_label $TICKET "AI_PROCESSED"
              echo "Posted analysis comment to $TICKET"
              ;;
            code|review)
              node agents/postActions/developTicketAndCreatePR.js $TICKET
              ;;
          esac

      - name: Upload artifacts
        if: always() && steps.select-ticket.outputs.found != 'false'
        uses: actions/upload-artifact@v4
        with:
          name: ai-teammate-artifacts-${{ steps.select-ticket.outputs.ticket_key }}
          path: |
            planning-artifacts/
            implementation-artifacts/
            outputs/
          retention-days: 30
```

---

## STEP 5: Clean Up v1 Files

Remove the flat-prompt infrastructure that is no longer needed.

**Delete these files:**
- `scripts/build-claude-prompt.js` — replaced by `scripts/build-orchestration-prompt.sh`
- `agents/analysis.json` — replaced by `.claude/agents/` orchestration
- `agents/code.json` — replaced by `.claude/agents/` orchestration
- `agents/review.json` — replaced by `.claude/agents/` orchestration
- `agents/default.json` — replaced by `.claude/agents/` orchestration

**Keep these files:**
- `agents/postActions/developTicketAndCreatePR.js` — still needed for git/PR delivery
- `agents/postActions/updatePRFromReview.js` — still needed for review fixes

---

## STEP 6: Update .gitignore

Ensure CI working directories are not committed.

**Add to `.gitignore`:**

```
# AI Teammate CI working directories
input/
outputs/
planning-artifacts/
implementation-artifacts/
```

---

## STEP 7: Test End-to-End

### 7.1 Test Analysis Flow (Simplest — Start Here)

1. In Jira, find a Task-type ticket (e.g., ATL-5)
2. Add label `AI`
3. Trigger manually:
   ```bash
   gh workflow run ai-teammate.yml -f ticket_key=ATL-5
   gh run watch
   ```
4. **Verify:**
   - [ ] GitHub Actions run completes within 60 minutes
   - [ ] ATL-5 has a structured analysis comment (not just raw text)
   - [ ] Label changed from `AI` to `AI_PROCESSED`
   - [ ] Artifacts uploaded (check Actions → run → Artifacts)
   - [ ] Artifacts contain planning-artifacts/ with a plan file

### 7.2 Test Code Flow (Most Complex)

1. Find a Story or Bug ticket (e.g., ATL-8) with clear requirements
2. Add label `AI`
3. Trigger:
   ```bash
   gh workflow run ai-teammate.yml -f ticket_key=ATL-8
   gh run watch
   ```
4. **Verify:**
   - [ ] PR created against main with code changes
   - [ ] PR description includes structured summary from outputs/response.md
   - [ ] Jira comment with PR link posted
   - [ ] Label changed to `AI_PROCESSED`
   - [ ] Artifacts contain: plan, implementation notes, review feedback, test report
   - [ ] Review cycles visible in implementation-artifacts/ (if reviewer requested changes)

### 7.3 Test AI-Review Flow

1. On the PR from 7.2, leave a review comment requesting a change
2. In Jira, change label on the ticket to `AI-REVIEW`
3. Trigger:
   ```bash
   gh workflow run ai-teammate.yml -f ticket_key=ATL-8
   gh run watch
   ```
4. **Verify:**
   - [ ] PR updated with new commit addressing feedback
   - [ ] Jira comment confirms review addressed
   - [ ] Label changed to `AI_PROCESSED`

### 7.4 Test Failure Handling

1. Add label `AI` to a ticket with empty description
2. Trigger and watch
3. **Verify:**
   - [ ] Jira comment reports what went wrong
   - [ ] Label changed to `AI_FAILED`
   - [ ] GitHub Actions artifacts still uploaded for debugging

### 7.5 Test Cron Polling

1. Add label `AI` to a ticket
2. Wait for next cron cycle (up to 15 min)
3. **Verify:** Ticket processed automatically

---

## STEP 8: Iterate and Refine

### 8.1 Tune Agent Behavior (First Priority)

After the first few runs, examine the artifacts:

- [ ] **Planner creating too many tasks?** → Adjust max task limit in planner.md CI additions
- [ ] **Reviewer too strict / too lenient?** → Calibrate severity definitions in reviewer.md
- [ ] **Implementer ignoring ticket context?** → Strengthen input/ reading instructions
- [ ] **Tester not finding issues?** → Add specific test strategy per project type

### 8.2 Cost Optimization (After First Week)

- [ ] Check Anthropic billing dashboard
- [ ] If costs too high: add complexity classifier — simple tickets skip planner/reviewer
- [ ] Consider `--model haiku` flag for analysis-only tasks
- [ ] Track tokens per run via `claude --output-format json` and parse usage

### 8.3 Timeout Tuning

- [ ] Measure actual run times per task type
- [ ] Analysis should complete in ~5 min — if longer, planner is over-decomposing
- [ ] Code should complete in ~15-30 min — if longer, ticket scope is too large
- [ ] If consistently hitting 60 min: split large tickets into subtasks before labeling AI

### 8.4 Advanced: Complexity-Based Routing

Add a pre-classification step to choose between flat (cheap) and orchestrated (thorough):

```bash
# In the workflow, before "Run Claude Code":
COMPLEXITY=$(claude -p "Rate this ticket 1-3 for implementation complexity.
Respond with ONLY the number. 1=trivial, 2=moderate, 3=complex.
Ticket: $(cat input/$TICKET/ticket.json)" --model haiku --dangerously-skip-permissions)

if [ "$COMPLEXITY" = "1" ]; then
  # Simple: flat prompt, skip orchestration
  claude -p "$(cat input/$TICKET/ticket.json). Implement this. Write summary to outputs/response.md." --dangerously-skip-permissions
else
  # Moderate/Complex: full orchestration
  PROMPT=$(bash scripts/build-orchestration-prompt.sh "$TICKET" "$TASK_TYPE")
  claude -p "$PROMPT" --dangerously-skip-permissions
fi
```

---

## Quick Reference

### GitHub Secrets Required

| Secret | Value |
|--------|-------|
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `JIRA_BASE_PATH` | `https://your-site.atlassian.net` |
| `JIRA_EMAIL` | Your Jira email |
| `JIRA_API_TOKEN` | From id.atlassian.com/manage-profile/security/api-tokens |

### Label Convention (Unchanged from v1)

| Label | Action | Output |
|-------|--------|--------|
| `AI` | Full processing (analysis or code based on ticket type) | Jira comment or PR |
| `AI-REVIEW` | Fix code from PR review feedback | Updated PR |
| `AI_PROCESSED` | (System) Ticket was successfully processed | — |
| `AI_FAILED` | (System) Processing failed | Error comment on ticket |

### Manual Trigger Commands

```bash
# Process next AI-labeled ticket
gh workflow run ai-teammate.yml

# Process a specific ticket
gh workflow run ai-teammate.yml -f ticket_key=ATL-15

# Watch the run
gh run watch

# Check recent runs
gh run list --workflow=ai-teammate.yml --limit=5

# Download artifacts from a run
gh run download <RUN_ID>
```

### File Structure (v2)

```
your-repo/
├── .github/workflows/
│   └── ai-teammate.yml              # Main workflow (v2 — orchestrated)
├── .claude/agents/
│   ├── planner.md                    # Task decomposition
│   ├── architect.md                  # Design decisions
│   ├── implementer.md                # Code writing
│   ├── reviewer.md                   # Code review
│   ├── tester.md                     # Test validation
│   └── researcher.md                 # Research & analysis
├── agents/
│   └── postActions/
│       ├── developTicketAndCreatePR.js   # Git + PR delivery
│       └── updatePRFromReview.js         # PR update from review
├── scripts/
│   └── build-orchestration-prompt.sh # Orchestration prompt builder
├── input/                            # .gitignored — DMTOOLS ticket context
├── outputs/                          # .gitignored — Claude final response
├── planning-artifacts/               # .gitignored — Plans, ADRs, research
├── implementation-artifacts/         # .gitignored — Reviews, test reports
├── _bmad/                            # BMAD rules (local interactive use)
└── CLAUDE.md                         # Orchestration kernel (auto-loaded)
```

### Cost Estimation

| Task Type | Agents Dispatched | Estimated Tokens | Estimated Cost |
|-----------|-------------------|------------------|----------------|
| Analysis | planner + researcher | ~50k tokens | ~$0.15–0.30 |
| Code (simple) | planner + implementer + reviewer | ~100k tokens | ~$0.30–0.60 |
| Code (complex) | planner + architect + implementer + reviewer×3 + tester | ~300k tokens | ~$0.90–1.80 |
| Review fix | implementer + reviewer | ~80k tokens | ~$0.25–0.50 |

*Costs based on Sonnet pricing. Opus escalation (architect) adds ~3x for that dispatch.*
