# Wireframe Prompts Parallel Execution Strategy & Analysis

**Date:** 2025-01-09  
**Context:** Running 25+ token-intensive wireframe generation prompts (E01-E10)  
**Goal:** Efficient parallel execution with separate context threads in Cursor/Claude Sonnet 4

## 📊 ANALYSIS

### Current Scope
- **Total Files:** 10 prompt files (E01-E10)
- **Total FR Prompts:** 25 individual wireframe generation prompts
- **File Distribution:**
  - E01: 4 FR prompts (FR1.1.1, FR1.1.2, FR1.1.3, FR1.1.4)
  - E02: 3 FR prompts (FR2.1.1, FR2.2.1, FR2.3.1)  
  - E03: 3 FR prompts
  - E04: 3 FR prompts
  - E05: 2 FR prompts
  - E06: 3 FR prompts
  - E07: 2 FR prompts
  - E08: 1 FR prompt
  - E09: 3 FR prompts
  - E10: 1 FR prompt

### Token Intensity Factors
- Each prompt reads 5+ source documents (Overview, User Stories, FRs, FR Maps, Journey)
- Generates comprehensive Figma-ready wireframe specifications
- Estimated 15K-25K input tokens per prompt
- Expected 5K-10K output tokens per prompt
- **Total Estimated Tokens:** 500K-875K tokens across all prompts

## 🚀 SOLUTION STRATEGIES

### Strategy 1: Cursor Multiple Tab Method (RECOMMENDED)
**Best for: Immediate execution with manual oversight**

**Implementation:**
1. **Open Multiple Cursor Tabs**
   - Open 10 separate Cursor windows/tabs
   - Each tab gets dedicated to one E## file
   - Each tab maintains separate Claude context

2. **Tab Assignment Structure:**
   ```
   Tab 1: E01 (4 prompts) - Highest priority
   Tab 2: E02 (3 prompts) - High priority  
   Tab 3: E03 (3 prompts) - High priority
   Tab 4: E04 (3 prompts) - Medium priority
   Tab 5: E05 (2 prompts) - Medium priority
   Tab 6: E06 (3 prompts) - Medium priority
   Tab 7: E07 (2 prompts) - Low priority
   Tab 8: E08 (1 prompt) - Low priority
   Tab 9: E09 (3 prompts) - Low priority
   Tab 10: E10 (1 prompt) - Low priority
   ```

3. **Execution Protocol per Tab:**
   ```
   For each tab:
   1. Load the E## prompt file
   2. Copy first FR prompt (e.g., FR1.1.1)
   3. Paste into Claude
   4. Wait for completion
   5. Save output to designated file
   6. Move to next FR in same file
   7. Repeat until E## file complete
   ```

4. **Benefits:**
   - ✅ Separate contexts prevent token limit issues
   - ✅ Can run 10 parallel executions
   - ✅ Manual quality control per prompt
   - ✅ Can prioritize critical stages (E01-E03)
   - ✅ Native Cursor integration

### Strategy 2: Cursor Background Agent Method
**Best for: Native Cursor agent orchestration**

**Cursor Agent Capabilities:**
- Cursor can spawn multiple background agents with dedicated contexts
- Each agent operates independently with separate token limits  
- Agents can run concurrently without blocking main interface
- Built-in agent coordination and monitoring

**Implementation:**
1. **Agent Spawn Command Structure**
   ```bash
   # Cursor CLI agent spawn commands (if available)
   cursor agent spawn --name="FR-E01-Agent" --context-file="04-FR-wireframes-prompt-E01.md"
   cursor agent spawn --name="FR-E02-Agent" --context-file="04-FR-wireframes-prompt-E02.md" 
   cursor agent spawn --name="FR-E03-Agent" --context-file="04-FR-wireframes-prompt-E03.md"
   # ... continue for E04-E10
   ```

2. **Cursor Agent Execution Flow:**
   - **Agent Initialization:** Each background agent loads specific E## file
   - **Context Isolation:** Separate 200K token limit per agent
   - **Parallel Processing:** All agents run simultaneously 
   - **Progress Monitoring:** Cursor interface shows agent status
   - **Output Collection:** Each agent writes to designated output file
   - **Completion Notification:** Agents report completion status

3. **Agent Coordination Script**
   ```javascript
   // cursor-agent-coordinator.js
   class CursorAgentCoordinator {
     constructor() {
       this.agents = [
         { name: 'FR-E01-Agent', stage: 'E01', status: 'pending', frCount: 4 },
         { name: 'FR-E02-Agent', stage: 'E02', status: 'pending', frCount: 3 },
         // ... all 10 agents
       ];
     }
     
     async spawnAgents() {
       for (const agent of this.agents) {
         // Use Cursor's native agent spawn API
         await cursor.agent.spawn({
           name: agent.name,
           contextFile: `04-FR-wireframes-prompt-${agent.stage}.md`,
           outputFile: `04-bmo-FR-wireframes-output-${agent.stage}.md`
         });
       }
     }
     
     async monitorProgress() {
       // Poll agent status and aggregate completion metrics
     }
   }
   ```

4. **Benefits:**
   - ✅ **Native Cursor Integration** - Uses built-in agent system
   - ✅ **True Parallel Execution** - 10 agents running simultaneously  
   - ✅ **Automatic Context Management** - Each agent gets separate token limit
   - ✅ **Built-in Monitoring** - Cursor interface shows agent progress
   - ✅ **No External APIs** - Uses Cursor's internal Claude integration

### Strategy 3: Hybrid Batch Method (BALANCED APPROACH)
**Best for: Controlled parallel execution with oversight**

**Implementation:**
1. **Stage-Based Batching:**
   - Group E01-E03 (Critical Path) - Run first
   - Group E04-E06 (Core Features) - Run second  
   - Group E07-E10 (Supporting Features) - Run third

2. **Batch Execution Protocol:**
   ```
   Batch 1 (Priority): E01, E02, E03
   - 3 Cursor tabs, one per stage
   - Execute all FRs in parallel across these 3 stages
   - Complete before moving to Batch 2
   
   Batch 2 (Core): E04, E05, E06  
   - Same 3 tabs, reload with new stages
   - Execute second batch
   
   Batch 3 (Support): E07, E08, E09, E10
   - 4 tabs for remaining stages
   - Complete final batch
   ```

3. **Benefits:**
   - ✅ Manageable parallel execution
   - ✅ Priority-based processing
   - ✅ Quality control checkpoints
   - ✅ Resource optimization

## 📋 IMPLEMENTATION CHECKLIST

### Pre-Execution Setup
- [ ] Verify all 10 E## prompt files exist and are accessible
- [ ] Create/verify output directories for each stage
- [ ] Test one FR prompt manually to establish baseline
- [ ] Document template for consistent execution
- [ ] Set up progress tracking mechanism

### For Strategy 1 (Multiple Tabs):
- [ ] Open 10 Cursor windows/tabs
- [ ] Assign each tab to specific E## file  
- [ ] Create execution order based on business priority
- [ ] Set up output file naming convention
- [ ] Establish quality check procedure per completion

### For Strategy 2 (Conductor Agent):
- [ ] Develop conductor script with FR parsing logic
- [ ] Implement Claude API integration with proper auth
- [ ] Add rate limiting and error handling
- [ ] Create progress monitoring dashboard
- [ ] Set up automated output aggregation

### For Strategy 3 (Hybrid Batch):
- [ ] Define batch groupings (Critical/Core/Support)
- [ ] Set up 3-4 Cursor tabs for parallel execution
- [ ] Create batch completion checkpoints
- [ ] Establish quality gates between batches
- [ ] Document lessons learned per batch

## ⚡ RECOMMENDED EXECUTION PLAN

**Option A: Cursor Background Agents (IF AVAILABLE)**
1. **Check Cursor agent capabilities** - Test if `cursor agent spawn` commands exist
2. **If agents available:** Use Strategy 2 to spawn 10 background agents
3. **Monitor all agents** running in parallel with built-in Cursor interface
4. **Completion time:** 1-2 hours (fully parallel execution)

**Option B: Manual Tabs (PROVEN METHOD)**  
**Phase 1: Immediate Start (Strategy 1)**
1. **Open 4 Cursor tabs** for E01-E04 (highest business impact)
2. **Start with E01** (4 FR prompts) - Critical infrastructure
3. **Parallel execute E02-E04** while E01 completes
4. **Quality check** outputs before proceeding

**Phase 2: Scale Up (Strategy 3)**  
1. **Add remaining 6 tabs** for E05-E10
2. **Batch execute** remaining stages with priority weighting
3. **Monitor token usage** across all contexts
4. **Aggregate outputs** as each stage completes

**Phase 3: Optimization (Future)**
1. **Test Cursor's native agent system** if not used initially
2. **Automate repetitive aspects** while maintaining quality
3. **Create reusable templates** for similar prompt campaigns

## 🔍 CURSOR AGENT DISCOVERY

**Before implementing Strategy 2, test Cursor's agent capabilities:**

### Method 1: CLI Command Test
```bash
# Test if Cursor has agent commands
cursor --help | grep agent
cursor agent --help  
cursor spawn --help
```

### Method 2: Cursor Interface Check  
- Look for "Agents" or "Background Tasks" in Cursor menus
- Check if there's an "Agent" panel or tab
- Search Cursor settings for agent-related options

### Method 3: Documentation Check
- Check Cursor's official documentation for agent features
- Look for multi-context or parallel execution capabilities  
- Search for "background agent" or "conductor" features

### Method 4: Community/Forum Check
- Search Cursor Discord/forums for "background agents"
- Look for examples of parallel AI task execution
- Check if other users have implemented similar workflows

**If agents NOT available:** Fall back to Strategy 1 (Multiple Tabs)  
**If agents ARE available:** Proceed with Strategy 2 for maximum efficiency

## 🔧 TECHNICAL CONSIDERATIONS

### Context Management
- Each tab maintains separate Claude context (no token sharing)
- Monitor individual context token limits (~200K tokens)
- Plan for context reset if limits approached

### Rate Limiting  
- Claude Sonnet 4 has request rate limits
- Stagger prompt submissions by 10-15 seconds
- Monitor for 429 rate limit responses

### Output Management
- Each FR outputs to specific designated file
- Use consistent marker format: `=== BEGIN PROMPT FR: [FR_ID] ===`
- Maintain separate output files per stage (E01-E10)

### Quality Control
- Spot check 20% of generated prompts for completeness
- Verify all acceptance criteria are captured
- Confirm Figma-ready format compliance

## 📊 SUCCESS METRICS

### Completion Metrics
- **Target:** 25 FR wireframe prompts generated
- **Timeline:** 4-6 hours for full completion (with manual oversight)
- **Quality:** 95%+ acceptance criteria coverage per prompt

### Efficiency Metrics  
- **Parallel Execution:** 3-10 simultaneous prompts
- **Context Isolation:** Zero token limit conflicts
- **Error Rate:** <5% prompts requiring regeneration

### Output Quality
- **Figma Compatibility:** 100% prompts ready for Figma Make AI
- **Acceptance Criteria Coverage:** Complete coverage per FR
- **Journey Integration:** User journey elements properly incorporated

## 🚨 RISK MITIGATION

### Token Limit Risks
- **Risk:** Individual contexts hitting 200K token limits
- **Mitigation:** Monitor token usage, reset contexts proactively

### Rate Limit Risks  
- **Risk:** Claude API rate limiting with parallel requests
- **Mitigation:** Stagger submissions, implement exponential backoff

### Quality Risks
- **Risk:** Generated prompts missing critical acceptance criteria  
- **Mitigation:** Spot check outputs, maintain quality checklist

### Coordination Risks
- **Risk:** Confusion over which prompts completed in which tabs
- **Mitigation:** Clear naming convention, progress tracking spreadsheet

---

**Status:** Ready for implementation  
**Recommended Start:** Strategy 1 (Multiple Tabs) with 4 tabs for E01-E04  
**Estimated Completion Time:** 4-6 hours with manual oversight  
**Next Action:** Open first 4 Cursor tabs and begin E01-E04 execution
