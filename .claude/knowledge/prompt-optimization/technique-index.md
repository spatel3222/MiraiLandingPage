# Prompt Engineering Technique Index

## Quick Technique Lookup

### By Problem Type

#### **Complex Reasoning Problems**
- **Chain-of-Thought (CoT)**: +90.2% accuracy on math problems
- **Tree-of-Thoughts (ToT)**: 74% vs 4% success rate on complex tasks
- **Logic-of-Thought (LoT)**: +4.35% on ReClor, +5% on LogiQA
- **Self-Consistency**: +17.9% on GSM8K, +11.0% on SVAMP

#### **Hallucination Reduction**
- **Chain-of-Verification (CoVe)**: Significant hallucination reduction
- **Retrieval Augmented Generation (RAG)**: +56.8% exact match on TriviaQA
- **Self-Refine**: Iterative accuracy improvement
- **Verify-Then-Generate**: Multi-step validation

#### **Code Generation**
- **Chain-of-Code (CoC)**: 84% accuracy on BIG-Bench Hard (+12% gain)
- **Program-of-Thoughts (PoT)**: +12% over CoT on math problems
- **Code-as-Reasoning**: Executable logic chains
- **Structured Programming**: Step-by-step code construction

#### **Business Analysis**
- **SWOT Analysis Prompting**: Strategic evaluation
- **Growth Lever Identification**: Scalable improvements
- **KPI Dashboard Building**: Metric-focused analysis
- **Value Proposition Enhancement**: Customer-centric messaging

### By User Type

#### **Executive/Strategic**
- Role: Strategic business consultant with 15+ years experience
- Focus: High-level outcomes, ROI, competitive advantage
- Templates: SWOT analysis, growth levers, strategic roadmaps
- Success metrics: Business impact, market positioning

#### **Technical/Implementation**
- Role: Technical architect or engineering lead
- Focus: Implementation details, system design, performance
- Templates: Technical specifications, code examples, architecture
- Success metrics: Performance, scalability, compliance

#### **Creative/Marketing**
- Role: Creative strategist or marketing expert
- Focus: Messaging, positioning, content creation
- Templates: Brand strategy, content frameworks, campaign design
- Success metrics: Engagement, conversion, brand awareness

#### **Analytical/Data**
- Role: Data scientist or business analyst
- Focus: Evidence-based insights, statistical rigor
- Templates: Data analysis, research frameworks, metrics
- Success metrics: Accuracy, statistical significance, insights

### By Effectiveness Level

#### **High Impact (50%+ improvement)**
- **Few-shot Examples**: +50% consistency
- **RAG Integration**: +56.8% exact match
- **Emotion Prompting**: +115% on challenging tasks
- **Tree-of-Thoughts**: 74% vs 4% success rate

#### **Medium Impact (20-50% improvement)**
- **Chain-of-Thought**: +90.2% on math (domain-specific)
- **Clarity over Brevity**: +25-40% accuracy
- **Context-First Approach**: +30% relevance
- **Role Definition**: +20% quality

#### **Consistent Improvement (10-20%)**
- **Self-Consistency**: +17.9% reliability
- **Program-of-Thoughts**: +12% over CoT
- **Structure/XML**: +15% parsing
- **APE Optimization**: +8% GSM8K, +50% Big-Bench

## Quick Reference Templates

### **Optimization Starter**
```
<context>[Background information]</context>
<role>You are a [specific expert]</role>
<task>
  <objective>[Clear goal]</objective>
  <requirements>
    <requirement>[Constraint 1]</requirement>
    <requirement>[Constraint 2]</requirement>
  </requirements>
</task>
<examples>[1-3 relevant examples]</examples>
<output_format>[Specific structure]</output_format>
<success_criteria>[Measurable outcomes]</success_criteria>
```

### **Business Analysis Template**
```
Act as a [EXPERT TYPE] with 15+ years experience.

Context: [Industry/company background]
Objective: [Specific business goal]

Framework:
1. [Analysis dimension 1]
2. [Analysis dimension 2] 
3. [Analysis dimension 3]

For each dimension:
- Identify key factors
- Provide evidence/examples
- Rate impact (High/Medium/Low)
- Suggest strategic implications

Output as structured table with actionable insights.
```

### **Technical Implementation Template**
```
You are a [TECHNICAL ROLE].

System Requirements: [Technical constraints]
Performance Targets: [Specific metrics]

Implementation Steps:
1. [Architecture design]
2. [Core implementation]
3. [Testing & validation]
4. [Performance optimization]

Include:
- Technical specifications
- Code examples
- Success metrics
- Risk mitigation

Output: Implementation roadmap with timelines.
```

### **Mental Model Alignment Questions**
Before optimization, clarify:
- **Audience**: "Who is this for: executives, technical team, or end users?"
- **Expertise Level**: "What's the audience's domain knowledge?"
- **Output Format**: "Do you need tables, bullet points, or narrative?"
- **Detail Level**: "Should this be high-level strategy or tactical implementation?"
- **Use Case**: "How will you use this output?"
- **Success Criteria**: "What does success look like?"

## Anti-Patterns to Avoid

### **Vague Objectives**
❌ "Help me with marketing"
✅ "Create a 90-day B2B lead generation plan for SaaS targeting mid-market enterprises"

### **Missing Context**
❌ "Write a proposal"
✅ "Write a technical proposal for enterprise clients evaluating AI solutions"

### **Ambiguous Scope**
❌ "Analyze this data"
✅ "Perform customer segmentation analysis and identify 3 highest-value segments"

### **Generic Examples**
❌ "Like other companies do"
✅ "Following the Apple product launch playbook: tease → reveal → educate → convert"

### **Undefined Success**
❌ "Make it better"
✅ "Increase conversion rate by 25% while maintaining quality standards"

## Emergency Optimizations

### **When Prompts Fail**
1. **Add Chain-of-Thought**: "Let's think step by step:"
2. **Specify Role**: "You are an expert [DOMAIN] consultant"
3. **Include Examples**: Show 1-3 patterns
4. **Define Success**: Add measurable criteria
5. **Structure Output**: Use XML tags or bullet points

### **Quick Fixes**
- **Too Generic**: Add specific role and context
- **Poor Quality**: Include relevant examples
- **Wrong Format**: Specify exact output structure
- **Missing Context**: Add background information
- **Unclear Goal**: Define success criteria

---

*This index serves as a quick reference for the prompt-optimizer agent to rapidly identify appropriate techniques based on user requests and mental models.*