# Phase 4: AI Teammate — Step-by-Step Implementation Guide

**Created:** 2026-02-15
**Source:** Brainstorming session 2026-02-15 (Morphological Analysis + Role Playing + Decision Tree)
**Architecture:** DMTOOLS context engine + Claude Code CLI brain + GitHub Actions runner

---

## Prerequisites

- [ ] GitHub repository with your working code (local + remote)
- [ ] DMTOOLS fork cloned locally
- [ ] Personal test Jira space (ATL project) with tickets
- [ ] Phase 1 solo mode working (MCP + Claude Code locally)

---

## STEP 0: Validate Blockers (before building anything)

These three must pass or the entire architecture needs rethinking.

### 0.1 Get Anthropic API Key

1. Go to https://console.anthropic.com
2. Sign up / log in
3. Create an API key
4. Save it securely — you'll need it for GitHub Secrets
5. Test locally:
   ```bash
   export ANTHROPIC_API_KEY="sk-ant-..."
   claude -p "Say hello"
   ```
6. **PASS:** Claude responds. **FAIL:** Check key, check billing.

### 0.2 Validate DMTOOLS in GitHub Actions

Create a minimal test workflow in your repo:

**File:** `.github/workflows/test-dmtools.yml`

```yaml
name: Test DMTOOLS in CI

on:
  workflow_dispatch:

jobs:
  test-dmtools:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install DMTOOLS
        run: |
          # Adjust this to match DMTOOLS installation method
          # Option A: npm install
          npm install -g dmtools
          # Option B: clone your fork and install
          # git clone https://github.com/YOUR_USER/dmtools.git /tmp/dmtools
          # cd /tmp/dmtools && npm install -g .

      - name: Verify DMTOOLS
        run: dmtools --version

      - name: Test Jira connection
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          dmtools jira_get_ticket ATL-2 summary,status
```

**Before running:**
1. Add GitHub Secrets to your repo:
   - `JIRA_BASE_URL` = `https://your-site.atlassian.net`
   - `JIRA_EMAIL` = your email
   - `JIRA_API_TOKEN` = your Jira API token
2. Push the workflow file
3. Run manually: `gh workflow run test-dmtools.yml`
4. Watch: `gh run watch`

**PASS:** DMTOOLS installs, connects to Jira, returns ATL-2 data.
**FAIL:** Check DMTOOLS install method for Linux. Try Docker fallback:
```yaml
      - name: Install DMTOOLS via Docker
        run: |
          docker pull dmtools/dmtools:latest
          docker run --rm \
            -e JIRA_BASE_URL=${{ secrets.JIRA_BASE_URL }} \
            -e JIRA_EMAIL=${{ secrets.JIRA_EMAIL }} \
            -e JIRA_API_TOKEN=${{ secrets.JIRA_API_TOKEN }} \
            dmtools/dmtools:latest jira_get_ticket ATL-2 summary,status
```

### 0.3 Validate Claude Code CLI in GitHub Actions

**File:** `.github/workflows/test-claude-cli.yml`

```yaml
name: Test Claude Code CLI in CI

on:
  workflow_dispatch:

jobs:
  test-claude:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Install Claude Code CLI
        run: |
          # Install via npm (check latest install method)
          npm install -g @anthropic-ai/claude-code

      - name: Test Claude headless
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude -p "Respond with exactly: CLAUDE_CLI_WORKS" --dangerously-skip-permissions
```

**Before running:**
1. Add GitHub Secret: `ANTHROPIC_API_KEY` = your API key
2. Push, run: `gh workflow run test-claude-cli.yml`
3. Watch: `gh run watch`

**PASS:** Output contains `CLAUDE_CLI_WORKS`.
**FAIL:** Check install command (may change), check API key, check billing.

### 0.4 Combined Smoke Test

Once 0.1-0.3 pass individually, run them together:

**File:** `.github/workflows/test-combined.yml`

```yaml
name: Test Combined Stack

on:
  workflow_dispatch:

jobs:
  smoke-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install DMTOOLS
        run: npm install -g dmtools

      - name: Install Claude Code CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Fetch ticket context with DMTOOLS
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          mkdir -p input/ATL-2
          dmtools jira_get_ticket ATL-2 summary,description,status > input/ATL-2/ticket.json
          echo "Ticket context fetched:"
          cat input/ATL-2/ticket.json

      - name: Run Claude on ticket context
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          mkdir -p outputs
          claude -p "Read input/ATL-2/ticket.json and write a one-paragraph summary to outputs/response.md. Only write the file, nothing else." --dangerously-skip-permissions
          echo "Claude output:"
          cat outputs/response.md

      - name: Post result as Jira comment
        env:
          JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
          JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          RESPONSE=$(cat outputs/response.md)
          dmtools jira_post_comment ATL-2 "CI Smoke Test: ${RESPONSE}"
```

**PASS:** ATL-2 gets a comment with Claude's summary. **The entire pipeline works end-to-end.**

**After all blockers pass:** Delete these test workflow files (or keep them for reference). Move to Step 1.

---

## STEP 1: Create the AI Teammate GitHub Actions Workflow

This is the main workflow file that runs on cron and manual dispatch.

**File:** `.github/workflows/ai-teammate.yml`

```yaml
name: AI Teammate

on:
  schedule:
    # Every 15 min, 8am-6pm UTC, Mon-Fri
    # Adjust timezone offset as needed
    - cron: '*/15 8-18 * * 1-5'
  workflow_dispatch:
    inputs:
      ticket_key:
        description: 'Specific ticket key (leave empty to poll JQL)'
        required: false
        type: string

env:
  JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
  JIRA_EMAIL: ${{ secrets.JIRA_EMAIL }}
  JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
  ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}

jobs:
  process-ticket:
    runs-on: ubuntu-latest
    timeout-minutes: 30

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
        run: npm install -g dmtools

      - name: Install Claude Code CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Select ticket
        id: select-ticket
        run: |
          if [ -n "${{ inputs.ticket_key }}" ]; then
            echo "ticket_key=${{ inputs.ticket_key }}" >> $GITHUB_OUTPUT
            echo "Selected manually: ${{ inputs.ticket_key }}"
          else
            # Poll JQL for AI-labeled tickets, priority ordered
            RESULT=$(dmtools jira_search_by_jql \
              "assignee = currentUser() AND labels in ('AI', 'AI-Review') ORDER BY priority DESC, created ASC" \
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
          TICKET=${{ steps.select-ticket.outputs.ticket_key }}
          mkdir -p input/$TICKET

          # Fetch ticket with context depth 1 (ticket + children)
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
          if echo "$LABELS" | grep -q "AI-Review"; then
            echo "review" > input/$TICKET/task_type.txt
          else
            ISSUE_TYPE=$(cat input/$TICKET/ticket.json | jq -r '.fields.issuetype.name')
            case "$ISSUE_TYPE" in
              Bug|Story) echo "code" > input/$TICKET/task_type.txt ;;
              Task|Analysis) echo "analysis" > input/$TICKET/task_type.txt ;;
              *) echo "analysis" > input/$TICKET/task_type.txt ;;
            esac
          fi

          echo "Task type: $(cat input/$TICKET/task_type.txt)"

      - name: Run Claude Code
        if: steps.select-ticket.outputs.found != 'false'
        run: |
          TICKET=${{ steps.select-ticket.outputs.ticket_key }}
          TASK_TYPE=$(cat input/$TICKET/task_type.txt)
          mkdir -p outputs

          # Load the appropriate agent config
          CONFIG_FILE="agents/${TASK_TYPE}.json"
          if [ ! -f "$CONFIG_FILE" ]; then
            CONFIG_FILE="agents/default.json"
          fi

          # Build prompt from agent config
          PROMPT=$(node scripts/build-claude-prompt.js "$CONFIG_FILE" "$TICKET")

          # Run Claude Code headless
          claude -p "$PROMPT" --dangerously-skip-permissions

      - name: Route output
        if: steps.select-ticket.outputs.found != 'false'
        run: |
          TICKET=${{ steps.select-ticket.outputs.ticket_key }}
          TASK_TYPE=$(cat input/$TICKET/task_type.txt)

          case "$TASK_TYPE" in
            analysis)
              # Post analysis as Jira comment
              RESPONSE=$(cat outputs/response.md)
              dmtools jira_post_comment $TICKET "$RESPONSE"
              dmtools jira_remove_label $TICKET "AI"
              dmtools jira_add_label $TICKET "ai_processed"
              echo "Posted analysis comment to $TICKET"
              ;;
            code|review)
              # Run postJSAction to handle git + PR
              node agents/postActions/developTicketAndCreatePR.js $TICKET
              ;;
          esac
```

**Note:** This is a starting scaffold. You'll refine the DMTOOLS commands, jq parsing, and prompt building as you test. The exact CLI syntax depends on your DMTOOLS fork's API.

---

## STEP 2: Create the Prompt Builder Script

This script reads an agent JSON config and builds the prompt for Claude Code CLI.

**File:** `scripts/build-claude-prompt.js`

```javascript
const fs = require('fs');
const path = require('path');

const configPath = process.argv[2];
const ticketKey = process.argv[3];

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const params = config.params.agentParams;

// Read ticket context
const ticketData = fs.readFileSync(`input/${ticketKey}/ticket.json`, 'utf8');
const childrenData = fs.readFileSync(`input/${ticketKey}/children.json`, 'utf8');

let prompt = `You are: ${params.aiRole}\n\n`;
prompt += `## Ticket Context\n\n`;
prompt += `${ticketData}\n\n`;
prompt += `## Child Tickets\n\n`;
prompt += `${childrenData}\n\n`;
prompt += `## Instructions\n\n`;
prompt += params.instructions.join('\n');
prompt += `\n\n## Formatting Rules\n\n${params.formattingRules || 'Markdown'}`;
prompt += `\n\n## Known Info\n\n${params.knownInfo || 'None'}`;
prompt += `\n\n## Output\n\nWrite your complete response to outputs/response.md`;
prompt += `\nDO NOT create git branches, commit, or push code.`;
prompt += `\nIf you need more Jira data, use: dmtools jira_get_ticket TICKET-KEY fields`;
prompt += `\nIf you need to search Jira, use: dmtools jira_search_by_jql "JQL" "fields"`;

process.stdout.write(prompt);
```

---

## STEP 3: Create Agent Config Files

### 3.1 Analysis Agent

**File:** `agents/analysis.json`

```json
{
  "name": "Teammate",
  "params": {
    "agentParams": {
      "aiRole": "Senior Technical Analyst",
      "instructions": [
        "Read ticket details from input/ folder",
        "Analyze requirements, constraints, and acceptance criteria",
        "If child tickets exist, incorporate their context",
        "Produce a structured analysis covering:",
        "  - Requirements summary",
        "  - Technical approach options",
        "  - Risks and open questions",
        "  - Recommended next steps",
        "Write output to outputs/response.md",
        "DO NOT create branches or push code"
      ],
      "formattingRules": "Markdown with sections: ## Summary, ## Approach Options, ## Risks, ## Recommendations",
      "knownInfo": ""
    },
    "outputType": "comment"
  },
  "metadata": {
    "version": "1.0",
    "description": "Analyze ticket and post structured analysis as Jira comment"
  }
}
```

### 3.2 Code Development Agent

**File:** `agents/code.json`

```json
{
  "name": "Teammate",
  "params": {
    "agentParams": {
      "aiRole": "Senior Software Engineer",
      "instructions": [
        "Read ticket details from input/ folder",
        "Analyze requirements and acceptance criteria",
        "Read existing codebase to understand patterns and architecture",
        "Follow project conventions from CLAUDE.md and _bmad/ rules",
        "Implement code changes:",
        "  - Source code following existing architecture patterns",
        "  - Unit tests with good coverage",
        "  - Documentation ONLY if explicitly required",
        "DO NOT create git branches, commit, or push code",
        "Write development summary to outputs/response.md:",
        "  - ## Approach: Design decisions made",
        "  - ## Files Modified: List with explanations",
        "  - ## Test Coverage: Tests created and what they cover",
        "  - ## Issues/Notes: Problems or incomplete work"
      ],
      "formattingRules": "Markdown with sections: ## Approach, ## Files Modified, ## Test Coverage, ## Issues/Notes",
      "knownInfo": ""
    },
    "outputType": "none",
    "postJSAction": "agents/postActions/developTicketAndCreatePR.js"
  },
  "metadata": {
    "version": "1.0",
    "description": "Implement ticket requirements and prepare for PR creation"
  }
}
```

### 3.3 Review Fix Agent

**File:** `agents/review.json`

```json
{
  "name": "Teammate",
  "params": {
    "agentParams": {
      "aiRole": "Senior Software Engineer",
      "instructions": [
        "Read ticket details from input/ folder",
        "Read PR review comments from input/TICKET/pr_review.json",
        "Understand what changes were requested in the review",
        "Read the existing code that was already implemented",
        "Make the requested changes following review feedback exactly",
        "DO NOT create git branches, commit, or push code",
        "Write summary of changes to outputs/response.md:",
        "  - ## Review Feedback Addressed",
        "  - ## Changes Made",
        "  - ## Notes for Reviewer"
      ],
      "formattingRules": "Markdown",
      "knownInfo": ""
    },
    "outputType": "none",
    "postJSAction": "agents/postActions/updatePRFromReview.js"
  },
  "metadata": {
    "version": "1.0",
    "description": "Address PR review feedback and update existing PR"
  }
}
```

### 3.4 Default Fallback Agent

**File:** `agents/default.json`

```json
{
  "name": "Teammate",
  "params": {
    "agentParams": {
      "aiRole": "Senior Technical Analyst",
      "instructions": [
        "Read ticket details from input/ folder",
        "Determine what this ticket needs based on its type and description",
        "Produce a helpful analysis or initial approach",
        "Write output to outputs/response.md",
        "DO NOT create branches or push code"
      ],
      "formattingRules": "Markdown",
      "knownInfo": ""
    },
    "outputType": "comment"
  },
  "metadata": {
    "version": "1.0",
    "description": "Fallback agent for unrecognized ticket types"
  }
}
```

---

## STEP 4: Create PostJS Actions

### 4.1 Develop and Create PR

**File:** `agents/postActions/developTicketAndCreatePR.js`

Adapt from DMTOOLS's `developTicketAndCreatePR.js` (you already have this in your reference docs). Key modifications:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

const ticketKey = process.argv[2];

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

try {
  // Read ticket summary for branch name and commit message
  const ticket = JSON.parse(fs.readFileSync(`input/${ticketKey}/ticket.json`, 'utf8'));
  const summary = ticket.fields?.summary || ticketKey;

  // Configure git
  run('git config user.name "AI Teammate"');
  run('git config user.email "ai-teammate@noreply.github.com"');

  // Create branch
  const branchName = `feature/${ticketKey}`;
  run(`git checkout -b ${branchName}`);

  // Stage changes (exclude input/ and outputs/ folders)
  run('git add --all -- ":!input/" ":!outputs/"');

  // Check if there are changes
  const status = run('git status --porcelain');
  if (!status) {
    console.log('No code changes to commit. Posting analysis only.');
    const response = fs.readFileSync('outputs/response.md', 'utf8');
    run(`dmtools jira_post_comment ${ticketKey} "${response.replace(/"/g, '\\"')}"`);
    run(`dmtools jira_remove_label ${ticketKey} "AI"`);
    run(`dmtools jira_add_label ${ticketKey} "ai_processed"`);
    process.exit(0);
  }

  // Commit and push
  const commitMsg = `${ticketKey} ${summary}`;
  run(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`);
  run(`git push -u origin ${branchName}`);

  // Create PR
  const prOutput = run(
    `gh pr create --title "${commitMsg.replace(/"/g, '\\"')}" --body-file outputs/response.md --base main`
  );

  const prUrl = prOutput.match(/https:\/\/github\.com\/[^\s]+/)?.[0] || '';

  // Post comment to Jira
  const comment = [
    'h3. *AI Teammate: Development Completed*',
    '',
    `*Branch:* {code}${branchName}{code}`,
    prUrl ? `*Pull Request:* ${prUrl}` : '',
    '',
    'Ready for review. Merge PR to approve.'
  ].join('\n');

  run(`dmtools jira_post_comment ${ticketKey} "${comment.replace(/"/g, '\\"')}"`);

  // Update labels
  run(`dmtools jira_remove_label ${ticketKey} "AI"`);
  run(`dmtools jira_add_label ${ticketKey} "ai_processed"`);

  console.log(`Done. PR: ${prUrl}`);

} catch (error) {
  console.error('Error:', error.message);

  // Post failure comment to Jira
  try {
    run(`dmtools jira_post_comment ${ticketKey} "AI Teammate failed: ${error.message.replace(/"/g, '\\"')}"`);
    run(`dmtools jira_remove_label ${ticketKey} "AI"`);
    run(`dmtools jira_add_label ${ticketKey} "ai_failed"`);
  } catch (e) {
    console.error('Failed to post error to Jira:', e.message);
  }

  process.exit(1);
}
```

### 4.2 Update PR from Review

**File:** `agents/postActions/updatePRFromReview.js`

```javascript
const { execSync } = require('child_process');
const fs = require('fs');

const ticketKey = process.argv[2];

function run(cmd) {
  console.log(`> ${cmd}`);
  return execSync(cmd, { encoding: 'utf8' }).trim();
}

try {
  // Find existing PR branch
  const branchName = `feature/${ticketKey}`;

  // Checkout existing branch
  run(`git fetch origin ${branchName}`);
  run(`git checkout ${branchName}`);

  // Configure git
  run('git config user.name "AI Teammate"');
  run('git config user.email "ai-teammate@noreply.github.com"');

  // Stage changes
  run('git add --all -- ":!input/" ":!outputs/"');

  const status = run('git status --porcelain');
  if (!status) {
    console.log('No changes from review fix.');
    process.exit(0);
  }

  // Commit and push to existing branch (PR auto-updates)
  run(`git commit -m "${ticketKey} Address review feedback"`);
  run(`git push origin ${branchName}`);

  // Post comment to Jira
  run(`dmtools jira_post_comment ${ticketKey} "AI Teammate: Review feedback addressed. PR updated."`);

  // Update labels
  run(`dmtools jira_remove_label ${ticketKey} "AI-Review"`);
  run(`dmtools jira_add_label ${ticketKey} "ai_processed"`);

  console.log('PR updated from review feedback.');

} catch (error) {
  console.error('Error:', error.message);
  try {
    run(`dmtools jira_post_comment ${ticketKey} "AI Teammate review fix failed: ${error.message.replace(/"/g, '\\"')}"`);
  } catch (e) {
    console.error('Failed to post error:', e.message);
  }
  process.exit(1);
}
```

---

## STEP 5: Enhance Ticket Selection for AI-Review

The workflow in Step 1 needs extra context for review tasks. Add this to the "Fetch ticket context" step:

```bash
# If AI-Review, also fetch PR review comments
if [ "$TASK_TYPE" = "review" ]; then
  # Find the PR for this ticket's branch
  PR_URL=$(gh pr list --head "feature/$TICKET" --json url --jq '.[0].url' || echo "")

  if [ -n "$PR_URL" ]; then
    gh pr view "$PR_URL" --json reviews,comments \
      > input/$TICKET/pr_review.json
  fi
fi
```

---

## STEP 6: Test End-to-End on ATL Project

### 6.1 Test Analysis Flow

1. Open Jira, find a Task-type ticket (e.g. ATL-5)
2. Add label `AI`
3. Trigger manually:
   ```bash
   gh workflow run ai-teammate.yml
   ```
4. Watch the run:
   ```bash
   gh run watch
   ```
5. **Verify:** ATL-5 has a new analysis comment from AI Teammate
6. **Verify:** Label changed from `AI` to `ai_processed`

### 6.2 Test Code Flow

1. Find a Story or Bug ticket (e.g. ATL-8)
2. Add label `AI`
3. Trigger:
   ```bash
   gh workflow run ai-teammate.yml
   ```
4. **Verify:** PR created against main with code changes
5. **Verify:** Jira comment with PR link posted
6. **Verify:** Label changed to `ai_processed`

### 6.3 Test AI-Review Flow

1. On the PR from step 6.2, leave a review comment requesting a change
2. In Jira, change label on ATL-8 to `AI-Review`
3. Trigger:
   ```bash
   gh workflow run ai-teammate.yml
   ```
4. **Verify:** PR updated with new commit addressing feedback
5. **Verify:** Jira comment confirms review addressed
6. **Verify:** Label changed to `ai_processed`

### 6.4 Test Cron Polling

1. Add label `AI` to a ticket
2. Do NOT trigger manually
3. Wait for next cron cycle (up to 15 min)
4. **Verify:** Ticket processed automatically

### 6.5 Test Failure Handling

1. Add label `AI` to a ticket with minimal/empty description
2. Trigger and watch
3. **Verify:** Jira comment reports failure reason
4. **Verify:** Label changed to `ai_failed` (not stuck as `AI`)

---

## STEP 7: Iterate and Refine

After the first successful end-to-end run, refine based on what you learn:

- [ ] **Tune agent prompts** — The `instructions` in agent JSON configs will need several iterations based on real output quality
- [ ] **Adjust CLAUDE.md** — Add AI Teammate-specific rules if Claude behaves differently in CI vs local
- [ ] **Refine task type detection** — The simple issue-type-based detection may need JQL or label-based overrides
- [ ] **Monitor API costs** — Track Anthropic API usage after a week of cron runs
- [ ] **Add more label commands** — `AI-Analyze`, `AI-Design` when you need them, not before
- [ ] **Consider timeout handling** — What if Claude hangs? The 30-min `timeout-minutes` in the workflow is your safety net

---

## Quick Reference

### GitHub Secrets Required

| Secret | Value |
|--------|-------|
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `JIRA_BASE_URL` | `https://your-site.atlassian.net` |
| `JIRA_EMAIL` | Your Jira email |
| `JIRA_API_TOKEN` | From id.atlassian.com/manage-profile/security/api-tokens |

### Label Convention

| Label | Action | Output |
|-------|--------|--------|
| `AI` | Full processing (analysis or code based on ticket type) | Jira comment or PR |
| `AI-Review` | Fix code from PR review feedback | Updated PR |
| `ai_processed` | (System) Ticket was successfully processed | — |
| `ai_failed` | (System) Processing failed | Error comment on ticket |

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
```

### File Structure

```
your-repo/
├── .github/workflows/
│   └── ai-teammate.yml          # Main workflow
├── agents/
│   ├── analysis.json             # Analysis agent config
│   ├── code.json                 # Code development agent config
│   ├── review.json               # Review fix agent config
│   ├── default.json              # Fallback agent config
│   └── postActions/
│       ├── developTicketAndCreatePR.js
│       └── updatePRFromReview.js
├── scripts/
│   └── build-claude-prompt.js    # Prompt builder
├── input/                        # .gitignored — DMTOOLS ticket context
├── outputs/                      # .gitignored — Claude response
├── .claude/agents/               # Claude Code agent definitions
├── _bmad/                        # BMAD rules and workflows
└── CLAUDE.md                     # Orchestration kernel
```
