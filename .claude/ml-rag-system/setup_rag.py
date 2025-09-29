#!/usr/bin/env python3
"""
ML Knowledge RAG Setup Script
Installs dependencies, downloads models, and initializes the vector database
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
            return False
        print(f"✅ {description} completed")
        return True
    except Exception as e:
        print(f"❌ Error running {description}: {e}")
        return False

def install_dependencies():
    """Install Python dependencies"""
    print("📦 Installing ML RAG Dependencies...")
    
    dependencies = [
        "pip install numpy>=1.21.0",
        "pip install pandas>=1.3.0", 
        "pip install scikit-learn>=1.0.0",
        "pip install sentence-transformers>=2.2.0",
        "pip install chromadb>=0.4.0",
        "pip install nltk>=3.8",
        "pip install spacy>=3.4.0"
    ]
    
    for dep in dependencies:
        if not run_command(dep, f"Installing {dep.split()[-1]}"):
            return False
    
    return True

def download_models():
    """Download required models"""
    print("🤖 Downloading AI Models...")
    
    # Download NLTK data
    nltk_downloads = [
        "python -c \"import nltk; nltk.download('punkt', quiet=True)\"",
        "python -c \"import nltk; nltk.download('stopwords', quiet=True)\""
    ]
    
    for download in nltk_downloads:
        run_command(download, "Downloading NLTK data")
    
    # Download spaCy model
    run_command("python -m spacy download en_core_web_sm", "Downloading spaCy English model")
    
    # Download sentence transformer model
    run_command(
        "python -c \"from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')\"",
        "Downloading Sentence Transformer model"
    )
    
    return True

def setup_directories():
    """Create necessary directories"""
    print("📁 Setting up directories...")
    
    base_path = Path("/Users/shivangpatel/Documents/GitHub/crtx.in/.claude/ml-rag-system")
    
    directories = [
        base_path / "vector_db",
        base_path / "logs",
        base_path / "cache"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    return True

def initialize_rag_system():
    """Initialize the RAG system and ingest knowledge"""
    print("🧠 Initializing RAG System...")
    
    script_path = Path("/Users/shivangpatel/Documents/GitHub/crtx.in/.claude/ml-rag-system")
    
    init_script = f"""
import sys
sys.path.append('{script_path}')

from ml_knowledge_rag import MLKnowledgeRAG

# Initialize RAG system
print("🚀 Starting ML Knowledge RAG System...")
rag = MLKnowledgeRAG()

# Ingest knowledge base
print("📚 Ingesting knowledge base...")
rag.ingest_knowledge_base(force_rebuild=True)

print("✅ RAG system initialized successfully!")

# Test query
test_query = "How to implement a CNN for image classification?"
print(f"\\n🧪 Testing with query: {test_query}")
context = rag.get_enhanced_context(test_query, top_k=2)
print("📝 Retrieved context:")
print(context[:500] + "..." if len(context) > 500 else context)
"""
    
    # Write temporary test script
    test_file = script_path / "test_init.py"
    with open(test_file, 'w') as f:
        f.write(init_script)
    
    # Run initialization
    success = run_command(f"cd {script_path} && python test_init.py", "Initializing RAG system")
    
    # Clean up
    if test_file.exists():
        test_file.unlink()
    
    return success

def create_usage_example():
    """Create a usage example script"""
    print("📋 Creating usage example...")
    
    example_script = '''#!/usr/bin/env python3
"""
ML RAG Usage Example
Demonstrates how to use the ML Knowledge RAG system
"""

import sys
from pathlib import Path

# Add RAG system to path
rag_path = Path("/Users/shivangpatel/Documents/GitHub/crtx.in/.claude/ml-rag-system")
sys.path.append(str(rag_path))

from ml_knowledge_rag import MLKnowledgeRAG

def main():
    """Example usage of ML RAG system"""
    
    # Initialize RAG system
    print("🚀 Initializing ML Knowledge RAG...")
    rag = MLKnowledgeRAG()
    
    # Example queries for different ML domains
    queries = [
        "How to implement a CNN for image classification?",
        "Best practices for deploying ML models in production",
        "Time series forecasting with LSTM networks", 
        "Fine-tuning large language models",
        "Reinforcement learning for autonomous driving"
    ]
    
    print("\\n🧠 Testing ML Knowledge Retrieval:\\n")
    
    for i, query in enumerate(queries, 1):
        print(f"{'='*60}")
        print(f"📝 Query {i}: {query}")
        print(f"{'='*60}")
        
        # Get enhanced context
        context = rag.get_enhanced_context(query, top_k=3)
        print(context)
        print("\\n")
    
    # Advanced search example
    print("🔍 Advanced Search Example:")
    search_results = rag.search_knowledge(
        "computer vision medical imaging",
        filters={'min_relevance': 0.5}
    )
    
    print(f"Found {search_results['analytics']['total_results']} relevant results")
    print(f"Domains: {search_results['analytics']['domains_found']}")
    print(f"Average relevance: {search_results['analytics']['average_relevance']:.3f}")

if __name__ == "__main__":
    main()
'''
    
    example_file = Path("/Users/shivangpatel/Documents/GitHub/crtx.in/.claude/ml-rag-system/example_usage.py")
    with open(example_file, 'w') as f:
        f.write(example_script)
    
    # Make executable
    os.chmod(example_file, 0o755)
    print(f"✅ Created usage example: {example_file}")
    
    return True

def main():
    """Main setup process"""
    print("🚀 ML Knowledge RAG System Setup")
    print("=" * 50)
    
    steps = [
        ("Install Dependencies", install_dependencies),
        ("Download Models", download_models), 
        ("Setup Directories", setup_directories),
        ("Initialize RAG System", initialize_rag_system),
        ("Create Usage Example", create_usage_example)
    ]
    
    for step_name, step_func in steps:
        print(f"\\n🔸 {step_name}")
        print("-" * 30)
        
        if not step_func():
            print(f"❌ Failed at step: {step_name}")
            print("Setup incomplete. Please check errors above.")
            sys.exit(1)
    
    print("\\n" + "=" * 50)
    print("🎉 ML Knowledge RAG Setup Complete!")
    print("=" * 50)
    
    print("\\n📋 Next Steps:")
    print("1. Test the system: python .claude/ml-rag-system/example_usage.py")
    print("2. The RAG system is now integrated with your ML agent")
    print("3. Use the ai-ml-data-science-engineer agent for ML tasks")
    
    print("\\n🔧 RAG System Features:")
    print("• Domain-specific knowledge retrieval (CV, NLP, MLOps, etc.)")
    print("• Semantic search with relevance scoring")
    print("• Automatic query classification")
    print("• Production-ready vector database")
    print("• Stanford-level theoretical foundations")

if __name__ == "__main__":
    main()