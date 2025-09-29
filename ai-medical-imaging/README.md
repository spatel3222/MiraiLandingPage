# Medical Image Classification for Pneumonia Detection

A production-ready CNN implementation for chest X-ray pneumonia detection, following **Stanford CS231n** best practices and **ML Engineering** production patterns.

## 🎓 Knowledge Base Implementation

This project demonstrates the application of two comprehensive knowledge bases:

### Stanford CS231n Principles Applied
- **Progressive CNN Architecture**: Increasing channel depth (32→64→128→256→512)
- **Batch Normalization**: Stable training and faster convergence
- **Xavier Weight Initialization**: Optimal weight initialization for deep networks
- **Dropout Regularization**: Preventing overfitting with 0.5 dropout rate
- **Learning Rate Scheduling**: ReduceLROnPlateau for adaptive learning
- **Early Stopping**: Preventing overfitting with patience-based stopping
- **Global Average Pooling**: Reducing parameters compared to large FC layers

### ML Engineering Best Practices
- **Production-Ready Architecture**: Comprehensive error handling and logging
- **Medical-Specific Metrics**: Sensitivity, specificity, AUC-ROC for clinical use
- **Batch Processing**: Efficient inference for clinical workflows
- **Model Checkpointing**: Recovery and persistence patterns
- **Uncertainty Quantification**: Entropy-based confidence scoring
- **Risk Level Assessment**: Clinical decision support
- **Comprehensive Monitoring**: Training history and performance tracking

## 🏗️ Architecture Overview

```
MedicalCNN Architecture:
Input (3, 224, 224)
├── Conv Block 1: 3→32 channels
├── Conv Block 2: 32→64 channels  
├── Conv Block 3: 64→128 channels
├── Conv Block 4: 128→256 channels
├── Conv Block 5: 256→512 channels
├── Global Average Pooling
├── FC Layer: 512→256 (with dropout)
└── Output Layer: 256→2 classes

Each Conv Block:
- Conv2d → BatchNorm → ReLU
- Conv2d → BatchNorm → ReLU  
- MaxPool2d(2,2)
```

## 🚀 Quick Start

### 1. Installation
```bash
# Clone the repository
git clone <repository-url>
cd ai-medical-imaging

# Install dependencies
pip install -r requirements.txt
```

### 2. Data Structure
Organize your chest X-ray data as follows:
```
data/
├── train/
│   ├── NORMAL/
│   └── PNEUMONIA/
├── val/
│   ├── NORMAL/
│   └── PNEUMONIA/
└── test/
    ├── NORMAL/
    └── PNEUMONIA/
```

### 3. Training
```bash
python train_medical_model.py \
    --data_dir /path/to/chest_xray_data \
    --epochs 100 \
    --batch_size 32 \
    --lr 0.001 \
    --output_dir ./training_output
```

### 4. Inference
```bash
# Single image
python run_inference.py \
    --model_path training_output/medical_cnn_model.pth \
    --image_path chest_xray.jpg

# Batch processing
python run_inference.py \
    --model_path training_output/medical_cnn_model.pth \
    --image_dir /path/to/images/ \
    --output_path results.json
```

## 📊 Model Performance

The model provides comprehensive evaluation metrics specific to medical diagnosis:

- **Accuracy**: Overall classification accuracy
- **Sensitivity (Recall)**: True positive rate for pneumonia detection
- **Specificity**: True negative rate for normal cases
- **Precision**: Positive predictive value
- **F1-Score**: Harmonic mean of precision and recall
- **AUC-ROC**: Area under the receiver operating characteristic curve

## 🔬 Stanford CS231n Implementation Details

### CNN Architecture Design
Following CS231n assignment patterns:
- Progressive channel expansion for hierarchical feature learning
- Batch normalization after each convolution for stable training
- ReLU activations for non-linearity
- Max pooling for spatial dimension reduction
- Global average pooling to reduce overfitting

### Training Loop Implementation
```python
# CS231n pattern implementation
for epoch in range(epochs):
    # Training phase
    model.train()
    for batch_idx, (data, target) in enumerate(train_loader):
        optimizer.zero_grad()
        output = model(data)
        loss = criterion(output, target)
        loss.backward()
        optimizer.step()
    
    # Validation phase  
    model.eval()
    with torch.no_grad():
        # Validation logic
    
    # Learning rate scheduling
    scheduler.step(val_loss)
```

### Weight Initialization
Xavier initialization for optimal gradient flow:
```python
def _initialize_weights(self):
    for m in self.modules():
        if isinstance(m, nn.Conv2d):
            nn.init.xavier_uniform_(m.weight)
```

## 🏭 Production ML Engineering Features

### Comprehensive Logging
```python
self.logger.info(
    f"Epoch {epoch+1}/{epochs} - "
    f"Train Loss: {train_loss:.4f}, "
    f"Val Sensitivity: {sensitivity:.4f}, "
    f"Val Specificity: {specificity:.4f}"
)
```

### Error Handling & Validation
- Input validation for images and parameters
- Graceful failure handling with detailed error messages
- Batch processing with per-image error isolation

### Medical-Grade Inference
```python
@dataclass
class InferenceResult:
    prediction: str
    confidence: float
    probabilities: Dict[str, float]
    risk_level: str  # 'LOW', 'MEDIUM', 'HIGH'
    uncertainty: float
    processing_time: float
    timestamp: str
```

### Uncertainty Quantification
```python
def _calculate_uncertainty(self, probabilities):
    # Entropy-based uncertainty measure
    entropy = -(probs * torch.log(probs)).sum()
    return entropy / max_entropy
```

## 📈 Training Outputs

The training process generates comprehensive outputs:

1. **Model Checkpoint**: `medical_cnn_model.pth`
2. **Training History Plots**: Loss curves, accuracy, medical metrics
3. **Training Results JSON**: Complete training metadata and metrics
4. **Training Summary**: Human-readable report
5. **Training Logs**: Detailed logging for monitoring

## 🔍 Medical Evaluation Metrics

### Key Metrics for Pneumonia Detection
- **Sensitivity (Critical)**: Ability to correctly identify pneumonia cases
- **Specificity**: Ability to correctly identify normal cases  
- **PPV (Precision)**: Proportion of positive predictions that are correct
- **NPV**: Proportion of negative predictions that are correct
- **AUC-ROC**: Overall discriminative ability

### Risk Assessment
- **LOW Risk**: High confidence (>0.8) + Low uncertainty (<0.3)
- **MEDIUM Risk**: Moderate confidence (>0.6) + Moderate uncertainty (<0.5)
- **HIGH Risk**: Low confidence or high uncertainty

## 🎯 Clinical Decision Support

The model provides structured outputs for clinical workflows:

```json
{
  "prediction": "PNEUMONIA",
  "confidence": 0.92,
  "probabilities": {
    "NORMAL": 0.08,
    "PNEUMONIA": 0.92
  },
  "risk_level": "LOW",
  "uncertainty": 0.18,
  "processing_time": 0.045,
  "timestamp": "2024-01-15T10:30:00"
}
```

## 🔧 Customization

### Model Architecture
Modify `MedicalCNN` class in `medical_cnn_model.py`:
- Adjust channel sizes for different complexity
- Add residual connections for deeper networks
- Implement attention mechanisms

### Training Parameters
Customize in `train_medical_model.py`:
- Learning rate schedules
- Data augmentation strategies
- Loss functions (focal loss for imbalanced data)
- Regularization techniques

### Inference Pipeline
Extend `MedicalImageInference` class:
- Add new medical metrics
- Implement ensemble methods
- Add DICOM file support

## 📚 Knowledge Base References

This implementation directly applies concepts from:

### Stanford CS231n: Deep Learning for Computer Vision
- **Assignment Patterns**: Progressive CNN implementation
- **Training Techniques**: Batch normalization, dropout, learning rate scheduling
- **Best Practices**: Weight initialization, early stopping, validation

### ML Engineer Knowledge Base
- **Production Patterns**: Error handling, logging, monitoring
- **Medical Applications**: Sensitivity/specificity metrics, clinical workflows
- **System Design**: Batch processing, model persistence, API design

## 🏆 Key Achievements

✅ **Stanford CS231n Compliance**: Implements all core CNN training principles  
✅ **Production Ready**: Comprehensive error handling and monitoring  
✅ **Medical Grade**: Sensitivity/specificity evaluation for clinical use  
✅ **Scalable Architecture**: Batch processing and inference optimization  
✅ **Complete Pipeline**: End-to-end training to deployment workflow  

## 📝 License

This implementation is provided for educational and research purposes, demonstrating the application of Stanford CS231n principles and production ML engineering practices in medical imaging.

---

*This project demonstrates how academic excellence (Stanford CS231n) combines with engineering best practices to create production-ready medical AI systems.*