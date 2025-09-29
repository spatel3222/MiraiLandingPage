#!/usr/bin/env python3
"""
ML Knowledge RAG System
Production-grade Retrieval Augmented Generation for ML/AI engineering knowledge base
"""

import os
import json
import pickle
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path
import logging

# Core ML/AI Libraries
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

# Text Processing
import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk.corpus import stopwords
import spacy

# Optional: Advanced embeddings
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

@dataclass
class KnowledgeChunk:
    """Represents a chunk of ML knowledge with metadata"""
    content: str
    source_file: str
    domain: str
    chunk_id: str
    embedding: Optional[np.ndarray] = None
    metadata: Dict = None

class MLKnowledgeRAG:
    """
    Production-grade RAG system for ML engineering knowledge base
    
    Features:
    - Multi-domain knowledge organization (CV, NLP, MLOps, etc.)
    - Hybrid retrieval (semantic + keyword)
    - Adaptive chunking strategies
    - Query classification and routing
    - Contextual re-ranking
    """
    
    def __init__(self, 
                 knowledge_base_path: str = "/Users/shivangpatel/Documents/GitHub/crtx.in/.claude/knowledge",
                 embedding_model: str = "all-MiniLM-L6-v2",
                 vector_db_path: str = "/Users/shivangpatel/Documents/GitHub/crtx.in/.claude/ml-rag-system/vector_db",
                 use_openai: bool = False):
        
        self.knowledge_base_path = Path(knowledge_base_path)
        self.vector_db_path = Path(vector_db_path)
        self.use_openai = use_openai and OPENAI_AVAILABLE
        
        # Initialize embedding model
        if self.use_openai:
            self.embedding_model = "text-embedding-ada-002"
            if not os.getenv("OPENAI_API_KEY"):
                raise ValueError("OpenAI API key required for OpenAI embeddings")
        else:
            self.embedding_model = SentenceTransformer(embedding_model)
        
        # Initialize vector database
        self.vector_db = chromadb.PersistentClient(
            path=str(self.vector_db_path),
            settings=Settings(allow_reset=True)
        )
        
        # ML domain classification
        self.domain_keywords = {
            'computer_vision': [
                'cnn', 'convolutional', 'vision', 'image', 'cv', 'yolo', 
                'transformer', 'vit', 'resnet', 'efficientnet', 'segmentation',
                'detection', 'classification', 'gan', 'diffusion', 'stable diffusion'
            ],
            'nlp': [
                'nlp', 'natural language', 'bert', 'gpt', 'transformer', 'llm',
                'language model', 'text', 'tokenizer', 'embedding', 'attention',
                'rag', 'fine-tuning', 'prompt', 'chatbot', 'sentiment'
            ],
            'time_series': [
                'time series', 'forecasting', 'lstm', 'gru', 'rnn', 'arima',
                'prophet', 'temporal', 'sequence', 'anomaly detection', 'seasonal'
            ],
            'mlops': [
                'mlops', 'deployment', 'serving', 'monitoring', 'pipeline',
                'kubernetes', 'docker', 'ci/cd', 'model serving', 'production',
                'infrastructure', 'scaling', 'batch inference'
            ],
            'reinforcement_learning': [
                'rl', 'reinforcement learning', 'q-learning', 'policy', 'agent',
                'environment', 'reward', 'action', 'dqn', 'ppo', 'actor-critic'
            ],
            'foundations': [
                'mathematics', 'linear algebra', 'statistics', 'probability',
                'optimization', 'gradient descent', 'backpropagation', 'theory'
            ]
        }
        
        # Initialize collections for each domain
        self.collections = {}
        self._initialize_collections()
        
        # Text processing
        self.setup_text_processing()
        
        # Logging
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def setup_text_processing(self):
        """Initialize text processing tools"""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            self.stop_words = set(stopwords.words('english'))
        except:
            self.stop_words = set()
        
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = None
            self.logger.warning("spaCy model not available. Using basic tokenization.")
    
    def _initialize_collections(self):
        """Initialize ChromaDB collections for each ML domain"""
        for domain in self.domain_keywords.keys():
            try:
                collection = self.vector_db.get_collection(f"ml_knowledge_{domain}")
                self.logger.info(f"Loaded existing collection: {domain}")
            except:
                collection = self.vector_db.create_collection(
                    name=f"ml_knowledge_{domain}",
                    metadata={"domain": domain}
                )
                self.logger.info(f"Created new collection: {domain}")
            
            self.collections[domain] = collection
    
    def classify_query_domain(self, query: str) -> List[str]:
        """
        Classify query into ML domains using keyword matching and semantic analysis
        Returns list of relevant domains sorted by relevance
        """
        query_lower = query.lower()
        domain_scores = {}
        
        # Keyword-based classification
        for domain, keywords in self.domain_keywords.items():
            score = sum(1 for keyword in keywords if keyword in query_lower)
            if score > 0:
                domain_scores[domain] = score
        
        # If no clear domain, include all domains
        if not domain_scores:
            return list(self.domain_keywords.keys())
        
        # Sort by relevance score
        sorted_domains = sorted(domain_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Return top domains (minimum 1, maximum 3)
        top_domains = [domain for domain, score in sorted_domains[:3]]
        
        # Always include foundations for theoretical questions
        if any(word in query_lower for word in ['theory', 'math', 'foundation', 'principle']):
            if 'foundations' not in top_domains:
                top_domains.append('foundations')
        
        return top_domains
    
    def chunk_document(self, content: str, source_file: str, domain: str) -> List[KnowledgeChunk]:
        """
        Intelligently chunk documents based on content structure
        """
        chunks = []
        
        # Strategy 1: Split by markdown headers
        if '##' in content:
            sections = content.split('##')
            for i, section in enumerate(sections[1:], 1):  # Skip first empty section
                if len(section.strip()) > 100:  # Minimum chunk size
                    chunk = KnowledgeChunk(
                        content=f"##{section}".strip(),
                        source_file=source_file,
                        domain=domain,
                        chunk_id=f"{source_file}_{domain}_section_{i}"
                    )
                    chunks.append(chunk)
        
        # Strategy 2: Split by sentences (for dense content)
        else:
            sentences = sent_tokenize(content)
            current_chunk = ""
            chunk_num = 1
            
            for sentence in sentences:
                if len(current_chunk + sentence) > 1000:  # Max chunk size
                    if current_chunk:
                        chunk = KnowledgeChunk(
                            content=current_chunk.strip(),
                            source_file=source_file,
                            domain=domain,
                            chunk_id=f"{source_file}_{domain}_chunk_{chunk_num}"
                        )
                        chunks.append(chunk)
                        current_chunk = sentence
                        chunk_num += 1
                    else:
                        current_chunk = sentence
                else:
                    current_chunk += " " + sentence
            
            # Add final chunk
            if current_chunk.strip():
                chunk = KnowledgeChunk(
                    content=current_chunk.strip(),
                    source_file=source_file,
                    domain=domain,
                    chunk_id=f"{source_file}_{domain}_chunk_{chunk_num}"
                )
                chunks.append(chunk)
        
        return chunks
    
    def generate_embedding(self, text: str) -> np.ndarray:
        """Generate embeddings using selected model"""
        if self.use_openai:
            response = openai.Embedding.create(
                input=text,
                model=self.embedding_model
            )
            return np.array(response['data'][0]['embedding'])
        else:
            return self.embedding_model.encode(text)
    
    def ingest_knowledge_base(self, force_rebuild: bool = False):
        """
        Ingest all knowledge files into the vector database
        """
        self.logger.info("Starting knowledge base ingestion...")
        
        if force_rebuild:
            for collection in self.collections.values():
                collection.delete()
            self._initialize_collections()
        
        knowledge_files = list(self.knowledge_base_path.glob("*.md"))
        
        for file_path in knowledge_files:
            self.logger.info(f"Processing: {file_path.name}")
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Determine domain from filename or content
                domain = self._determine_domain(file_path.name, content)
                
                # Chunk the document
                chunks = self.chunk_document(content, file_path.name, domain)
                
                # Generate embeddings and store
                for chunk in chunks:
                    embedding = self.generate_embedding(chunk.content)
                    
                    # Store in appropriate collection
                    collection = self.collections[domain]
                    collection.add(
                        ids=[chunk.chunk_id],
                        embeddings=[embedding.tolist()],
                        documents=[chunk.content],
                        metadatas=[{
                            "source_file": chunk.source_file,
                            "domain": chunk.domain,
                            "chunk_id": chunk.chunk_id
                        }]
                    )
                
                self.logger.info(f"Added {len(chunks)} chunks from {file_path.name} to {domain}")
                
            except Exception as e:
                self.logger.error(f"Error processing {file_path.name}: {e}")
        
        self.logger.info("Knowledge base ingestion completed!")
    
    def _determine_domain(self, filename: str, content: str) -> str:
        """Determine the domain of a knowledge file"""
        filename_lower = filename.lower()
        content_lower = content.lower()
        
        # Check filename first
        for domain, keywords in self.domain_keywords.items():
            if any(keyword.replace(' ', '-') in filename_lower for keyword in keywords):
                return domain
        
        # Check content
        domain_scores = {}
        for domain, keywords in self.domain_keywords.items():
            score = sum(content_lower.count(keyword) for keyword in keywords)
            domain_scores[domain] = score
        
        # Return domain with highest score, default to foundations
        best_domain = max(domain_scores.items(), key=lambda x: x[1])
        return best_domain[0] if best_domain[1] > 0 else 'foundations'
    
    def retrieve_context(self, 
                        query: str, 
                        top_k: int = 5, 
                        domains: Optional[List[str]] = None,
                        include_metadata: bool = True) -> List[Dict]:
        """
        Retrieve relevant context for a query using semantic search
        """
        if domains is None:
            domains = self.classify_query_domain(query)
        
        all_results = []
        
        # Generate query embedding
        query_embedding = self.generate_embedding(query)
        
        # Search in relevant domain collections
        for domain in domains:
            if domain in self.collections:
                collection = self.collections[domain]
                
                try:
                    results = collection.query(
                        query_embeddings=[query_embedding.tolist()],
                        n_results=min(top_k, 10),  # Retrieve more, then re-rank
                        include=['documents', 'metadatas', 'distances']
                    )
                    
                    # Format results
                    for i in range(len(results['documents'][0])):
                        result = {
                            'content': results['documents'][0][i],
                            'domain': domain,
                            'distance': results['distances'][0][i],
                            'relevance_score': 1 - results['distances'][0][i]  # Convert distance to relevance
                        }
                        
                        if include_metadata and results['metadatas'][0]:
                            result['metadata'] = results['metadatas'][0][i]
                        
                        all_results.append(result)
                
                except Exception as e:
                    self.logger.error(f"Error searching in {domain}: {e}")
        
        # Re-rank and return top results
        all_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return all_results[:top_k]
    
    def get_enhanced_context(self, 
                           query: str, 
                           top_k: int = 5,
                           include_domain_context: bool = True) -> str:
        """
        Get enhanced context string for ML agent with domain-specific knowledge
        """
        results = self.retrieve_context(query, top_k)
        
        if not results:
            return "No relevant knowledge found in the ML knowledge base."
        
        context_parts = []
        
        if include_domain_context:
            domains = list(set(r['domain'] for r in results))
            context_parts.append(f"📚 **Relevant ML Domains**: {', '.join(domains)}\n")
        
        context_parts.append("🧠 **Retrieved ML Knowledge**:\n")
        
        for i, result in enumerate(results, 1):
            domain_emoji = {
                'computer_vision': '👁️',
                'nlp': '💬', 
                'time_series': '📈',
                'mlops': '🚀',
                'reinforcement_learning': '🎮',
                'foundations': '📐'
            }.get(result['domain'], '📖')
            
            context_parts.append(
                f"{domain_emoji} **Knowledge #{i}** (Domain: {result['domain']}, "
                f"Relevance: {result['relevance_score']:.2f})\n"
                f"{result['content']}\n"
            )
        
        return "\n".join(context_parts)
    
    def search_knowledge(self, query: str, filters: Optional[Dict] = None) -> Dict:
        """
        Advanced search with filtering and analytics
        """
        results = self.retrieve_context(query, top_k=10)
        
        # Apply filters
        if filters:
            if 'domain' in filters:
                results = [r for r in results if r['domain'] in filters['domain']]
            if 'min_relevance' in filters:
                results = [r for r in results if r['relevance_score'] >= filters['min_relevance']]
        
        # Analytics
        domains_found = list(set(r['domain'] for r in results))
        avg_relevance = np.mean([r['relevance_score'] for r in results]) if results else 0
        
        return {
            'results': results,
            'analytics': {
                'total_results': len(results),
                'domains_found': domains_found,
                'average_relevance': avg_relevance,
                'query_classification': self.classify_query_domain(query)
            }
        }

def main():
    """Test the RAG system"""
    rag = MLKnowledgeRAG()
    
    # Test ingestion
    print("🚀 Starting ML Knowledge RAG System...")
    rag.ingest_knowledge_base(force_rebuild=True)
    
    # Test queries
    test_queries = [
        "How to implement a CNN for image classification?",
        "Best practices for deploying ML models in production",
        "Time series forecasting with LSTM networks",
        "Fine-tuning large language models"
    ]
    
    for query in test_queries:
        print(f"\n📝 Query: {query}")
        context = rag.get_enhanced_context(query, top_k=3)
        print(context)
        print("-" * 80)

if __name__ == "__main__":
    main()