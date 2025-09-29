# Mental Model Alignment Patterns

## User Intent Decoding Framework

### **Surface vs Deep Analysis**

#### **Level 1: What They Said**
```
"Help me with marketing" 
"Analyze this data"
"Write a business plan"
"Improve my strategy"
"Fix this problem"
```

#### **Level 2: What They Likely Mean**
```
Marketing Request Could Mean:
- Create marketing strategy
- Generate marketing content  
- Analyze marketing performance
- Solve specific marketing problem
- Get marketing advice/consultation

Data Analysis Could Mean:
- Summarize key findings
- Identify patterns/trends
- Create visualizations
- Make recommendations
- Validate hypotheses
```

#### **Level 3: Mental Model Inference**
```
Context Clues to Consider:
- User's role (CEO, Marketing Manager, Data Analyst)
- Company size (startup, SMB, enterprise)
- Industry (healthcare, legal, retail, tech)
- Time constraints (urgent, planning, exploratory)
- Previous conversations/context
- Implicit assumptions about output
```

## User Persona Patterns

### **Executive Mental Model**
**Characteristics:**
- Time-constrained
- Strategic focus
- Outcome-oriented
- Risk-aware
- Resource-conscious

**Typical Requests:**
- "Give me the high-level view"
- "What's the bottom line?"
- "How does this impact our goals?"
- "What are the risks?"

**Optimization Approach:**
```
<role>You are a senior strategy consultant</role>
<context>Executive decision-making for [COMPANY]</context>
<output_format>
- Executive summary (2-3 bullets)
- Key recommendations with ROI
- Risk assessment
- Resource requirements
- Timeline with milestones
</output_format>
<success_criteria>
- Actionable decisions
- Clear ROI justification
- Risk mitigation plan
</success_criteria>
```

### **Technical Mental Model**
**Characteristics:**
- Detail-oriented
- Process-focused
- Implementation-minded
- Quality-conscious
- Specification-driven

**Typical Requests:**
- "How does this work technically?"
- "What are the implementation steps?"
- "Show me the code/specifications"
- "What are the technical requirements?"

**Optimization Approach:**
```
<role>You are a technical architect with domain expertise</role>
<context>Implementation planning for [SYSTEM/PROJECT]</context>
<output_format>
- Technical specifications
- Step-by-step implementation
- Code examples/pseudocode
- Performance requirements
- Testing criteria
- Dependencies and constraints
</output_format>
<success_criteria>
- Complete technical documentation
- Executable implementation plan
- Performance benchmarks
</success_criteria>
```

### **Creative Mental Model**
**Characteristics:**
- Inspiration-seeking
- Flexible approach
- Iterative thinking
- Possibility-focused
- Collaborative

**Typical Requests:**
- "Give me some ideas"
- "What are our options?"
- "How can we make this more engaging?"
- "What would be innovative here?"

**Optimization Approach:**
```
<role>You are a creative strategist and innovation consultant</role>
<context>Creative solution development for [PROJECT]</context>
<output_format>
- 3-5 distinct creative approaches
- Inspiration sources and examples
- Pros/cons for each option
- Iteration possibilities
- Implementation flexibility
</output_format>
<success_criteria>
- Multiple viable options
- Clear differentiation
- Practical implementation path
</success_criteria>
```

### **Analytical Mental Model**
**Characteristics:**
- Data-driven
- Evidence-focused
- Methodical approach
- Hypothesis-testing
- Metric-oriented

**Typical Requests:**
- "What does the data show?"
- "How do we measure this?"
- "What's the statistical significance?"
- "Can you validate this hypothesis?"

**Optimization Approach:**
```
<role>You are a senior data scientist and business analyst</role>
<context>Data-driven analysis for [BUSINESS PROBLEM]</context>
<output_format>
- Methodology and approach
- Statistical analysis results
- Data visualizations description
- Confidence levels and limitations
- Actionable insights with evidence
- Recommended next steps
</output_format>
<success_criteria>
- Statistically rigorous analysis
- Clear methodology
- Actionable insights
- Confidence intervals
</success_criteria>
```

## Context Inference Patterns

### **Industry-Specific Expectations**

#### **Healthcare**
- Regulatory compliance (HIPAA, FDA)
- Patient safety prioritization
- Evidence-based approaches
- Risk minimization
- Professional liability awareness

#### **Legal**
- Ethical compliance requirements
- Confidentiality protection
- Precedent and case law focus
- Billable hour considerations
- Bar association standards

#### **Retail/E-commerce**
- Customer experience focus
- Conversion optimization
- Seasonal considerations
- Omnichannel approach
- Revenue impact priority

#### **Technology/SaaS**
- Scalability requirements
- Technical implementation
- User adoption metrics
- Product-market fit
- Growth optimization

### **Company Size Implications**

#### **Startup Mental Model**
- Resource constraints
- Speed over perfection
- Pivot readiness
- Growth focus
- Risk tolerance

#### **SMB Mental Model**
- Practical implementation
- Cost-consciousness
- Immediate ROI need
- Limited technical resources
- Operational efficiency

#### **Enterprise Mental Model**
- Compliance requirements
- Risk management
- Stakeholder alignment
- Process standardization
- Change management

## Output Format Inference

### **Format Clues from Context**

#### **Board Meeting Context**
Expected Output:
- Executive summary format
- Key metrics and KPIs
- Risk assessment
- Resource requirements
- Decision recommendations

#### **Implementation Planning**
Expected Output:
- Step-by-step procedures
- Technical specifications
- Timeline with milestones
- Resource allocation
- Success metrics

#### **Team Communication**
Expected Output:
- Action items
- Responsibility assignments
- Progress tracking
- Next steps
- Communication plan

#### **Client Presentation**
Expected Output:
- Professional formatting
- Visual elements description
- Supporting evidence
- Clear recommendations
- Value proposition

## Expectation Calibration Questions

### **Pre-Optimization Checklist**

#### **Audience Clarification**
- "Who is the primary audience for this output?"
- "What's their level of domain expertise?"
- "Are they decision-makers or implementers?"
- "What's their time availability?"

#### **Context Understanding**
- "What's the business/project context?"
- "Are there any constraints I should know about?"
- "What's the urgency level?"
- "Who else will see this output?"

#### **Success Definition**
- "How will you know if this is successful?"
- "What specific decisions will this inform?"
- "What format would be most useful?"
- "What level of detail is needed?"

#### **Usage Scenario**
- "How will you use this output?"
- "Is this for immediate action or future reference?"
- "Will you need to present this to others?"
- "Are there follow-up steps planned?"

## Mental Model Mismatch Indicators

### **Warning Signs**
- Generic "help me with..." requests
- Missing context about audience
- Unclear success criteria
- No specification of constraints
- Ambiguous timeline expectations

### **Recovery Strategies**
1. **Pause and Clarify**: Ask specific questions before proceeding
2. **Infer and Confirm**: Make educated guesses and validate
3. **Provide Options**: Offer multiple approaches based on different scenarios
4. **Iterative Refinement**: Start with best guess and refine based on feedback

## Success Patterns

### **High Alignment Indicators**
- User accepts first output without major revisions
- Specific, actionable feedback for minor adjustments
- Request for related/follow-up analysis
- Positive confirmation of utility
- Minimal back-and-forth iterations

### **Optimization Success Metrics**
- **First-Attempt Success Rate**: >80%
- **Revision Cycles**: <2 per request
- **User Satisfaction**: 4.5+ out of 5
- **Clarity Score**: 8+ out of 10
- **Actionability Rating**: 9+ out of 10

---

*This framework enables the prompt-optimizer agent to rapidly assess user mental models and align outputs with expectations, minimizing iteration cycles.*