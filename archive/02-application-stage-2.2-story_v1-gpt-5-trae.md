# Stage 2.2 — The Bright Run Knowledge Graph Explorer Story

Imagine you’ve just finished uploading and processing a bunch of documents in Stage 1. They might be PDFs, notes, or web pages. Stage 2 is where Bright Run helps turn that messy pile of content into organized knowledge. Stage 2.2 is the part where you actually see and shape that knowledge as a “graph.”

Think of the knowledge graph like a map of ideas:
- Each idea (like “Machine Learning” or “Customer Onboarding”) is a node.
- Each connection between ideas (like “A uses B” or “Part of C”) is a relationship.

Stage 2.2 lets you explore, clean up, and strengthen this map so it’s ready for the next stage, where we’ll generate high-quality training data for your custom AI.

This story explains what each part of Stage 2.2 does, why it matters, and how it fits into the whole Bright Run platform.



## The Big Picture: Why a Knowledge Graph?

To teach an AI to think like you, it needs more than words—it needs structure. A knowledge graph organizes important topics, entities (like people, places, tools), and processes (like steps in your workflow) and shows how they relate to each other. This structure:
- Preserves your expertise and logic
- Makes it easier to spot gaps or mistakes
- Feeds the training data generator in later stages

Stage 2.2 gives you four main views to manage this:
1. Graph Explorer — draw, edit, and review the map directly
2. Hierarchy — see parent-child structure (like chapters and sections)
3. Query & Analytics — search and measure the health of your graph
4. Versions & Export — save checkpoints and export to standard formats

You can switch between these views to build a clear, accurate understanding of your content.



## 1) Graph Explorer — Think With a Visual Map

This is the center of Stage 2.2. You see your nodes and relationships drawn on a canvas, like dots and arrows on a whiteboard—only smarter.

What you can do here:
- Move around and zoom in/out to focus on different areas
- Click nodes to select them (hold Ctrl/Command to select multiple)
- Add new nodes (for new ideas), edit existing ones, or delete ones that don’t belong
- Draw new relationships (connections) when you see a link the system missed
- See “confidence” scores on relationships to judge how strong or reliable they are
- Collaborate in real time—see where other teammates’ cursors are and what they’re selecting

Why this matters:
- It helps you translate your expert knowledge into a reliable structure
- You can fix problems the automated system missed
- You can make choices that protect your unique way of thinking

Smart suggestion engine:
- The system can analyze your current nodes and propose new relationships
- Each suggestion comes with a confidence level (like 85%)
- You can accept or reject suggestions quickly
- Accepted suggestions become new relationships in your graph

This keeps you in control: AI suggests, you decide. It speeds up mapping without sacrificing accuracy.

Operationally, every change you make updates your project’s graph data. The system tracks whether your graph is “in sync” (saved) or “out of sync” (needs saving) so you don’t lose work. Under the hood, your actions update the shared graph state and let others see your changes.



## 2) Hierarchy View — See the Structure Like a Table of Contents

Sometimes you need a clean outline instead of a web of dots. The Hierarchy view shows parent-child relationships, like:
- “Book” contains “Chapters”
- “Course” contains “Units”
- “Process” contains “Steps”

What you can do:
- Expand and collapse items to see structure at different levels
- Search by name or type to find things fast
- Select an item and jump back to the Graph Explorer to see it in context
- View a “cross-document dependencies” panel that highlights references between documents (like “Doc A references Doc B”)

Why this matters:
- It reveals how information is organized
- You can catch missing sections, misplaced items, or tangled structure
- It makes review and cleanup easier, especially for large projects

The Hierarchy view also shows simple stats like total nodes, number of root items, and the deepest level in your structure. That helps you understand scale and complexity at a glance.



## 3) Query & Analytics — Ask Questions and Check Quality

The Query & Analytics view gives you two tabs:

A) Query Builder
- Filter by node types (like concept, entity, process)
- Filter by relationship types (like parent_of, references, depends_on)
- Search by text inside nodes (like “pricing policy”)
- Set a minimum confidence level for relationships
- Save queries for reuse later

When you run a query, Bright Run shows only the nodes and relationships that match. It also highlights them when you switch back to the Graph Explorer. This makes it easy to focus on exactly what you need (for example, “Show me all processes that reference this tool”).

B) Analytics
- Node count and relationship count
- Density (how interconnected your graph is)
- Average degree (on average, how many connections each node has)
- Number of connected components (how many separate clusters exist)
- Top “central” nodes (the most connected or influential ones)
- Coverage (how many nodes are connected at all)
- Gaps and suggestions:
  - Isolated nodes (not connected to anything)
  - Missing expected node types (e.g., you have concepts and entities, but no processes)
  - Low relationship diversity (only one or two kinds of links used)

Why this matters:
- Analytics help you measure the health of your knowledge graph
- Gaps point to exactly what you should fix next
- Better structure = better training data downstream

Operationally, these metrics give you a quality checklist before moving to the next stage. You can confirm your graph is connected, balanced, and meaningful—not just a random pile of terms.



## 4) Versions & Export — Save Checkpoints and Package Your Work

This view has two parts: Version History and Export.

A) Version History
- Create a new version (a checkpoint) whenever you reach a milestone
- See a list of previous versions with timestamps and descriptions
- Compare two versions to see what changed (nodes added/removed, relationships added/removed)
- Restore a version if you need to roll back

Why this matters:
- Your knowledge evolves—versions let you keep track without losing anything
- If an experiment goes wrong, restore a clean, earlier state in one click
- Versions support teamwork and accountability

B) Export
- Choose a standard format:
  - JSON-LD (Linked Data, good for semantic web tools)
  - GraphML (XML format used by many graph tools)
  - RDF/Turtle (a popular graph language)
  - JSON (simple and flexible)
- Generate and download the export with a progress indicator
- These exports can be used by external tools, stored for audit, or fed into later Bright Run stages

Why this matters:
- You can use the graph outside Bright Run—for example, to visualize it elsewhere or integrate with another system
- These formats are standard and widely supported
- It makes your knowledge a portable asset you own



## How Stage 2.2 Fits the Whole Bright Run Workflow

- Stage 1 (you did this earlier): Ingest and process raw content
- Stage 2 (where we are): Analyze, structure, and improve that content as a knowledge graph
  - Stage 2.2 is the hands-on, visual part where you confirm meaning, fix errors, add details, and shape the final structure
- Stage 3 (coming next): Generate training pairs (like Q&A) using your structured graph to guide quality and context
- Stage 4–6: Expand variety, assess quality, and export training data for LoRA fine-tuning

Stage 2.2 is where your expert thinking becomes visible and editable. It’s your chance to capture nuance that raw text can’t. The outputs of Stage 2.2—clean, connected, well-scored knowledge—make everything after this more accurate and more “you.”



## What Each Element Is Designed to Do (Feature-by-Feature)

Graph Explorer
- Canvas and tools
  - Zoom in/out and reset view: navigate big graphs without getting lost
  - Pan by dragging: move around quickly
  - Select one or many nodes: group editing and focused review
- Node management
  - Add: create a new idea or concept
  - Edit: fix labels, types, or content to improve clarity
  - Delete: remove duplicates or irrelevant items
- Relationship management
  - Add: define how two ideas connect (like “A references B”)
  - Confidence display: judge whether a connection is strong enough to trust
  - Delete: remove wrong or weak connections
- AI suggestions
  - Generate suggestions: the system proposes new connections
  - Accept/reject: you decide what becomes part of the graph
  - Confidence threshold: hide low-confidence connections to reduce noise
- Collaboration
  - See teammate cursors and selections: avoid conflicts and work together in real time
  - Presence updates: the app quietly syncs where you’re looking, so others see it too

Hierarchy View
- Tree structure
  - Parent-child mapping (like chapters and sections)
  - Expand/collapse for fast navigation
- Search and selection
  - Find by name/type
  - Jump to the Graph Explorer to see context
- Cross-document dependencies
  - See if one document references or depends on another
  - Spot missing links or unexpected crossovers
- Quick stats
  - Total nodes, root nodes, maximum depth:
  - A simple snapshot of scale and organization

Query & Analytics
- Query Builder
  - Filter by node types and relationship types
  - Text search inside nodes
  - Confidence minimum filter for relationships
  - Save and reuse queries
  - Highlight results in the Graph Explorer
- Analytics
  - Core metrics (counts, degree, density, components)
  - Centrality (top connected nodes)
  - Coverage (how many nodes are connected at least once)
  - Gap detection (isolated nodes, missing types, low diversity)
  - Practical guidance on what to fix next

Versions & Export
- Version History
  - Create checkpoints with descriptions
  - Compare any two versions (what changed)
  - Restore earlier versions safely
- Export
  - Choose format (JSON-LD, GraphML, RDF/Turtle, JSON)
  - Download with clear progress
  - Use exports for integration, backup, or later stages



## What “Good” Looks Like in Stage 2.2

- Nodes are clear: names are specific, types are correct, and important content is attached
- Relationships are meaningful: they have the right type and enough confidence
- The hierarchy reflects real structure: no orphaned sections or strange loops
- Queries return sensible results: you can find what you expect
- Analytics look healthy:
  - Few or no isolated nodes
  - A good mix of relationship types
  - Reasonable density and connected components
- You’ve created a version after major changes
- You can export confidently for downstream use



## Why This Matters for LoRA Fine-Tuning

LoRA training data needs to be:
- Accurate (no missing context or wrong links)
- Structured (so examples can be generated systematically)
- Complete (covers all the key areas of your knowledge)

Stage 2.2 is where you make that happen. You’re not just drawing a pretty picture—you’re building a blueprint of your expertise. That blueprint powers the training pair generation in Stage 3 and helps your AI learn your way of thinking, not just random facts.



## Final Thought

Stage 2.2 gives you the steering wheel. The system can suggest and help, but you decide what your knowledge really looks like. When you finish this stage with a clean, connected, and well-understood graph, the rest of the Bright Run pipeline becomes easier, faster, and more reliable. That’s how you get high-quality, on-brand, and trustworthy AI—by shaping your knowledge now, the right way.