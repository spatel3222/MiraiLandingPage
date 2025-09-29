"""
Marketing Analytics ML Pipeline - System Architecture Visualization
Enterprise-Scale Data Processing Architecture Design
"""

import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, ConnectionPatch
import numpy as np

def create_system_architecture():
    """Generate comprehensive system architecture diagram"""
    
    fig, ax = plt.subplots(1, 1, figsize=(20, 14))
    ax.set_xlim(0, 20)
    ax.set_ylim(0, 14)
    ax.axis('off')
    
    # Color scheme
    colors = {
        'data_source': '#E3F2FD',
        'ingestion': '#BBDEFB', 
        'processing': '#90CAF9',
        'ml_layer': '#64B5F6',
        'storage': '#42A5F5',
        'api': '#2196F3',
        'frontend': '#1976D2',
        'monitoring': '#0D47A1'
    }
    
    # Data Sources Layer
    sources = [
        ('Shopify\nCSV Export', 1, 12),
        ('Meta Ads\nAPI/CSV', 1, 10), 
        ('Google Ads\nAPI/CSV', 1, 8)
    ]
    
    for name, x, y in sources:
        box = FancyBboxPatch((x-0.8, y-0.5), 1.6, 1, 
                           boxstyle="round,pad=0.1",
                           facecolor=colors['data_source'],
                           edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=10, weight='bold')
    
    # Data Ingestion Layer
    ingestion_components = [
        ('Streaming\nIngestion\n(Kafka)', 4, 11),
        ('CSV Upload\nValidator', 4, 9),
        ('Schema\nValidation', 6, 10)
    ]
    
    for name, x, y in ingestion_components:
        box = FancyBboxPatch((x-0.8, y-0.5), 1.6, 1,
                           boxstyle="round,pad=0.1", 
                           facecolor=colors['ingestion'],
                           edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, weight='bold')
    
    # ML Processing Layer
    ml_components = [
        ('Data Cleaning\nML Engine', 9, 12),
        ('Feature\nEngineering', 9, 10),
        ('UTM Campaign\nConsolidation', 9, 8),
        ('Real-time\nAggregation', 11, 10)
    ]
    
    for name, x, y in ml_components:
        box = FancyBboxPatch((x-0.8, y-0.5), 1.6, 1,
                           boxstyle="round,pad=0.1",
                           facecolor=colors['ml_layer'],
                           edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, weight='bold')
    
    # Storage Layer
    storage_components = [
        ('Time-Series\nDB (InfluxDB)', 14, 12),
        ('Document Store\n(MongoDB)', 14, 10),
        ('Cache Layer\n(Redis)', 14, 8),
        ('Data Lake\n(S3/MinIO)', 16, 10)
    ]
    
    for name, x, y in storage_components:
        box = FancyBboxPatch((x-0.8, y-0.5), 1.6, 1,
                           boxstyle="round,pad=0.1",
                           facecolor=colors['storage'],
                           edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, weight='bold')
    
    # API Layer
    api_layer = FancyBboxPatch((6, 4.5), 8, 1.5,
                              boxstyle="round,pad=0.1",
                              facecolor=colors['api'],
                              edgecolor='black', linewidth=2)
    ax.add_patch(api_layer)
    ax.text(10, 5.25, 'GraphQL API Gateway\nSub-second Response Optimization', 
            ha='center', va='center', fontsize=11, weight='bold', color='white')
    
    # Frontend Layer
    frontend_components = [
        ('Real-time\nDashboard', 4, 2),
        ('Analytics\nInterface', 8, 2),
        ('Export\nPortal', 12, 2),
        ('Admin\nPanel', 16, 2)
    ]
    
    for name, x, y in frontend_components:
        box = FancyBboxPatch((x-1, y-0.5), 2, 1,
                           boxstyle="round,pad=0.1",
                           facecolor=colors['frontend'],
                           edgecolor='black', linewidth=1.5)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, weight='bold', color='white')
    
    # Monitoring Layer
    monitoring_box = FancyBboxPatch((17.5, 0.5), 2, 6,
                                  boxstyle="round,pad=0.1",
                                  facecolor=colors['monitoring'],
                                  edgecolor='black', linewidth=2)
    ax.add_patch(monitoring_box)
    ax.text(18.5, 3.5, 'Monitoring\n&\nObservability\n\n• Metrics\n• Logging\n• Alerting\n• Performance', 
            ha='center', va='center', fontsize=9, weight='bold', color='white')
    
    # Draw connections
    connections = [
        # Data sources to ingestion
        ((1.8, 12), (3.2, 11)),
        ((1.8, 10), (3.2, 9)),
        ((1.8, 8), (5.2, 10)),
        
        # Ingestion to processing
        ((4.8, 11), (8.2, 12)),
        ((4.8, 9), (8.2, 10)),
        ((6.8, 10), (8.2, 8)),
        
        # Processing to storage
        ((9.8, 12), (13.2, 12)),
        ((9.8, 10), (13.2, 10)),
        ((11.8, 10), (13.2, 8)),
        
        # Storage to API
        ((14, 8), (10, 4.5)),
        ((14, 10), (10, 4.5)),
        ((14, 12), (10, 4.5)),
        
        # API to frontend
        ((10, 4.5), (4, 2.5)),
        ((10, 4.5), (8, 2.5)),
        ((10, 4.5), (12, 2.5)),
        ((10, 4.5), (16, 2.5))
    ]
    
    for start, end in connections:
        arrow = ConnectionPatch(start, end, "data", "data",
                              arrowstyle="->", shrinkA=5, shrinkB=5,
                              mutation_scale=20, fc="black", alpha=0.7)
        ax.add_patch(arrow)
    
    # Add title and labels
    ax.text(10, 13.5, 'Marketing Analytics ML Pipeline - Enterprise Architecture', 
            ha='center', va='center', fontsize=16, weight='bold')
    
    # Performance annotations
    performance_text = """
    Key Performance Features:
    • Stream Processing: 100k+ rows/second
    • Memory Optimization: Chunked processing
    • Cache Hit Ratio: 95%+ for dashboard queries
    • Response Time: <500ms API calls
    • Horizontal Scaling: Auto-scaling containers
    • ML Automation: Real-time data quality scoring
    """
    
    ax.text(1, 6, performance_text, ha='left', va='top', fontsize=10,
            bbox=dict(boxstyle="round,pad=0.5", facecolor='lightyellow', alpha=0.8))
    
    plt.tight_layout()
    return fig

def create_data_flow_diagram():
    """Generate detailed data flow and processing pipeline diagram"""
    
    fig, ax = plt.subplots(1, 1, figsize=(18, 12))
    ax.set_xlim(0, 18)
    ax.set_ylim(0, 12)
    ax.axis('off')
    
    # Processing stages
    stages = [
        ('CSV Upload\n(100k+ rows)', 2, 10, '#FFE0E0'),
        ('Schema Validation\n& Type Inference', 2, 8, '#FFE8E0'),
        ('Chunked Processing\n(10k row batches)', 2, 6, '#FFF0E0'),
        ('ML Data Cleaning\n(Outlier Detection)', 6, 10, '#E0F0FF'),
        ('Feature Engineering\n(UTM Parsing)', 6, 8, '#E0F8FF'),
        ('Campaign Consolidation\n(Cross-platform)', 6, 6, '#E0FFFF'),
        ('Real-time Aggregation\n(Time windows)', 10, 10, '#E0FFE0'),
        ('Performance Metrics\n(ROI, Conversion)', 10, 8, '#E8FFE0'),
        ('Cache Storage\n(Redis)', 10, 6, '#F0FFE0'),
        ('API Response\n(<500ms)', 14, 10, '#FFE0F0'),
        ('Dashboard Update\n(WebSocket)', 14, 8, '#F0E0FF'),
        ('Export Generation\n(CSV/JSON)', 14, 6, '#E0E0FF')
    ]
    
    for name, x, y, color in stages:
        box = FancyBboxPatch((x-1, y-0.7), 2, 1.4,
                           boxstyle="round,pad=0.1",
                           facecolor=color,
                           edgecolor='black', linewidth=1)
        ax.add_patch(box)
        ax.text(x, y, name, ha='center', va='center', fontsize=9, weight='bold')
    
    # Processing metrics
    metrics = [
        ('Memory Usage:\n~50MB/100k rows', 2, 4),
        ('Processing Speed:\n~2-3 seconds/100k', 6, 4),
        ('Cache Hit Rate:\n95%+ dashboard queries', 10, 4),
        ('API Response:\n<500ms average', 14, 4)
    ]
    
    for text, x, y in metrics:
        ax.text(x, y, text, ha='center', va='center', fontsize=10,
                bbox=dict(boxstyle="round,pad=0.3", facecolor='lightgray', alpha=0.7))
    
    # Draw flow arrows
    flow_connections = [
        ((2, 9.3), (2, 8.7)),  # Upload to validation
        ((2, 7.3), (2, 6.7)),  # Validation to chunking
        ((3, 6), (5, 10)),     # Chunking to ML cleaning
        ((3, 6), (5, 8)),      # Chunking to feature eng
        ((3, 6), (5, 6)),      # Chunking to consolidation
        ((7, 10), (9, 10)),    # ML to aggregation
        ((7, 8), (9, 8)),      # Features to metrics
        ((7, 6), (9, 6)),      # Consolidation to cache
        ((11, 10), (13, 10)),  # Aggregation to API
        ((11, 8), (13, 8)),    # Metrics to dashboard
        ((11, 6), (13, 6))     # Cache to export
    ]
    
    for start, end in flow_connections:
        arrow = ConnectionPatch(start, end, "data", "data",
                              arrowstyle="->", shrinkA=5, shrinkB=5,
                              mutation_scale=20, fc="blue", alpha=0.7)
        ax.add_patch(arrow)
    
    ax.text(9, 11.5, 'Data Processing Pipeline - 100k+ Row Optimization', 
            ha='center', va='center', fontsize=16, weight='bold')
    
    # Add optimization techniques box
    optimization_text = """
    Memory Optimization Techniques:
    • Pandas chunking (10k row batches)
    • Streaming JSON parsing
    • Lazy evaluation with Dask
    • Column-wise processing
    • Memory mapping for large files
    • Garbage collection optimization
    
    Performance Optimization:
    • Vectorized operations (NumPy)
    • Parallel processing (multiprocessing)
    • Asynchronous I/O operations
    • Connection pooling
    • Query result caching
    • Pre-computed aggregations
    """
    
    ax.text(16, 8, optimization_text, ha='left', va='center', fontsize=9,
            bbox=dict(boxstyle="round,pad=0.5", facecolor='lightyellow', alpha=0.9))
    
    plt.tight_layout()
    return fig

if __name__ == "__main__":
    # Generate architecture diagrams
    arch_fig = create_system_architecture()
    arch_fig.savefig('/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/Marketing_Analytics_ML_Pipeline/04_Visualizations/system_architecture.png', 
                     dpi=300, bbox_inches='tight')
    
    flow_fig = create_data_flow_diagram()
    flow_fig.savefig('/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/Marketing_Analytics_ML_Pipeline/04_Visualizations/data_flow_pipeline.png', 
                     dpi=300, bbox_inches='tight')
    
    print("Architecture diagrams generated successfully!")
    plt.show()