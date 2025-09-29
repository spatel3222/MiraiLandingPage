# Stanford CS AI/ML Curricula Knowledge Base

## CS231n: Deep Learning for Computer Vision

### Course Structure & Implementation
- **Assignments (45%)**: Hands-on neural network implementation
- **Midterm (20%)**: Theory and mathematical foundations  
- **Final Project (35%)**: Real-world computer vision applications
- **Prerequisites**: Python programming, calculus, linear algebra, probability

### Key Learning Objectives
1. **Implement and train neural networks** from scratch
2. **Master CNN architectures** for visual recognition
3. **Develop end-to-end models** for classification, detection, segmentation
4. **Learn practical engineering** for multi-million parameter networks

### Technical Implementation Focus
- **Backpropagation techniques** and gradient computation
- **Multi-layer perceptrons** and activation functions
- **Convolutional layers** and pooling operations
- **Batch normalization** and regularization techniques
- **Transfer learning** and fine-tuning strategies

### Project Implementation Patterns
```python
# Example CNN Architecture Implementation
class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super(ConvNet, self).__init__()
        self.conv1 = nn.Conv2d(3, 32, 3, padding=1)
        self.conv2 = nn.Conv2d(32, 64, 3, padding=1)
        self.conv3 = nn.Conv2d(64, 128, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(128 * 4 * 4, 512)
        self.fc2 = nn.Linear(512, num_classes)
        self.dropout = nn.Dropout(0.5)
        
    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = self.pool(F.relu(self.conv3(x)))
        x = x.view(-1, 128 * 4 * 4)
        x = F.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.fc2(x)
        return x
```

## CS224n: Natural Language Processing with Deep Learning

### Core Implementation Areas
1. **Word Embeddings**: Word2Vec, GloVe implementation from scratch
2. **Neural Language Models**: RNN, LSTM, GRU architectures
3. **Attention Mechanisms**: Self-attention and cross-attention
4. **Transformer Architecture**: Multi-head attention, positional encoding
5. **BERT and GPT**: Pre-training and fine-tuning strategies

### Assignment Implementation Patterns
```python
# Transformer Block Implementation
class TransformerBlock(nn.Module):
    def __init__(self, embed_dim, num_heads, ff_dim, dropout=0.1):
        super().__init__()
        self.attention = MultiHeadAttention(embed_dim, num_heads)
        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)
        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.ReLU(),
            nn.Linear(ff_dim, embed_dim)
        )
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x):
        attn_out = self.attention(x, x, x)
        x = self.norm1(x + self.dropout(attn_out))
        ff_out = self.feed_forward(x)
        x = self.norm2(x + self.dropout(ff_out))
        return x
```

## CS229: Machine Learning

### Mathematical Foundations
1. **Linear Algebra**: Matrix operations, eigendecomposition, SVD
2. **Probability Theory**: Bayes' theorem, distributions, expectation
3. **Optimization**: Gradient descent, Newton's method, convex optimization
4. **Statistical Learning Theory**: Bias-variance tradeoff, generalization

### Algorithm Implementation Requirements
```python
# Logistic Regression from Scratch
class LogisticRegression:
    def __init__(self, learning_rate=0.01, max_iterations=1000):
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        
    def sigmoid(self, z):
        return 1 / (1 + np.exp(-np.clip(z, -250, 250)))
        
    def fit(self, X, y):
        m, n = X.shape
        self.weights = np.zeros(n)
        self.bias = 0
        
        for i in range(self.max_iterations):
            z = X.dot(self.weights) + self.bias
            predictions = self.sigmoid(z)
            
            # Compute gradients
            dw = (1/m) * X.T.dot(predictions - y)
            db = (1/m) * np.sum(predictions - y)
            
            # Update parameters
            self.weights -= self.learning_rate * dw
            self.bias -= self.learning_rate * db
```

## Assignment Implementation Strategies

### CS231n Assignment Patterns
1. **Assignment 1**: k-NN, SVM, Softmax classifiers from scratch
2. **Assignment 2**: Multi-layer networks, batch normalization, dropout
3. **Assignment 3**: CNN architectures, PyTorch/TensorFlow implementation

### CS224n Assignment Patterns  
1. **Assignment 1**: Word2Vec and word window classification
2. **Assignment 2**: word2vec and dependency parsing
3. **Assignment 3**: Neural machine translation with RNNs
4. **Assignment 4**: Self-attention and transformers
5. **Assignment 5**: BERT fine-tuning and analysis

### Common Implementation Techniques
- **Vectorized Operations**: NumPy array operations for efficiency
- **Gradient Checking**: Numerical gradient verification
- **Batch Processing**: Mini-batch gradient descent implementation
- **Learning Rate Scheduling**: Adaptive learning rate strategies
- **Regularization**: L1/L2 regularization, dropout implementation

## Practical Engineering Patterns

### Training Loop Implementation
```python
def train_model(model, train_loader, val_loader, epochs=100):
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer)
    criterion = nn.CrossEntropyLoss()
    
    for epoch in range(epochs):
        # Training phase
        model.train()
        train_loss = 0
        for batch_idx, (data, target) in enumerate(train_loader):
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            loss.backward()
            optimizer.step()
            train_loss += loss.item()
            
        # Validation phase
        model.eval()
        val_loss = 0
        correct = 0
        with torch.no_grad():
            for data, target in val_loader:
                output = model(data)
                val_loss += criterion(output, target).item()
                pred = output.argmax(dim=1, keepdim=True)
                correct += pred.eq(target.view_as(pred)).sum().item()
                
        scheduler.step(val_loss)
```

### Model Evaluation Patterns
```python
def evaluate_model(model, test_loader, device):
    model.eval()
    all_predictions = []
    all_targets = []
    
    with torch.no_grad():
        for data, target in test_loader:
            data, target = data.to(device), target.to(device)
            output = model(data)
            predictions = output.argmax(dim=1)
            all_predictions.extend(predictions.cpu().numpy())
            all_targets.extend(target.cpu().numpy())
    
    accuracy = accuracy_score(all_targets, all_predictions)
    precision = precision_score(all_targets, all_predictions, average='weighted')
    recall = recall_score(all_targets, all_predictions, average='weighted')
    f1 = f1_score(all_targets, all_predictions, average='weighted')
    
    return {
        'accuracy': accuracy,
        'precision': precision, 
        'recall': recall,
        'f1_score': f1
    }
```

## Research Paper Implementation Approach

### Paper-to-Code Pipeline
1. **Mathematical Formulation**: Extract key equations and algorithms
2. **Architecture Design**: Translate model diagrams to code structures  
3. **Loss Function Implementation**: Custom loss functions and training objectives
4. **Hyperparameter Analysis**: Reproduce paper's experimental setup
5. **Ablation Studies**: Systematic component analysis

### Example: Attention Implementation from "Attention Is All You Need"
```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, num_heads):
        super().__init__()
        assert d_model % num_heads == 0
        self.d_model = d_model
        self.num_heads = num_heads
        self.d_k = d_model // num_heads
        
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)
        
    def scaled_dot_product_attention(self, Q, K, V, mask=None):
        scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attention_weights = F.softmax(scores, dim=-1)
        output = torch.matmul(attention_weights, V)
        return output, attention_weights
```

This knowledge base provides the concrete implementation patterns and curricula content that the ML agent can reference for Stanford-level expertise.