  # CRAWL Phase Requirements
  
  ## PRODUCT REQUIREMENTS DEFINITION PROMPT

executive-orchestrator - Supreme coordination agent for complex AI consultation projects
  CONTEXT:
  You are a senior product manager working with market research insights to define requirements for a
  legal AI self-service portal. The solution packages existing capabilities into a standalone platform
  following the proven crawl-walk-run framework.

  BUSINESS OBJECTIVE:
  Create a self-reliant portal where legal professionals can independently:
  - Authenticate with approved email credentials
  - Upload legal documents securely
  - Generate versioned digital twins of their documents
  - Manage document versions with full audit trail

  FRAMEWORK REFERENCE:
  Base requirements on the three-pillar crawl-walk-run progression:
  1. Back Office Automation (Document management, workflow automation)
  2. Legal Intelligence & Analysis (AI-powered brief generation, research, chatbot)
  3. Client Experience Enhancement (Portal access, communication, service delivery)

  DELIVERABLES REQUIRED:

  1. PRODUCT PILLARS - High-level capability areas aligned with the three strategic pillars
  2. L1 FEATURES (EPICS) - Major feature sets that deliver user value within each pillar
  3. L2 FEATURES (USER STORIES) - Specific user stories following "As a [user], I want [goal] so that
  [benefit]" format
  4. USER FLOW DIAGRAM - Visual representation of the complete user journey from login to digital twin
  creation

  SPECIFIC REQUIREMENTS:
  - Focus on CRAWL phase capabilities for MVP (foundational features)
  - Emphasize self-service functionality requiring minimal support
  - Include robust authentication and version control throughout
  - Ensure scalability for boutique law firms (10-49 lawyers)
  - when you create user flow create give the output to Tool Playwrite to visulize the flow and go through 3 rounds of iteration with design UI and UX and AI expert agents to make sure the flow is smooth and free of any firction and very intutive. Use ai-thought-leadership-engine - Content strategy, thought leadership and ai-experience-designer - UI/UX design for AI applications 

  OUTPUT FORMAT:
  Present as a structured product requirements document with clear categorization, priority levels, and
  user flow visualization.



Phase 1: Market Intelligence & Strategy Foundation
  Task(subagent_type="market-intelligence-analyst", 
       description="Legal AI portal market analysis",
       prompt="Analyze the legal AI self-service portal market for boutique law firms (10-49 lawyers) in 
  India. Focus on: 1) Competitive landscape for document automation tools, 2) Pricing strategies for 
  ₹2,000-5,000 per user range, 3) User adoption patterns for legal tech, 4) Market size and opportunity 
  for crawl phase MVP. Reference Mirai360.ai white paper insights.")

  Task(subagent_type="strategy-execution-advisor",
       description="Product strategy and pillar definition",
       prompt="Define product strategy for legal AI self-service portal based on crawl-walk-run framework.
   Create: 1) Three strategic product pillars aligned with Back Office Automation, Legal Intelligence, and
   Client Experience, 2) CRAWL phase feature prioritization for 30% productivity gains, 3) Scalability
  roadmap for boutique firms, 4) Business model validation for competitive pricing strategy.")

  Phase 2: Product Requirements Development
  Task(subagent_type="ai-solutions-architect",
       description="Technical architecture and features",
       prompt="Design technical requirements for legal AI portal focusing on: 1) L1 Features (Epics) for 
  document automation, authentication, and version control, 2) L2 Features (User Stories) following 'As a 
  [user], I want [goal] so that [benefit]' format, 3) Security and compliance requirements for legal 
  documents, 4) Scalable architecture for 10-49 lawyer firms, 5) Integration capabilities for future 
  WALK/RUN phases.")

  Phase 3: User Experience Design (3 Iteration Rounds)
  Task(subagent_type="ai-experience-designer",
       description="User flow design - Round 1",
       prompt="Create initial user flow diagram for legal AI portal from login to digital twin creation. 
  Focus on: 1) Friction-free authentication process, 2) Intuitive document upload and processing, 3) 
  Version control and audit trail access, 4) Self-service capabilities requiring minimal support. Design 
  for legal professionals with varying tech expertise.")

  Task(subagent_type="ai-thought-leadership-engine",
       description="UX content strategy - Round 2",
       prompt="Refine user flow based on Round 1 design. Focus on: 1) Content strategy for user onboarding
   and guidance, 2) Terminology and messaging for legal professionals, 3) Value proposition communication
  throughout user journey, 4) Error handling and support pathways, 5) Trust-building elements for document
   security.")

  Task(subagent_type="ai-experience-designer",
       description="Final UX optimization - Round 3", 
       prompt="Final user flow iteration incorporating content strategy feedback. Optimize for: 1) Maximum
   intuitive navigation, 2) Minimal cognitive load for legal professionals, 3) Clear value demonstration 
  at each step, 4) Seamless progression from document upload to digital twin creation, 5) 
  Mobile-responsive considerations.")

  Phase 4: Documentation and Validation
  Task(subagent_type="ai-intelligence-reporter",
       description="PRD compilation and analysis",
       prompt="Compile comprehensive Product Requirements Document incorporating all agent outputs. 
  Structure with: 1) Executive summary with CRAWL phase focus, 2) Product pillars and feature hierarchy, 
  3) User stories with acceptance criteria, 4) User flow documentation with rationale, 5) Success metrics 
  aligned with 30% productivity gains target, 6) Implementation roadmap and resource requirements.")






  ---
  Would you like to edit this prompt before I proceed with creating the requirements?

  Please review and modify any aspects you'd like changed, then I'll use the finalized prompt to generate
  comprehensive product requirements with our specialized agents.

  ### Agents
   🤖 Specialized Agents Available

  Strategic & Leadership

  - executive-orchestrator - Supreme coordination agent for complex AI consultation projects
  - strategy-execution-advisor - Business strategy consultant and transformation expert
  - market-intelligence-analyst - Market research and competitive intelligence expert

  AI & Technical Development

  - ai-solutions-architect - AI/ML technical leader for system design and implementation
  - ai-ml-data-science-engineer - End-to-end machine learning systems specialist
  - ai-optimization-specialist - AI performance and reliability engineer
  - ai-experience-designer - AI-powered UX/UI design expert

  Business Development & Growth

  - ai-thought-leadership-engine - Technical marketing and thought leadership expert
  - ai-project-orchestrator - AI project management expert
  - ai-client-advisor - Client success and consultation expert
  - ai-intelligence-reporter - AI analytics and intelligence expert

  Specialized Purpose

  - general-purpose - General-purpose agent for complex multi-step tasks
  - statusline-setup - Configure Claude Code status line settings
  - output-style-setup - Create Claude Code output styles

  ---
  🛠️ Core Tools Available

  File Operations

  - Read - Read files with support for images, PDFs, Jupyter notebooks
  - Write - Write files to filesystem (overwrites existing)
  - Edit - Exact string replacement in files
  - MultiEdit - Multiple edits to single file in one operation
  - Glob - Fast file pattern matching (e.g., "**/*.js")
  - Grep - Powerful search using ripgrep with regex support

  Code Development

  - Bash - Execute bash commands in persistent shell
  - BashOutput - Retrieve output from background bash processes
  - KillBash - Terminate background bash processes
  - NotebookEdit - Edit Jupyter notebook cells

  Planning & Organization

  - TodoWrite - Create and manage structured task lists
  - ExitPlanMode - Exit planning mode when ready to code
  - Task - Launch specialized agents for complex tasks

  Web & Research

  - WebSearch - Search the web for current information
  - WebFetch - Fetch and analyze web content with AI

  MCP (Model Context Protocol) Tools

  - ListMcpResourcesTool - List available MCP server resources
  - ReadMcpResourceTool - Read specific MCP server resources

  ---
  🔧 Shadcn/UI Integration Tools

  - mcp__shadcn__get_project_registries - Get configured registry names
  - mcp__shadcn__list_items_in_registries - List registry items
  - mcp__shadcn__search_items_in_registries - Search components with fuzzy matching
  - mcp__shadcn__view_items_in_registries - View detailed component information
  - mcp__shadcn__get_item_examples_from_registries - Find usage examples and demos
  - mcp__shadcn__get_add_command_for_items - Get CLI add commands
  - mcp__shadcn__get_audit_checklist - Verify component implementation

  ---
  🌐 RUBE/Composio Integration Tools

  - mcp__rube__RUBE_SEARCH_TOOLS - Discover 500+ app integration tools
  - mcp__rube__RUBE_CREATE_PLAN - Generate workflow execution plans
  - mcp__rube__RUBE_MULTI_EXECUTE_TOOL - Execute up to 20 tools in parallel
  - mcp__rube__RUBE_REMOTE_WORKBENCH - Python execution in remote sandbox
  - mcp__rube__RUBE_REMOTE_BASH_TOOL - Bash commands in remote environment
  - mcp__rube__RUBE_MANAGE_CONNECTIONS - Create/manage app connections

  ---
  🎯 Agent Selection Guide

  For Market Research & Strategy:
  - market-intelligence-analyst - Competitive analysis, market sizing
  - strategy-execution-advisor - Business transformation planning

  For AI Development:
  - ai-solutions-architect - Technical architecture design
  - ai-ml-data-science-engineer - ML model development
  - ai-optimization-specialist - Performance tuning

  For Content & Marketing:
  - ai-thought-leadership-engine - Content strategy, thought leadership
  - ai-experience-designer - UI/UX design for AI applications

  For Project Management:
  - executive-orchestrator - Complex multi-agent coordination
  - ai-project-orchestrator - AI project delivery management

  For Client Success:
  - ai-client-advisor - Client consultation and success planning
  - ai-intelligence-reporter - Analytics and performance reporting

  ---
