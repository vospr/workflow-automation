---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - 'brainstorming-session-2026-02-14.md'
  - 'vospr-dmtools-ai-teammate.txt'
session_topic: 'Phase 4 AI Teammate: technical architecture options for autonomous and semi-automated Jira-connected AI agent workflows'
session_goals: 'Map all viable technical solutions (beyond DMTOOLS); evaluate each through minute-by-minute iteration flow; compare fully autonomous vs semi-automated; select optimal approach for constraints (no Jira admin, Windows, Claude Pro, personal test Jira)'
selected_approach: 'ai-recommended'
techniques_used: ['Morphological Analysis', 'Role Playing (Operator Walkthrough)', 'Decision Tree Mapping']
ideas_generated: 52
context_file: 'brainstorming-session-2026-02-14.md'
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Andrey
**Date:** 2026-02-15

## Session Overview

**Topic:** Phase 4 AI Teammate: technical architecture options for autonomous and semi-automated Jira-connected AI agent workflows

**Goals:**
- Map all viable technical solutions for AI Teammate (not just DMTOOLS approach)
- Evaluate each through the lens of real minute-by-minute iteration flow
- Compare fully autonomous vs semi-automated flows
- Select the most optimal approach given constraints (no Jira admin, Windows, Claude Pro, personal test Jira)

### Context Guidance

_Building on Phase 1-3 architecture from 2026-02-14 session (MCP-first solo operator with DMTOOLS preprocessing). Reference implementation: DMTOOLS AI Teammate (JSON agent configs, Cursor agent runner, JS post-actions, GitHub Actions trigger). Phase 4 was explicitly deferred — now exploring it._

### Session Setup

_Session established with DMTOOLS AI Teammate documentation as reference implementation. Scope includes both fully autonomous and semi-automated flows. Focus on practical minute-by-minute iteration visualization for each approach._

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Multi-variable architecture decision requiring both systematic breadth and experiential depth

**Recommended Techniques:**
- **Morphological Analysis:** Map all architectural dimensions and systematically explore every viable combination for Phase 4
- **Role Playing (Operator Walkthrough):** Walk through top candidate architectures minute-by-minute as the real operator at the desk
- **Decision Tree Mapping:** Build structured decision paths from constraints to select the optimal architecture

## Technique Execution Results

### Technique 1: Morphological Analysis

**Interactive Focus:** 9 architectural dimensions explored with all options mapped

**Morphological Matrix:**

| # | Dimension | Selected Option | Key Rationale |
|---|-----------|----------------|---------------|
| 1 | Trigger Mechanism | Assign + Label "AI" (polled via JQL) | No Jira admin needed, explicit opt-in, reversible |
| 2 | Execution Environment | GitHub Actions runner | Autonomous when away, solo mode covers local |
| 3 | LLM Orchestrator | DMTOOLS + Claude Code CLI (E-modified) | DMTOOLS Jira plumbing + Claude brain, swap Cursor for Claude |
| 4 | Jira I/O Method | DMTOOLS prep + DMTOOLS CLI inside Claude | No MCP in CI, Claude calls dmtools CLI for extra data |
| 5 | Context Gathering | Repo + BMAD rules + progressive deepening | Depth 1 pre-fetch, CLAUDE.md inherent, deepen on demand |
| 6 | Autonomy Level | Autonomous with guardrails | Works independently, stops before irreversible actions |
| 7 | Output Delivery | Adaptive per task type, PR merge = approval | Analysis → Jira comment, code → PR, merge = green light |
| 8 | Code/Artifact Handling | Claude codes, postJSAction handles git | Claude focused on coding, JS handles branch/commit/push/PR |
| 9 | Scheduling / Batching | Priority-ordered, one at a time, every 15 min work hours | `*/15 8-18 * * 1-5`, cheap, predictable |

**52 Options Explored Across 9 Dimensions**

**Key Decisions Made:**
- **Label as command vocabulary:** `AI` = do the work, `AI-Review` = fix PR based on review feedback. Extensible to `AI-Analyze`, `AI-Design` later.
- **DMTOOLS role confirmed:** Jira context engine + output routing, NOT the AI brain. Claude Code CLI replaces Cursor Agent as the LLM orchestrator.
- **PR merge as approval gate:** The guardrail is GitHub-native — you merge to approve, postJSAction can watch for merge to transition Jira status.
- **No MCP in CI:** DMTOOLS CLI is the Jira interface in GitHub Actions. MCP stays for solo mode only.
- **Cron schedule:** `*/15 8-18 * * 1-5` — work hours only, no overnight surprises.

### Technique 2: Role Playing (Operator Walkthrough)

**Three scenarios walked through minute-by-minute:**

**Scenario A — Away Path (fully autonomous):**
- 9:27 AM: Label 3 tickets `AI`, walk to meeting
- 9:30 - 10:15 AM: Cron processes all 3 sequentially (analysis → Jira comment, code → PR)
- 11:30 AM: Return from meeting, review results, request change on one PR
- 11:35 AM: Re-label `AI-Review`, next cron picks it up, fixes code, updates PR
- 11:47 AM: Review, merge, done

**Scenario B — At the Desk, Quick Trigger:**
- 2:15 PM: Solo mode — architecture thinking, create 3 subtasks
- 2:36 PM: Label 2 subtasks `AI`, trigger immediately via `gh workflow run`
- 2:37 - 3:10 PM: You work on docs locally while AI implements in parallel
- 3:10 PM: Review both PRs, merge, story complete in under an hour

**Scenario C — Handoff Mid-Work:**
- 3:30 PM: Start refactoring in solo mode
- 3:50 PM: Hit tedious part (14 test files), create subtask, label `AI`, trigger
- 4:05 PM: Merge AI's test PR into your feature branch, all green

**Timing Reality:**

| Scenario | Wall-clock | Your active time | AI time | Parallel? |
|----------|-----------|------------------|---------|-----------|
| A: Away | ~45 min / 3 tickets | 3 min (labeling) | ~30 min | No — sequential |
| B: Quick trigger | ~55 min / 3 subtasks | ~35 min | ~20 min | Yes |
| C: Handoff | ~35 min total | ~25 min | ~15 min | Sequential handoff |

### Technique 3: Decision Tree Mapping

**Implementation Decision Tree:**

**Pre-flight Blockers (Validate First):**

| # | Blocker | Validation | Time |
|---|---------|-----------|------|
| 1 | DMTOOLS installs in GitHub Actions Ubuntu runner | Minimal workflow: `dmtools --version` | 10 min |
| 2 | Claude Code CLI runs headless in CI | Minimal workflow: `claude -p "say hello"` | 10 min |
| 3 | Anthropic API key | Sign up at console.anthropic.com | 5 min |

**Build Order (after blockers pass):**

```
Step 1: GitHub Actions workflow file
├─ Cron trigger: */15 8-18 * * 1-5
├─ Manual trigger: workflow_dispatch
├─ Install DMTOOLS in runner
├─ Install Claude Code CLI in runner
└─ Wire up secrets (ANTHROPIC_API_KEY, JIRA creds)

Step 2: JQL polling + ticket selection logic
├─ Query: assignee + labels in (AI, AI-Review)
├─ Pick highest priority
└─ Determine task type from ticket fields

Step 3: Agent configs (JSON files)
├─ story_analysis.json (outputType: comment)
├─ story_development.json (outputType: none + postJSAction)
├─ review_fix.json (reads PR comments, updates code)
└─ Replace run-cursor-agent.sh with run-claude-agent.sh

Step 4: run-claude-agent.sh
├─ Receives task prompt from DMTOOLS
├─ Calls: claude -p "prompt" --dangerously-skip-permissions
├─ Claude reads input/, writes outputs/response.md
└─ Exits, DMTOOLS routes output

Step 5: postJSActions
├─ developTicketAndCreatePR.js (reuse from DMTOOLS, adapt)
├─ Label management (remove AI, add AI_PROCESSED)
└─ Jira comment posting

Step 6: Test on ATL project
├─ Label ATL-2 as AI
├─ Watch GitHub Actions run
├─ Verify: Jira comment or PR created
└─ Test AI-Review cycle
```

## Session Summary and Insights

**Key Achievements:**
- Mapped 9 architectural dimensions with 52 total options explored
- Selected a coherent architecture: DMTOOLS context engine + Claude Code brain + GitHub Actions runner
- Walked through 3 real-world scenarios minute-by-minute, validating the architecture feels practical
- Built a 6-step implementation plan with 3 pre-flight blocker validations
- Discovered the "label as command vocabulary" pattern (AI, AI-Review) — extensible and requires zero Jira admin

**Architecture Decision Record:**

```
Trigger:          Assign to me + Label "AI" (polled via JQL every 15 min, work hours)
Runner:           GitHub Actions (cron + manual dispatch)
Brain:            Claude Code CLI (headless, --dangerously-skip-permissions)
Jira Engine:      DMTOOLS (context prep, output routing, postJSActions)
Jira I/O in CI:   DMTOOLS CLI (no MCP in GitHub Actions)
Context:          ticketContextDepth: 1 + repo CLAUDE.md/BMAD + progressive deepening via dmtools CLI
Autonomy:         Autonomous with guardrails — PR merge = approval
Output:           Adaptive — analysis → Jira comment, code → PR + Jira comment
Git:              Claude codes only, postJSAction handles branch/commit/push/PR
Scheduling:       One at a time, priority-ordered, */15 8-18 * * 1-5
Labels:           AI = work, AI-Review = fix from PR feedback
Quick trigger:    gh workflow run ai-teammate.yml (skip cron when at desk)
```

**Relationship to Phase 1 (Solo Mode):**
- Phase 1 (local, MCP, manual) and Phase 4 (GitHub Actions, DMTOOLS, autonomous) are complementary, not competing
- Same repo, same CLAUDE.md, same BMAD rules — the "brain" is identical
- Solo mode = at the desk, interactive. AI Teammate = away or parallel, autonomous.
- You choose per-ticket: work it yourself or label it for AI.

**Prerequisites Before Building:**
1. Anthropic API key (console.anthropic.com)
2. Validate DMTOOLS in GitHub Actions runner
3. Validate Claude Code CLI in GitHub Actions runner

**Session Statistics:**
- 52 options explored across 9 dimensions
- 3 techniques applied (Morphological Analysis, Role Playing, Decision Tree Mapping)
- 3 scenarios walked through minute-by-minute
- 6-step implementation plan with dependency ordering
- 3 pre-flight blockers identified
