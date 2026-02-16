---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - 'Idea for brainstorming and realizat.txt'
  - 'DMTOOLS_BMAD_prerequisites.txt'
  - 'istin-dmtools.txt'
  - 'dmtools.txt'
  - 'Case_1.txt'
  - 'DMTOOLS_BMAD_Integration_Scenarios.md'
  - 'automation-rule.json'
  - 'ai-teammate.yml'
session_topic: 'Jira-LLM workflow automation architecture and implementation strategy for EPAM AI engineer projects'
session_goals: 'Clarify architecture for solo + AI teammate scenarios; decide Jira connectivity approach (DMTOOLS vs open-source MCP); prioritize Jira read/write first; plan LLM switching strategy'
selected_approach: 'ai-recommended'
techniques_used: ['Morphological Analysis', 'Six Thinking Hats', 'Constraint Mapping']
ideas_generated: 36
context_file: 'Idea for brainstorming and realizat.txt'
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Andrey
**Date:** 2026-02-14

## Session Overview

**Topic:** Jira-LLM workflow automation architecture and implementation strategy for EPAM AI engineer projects

**Goals:**
- Clarify the architecture for both scenarios (solo mode + AI teammate mode)
- Decide on Jira connectivity approach (DMTOOLS MCP vs. open-source MCP)
- Prioritize Jira connectivity (read/write) as the first deliverable
- Plan strategy for quickly switching between personal and client LLM stacks

### Context Guidance

_Loaded from project files: idea document, DMTOOLS repository analysis (152 MCP tools, 52 Jira tools), BMAD-METHOD framework, Claude Template (context engineering), Case_1 transcript (end-to-end AI Teammate demo), integration scenarios (3 handoff patterns), Jira automation rule, GitHub Actions workflow._

_Key constraints: No Jira admin rights (standard user). Personal test Jira space "AI Teammate Learning" (ATL-1..ATL-31). Forked repos for both DMTOOLS and BMAD. Tools evolving continuously - reinstall from original repos each time._

### Session Setup

_Session established with comprehensive project context loaded via 5 parallel research agents. Focus areas: architecture decisions, Jira connectivity priority, LLM portability, and phased rollout (solo first, then AI teammate)._

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Multi-variable architecture decision with strategic planning needs

**Recommended Techniques:**
- **Morphological Analysis:** Map all architectural dimensions and systematically explore combinations
- **Six Thinking Hats:** Stress-test the chosen architecture from 6 distinct perspectives
- **Constraint Mapping:** Separate hard from soft constraints to define the MVP boundary

## Technique Execution Results

### Technique 1: Morphological Analysis

**Interactive Focus:** 6 architectural dimensions explored with all options mapped

**Morphological Matrix:**

| Dimension | Selected Option | Alternatives Considered |
|-----------|----------------|------------------------|
| Jira Connection | MCP-first, DMTOOLS-on-demand | DMTOOLS-only, Direct REST API, Hybrid equal partners |
| LLM Provider | Claude (personal Pro) | Gemini, Client LLM, Ollama |
| Execution Env | Local terminal (VS Code) | GitHub Actions, Client CI/CD, DMTOOLS server |
| Communication | Terminal CLI | Jira comments (Phase 2), Hybrid, Slack/Teams |
| Context Mgmt | CLAUDE.md + file artifacts | DMTOOLS configs, Jira fields, Hybrid |
| Trigger | Manual | Jira automation (Phase 2), Webhook, Scheduled |

**Key Decisions Made:**
- **Scenario A (Phase 1):** Solo operator -- MCP-first + Claude + local terminal + CLI + CLAUDE.md + manual trigger
- **Scenario B (Phase 2):** AI Teammate -- deferred until Phase 1 fully realized
- **DMTOOLS role:** Preprocessing engine for bulk data extraction, NOT an AI orchestrator
- **Jira split:** MCP for real-time lightweight reads/writes; DMTOOLS for batch extraction, attachments, large history
- **Client isolation:** Per-client folder with own `.claude/` config, credentials, and artifacts
- **Visibility:** Invisible AI partner (client sees normal human work)
- **LLM portability:** Via artifact format (markdown files are LLM-agnostic), not tool switching

**36 Ideas Generated Across 10 Domains:**

**Architecture Ideas (11):**
1. Solo Operator with Hybrid Jira
2. MCP-First, DMTOOLS-on-Demand
3. MCP-Only Until Proven Insufficient
4. MCP-First with Manual Escalation (SELECTED)
5. Per-Client Folder Isolation (SELECTED)
6. Jira Context Extraction Pattern -- Hybrid (SELECTED)
7. Per-Client Starter Kit Template
8. DMTOOLS as Preprocessing Engine (SELECTED)
9. Token Budget Architecture (>5000 tokens = preprocess)
10. Minimal DMTOOLS Installation (5 CLI tools out of 152)
11. Two-Stage Preprocessing Pipeline (DMTOOLS raw -> Claude brief)

**Workflow Ideas (5):**
1. The Invisible AI Partner (SELECTED for Phase 1)
2. The Transparent AI Augmentation (option for clients who are open)
3. Hybrid Context Extraction Flow (SELECTED)
4. The Daily Operator Loop
5. New Client Onboarding in 15 Minutes

**Client Onboarding (3):**
1. Zero-Setup Client Demo (use YOUR test Jira first)
2. Credential Handoff Protocol (3 things: URL, email, API token)
3. Client Repository Integration Options (dual-repo vs gitignore isolation)

**Failure Modes & Risks (4):**
1. MCP Rate Limiting -- mitigated by context extraction pattern
2. Large Attachments Blindspot -- escalate to DMTOOLS or Claude PDF reader
3. Stale Context Trap -- timestamp metadata + freshness check
4. Credential Leakage -- per-folder isolation, never global env vars

**LLM Portability (3):**
1. Claude-Default, Client-LLM-Optional
2. DMTOOLS as LLM Abstraction Layer (for client LLM)
3. Prompt Portability via BMAD Artifacts (SELECTED)

**Git Workflow (3):**
1. Dual-Repo Pattern (toolkit + client code)
2. Single-Repo with .gitignore Isolation
3. Toolkit as Git Submodule

**BMAD Integration (3):**
1. BMAD as Session Wrapper (strategic mode, not always-on)
2. BMAD Workflows Fed by Jira Context
3. Selective BMAD Agent Installation per client type

**Security (3):**
1. Layered .gitignore Defense (3 layers)
2. Credential Rotation Reminder (90-day timestamp)
3. No Credentials in DMTOOLS Config (env vars only)

**Scaling (2):**
1. Parallel Client Work via Terminal Tabs
2. Client Priority Queue (cross-client dashboard)

**Knowledge Transfer (3):**
1. Cross-Client Pattern Library
2. CLAUDE.md Evolution Per Client Type (greenfield/brownfield/demo)
3. Personal Memory System Across Projects

### Technique 2: Six Thinking Hats

**Evaluation of "MCP-First Solo Operator with DMTOOLS Preprocessing":**

| Hat | Key Finding |
|-----|-------------|
| **WHITE (Facts)** | MCP Atlassian plugin working. DMTOOLS installable. Test Jira available. Gaps: rate limits unknown, attachment access untested, DMTOOLS on Windows untested |
| **RED (Gut)** | Architecture feels right-sized. MCP-first feels safe. Invisible AI feels politically smart. Nervousness: gap between test Jira and real client Jira |
| **YELLOW (Benefits)** | 15-min client onboarding. Zero client-side requirements. Token-efficient. Compounds over time. Clean exit. Natural Phase 2 path. Sellable demo |
| **BLACK (Risks)** | MCP plugin instability. Client Jira weirdness (custom fields, permissions). DMTOOLS on Windows. Stale context at scale. Invisible AI policy limits |
| **GREEN (Creative)** | MCP wrapper script (auto-save to context/). Context health dashboard. MCP capability probe per client. DMTOOLS Docker container |
| **BLUE (Process)** | MVP = 5 Jira operations demo. Build order: MCP connectivity -> extraction pattern -> starter-kit template |

### Technique 3: Constraint Mapping

**Hard Constraints (Immovable):**
- H1: No Jira admin rights on client projects
- H2: Client LLM stack unknown until arrival
- H3: Data leaves client Jira via API (policy risk)
- H4: Windows 11 development machine
- H5: Claude Pro token limits
- H6: Client repo access varies

**Soft Constraints (Workaround Exists):**
- S1: DMTOOLS on Windows -- Docker container solves it
- S2: MCP custom fields -- REST API v3 supports them, needs probe test
- S3: Can't create Jira automation on client -- not needed for Phase 1
- S4: Tools evolve -- pin versions, install from YOUR fork
- S5: Per-client setup overhead -- starter-kit template, 15 min
- S6: Client data to Claude API -- per-client policy check, Ollama fallback
- S7: Attachments need DMTOOLS -- Claude reads PDFs natively, needs test

**Questionable (Need Verification):**
- Q1: MCP Jira rate limits (burst test needed)
- Q2: MCP attachment download capability
- Q3: MCP write capabilities (subtasks, formatting, transitions)
- Q4: DMTOOLS CLI on Windows
- Q5: Token cost comparison: MCP reads vs file reads

## Idea Organization and Prioritization

### Architecture Decision Record

**Decision: MCP-First Solo Operator with DMTOOLS Preprocessing**

```
Jira Connection:  MCP Atlassian plugin (primary) + DMTOOLS CLI (bulk extraction)
LLM:              Claude Pro (personal) | Client LLM via DMTOOLS when required
Execution:        Local VS Code terminal with Claude Code
Communication:    Terminal CLI (Phase 1) | Jira comments via AI Teammate (Phase 2)
Context:          CLAUDE.md + planning-artifacts/ + context/ folder
Trigger:          Manual (Phase 1) | Jira automation rules (Phase 2)
Client Isolation:  Per-client folder with own .claude/ config and credentials
DMTOOLS Role:     Preprocessing engine -- bulk extraction, attachments, history
BMAD Role:        Strategic mode for substantial work (PRDs, architecture, planning)
Visibility:       Invisible AI partner to client
LLM Portability:  Via markdown artifacts (LLM-agnostic format)
```

## Step-by-Step Implementation Guide

---

### PHASE 0: Zero Additional Setup (Do Right Now -- 10 min)

_Everything here works with what you already have configured._

**Step 0.1: Verify MCP Atlassian Connection**
- Open Claude Code in VS Code terminal (this project)
- Ask Claude: "Use MCP to list my Jira projects"
- Confirm you see the ATL project in results
- Expected: immediate response with project list

**Step 0.2: Read a Test Ticket**
- Ask Claude: "Read Jira ticket ATL-2 including description, status, and subtasks"
- Verify all fields return correctly
- Check: does it show subtasks? Custom fields? Labels?

**Step 0.3: Post a Test Comment**
- Ask Claude: "Post a comment on ATL-2: 'MCP connectivity test -- please ignore'"
- Open ATL-2 in browser, verify comment appears
- Confirm it shows as YOUR user, not a bot

**Step 0.4: Search by JQL**
- Ask Claude: "Search Jira with JQL: project = ATL AND assignee = currentUser() ORDER BY created DESC"
- Verify results match your assigned tickets

**Step 0.5: Read Confluence Page**
- Ask Claude: "Search Confluence for pages in the AI Teammate Learning space"
- Verify Confluence connectivity works alongside Jira

**Checkpoint:** If all 5 steps work, your entire Phase 1 foundation is validated. MCP reads, writes, searches, and connects to both Jira and Confluence. You can stop here and already have a working AI-augmented Jira workflow.

---

### PHASE 1: Test Session -- Validate Architecture Assumptions (30 min)

_Run the MCP Capability Probe and DMTOOLS smoke test._

**Step 1.1: MCP Rate Limit Test**
- Ask Claude to read 10 different ATL tickets in rapid succession
- Then search by JQL 5 times with different queries
- Monitor: do any calls fail? Slow down? Return errors?
- Document: approximate rate limit threshold

**Step 1.2: MCP Attachment Test**
- Find or create an ATL ticket with a PDF or image attachment
- Ask Claude: "List attachments on ATL-{X}"
- Ask Claude: "Download and read the attachment from ATL-{X}"
- Document: can MCP access attachment content? Or only metadata?

**Step 1.3: MCP Write Capabilities Test**
- Create a subtask: "Create a subtask under ATL-2 with summary 'Test subtask from MCP'"
- Transition status: "Move ATL-{test} to In Progress"
- Update a field: "Add label 'mcp-test' to ATL-{test}"
- Document: which write operations work, which fail, which need specific field formats

**Step 1.4: Token Cost Measurement**
- Read ATL-2 with full details via MCP -- note approximate token usage
- Save that same content to a file `context/test-atl2.md`
- In a new message, ask Claude to read the file -- note token usage
- Compare: what's the token overhead of MCP vs file read?

**Step 1.5: DMTOOLS CLI Smoke Test on Windows**
- Install DMTOOLS: open PowerShell, run the Windows install command from README
- Verify: `dmtools --version` and `dmtools list`
- Test: `dmtools jira_get_ticket ATL-2 summary,description,status`
- If fails: test via Docker: `docker run -e JIRA_BASE_PATH=... dmtools jira_get_ticket ATL-2`
- Document: Windows native works / Docker needed / both fail

**Step 1.6: DMTOOLS Batch Extraction Test**
- Run: `dmtools jira_search_by_jql "project = ATL ORDER BY created" "summary,status,assignee"`
- Redirect output to file: `> context/raw/atl-all-tickets.json`
- Ask Claude: "Read context/raw/atl-all-tickets.json and create a structured brief in context/task-brief-ATL-project.md"
- Validate: the two-stage pipeline (DMTOOLS extracts -> Claude summarizes) works end-to-end

**Checkpoint:** You now know exactly what MCP can and cannot do, whether DMTOOLS runs on your machine, and whether the preprocessing pipeline works. All questionable constraints (Q1-Q5) are resolved.

---

### PHASE 2: One-Time Setup -- Build the Starter Kit (1 hour)

_Create the reusable template that makes every future client onboarding take 15 minutes._

**Step 2.1: Create Starter Kit Folder Structure (10 min)**

```
workflow-automation-template/
  .claude/
    agents/          # Copy from Claude Template (researcher, planner, architect, etc.)
    skills/          # Copy from Claude Template
    settings.json    # Pre-commit hooks for secret detection
  _bmad/
    core/            # Install from latest BMAD-METHOD repo
  context/
    raw/             # .gitignored -- ephemeral DMTOOLS output
    README.md        # "This folder holds Jira extraction context"
  planning-artifacts/
    README.md
  implementation-artifacts/
    README.md
  .env.local         # .gitignored -- client credentials placeholder
  .env.example        # Template with placeholder values (committed)
  .gitignore          # Blocks .env*, context/raw/, credentials, secrets
  CLAUDE.md           # Orchestration kernel (adapted from current template)
  init.ps1            # PowerShell init script (Step 2.2)
  README.md           # "How to use this toolkit" for your reference
```

**Step 2.2: Write the Init Script (15 min)**

Create `init.ps1` (PowerShell for Windows):
```
# Prompts for: client name, Jira URL, email, API token
# Creates .env.local with credentials
# Updates .claude/ MCP config to point to client Jira
# Runs git init if not already a repo
# Runs a quick MCP test: read one ticket
# Prints: "Ready! Try: ask Claude to read your Jira tickets"
```

**Step 2.3: Adapt CLAUDE.md for Solo Operator Mode (15 min)**

Modify the orchestration kernel for Phase 1 workflow:
- Remove AI Teammate references
- Add Jira context extraction as first step in dispatch loop
- Add DMTOOLS escalation rule: "If data volume > 5000 tokens, use DMTOOLS CLI"
- Add per-session init: check credential freshness, verify MCP connection
- Define two modes: tactical (Claude + MCP) and strategic (BMAD workflows)

**Step 2.4: Create .env.example and Security Layers (10 min)**

`.env.example` (committed to repo):
```
# Client Jira Configuration
JIRA_BASE_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-api-token

# DMTOOLS (only needed for bulk extraction)
# Same credentials as above, used by DMTOOLS CLI

# Created: YYYY-MM-DD | Rotate by: +90 days
```

`.gitignore` additions:
```
.env.local
.env.*.local
context/raw/
*.key
credentials.*
secrets/
```

**Step 2.5: Test the Full Onboarding Flow (10 min)**

- Clone your starter-kit template to a new folder
- Run `init.ps1` with YOUR test Jira credentials (ATL project)
- Start Claude Code
- Ask: "Read my assigned Jira tickets"
- Ask: "Read ATL-2 and save context to planning-artifacts/"
- Ask: "Post a comment on ATL-2: setup validated"
- Time yourself. Target: under 15 minutes total.

**Checkpoint:** You now have a reusable, secure, tested template. Every future client engagement starts with: clone -> init -> work.

---

### PHASE 3: First Real Workflow (Next Work Session)

_Use the architecture on a real task from your ATL project._

**Step 3.1:** Pick a real task from ATL (e.g., ATL-5 or any substantial ticket)

**Step 3.2:** Run the full Daily Operator Loop:
- Read ticket + epic context via MCP
- Save structured brief to `context/task-brief-ATL-{X}.md`
- Analyze requirements with Claude
- Break into subtasks, create them in Jira via MCP
- Work on first subtask (code, docs, or analysis)
- Post status comment to Jira
- Commit work to git

**Step 3.3:** Document what worked, what was painful, what needs improvement

**Step 3.4:** If you hit the DMTOOLS threshold (big attachment, long history), test the escalation path live

---

### PHASE 4: Future -- AI Teammate (Deferred)

_Only after Phase 1-3 are solid and battle-tested on at least one client._

- Configure Jira automation rules (on YOUR test Jira first)
- Set up GitHub Actions workflow with DMTOOLS agents
- Implement comment-based communication loop
- Test end-to-end: assign ticket -> AI responds in Jira
- Adapt for client deployment (requires client Jira admin or their cooperation)

---

## Session Summary and Insights

**Key Achievements:**
- Resolved the DMTOOLS-vs-MCP dilemma: it's not either/or, it's MCP-first with DMTOOLS as preprocessing backup
- Defined a clear two-phase strategy: solo operator first, AI teammate second
- Identified that most perceived blockers are soft constraints with known workarounds
- Created a concrete 4-phase implementation plan with measurable checkpoints

**Architecture Breakthrough:**
DMTOOLS reframed from "alternative AI orchestrator" to "data preprocessing engine." This eliminates the complexity of managing two AI systems and lets Claude Code be the single orchestrator. DMTOOLS does what it's great at (bulk Jira extraction, attachment handling) without competing with Claude for the AI role.

**Fastest Path to Value:**
Phase 0 takes 10 minutes and validates the entire foundation. If MCP reads and writes Jira successfully, everything else is incremental improvement on a working system.

**Session Statistics:**
- 36 ideas generated across 10 domains
- 3 techniques applied (Morphological Analysis, Six Thinking Hats, Constraint Mapping)
- 6 hard constraints, 7 soft constraints, 5 questionable constraints mapped
- 4-phase implementation plan with step-by-step guide
