# DMTOOLS + BMAD-METHOD: Integration Scenarios
## Test-Presentation for Team

**Date:** February 3, 2026
**Audience:** Business Analysts, Product Owners, Tech Leads, Developers
**Constraint:** No source code modifications to either tool

---

## Executive Summary

**DMTOOLS** and **BMAD-METHOD** are complementary tools that address different phases and concerns of the software development lifecycle. By chaining them together through **file-based handoffs**, **Jira/Confluence as shared data stores**, and **shared MCP (Model Context Protocol) servers**, teams can build end-to-end automated workflows without modifying either tool's source code.

| Aspect | DMTOOLS | BMAD-METHOD |
|--------|---------|-------------|
| **Core Strength** | Enterprise tool automation (Jira, Confluence, Figma, ADO) | Structured agile planning & requirements decomposition |
| **Agent Focus** | Task execution (generate tests, reports, diagrams) | Role-based collaboration (PM, Architect, Developer, QA) |
| **Input** | JQL queries, Jira tickets, Confluence pages | Markdown files, project context, user conversations |
| **Output** | Jira tickets/fields/comments, files, reports | Markdown artifacts (PRD, architecture, epics, stories) |
| **Runs In** | CLI / REST API / GitHub Actions | IDE (Cursor, Claude Code, Windsurf) |
| **Who Uses It** | BA, QA, DevOps, Scrum Master | BA, PM, Architect, Developer |

**Key Insight:** DMTOOLS excels at **extracting data from** and **pushing data to** enterprise tools (Jira, Confluence). BMAD-METHOD excels at **structured thinking** - decomposing problems into briefs, PRDs, architecture, and stories. Together, they create a pipeline where DMTOOLS handles the enterprise integration layer and BMAD-METHOD handles the analytical/planning layer.

---

## Architecture Overview

### High-Level Integration Architecture

```
+------------------------------------------------------------------+
|                    INTEGRATION LAYER                              |
|                  (No code changes needed)                         |
+------------------------------------------------------------------+
|                                                                    |
|  +-----------------+    Handoff Mechanisms    +------------------+ |
|  |                 |                          |                  | |
|  |    DMTOOLS      |  1. File-based (MD/JSON) |  BMAD-METHOD    | |
|  |                 |  ───────────────────────> |                 | |
|  |  67+ MCP Tools  |                          |  21+ Agents     | |
|  |  23 Agent Configs|  2. Jira as shared store |  50+ Workflows  | |
|  |  20+ Jobs       |  <───────────────────────>|                 | |
|  |                 |                          |                  | |
|  |  Runs: CLI/API  |  3. Shared MCP servers   |  Runs: IDE      | |
|  |                 |  <───────────────────────>|                 | |
|  +-----------------+                          +------------------+ |
|         |                                            |             |
|         v                                            v             |
|  +-------------+  +-------------+  +----------------------------------+
|  | Jira/Xray   |  | Confluence  |  | Local Files (planning-artifacts/)|
|  | ADO         |  | Figma       |  | implementation-artifacts/        |
|  | GitHub      |  | Teams       |  | _bmad-output/                    |
|  +-------------+  +-------------+  +----------------------------------+
+------------------------------------------------------------------+
```

### Three Handoff Mechanisms (No Code Changes Required)

| # | Mechanism | How It Works | Who Does It |
|---|-----------|-------------|-------------|
| **1** | **File-based handoff** | DMTOOLS exports data to markdown/JSON files. BA opens IDE, loads files as context for BMAD agents. | BA manually or via script |
| **2** | **Jira as shared data store** | DMTOOLS writes structured data to Jira fields/comments. BMAD agents reference Jira content via copy-paste or MCP tools. | Automatic + BA |
| **3** | **Shared MCP servers** | Both tools support MCP. Configure the same Jira/Confluence MCP server for both DMTOOLS CLI and IDE (Cursor/Claude Code). | One-time setup by tech lead |

---

## Scenario 1: Legacy System Analysis for New Feature Development

### Use Case
A team inherits a legacy system with extensive Jira history and Confluence documentation. They need to plan a major new feature. The challenge: hundreds of Jira tickets and dozens of Confluence pages to analyze before writing a single line of requirements.

### Roles Involved
- **BA / Product Owner** - drives the process
- **Tech Lead** - reviews architecture output
- **Scrum Master** - uses final epics/stories for sprint planning

### Why Combine Tools Here

| Task | Without Integration | With Integration |
|------|-------------------|-----------------|
| Extract legacy context | Manually read 100+ tickets, summarize | DMTOOLS auto-extracts and structures |
| Analyze requirements | Start from scratch in documents | BMAD agents analyze extracted data |
| Create planning artifacts | Manual PRD writing | BMAD structured workflow with AI |
| Push results to Jira | Manual ticket creation | DMTOOLS auto-creates tickets |

### Step-by-Step Workflow

```
PHASE 1: EXTRACTION (DMTOOLS)                PHASE 2: ANALYSIS (BMAD)
================================             ================================

Step 1: Extract Jira Data                    Step 4: Create Product Brief
  dmtools run requirements.json               /create-product-brief
  - JQL: "project=LEGACY"                     - Input: extracted_context.md
  - Output: field or file                      - Agent: Analyst (Mary)
         |                                     - Output: product-brief.md
         v                                            |
Step 2: Extract Confluence Pages             Step 5: Create PRD
  dmtools confluence_search_content...         /create-prd
  - Input: space key, search text              - Input: product-brief.md
  - Output: markdown files                    - Agent: PM (John)
         |                                     - Output: prd.md
         v                                            |
Step 3: Generate Summary Report              Step 6: Create Architecture
  dmtools run expert_analysis.json             /create-architecture
  - AI summarizes extracted data               - Input: prd.md
  - Output: extracted_context.md               - Agent: Architect (Winston)
                                               - Output: architecture.md
                                                       |
                                              Step 7: Create Epics & Stories
                                                /create-epics-and-stories
                                                - Input: prd.md + architecture.md
                                                - Agent: PM (John)
                                                - Output: epics-and-stories.md


PHASE 3: PUSH BACK (DMTOOLS)
================================

Step 8: Create Jira Tickets from Epics
  dmtools run teammate.json
  - Input: epics-and-stories.md
  - postJSAction: creates Jira epics+stories
  - Output: Jira tickets with structured content
```

### Detailed Steps for a BA

**Phase 1 - DMTOOLS Extraction (CLI commands):**

```bash
# 1. Extract all stories from legacy project
dmtools jira_search_by_jql "project = LEGACY AND type = Story ORDER BY created DESC" \
  "summary,description,acceptance_criteria,comments"

# 2. Get Confluence documentation
dmtools confluence_search_content_by_text "LEGACY system architecture" "SPACE_KEY"

# 3. Run the Expert job to create a structured summary
dmtools run agents/expert_analysis.json
# Config: {"name":"Expert","params":{"inputJql":"project=LEGACY AND type in (Story,Epic)",
#   "ticketContextDepth":1, "outputType":"none"}}
# Copy the AI output to: planning-artifacts/extracted_context.md
```

**Phase 2 - BMAD Analysis (in IDE, e.g., Cursor or Claude Code):**

```
1. Open your project in IDE with BMAD installed
2. Copy extracted_context.md to planning-artifacts/
3. Invoke: /create-product-brief
   - Analyst agent reads extracted_context.md as reference
   - Interactively refines vision, problem statement, MVP scope
   - Output: planning-artifacts/product-brief.md

4. Invoke: /create-prd
   - PM agent reads product-brief.md
   - Creates personas, user journeys, requirements, success criteria
   - Output: planning-artifacts/prd.md

5. Invoke: /create-architecture
   - Architect agent reads prd.md
   - Defines tech stack, data models, API contracts
   - Output: planning-artifacts/architecture.md

6. Invoke: /create-epics-and-stories
   - PM agent reads prd.md + architecture.md
   - Creates prioritized epics with BDD acceptance criteria
   - Output: planning-artifacts/epics-and-stories.md
```

**Phase 3 - DMTOOLS Push Back:**

```bash
# Option A: Use Teammate agent with JS action to parse epics.md and create tickets
dmtools run agents/teammate_create_epics.json

# Option B: Manual ticket creation using MCP tools
dmtools jira_create_ticket_basic "NEWPROJ" "Epic" "User Authentication" \
  "As extracted from BMAD analysis..."
dmtools jira_create_ticket_basic "NEWPROJ" "Story" "Login with email" \
  "Given... When... Then..."
```

### Architecture Diagram - Scenario 1

```
+--------+     +-----------+     +------------------+     +----------+
|  Jira  | --> |  DMTOOLS  | --> |  Markdown Files  | --> |   BMAD   |
| (Legacy|     | Extract & |     | extracted_context|     | Analyst  |
| tickets|     | Summarize |     | .md              |     | PM       |
| & docs)|     +-----------+     +------------------+     | Architect|
+--------+                                                +----------+
                                                               |
                                                               v
+--------+     +-----------+     +------------------+     +----------+
|  Jira  | <-- |  DMTOOLS  | <-- | epics-and-       | <-- |   BMAD   |
| (New   |     | Create    |     | stories.md       |     | Output   |
| project|     | Tickets   |     | architecture.md  |     | Files    |
| tickets|     +-----------+     +------------------+     +----------+
+--------+
```

### Benefits
- **Time saved:** Extracting context from 100+ tickets manually takes days; DMTOOLS does it in minutes
- **Structured analysis:** BMAD agents follow proven agile methodology instead of ad-hoc analysis
- **Traceability:** Every artifact links back to source tickets
- **Non-technical:** BA drives the entire process using CLI commands and IDE slash commands

---

## Scenario 2: Requirements-to-Test-Cases Pipeline

### Use Case
A team uses BMAD-METHOD for structured requirements and planning, producing detailed PRDs and epics with BDD acceptance criteria. They need to generate comprehensive test cases in Jira/Xray from these structured requirements - without manually writing each test case.

### Roles Involved
- **BA / Product Owner** - creates requirements via BMAD
- **QA Engineer** - reviews generated test cases
- **Scrum Master** - tracks testing readiness

### Why Combine Tools Here

| Task | BMAD-METHOD Alone | DMTOOLS Alone | Combined |
|------|-------------------|---------------|----------|
| Requirements creation | Structured PRD + epics with BDD criteria | N/A - no requirements workflow | BMAD creates structured requirements |
| Test case generation | Quinn agent generates tests in code only | Generates Xray test cases in Jira | DMTOOLS generates from BMAD's structured output |
| Xray integration | No Xray support | Full Xray support (steps, preconditions, datasets) | DMTOOLS handles all Xray complexity |
| Traceability | Stories have acceptance criteria | Can link tests to stories | Tests linked to stories that came from BMAD PRD |

### Step-by-Step Workflow

```
PHASE 1: PLANNING (BMAD-METHOD)
================================

Step 1: Create Product Brief
  Agent: Analyst (Mary)
  Output: product-brief.md

Step 2: Create PRD with Detailed Acceptance Criteria
  Agent: PM (John)
  Output: prd.md (with Given/When/Then scenarios)

Step 3: Create Epics & Stories
  Agent: PM (John)
  Output: epics-and-stories.md
  Format: Each story has BDD acceptance criteria:
    "Given user is on login page
     When they enter valid credentials
     Then they should see the dashboard"

         |
         | BA creates Jira stories from epics
         | (manually or via DMTOOLS)
         v

PHASE 2: STORY CREATION IN JIRA (DMTOOLS)
==========================================

Step 4: Create Jira Stories from BMAD Output
  # Option A: Use Teammate agent
  dmtools run agents/teammate_create_stories.json

  # Option B: Use MCP tools directly
  dmtools jira_create_ticket_basic "PROJ" "Story" \
    "Login with email" "acceptance_criteria_from_bmad"

         |
         v

PHASE 3: TEST GENERATION (DMTOOLS)
====================================

Step 5: Generate Test Cases from Jira Stories
  dmtools run agents/xray_test_cases_generator.json
  Config:
    inputJql: "project = PROJ AND type = Story AND sprint = currentSprint()"
    outputType: "creation"
    testCaseIssueType: "Test"

  Output: Xray Test tickets with:
    - Step-by-step test instructions
    - Preconditions (auto-created)
    - Test data datasets
    - Links to parent story

Step 6: Generate Cucumber/Gherkin Tests (Alternative)
  dmtools run agents/xray_cucumber_test_generator.json
  Config:
    inputJql: "project = PROJ AND type = Story"
    outputType: "creation"

  Output: Gherkin scenarios with data tables

Step 7: Generate Mermaid Test Flow Diagrams
  dmtools run agents/xray_mermaid_diagrams_generator.json
  Output: Visual test flow diagrams as Jira comments
```

### Architecture Diagram - Scenario 2

```
+----------+     +----------------+     +-----------+     +----------+
|   BMAD   | --> | Markdown Files | --> |  DMTOOLS  | --> |   Jira   |
| PM Agent |     | prd.md         |     | Teammate  |     | Stories  |
| creates  |     | epics-and-     |     | creates   |     | with BDD |
| PRD+epics|     | stories.md     |     | tickets   |     | criteria |
+----------+     +----------------+     +-----------+     +----------+
                                                               |
                                                               v
                                                          +-----------+
                                                          |  DMTOOLS  |
                                                          | TestCases |
                                                          | Generator |
                                                          +-----------+
                                                               |
                                                               v
                                                          +----------+
                                                          | Jira/Xray|
                                                          | Test     |
                                                          | tickets  |
                                                          | + steps  |
                                                          | + data   |
                                                          +----------+
```

### Detailed Steps for a BA

**Phase 1 - BMAD Planning (in IDE):**

```
1. Open project in IDE with BMAD installed
2. /create-product-brief  -> product-brief.md
3. /create-prd            -> prd.md (ensure BDD criteria in each requirement)
4. /create-epics-and-stories -> epics-and-stories.md

Key: Ask the PM agent to include "Given/When/Then" acceptance criteria
for every story. This is what DMTOOLS will use to generate test cases.
```

**Phase 2 - Push Stories to Jira (DMTOOLS CLI):**

```bash
# Create stories in Jira from BMAD output
# The BA reads epics-and-stories.md and creates tickets
dmtools jira_create_ticket_basic "PROJ" "Epic" "User Authentication" \
  "Epic description from BMAD"

dmtools jira_create_ticket_basic "PROJ" "Story" "Login with email" \
  "## Acceptance Criteria\nGiven user is on login page\nWhen..."
```

**Phase 3 - Generate Tests (DMTOOLS CLI):**

```bash
# Generate Xray manual test cases from the stories
dmtools run agents/xray_test_cases_generator.json
# Input: JQL selects the stories just created
# Output: Test tickets appear in Jira/Xray linked to stories

# Alternatively, generate Cucumber/Gherkin scenarios
dmtools run agents/xray_cucumber_test_generator.json
```

### Benefits
- **End-to-end traceability:** PRD -> Story -> Test Case, all linked in Jira
- **Quality of test cases:** BDD criteria from BMAD's structured workflow produce better AI-generated tests
- **Scale:** Generate test cases for an entire sprint's stories in one command
- **Xray-native:** Tests include steps, preconditions, datasets - ready for execution
- **BA-friendly:** No code writing required at any step

---

## Scenario 3: Continuous Project Health - Documentation + Reporting

### Use Case
An ongoing project needs regular health monitoring: up-to-date documentation, developer productivity reports, sprint progress visualization, and architecture documentation that stays current. The team wants to combine BMAD's structured documentation with DMTOOLS' reporting and Confluence publishing.

### Roles Involved
- **Scrum Master** - runs regular reports
- **BA** - maintains documentation
- **Tech Lead** - reviews architecture artifacts

### Why Combine Tools Here

| Task | BMAD-METHOD | DMTOOLS | Combined |
|------|-------------|---------|----------|
| Document existing code | /document-project creates structured docs | N/A | BMAD generates structured documentation |
| Push docs to Confluence | No Confluence integration | Full Confluence API (create/update pages) | DMTOOLS publishes BMAD's docs to Confluence |
| Sprint reports | Sprint-status.yaml (local) | ScrumMasterDaily, DevProductivityReport | DMTOOLS generates reports from Jira, BMAD tracks locally |
| Architecture diagrams | Tech Writer agent creates Mermaid | DiagramsCreator generates from Jira | BMAD creates diagrams, DMTOOLS publishes |
| Code review tracking | /code-review generates report | Commits analysis via CommitsTriage | DMTOOLS analyzes commits, BMAD reviews code |

### Step-by-Step Workflow

```
RECURRING CYCLE (e.g., end of each sprint)
==========================================

DOCUMENTATION REFRESH (BMAD -> DMTOOLS -> Confluence)
-----------------------------------------------------

Step 1: BMAD - Generate/Update Project Documentation
  /document-project
  Agent: Tech Writer (Paige)
  Output: docs/architecture.md, docs/patterns.md, docs/api-docs.md

Step 2: BMAD - Generate Architecture Diagrams
  /create-diagrams (via Tech Writer agent MG command)
  Output: Mermaid diagrams in markdown

Step 3: DMTOOLS - Publish to Confluence
  dmtools confluence_create_page "SPACE" "Architecture - Sprint 14" \
    "$(cat docs/architecture.md)"
  dmtools confluence_create_page "SPACE" "API Documentation" \
    "$(cat docs/api-docs.md)"


REPORTING (DMTOOLS)
-----------------------------------------------------

Step 4: DMTOOLS - Developer Productivity Report
  dmtools run agents/dev_productivity.json
  Input: JQL for sprint tickets + commit data
  Output: Report posted as Jira comment or Confluence page

Step 5: DMTOOLS - QA Productivity Report
  dmtools run agents/qa_productivity.json
  Output: Test coverage and execution metrics

Step 6: DMTOOLS - Sprint Diagrams
  dmtools run agents/mermaid_diagrams_generator.json
  Input: Current sprint tickets
  Output: Visual workflow diagrams in Jira


PLANNING NEXT SPRINT (BMAD)
-----------------------------------------------------

Step 7: BMAD - Sprint Retrospective
  /retrospective
  Agent: Scrum Master (Bob)
  Input: Completed stories + DMTOOLS reports
  Output: retrospective.md with lessons learned

Step 8: BMAD - Sprint Planning
  /sprint-planning
  Agent: Scrum Master (Bob)
  Output: sprint-status.yaml for next sprint

Step 9: BMAD - Story Preparation
  /create-story (for each story in sprint)
  Agent: Scrum Master (Bob)
  Output: STORY-KEY-###.md files ready for developers
```

### Architecture Diagram - Scenario 3

```
+-----------+     +----------------+     +-----------+     +------------+
| Codebase  | --> |     BMAD       | --> |  Markdown  | --> |  DMTOOLS   |
| (existing | --> | /document-     |     | docs/      |     | Publish to |
|  project) |     |  project       |     | architecture|    | Confluence |
+-----------+     | /create-       |     | api-docs   |     +------------+
                  |  diagrams      |     | diagrams   |          |
                  +----------------+     +------------+          v
                                                           +------------+
                                                           | Confluence |
                                                           | (updated   |
                                                           |  pages)    |
                                                           +------------+

+-----------+     +-----------+     +------------------+
|   Jira    | --> |  DMTOOLS  | --> | Reports          |
| (sprint   |     | Reporting |     | - Dev metrics    |
|  tickets, |     | Jobs      |     | - QA metrics     |
|  commits) |     |           |     | - Sprint diagrams|
+-----------+     +-----------+     +------------------+
                                           |
                                           v
                  +----------------+     +------------+
                  |     BMAD       | <-- | Report     |
                  | /retrospective |     | summaries  |
                  | /sprint-       |     | as context |
                  |  planning      |     +------------+
                  +----------------+
```

### Detailed Steps for a Scrum Master

**Documentation Refresh:**

```
1. In IDE: /document-project
   - Tech Writer agent scans codebase
   - Generates: architecture.md, patterns.md, api-docs.md

2. In Terminal:
   dmtools confluence_create_page "PROJSPACE" \
     "Architecture Documentation" "content_from_file"
```

**Sprint Reports:**

```bash
# Generate developer productivity report
dmtools run agents/dev_productivity_report.json
# Config: {"name":"DevProductivityReport","params":{
#   "inputJql":"project=PROJ AND sprint=currentSprint()",
#   "outputType":"comment"}}

# Generate QA report
dmtools run agents/qa_productivity_report.json
```

**Next Sprint Planning:**

```
1. In IDE: /retrospective
   - Review completed work + DMTOOLS reports
   - Generate lessons learned

2. In IDE: /sprint-planning
   - Create sprint-status.yaml
   - Assign stories to sprint
```

### Benefits
- **Living documentation:** Code changes -> BMAD re-documents -> DMTOOLS publishes to Confluence
- **Automated reporting:** No manual report writing, DMTOOLS generates from Jira data
- **Sprint rhythm:** BMAD structures the planning, DMTOOLS handles the enterprise tool updates
- **Single source of truth:** Confluence always has the latest documentation

---

## Decision Matrix: When to Use Which Tool

### By Task Type

| Task | Use DMTOOLS | Use BMAD-METHOD | Use Both |
|------|-------------|-----------------|----------|
| **Extract data from Jira/Confluence** | **Yes** - JQL queries, MCP tools | No - no enterprise tool integration | DMTOOLS extracts, BMAD analyzes |
| **Create requirements/PRD** | No - no structured methodology | **Yes** - PM agent with workflow | BMAD creates, DMTOOLS pushes to Jira |
| **Generate test cases** | **Yes** - Xray/ADO test generators | Limited - Quinn for code tests only | BMAD writes criteria, DMTOOLS generates tests |
| **Architecture design** | No | **Yes** - Architect agent | BMAD designs, DMTOOLS creates diagrams |
| **Sprint planning** | Reports only | **Yes** - Scrum Master agent | BMAD plans, DMTOOLS reports |
| **Code implementation** | Code generation jobs | **Yes** - Developer agent with workflow | BMAD for workflow, DMTOOLS for CI/CD |
| **Productivity reports** | **Yes** - multiple report jobs | No | DMTOOLS generates, BMAD uses in retrospective |
| **Publish to Confluence** | **Yes** - full Confluence API | No | BMAD creates content, DMTOOLS publishes |
| **Create Jira tickets** | **Yes** - full Jira API | No | BMAD defines stories, DMTOOLS creates tickets |
| **Diagrams (Mermaid)** | **Yes** - from Jira data | **Yes** - from requirements | Both - different data sources |
| **Code review** | Commit analysis | **Yes** - structured review workflow | BMAD reviews, DMTOOLS tracks commits |
| **Brownfield analysis** | Extract existing ticket data | **Yes** - /document-project, /generate-project-context | DMTOOLS extracts, BMAD documents |

### By Role

| Role | Primary Tool | Secondary Tool | Key Workflows |
|------|-------------|----------------|---------------|
| **Business Analyst** | BMAD-METHOD | DMTOOLS | BMAD: /create-product-brief, /create-prd. DMTOOLS: extract context, push to Jira |
| **Product Owner** | BMAD-METHOD | DMTOOLS | BMAD: /create-prd, /create-epics. DMTOOLS: ticket management |
| **QA Engineer** | DMTOOLS | BMAD-METHOD | DMTOOLS: test case generation, Xray. BMAD: /qa-automate for code tests |
| **Scrum Master** | Both equally | - | BMAD: /sprint-planning, /retrospective. DMTOOLS: reports, daily standups |
| **Tech Lead** | BMAD-METHOD | DMTOOLS | BMAD: /create-architecture. DMTOOLS: diagrams, documentation publishing |
| **Developer** | BMAD-METHOD | DMTOOLS | BMAD: /dev-story, /code-review. DMTOOLS: CI/CD, commit analysis |

### By Integration Need

| External System | Tool to Use | Why |
|----------------|-------------|-----|
| **Jira** | DMTOOLS | 35+ Jira MCP tools, full API |
| **Confluence** | DMTOOLS | 13+ Confluence tools, page CRUD |
| **Xray** | DMTOOLS | 10+ Xray-specific tools |
| **Figma** | DMTOOLS | 12+ Figma extraction tools |
| **Azure DevOps** | DMTOOLS | 23+ ADO tools |
| **GitHub** | DMTOOLS | PR creation, commit analysis |
| **IDE (Cursor/Claude Code)** | BMAD-METHOD | Native IDE integration |
| **Local codebase** | BMAD-METHOD | Project context, code analysis |

---

## Implementation Guide (Non-Technical)

### Prerequisites

| Step | Action | Who | Difficulty |
|------|--------|-----|------------|
| 1 | Install DMTOOLS CLI | Tech Lead (one-time) | Easy - single curl command |
| 2 | Configure DMTOOLS environment (API keys) | Tech Lead (one-time) | Easy - fill in dmtools.env |
| 3 | Install BMAD-METHOD in project | Tech Lead (one-time) | Easy - `npx bmad-method install` |
| 4 | Verify BMAD agents work in IDE | BA (one-time) | Easy - run `/bmad-help` |
| 5 | Test DMTOOLS MCP tools | BA (one-time) | Easy - run `dmtools list` |

### Setup Steps

**1. Install DMTOOLS:**
```bash
# Download and install (one-time)
curl -fsSL https://github.com/IstiN/dmtools/releases/latest/download/install.sh | bash

# Create config file
cp dmtools.env.example dmtools.env
# Fill in: JIRA_BASE_PATH, JIRA_EMAIL, JIRA_API_TOKEN, GEMINI_API_KEY (or other AI key)

# Test it works
dmtools list          # Should show 67+ tools
dmtools jira_get_ticket YOUR-123  # Should return ticket data
```

**2. Install BMAD-METHOD:**
```bash
# In your project root
npx bmad-method install

# Choose: IDE (Cursor/Claude Code), Modules (BMM core + optional)
# Configure: project name, language, skill level

# Test it works
# Open project in IDE, type: /bmad-help
```

**3. Create Integration Folder Structure:**
```
your-project/
├── _bmad/                    # BMAD installation (auto-created)
├── planning-artifacts/       # BMAD output goes here
├── dmtools-output/           # DMTOOLS extractions go here
└── agents/                   # DMTOOLS agent configs (copy from DMTOOLS repo)
    ├── xray_test_cases_generator.json
    ├── expert_analysis.json
    └── teammate.json
```

### Running Integration Scenarios

**For Scenario 1 (Legacy Analysis):**
1. BA runs DMTOOLS extraction commands in terminal
2. BA copies output to `planning-artifacts/extracted_context.md`
3. BA opens IDE, runs BMAD workflows sequentially
4. BA runs DMTOOLS to push results back to Jira

**For Scenario 2 (Requirements to Tests):**
1. BA runs BMAD planning workflows in IDE
2. BA creates Jira stories using DMTOOLS
3. QA runs DMTOOLS test generator

**For Scenario 3 (Project Health):**
1. Schedule DMTOOLS reports (cron or GitHub Actions)
2. Scrum Master runs BMAD retrospective/planning in IDE
3. BA publishes BMAD docs via DMTOOLS to Confluence

---

## Success Metrics

| Metric | How to Measure | Expected Improvement |
|--------|---------------|---------------------|
| **Time to create PRD from legacy data** | Hours from start to completed PRD | 60-70% reduction |
| **Test case coverage** | % of stories with generated test cases | 80-100% coverage |
| **Documentation freshness** | Days since last Confluence update | Always current (per sprint) |
| **Sprint planning time** | Hours spent in sprint planning meeting | 30-40% reduction |
| **Requirements quality** | Number of "questions" raised during development | 40-50% reduction |
| **Reporting effort** | Hours spent creating reports | 80% reduction (automated) |

---

## Appendix A: Tool Capabilities Quick Reference

### DMTOOLS Key Jobs

| Job | Input | Output | BA-Friendly |
|-----|-------|--------|-------------|
| `TestCasesGenerator` | JQL (stories) | Xray test tickets | Yes |
| `RequirementsCollector` | JQL (tickets) | Structured requirements | Yes |
| `UserStoryGenerator` | JQL (epics) | User stories | Yes |
| `Expert` | JQL + question | AI analysis | Yes |
| `Teammate` | JQL + workflow | Complex automation | Moderate |
| `DevProductivityReport` | JQL (sprint) | Productivity metrics | Yes |
| `ScrumMasterDaily` | JQL (sprint) | Daily standup report | Yes |
| `DiagramsCreator` | JQL (tickets) | Mermaid diagrams | Yes |
| `DocumentationGenerator` | JQL + context | Technical docs | Yes |

### BMAD-METHOD Key Workflows

| Workflow | Agent | Input | Output | BA-Friendly |
|----------|-------|-------|--------|-------------|
| `/create-product-brief` | Analyst (Mary) | Ideas, research | product-brief.md | Yes |
| `/create-prd` | PM (John) | Product brief | prd.md | Yes |
| `/create-architecture` | Architect (Winston) | PRD | architecture.md | Moderate |
| `/create-epics-and-stories` | PM (John) | PRD + architecture | epics-and-stories.md | Yes |
| `/sprint-planning` | Scrum Master (Bob) | Epics file | sprint-status.yaml | Yes |
| `/create-story` | Scrum Master (Bob) | Epics + sprint | STORY-KEY-###.md | Yes |
| `/dev-story` | Developer (Amelia) | Story file | Code changes | No (developer) |
| `/code-review` | Developer (Amelia) | Changed code | Review report | Moderate |
| `/document-project` | Tech Writer (Paige) | Codebase | Documentation files | Yes |
| `/retrospective` | Scrum Master (Bob) | Completed sprint | retrospective.md | Yes |
| `/quick-spec` | Solo Dev (Barry) | Feature description | tech-spec.md | Moderate |

---

## Appendix B: Example Agent Config for Integration

### DMTOOLS Expert Agent for Legacy Analysis

```json
{
  "name": "Expert",
  "params": {
    "inputJql": "project = LEGACY AND type in (Story, Epic, Bug) ORDER BY created DESC",
    "ticketContextDepth": 1,
    "agentParams": {
      "aiRole": "Senior Business Analyst",
      "instructions": [
        "Analyze all provided tickets and extract key themes",
        "Identify functional areas and their relationships",
        "List all acceptance criteria patterns found",
        "Summarize the system's domain model based on ticket descriptions",
        "Output a structured markdown document suitable for product brief creation"
      ],
      "formattingRules": "Use markdown with clear headers for each section"
    },
    "outputType": "none"
  }
}
```

### BMAD config.yaml for Integration Project

```yaml
project_name: "Integration Project"
user_name: "BA Team"
communication_language: "English"
document_output_language: "English"
user_skill_level: "intermediate"
planning_artifacts: "planning-artifacts"
implementation_artifacts: "implementation-artifacts"
project_knowledge: "docs"

dev_load_always_files:
  - "{planning_artifacts}/extracted_context.md"
  - "{planning_artifacts}/architecture.md"
```

---

**Document Version:** 1.0
**Created:** February 3, 2026
**Tools Analyzed:** DMTOOLS (github.com/IstiN/dmtools), BMAD-METHOD (github.com/bmad-code-org/BMAD-METHOD)
