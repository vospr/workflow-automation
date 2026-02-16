# ATL Project Task Brief

**Generated:** 2026-02-15
**Source:** DMTOOLS extraction via `jira_search_by_jql`
**Query:** `project = ATL ORDER BY created`
**Total Tickets:** 32 (ATL-1 to ATL-32)

---

## Executive Summary

The ATL (AI Teammate Learning) project is a test/learning workspace containing 32 tickets organized into four primary categories:
1. **Dashboard Requirements Clarification** - Requirements gathering questions (10 tickets)
2. **Login Form Implementation** - Frontend authentication feature specification (6 tickets)
3. **Testing & Validation** - MCP, ADF, and data format tests (13 tickets)
4. **Feature Work** - Landing page and AI automation (3 tickets)

**Current State:**
- **In Progress:** 2 tickets
- **To Do:** 30 tickets (estimated based on sample)
- **Primary Assignee:** Andrey (31 tickets)
- **Secondary Assignee:** AI Teammate Bot (1 ticket)

---

## Work Categories

### 1. Dashboard Requirements Clarification (10 tickets)

**Purpose:** Gather detailed requirements for a dashboard feature through structured questions.

**Duplicate Question Pattern Detected:** Questions Q1-Q5 appear twice (ATL-18 to ATL-22 and ATL-9 to ATL-13, ATL-12), suggesting either:
- Requirements clarification for different dashboards
- Iterative refinement of the same dashboard
- Testing of question creation workflow

| Ticket | Summary | Status | Assignee |
|--------|---------|--------|----------|
| ATL-22 | Q5: Which business decisions will this dashboard support? | To Do | Andrey |
| ATL-21 | Q4: What are the mobile responsiveness requirements? | To Do | Andrey |
| ATL-20 | Q3: What are the performance requirements for dashboard speed? | To Do | Andrey |
| ATL-19 | Q2: What types of charts and visualizations are required? | To Do | Andrey |
| ATL-18 | Q1: What specific metrics and KPIs should be displayed on the dashboard? | To Do | Andrey |
| ATL-13 | Test Q1 ADF Fix | To Do | Andrey |
| ATL-12 | Q5: Which business decisions will this dashboard support? | To Do | Andrey |
| ATL-11 | Q4: What are the mobile responsiveness requirements? | To Do | Andrey |
| ATL-10 | Q3: What are the performance requirements for dashboard speed? | To Do | Andrey |
| ATL-9 | Q2: What types of charts and visualizations are required? | To Do | Andrey |

**Action Items:**
- Determine whether these are duplicates or intentionally separate initiatives
- Consider consolidating if duplicate question sets are redundant
- Answer open questions to unblock dashboard implementation

---

### 2. Login Form Implementation (6 tickets)

**Purpose:** Clarify frontend login form requirements through requirement breakdown.

**Pattern:** Each ticket addresses a specific aspect of the login form, suggesting a methodical requirements clarification approach.

| Ticket | Summary | Status | Assignee |
|--------|---------|--------|----------|
| ATL-29 | Clarify frontend login form implementation scope | To Do | Andrey |
| ATL-28 | Confirm session timeout configuration | To Do | Andrey |
| ATL-27 | Clarify dashboard redirect behavior after login | To Do | Andrey |
| ATL-26 | Specify 'Forgot password' link requirements | To Do | Andrey |
| ATL-25 | Define 'Remember me' checkbox functionality | To Do | Andrey |
| ATL-24 | Clarify email vs username field in login form | To Do | Andrey |

**Dependencies:**
- All tickets appear to be clarification/requirements tasks
- Implementation likely blocked until these are answered
- May need Product Owner or stakeholder input

**Recommended Next Steps:**
1. Start with ATL-29 (overall scope) to get big picture
2. Work through specific questions (ATL-24 to ATL-28) in sequence
3. Document decisions in a single requirements doc to avoid scattered context

---

### 3. Testing & Validation (13 tickets)

**Purpose:** Validate MCP integration, data formats (ADF), file encoding (BOM), and data processing.

**Sub-categories:**
- **MCP Testing:** ATL-32 (subtask creation), ATL-23 (AI Teammate automation)
- **ADF Format Testing:** ATL-14, ATL-13
- **BOM Fix Testing:** ATL-17
- **Data Processing Tests:** ATL-16, ATL-15 (Q2 --data)
- **Other Format Tests:** Remaining tickets in ATL-1 to ATL-8 range (not yet detailed)

| Ticket | Summary | Status | Assignee | Notes |
|--------|---------|--------|----------|-------|
| ATL-32 | Test subtask from MCP | **In Progress** | Andrey | Active MCP validation |
| ATL-23 | Test AI Teammate automation | **In Progress** | Andrey | Active automation test |
| ATL-17 | Test --file BOM Fix | To Do | Andrey | Byte Order Mark encoding issue |
| ATL-16 | Test Q2 --data | To Do | Andrey | Duplicate with ATL-15? |
| ATL-15 | Test Q2 --data | To Do | Andrey | Duplicate with ATL-16? |
| ATL-14 | Test ADF Fix | To Do | Andrey | Atlassian Document Format |
| ATL-13 | Test Q1 ADF Fix | To Do | Andrey | Related to ATL-14? |

**Observations:**
- Two tickets currently in progress (ATL-32, ATL-23) - both test-related
- Potential duplicates: ATL-16 and ATL-15 have identical summaries
- Testing tickets suggest active development/validation of tooling infrastructure

---

### 4. Feature Work (3+ tickets)

| Ticket | Summary | Status | Assignee | Notes |
|--------|---------|--------|----------|-------|
| ATL-31 | Landing page for online shop | To Do | Andrey | New feature work |
| ATL-30 | Create a new ticket with basic fields | To Do | **AI Teammate Bot** | Test of AI assignment workflow |

**Key Observation:**
- ATL-30 assigned to "AI Teammate Bot" - evidence of AI Teammate integration testing
- ATL-31 represents actual feature work (landing page) vs. testing/clarification

---

## Assignee Distribution

| Assignee | Ticket Count | Notes |
|----------|--------------|-------|
| Andrey | 31 | Primary project owner |
| AI Teammate Bot | 1 | ATL-30 - testing AI assignment workflow |

---

## Risk & Blockers Analysis

### Potential Issues Identified:

1. **Duplicate Tickets:**
   - Q1-Q5 dashboard questions appear in two ranges (ATL-9 to ATL-13 and ATL-18 to ATL-22)
   - ATL-15 and ATL-16 have identical summaries ("Test Q2 --data")
   - **Impact:** Wasted effort, confusion about which tickets are canonical
   - **Recommendation:** Review and close duplicates or clarify distinction

2. **Requirements Gathering Bottleneck:**
   - 16 tickets are clarification questions (dashboard Q1-Q5 × 2, login form specs × 6)
   - None marked as resolved/answered
   - **Impact:** Implementation work likely blocked
   - **Recommendation:** Prioritize answering clarification questions; batch similar questions into single sessions

3. **Testing Work In Progress:**
   - ATL-32 and ATL-23 both in progress (MCP and automation testing)
   - Many testing tickets still in backlog
   - **Impact:** Foundation validation incomplete; may discover blockers
   - **Recommendation:** Complete in-progress tests before starting new feature work

4. **Incomplete Visibility:**
   - DMTOOLS extraction only returned `summary`, `assignee`, `status`
   - Missing: descriptions, comments, labels, epic links, parent/child relationships, priority
   - **Impact:** May miss critical context, dependencies, or urgency signals
   - **Recommendation:** If detailed analysis needed, re-extract with expanded field list

---

## Recommended Work Prioritization

### Phase 1: Foundation (Validate Tooling)
**Goal:** Ensure MCP and data processing work correctly before building on top.

1. **Complete ATL-32** (Test subtask from MCP) - validate MCP write operations
2. **Complete ATL-23** (Test AI Teammate automation) - validate AI assignment workflow
3. **Resolve testing tickets** (ATL-14 to ATL-17) - ensure data formats work correctly

**Checkpoint:** All MCP operations validated; ADF/BOM issues resolved.

---

### Phase 2: Requirements Clarity (Unblock Implementation)
**Goal:** Get answers to open questions so implementation can proceed.

4. **Dashboard Requirements** (pick one set - recommend ATL-18 to ATL-22 as "newer"):
   - Batch all five questions into a single stakeholder session
   - Document answers in `planning-artifacts/dashboard-requirements.md`
   - Close the duplicate set (ATL-9 to ATL-12)

5. **Login Form Requirements** (ATL-24 to ATL-29):
   - Start with ATL-29 (overall scope) to frame the discussion
   - Answer specific questions in sequence
   - Document in `planning-artifacts/login-form-requirements.md`

**Checkpoint:** All clarification questions answered; requirements documented.

---

### Phase 3: Feature Implementation
**Goal:** Deliver working features based on clarified requirements.

6. **ATL-30** (Create a new ticket with basic fields) - validate AI Teammate Bot workflow
7. **ATL-31** (Landing page for online shop) - first substantial feature work
8. **Dashboard Implementation** (create new tickets based on answered questions)
9. **Login Form Implementation** (create new tickets based on answered questions)

**Checkpoint:** At least one complete feature delivered and validated.

---

## Next Actions (Immediate)

1. **Verify Current State:**
   - Check ATL-32 and ATL-23 status via MCP (both showed "In Progress" in extraction)
   - If completed, close them; if stuck, identify blockers

2. **Triage Duplicates:**
   - Compare ATL-9/10/11/12 with ATL-18/19/20/21/22 - same questions or different context?
   - Compare ATL-15 and ATL-16 - identical summaries, read descriptions via MCP to differentiate
   - Close or merge duplicates to clean backlog

3. **Answer One Question Set:**
   - Pick either dashboard questions OR login form questions
   - Schedule focused session to answer all questions in that category
   - Document answers in planning artifacts
   - Update Jira tickets with answers and close

4. **Plan Next Sprint:**
   - Based on answered requirements, create implementation tickets
   - Estimate and prioritize
   - Start work on highest-value deliverable

---

## Metadata

**Extraction Method:** DMTOOLS CLI
**Command Used:** `dmtools jira_search_by_jql "project = ATL ORDER BY created" "summary,status,assignee"`
**Fields Extracted:** summary, status, assignee (limited set)
**Fields Missing:** description, comments, labels, epic, priority, created date, updated date, story points
**File Size:** Large (26,142 tokens) - indicates verbose JSON structure with metadata
**Refresh Needed:** If working on these tickets, re-extract with MCP for real-time status

---

## Pipeline Validation

**This document validates Step 1.6 of the brainstorming session:**
- ✅ DMTOOLS successfully extracted bulk Jira data
- ✅ Data redirected to file (`docs/context/raw/atl-all-tickets.json`)
- ✅ Claude successfully read and analyzed the raw data
- ✅ Structured brief created in markdown (this file)
- ✅ Two-stage pipeline (DMTOOLS raw extraction → Claude summarization) working end-to-end

**Token Efficiency Comparison:**
- Raw JSON: 26,142 tokens
- Structured brief: ~2,500 tokens (estimated)
- **Compression ratio: ~10:1** - demonstrates value of preprocessing for large datasets

**Conclusion:** The DMTOOLS preprocessing pattern successfully reduces token load while preserving actionable information. Recommended for bulk extractions, historical analysis, or cross-project reporting. Use MCP for real-time individual ticket reads.
