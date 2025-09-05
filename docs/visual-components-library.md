# Visual Components Library for Workshop Automation Tool

## Component Specifications for Immediate Development

### 1. Data Consolidation Progress Component

#### Visual Progress Indicator
```css
.data-consolidation-progress {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin: 16px 0;
}

.progress-stage {
  display: flex;
  align-items: center;
  margin: 12px 0;
}

.stage-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-weight: bold;
  color: white;
}

.stage-raw { background: #e74c3c; }
.stage-cleaning { background: #f39c12; }
.stage-consolidated { background: #3498db; }
.stage-ready { background: #27ae60; }

.progress-bar {
  flex: 1;
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  transition: width 0.3s ease;
}
```

#### React Component Structure
```jsx
const DataConsolidationProgress = ({ stage, progress, metrics }) => {
  const stages = [
    { id: 'raw', label: 'Raw Data', count: metrics.rawCount },
    { id: 'cleaning', label: 'Cleaning', count: metrics.cleaningCount },
    { id: 'consolidated', label: 'Consolidated', count: metrics.consolidatedCount },
    { id: 'ready', label: 'Workshop Ready', count: metrics.readyCount }
  ];

  return (
    <div className="data-consolidation-progress">
      <h3>Data Preparation Journey</h3>
      {stages.map((stageData, index) => (
        <div key={stageData.id} className="progress-stage">
          <div className={`stage-icon stage-${stageData.id}`}>
            {index + 1}
          </div>
          <div className="stage-content">
            <div className="stage-label">{stageData.label}</div>
            <div className="stage-count">{stageData.count} processes</div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stage > index ? 100 : progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 2. Department Comparison Matrix Component

#### CSS Grid Layout
```css
.department-matrix {
  display: grid;
  grid-template-columns: 150px repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.department-header {
  background: var(--dept-color);
  color: white;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
}

.department-card {
  background: white;
  border: 2px solid var(--dept-color);
  border-radius: 8px;
  padding: 20px;
  position: relative;
}

.dept-stats {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--dept-color);
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.process-list {
  margin-top: 16px;
}

.process-item {
  display: flex;
  align-items: center;
  margin: 8px 0;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.priority-high { background: #e74c3c; }
.priority-medium { background: #f39c12; }
.priority-low { background: #95a5a6; }
```

#### React Component
```jsx
const DepartmentMatrix = ({ departments }) => {
  const departmentColors = {
    'Finance': '#2E5F3E',
    'Operations': '#4A90E2',
    'HR': '#F5A623',
    'IT': '#7B68EE'
  };

  return (
    <div className="department-matrix">
      <div></div> {/* Empty corner cell */}
      {departments.map(dept => (
        <div 
          key={dept.name}
          className="department-header"
          style={{ '--dept-color': departmentColors[dept.name] }}
        >
          {dept.name}
        </div>
      ))}
      
      {departments.map(dept => (
        <div key={`${dept.name}-card`} className="department-card" 
             style={{ '--dept-color': departmentColors[dept.name] }}>
          <div className="dept-stats">
            <div className="stat-item">
              <div className="stat-value">{dept.processCount}</div>
              <div className="stat-label">Processes</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{dept.automationScore}</div>
              <div className="stat-label">Auto Score</div>
            </div>
          </div>
          
          <div className="process-list">
            {dept.topProcesses.map(process => (
              <div key={process.id} className="process-item">
                <div className={`priority-indicator priority-${process.priority}`} />
                <span>{process.name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 3. Impact vs Effort Matrix Visualization

#### SVG-based Interactive Matrix
```css
.impact-effort-matrix {
  width: 100%;
  max-width: 800px;
  margin: 24px auto;
}

.matrix-svg {
  width: 100%;
  height: 500px;
  border: 1px solid #ddd;
  background: linear-gradient(
    135deg, 
    #ff6b6b22 0%, 
    #4ecdc422 25%, 
    #45b7d122 50%, 
    #96ceb422 100%
  );
}

.quadrant-label {
  font-size: 14px;
  font-weight: bold;
  fill: #2c3e50;
  text-anchor: middle;
}

.axis-label {
  font-size: 16px;
  font-weight: bold;
  fill: #34495e;
  text-anchor: middle;
}

.process-bubble {
  cursor: pointer;
  transition: all 0.3s ease;
}

.process-bubble:hover {
  stroke-width: 3;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.bubble-text {
  font-size: 12px;
  fill: white;
  text-anchor: middle;
  font-weight: bold;
}

.quadrant-background {
  fill-opacity: 0.1;
}

.quadrant-1 { fill: #e74c3c; } /* High Impact, Low Effort - Quick Wins */
.quadrant-2 { fill: #f39c12; } /* High Impact, High Effort - Strategic */
.quadrant-3 { fill: #3498db; } /* Low Impact, Low Effort - Fill-ins */
.quadrant-4 { fill: #95a5a6; } /* Low Impact, High Effort - Questionable */
```

#### React D3 Component
```jsx
import * as d3 from 'd3';

const ImpactEffortMatrix = ({ processes, onProcessSelect }) => {
  const width = 800;
  const height = 500;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  
  const xScale = d3.scaleLinear()
    .domain([0, 10])
    .range([margin.left, width - margin.right]);
    
  const yScale = d3.scaleLinear()
    .domain([0, 10])
    .range([height - margin.bottom, margin.top]);
    
  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(processes, d => d.complexity)])
    .range([10, 40]);

  const quadrants = [
    { x: 5, y: 7.5, label: 'Quick Wins', class: 'quadrant-1' },
    { x: 5, y: 2.5, label: 'Strategic Projects', class: 'quadrant-2' },
    { x: 2.5, y: 7.5, label: 'Fill-ins', class: 'quadrant-3' },
    { x: 2.5, y: 2.5, label: 'Questionable', class: 'quadrant-4' }
  ];

  return (
    <div className="impact-effort-matrix">
      <svg className="matrix-svg" width={width} height={height}>
        {/* Quadrant backgrounds */}
        <rect x={margin.left} y={margin.top} 
              width={(width - margin.left - margin.right)/2} 
              height={(height - margin.top - margin.bottom)/2}
              className="quadrant-background quadrant-4" />
        <rect x={width/2} y={margin.top} 
              width={(width - margin.left - margin.right)/2} 
              height={(height - margin.top - margin.bottom)/2}
              className="quadrant-background quadrant-2" />
        <rect x={margin.left} y={height/2} 
              width={(width - margin.left - margin.right)/2} 
              height={(height - margin.top - margin.bottom)/2}
              className="quadrant-background quadrant-3" />
        <rect x={width/2} y={height/2} 
              width={(width - margin.left - margin.right)/2} 
              height={(height - margin.top - margin.bottom)/2}
              className="quadrant-background quadrant-1" />
        
        {/* Grid lines */}
        <line x1={width/2} y1={margin.top} x2={width/2} y2={height - margin.bottom} 
              stroke="#bdc3c7" strokeDasharray="5,5" />
        <line x1={margin.left} y1={height/2} x2={width - margin.right} y2={height/2} 
              stroke="#bdc3c7" strokeDasharray="5,5" />
        
        {/* Axes */}
        <line x1={margin.left} y1={height - margin.bottom} 
              x2={width - margin.right} y2={height - margin.bottom} 
              stroke="#2c3e50" strokeWidth="2" />
        <line x1={margin.left} y1={margin.top} 
              x2={margin.left} y2={height - margin.bottom} 
              stroke="#2c3e50" strokeWidth="2" />
        
        {/* Axis labels */}
        <text x={width/2} y={height - 10} className="axis-label">
          Implementation Effort →
        </text>
        <text x={25} y={height/2} className="axis-label" 
              transform={`rotate(-90, 25, ${height/2})`}>
          Business Impact ↑
        </text>
        
        {/* Quadrant labels */}
        {quadrants.map((quad, i) => (
          <text key={i} x={xScale(quad.x)} y={yScale(quad.y)} 
                className="quadrant-label">
            {quad.label}
          </text>
        ))}
        
        {/* Process bubbles */}
        {processes.map(process => (
          <g key={process.id}>
            <circle
              cx={xScale(process.effort)}
              cy={yScale(process.impact)}
              r={radiusScale(process.complexity)}
              fill={process.departmentColor}
              stroke="#fff"
              strokeWidth="2"
              className="process-bubble"
              onClick={() => onProcessSelect(process)}
            />
            <text
              x={xScale(process.effort)}
              y={yScale(process.impact)}
              className="bubble-text"
              dy="0.35em"
            >
              {process.shortName}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
```

### 4. Admin Data Cleaning Interface Components

#### Drag-and-Drop Process Merger
```css
.process-merger {
  display: flex;
  gap: 24px;
  margin: 24px 0;
}

.process-column {
  flex: 1;
  min-height: 400px;
  border: 2px dashed #bdc3c7;
  border-radius: 8px;
  padding: 16px;
  background: #f8f9fa;
}

.column-header {
  text-align: center;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #bdc3c7;
}

.draggable-process {
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 12px;
  margin: 8px 0;
  cursor: move;
  transition: all 0.2s ease;
}

.draggable-process:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.draggable-process.dragging {
  opacity: 0.6;
  transform: rotate(5deg);
}

.drop-zone {
  border: 2px dashed #3498db;
  background: #ebf3fd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  color: #3498db;
  margin: 12px 0;
}

.drop-zone.drag-over {
  background: #d4edda;
  border-color: #27ae60;
  color: #27ae60;
}

.similarity-badge {
  display: inline-block;
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
  margin-left: 8px;
}

.merge-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 16px 0;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.merge-button {
  background: #27ae60;
  color: white;
}

.merge-button:hover {
  background: #219a52;
}

.separate-button {
  background: #f39c12;
  color: white;
}

.separate-button:hover {
  background: #e67e22;
}
```

#### React Drag-and-Drop Component
```jsx
const ProcessMerger = ({ processes, onMerge, onSeparate }) => {
  const [draggedProcess, setDraggedProcess] = useState(null);
  const [mergeGroup, setMergeGroup] = useState([]);

  const handleDragStart = (e, process) => {
    setDraggedProcess(process);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, targetZone) => {
    e.preventDefault();
    if (targetZone === 'merge' && draggedProcess) {
      setMergeGroup([...mergeGroup, draggedProcess]);
    }
    setDraggedProcess(null);
  };

  const similarityScore = (proc1, proc2) => {
    // Simple similarity calculation based on name and description
    const name1 = proc1.name.toLowerCase();
    const name2 = proc2.name.toLowerCase();
    const commonWords = name1.split(' ').filter(word => 
      name2.includes(word) && word.length > 2
    ).length;
    return Math.min(commonWords * 25, 95);
  };

  return (
    <div className="process-merger">
      <div className="process-column">
        <div className="column-header">Available Processes</div>
        {processes.map(process => (
          <div
            key={process.id}
            className="draggable-process"
            draggable
            onDragStart={(e) => handleDragStart(e, process)}
          >
            <div className="process-name">{process.name}</div>
            <div className="process-department">{process.department}</div>
            {mergeGroup.length > 0 && (
              <span className="similarity-badge">
                {Math.max(...mergeGroup.map(p => similarityScore(process, p)))}% similar
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="process-column">
        <div className="column-header">Merge Group</div>
        <div 
          className="drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, 'merge')}
        >
          {mergeGroup.length === 0 ? 
            'Drag similar processes here to merge' : 
            `${mergeGroup.length} processes ready to merge`
          }
        </div>
        
        {mergeGroup.map(process => (
          <div key={process.id} className="draggable-process">
            <div className="process-name">{process.name}</div>
            <div className="process-department">{process.department}</div>
          </div>
        ))}

        {mergeGroup.length > 1 && (
          <div className="merge-actions">
            <button 
              className="action-button merge-button"
              onClick={() => onMerge(mergeGroup)}
            >
              Merge Processes
            </button>
            <button 
              className="action-button separate-button"
              onClick={() => setMergeGroup([])}
            >
              Clear Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### 5. Workshop Voting Interface

#### Real-time Voting Component
```css
.voting-interface {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 24px;
  margin: 16px 0;
}

.process-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 16px 0;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.process-title {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.department-tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 16px 0;
}

.metric-item {
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
}

.rating-stars {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.star {
  width: 16px;
  height: 16px;
  margin: 0 2px;
  cursor: pointer;
}

.star.filled {
  fill: #f39c12;
}

.star.empty {
  fill: #bdc3c7;
}

.voting-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 20px;
}

.vote-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.vote-high {
  background: #27ae60;
  color: white;
}

.vote-high:hover {
  background: #219a52;
}

.vote-medium {
  background: #f39c12;
  color: white;
}

.vote-medium:hover {
  background: #e67e22;
}

.vote-low {
  background: #95a5a6;
  color: white;
}

.vote-low:hover {
  background: #7f8c8d;
}

.consensus-meter {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.consensus-bar {
  height: 8px;
  background: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin: 8px 0;
}

.consensus-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #f39c12, #27ae60);
  transition: width 0.3s ease;
}

.consensus-text {
  text-align: center;
  font-size: 14px;
  color: #666;
}
```

#### React Voting Component
```jsx
const VotingInterface = ({ process, participants, onVote, votes }) => {
  const [userVote, setUserVote] = useState(null);
  
  const voteBreakdown = votes.reduce((acc, vote) => {
    acc[vote.priority] = (acc[vote.priority] || 0) + 1;
    return acc;
  }, {});

  const consensusLevel = Math.max(...Object.values(voteBreakdown)) / participants.length * 100;
  
  const getConsensusStatus = (level) => {
    if (level >= 80) return { text: 'Strong Consensus', color: '#27ae60' };
    if (level >= 60) return { text: 'Moderate Agreement', color: '#f39c12' };
    return { text: 'Discussion Needed', color: '#e74c3c' };
  };

  const status = getConsensusStatus(consensusLevel);

  return (
    <div className="voting-interface">
      <div className="process-card">
        <div className="process-header">
          <div className="process-title">{process.name}</div>
          <div 
            className="department-tag" 
            style={{ background: process.departmentColor }}
          >
            {process.department}
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-label">Impact</div>
            <div className="metric-value">{process.impact}/10</div>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`star ${i < process.impact/2 ? 'filled' : 'empty'}`}>
                  <polygon points="12,2 15,8 22,8 17,13 19,20 12,16 5,20 7,13 2,8 9,8" />
                </svg>
              ))}
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Effort</div>
            <div className="metric-value">{process.effort}/10</div>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`star ${i < process.effort/2 ? 'filled' : 'empty'}`}>
                  <polygon points="12,2 15,8 22,8 17,13 19,20 12,16 5,20 7,13 2,8 9,8" />
                </svg>
              ))}
            </div>
          </div>
          
          <div className="metric-item">
            <div className="metric-label">Risk</div>
            <div className="metric-value">{process.risk}/10</div>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`star ${i < process.risk/2 ? 'filled' : 'empty'}`}>
                  <polygon points="12,2 15,8 22,8 17,13 19,20 12,16 5,20 7,13 2,8 9,8" />
                </svg>
              ))}
            </div>
          </div>
        </div>

        <div className="voting-buttons">
          <button 
            className={`vote-button vote-high ${userVote === 'high' ? 'active' : ''}`}
            onClick={() => {
              setUserVote('high');
              onVote(process.id, 'high');
            }}
          >
            High Priority
          </button>
          <button 
            className={`vote-button vote-medium ${userVote === 'medium' ? 'active' : ''}`}
            onClick={() => {
              setUserVote('medium');
              onVote(process.id, 'medium');
            }}
          >
            Medium Priority
          </button>
          <button 
            className={`vote-button vote-low ${userVote === 'low' ? 'active' : ''}`}
            onClick={() => {
              setUserVote('low');
              onVote(process.id, 'low');
            }}
          >
            Low Priority
          </button>
        </div>

        <div className="consensus-meter">
          <div className="consensus-text">
            Group Consensus: {Math.round(consensusLevel)}% - {status.text}
          </div>
          <div className="consensus-bar">
            <div 
              className="consensus-fill" 
              style={{ 
                width: `${consensusLevel}%`,
                background: status.color 
              }} 
            />
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            High: {voteBreakdown.high || 0} | 
            Medium: {voteBreakdown.medium || 0} | 
            Low: {voteBreakdown.low || 0}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Implementation Notes

### Component Integration Strategy
1. **Start with static components** - Build the visual layouts first
2. **Add interactivity progressively** - Layer in drag-and-drop, voting, etc.
3. **Implement real-time features last** - WebSocket integration for live updates
4. **Test with projector setups** - Ensure readability at presentation scale

### Responsive Design Considerations
```css
@media (max-width: 768px) {
  .department-matrix {
    grid-template-columns: 1fr;
  }
  
  .process-merger {
    flex-direction: column;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1200px) {
  .voting-interface {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
```

These components provide the visual foundation for transforming complex process data into compelling workshop narratives that drive clear decisions and build consensus among participants.