"""
Production-Ready Medical Image Inference Pipeline
Following Stanford CS231n and ML Engineering Best Practices

This module provides:
1. Robust inference pipeline with error handling
2. Batch processing capabilities for clinical workflows
3. Medical-grade confidence scoring and uncertainty quantification
4. Integration-ready API for healthcare systems

Knowledge Base Implementation:
- CS231n: Proper model loading, inference patterns, preprocessing
- ML Engineering: Error handling, logging, monitoring, production deployment
"""

import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple, Optional, Union
import time
from datetime import datetime
import warnings
from dataclasses import dataclass
import io
import base64

from medical_cnn_model import MedicalCNN


@dataclass
class InferenceResult:
    """Structure for inference results with medical context"""
    prediction: str  # 'NORMAL' or 'PNEUMONIA'
    confidence: float  # Probability of the predicted class
    probabilities: Dict[str, float]  # All class probabilities
    risk_level: str  # 'LOW', 'MEDIUM', 'HIGH'
    uncertainty: float  # Measure of model uncertainty
    processing_time: float  # Time taken for inference
    timestamp: str  # When inference was performed
    metadata: Dict  # Additional information


@dataclass
class InferenceConfig:
    """Configuration for inference pipeline"""
    model_path: str
    device: str = 'auto'
    confidence_threshold: float = 0.8
    uncertainty_threshold: float = 0.3
    batch_size: int = 32
    log_level: str = 'INFO'


class MedicalImageInference:
    """
    Production-ready inference pipeline for medical image classification
    
    Features:
    - Robust error handling and validation
    - Confidence and uncertainty scoring
    - Batch processing for clinical workflows
    - Medical-grade result interpretation
    - Comprehensive logging and monitoring
    """
    
    def __init__(self, config: InferenceConfig):
        self.config = config
        self.device = self._setup_device()
        self.logger = self._setup_logging()
        self.model = None
        self.transforms = None
        self.class_names = ['NORMAL', 'PNEUMONIA']
        
        # Load model and setup transforms
        self._load_model()
        self._setup_transforms()
        
        self.logger.info("Medical image inference pipeline initialized successfully")
    
    def _setup_device(self) -> torch.device:
        """Setup compute device with fallbacks"""
        if self.config.device == 'auto':
            if torch.cuda.is_available():
                device = torch.device('cuda')
                self.logger.info(f"Using GPU: {torch.cuda.get_device_name()}")
            else:
                device = torch.device('cpu')
                self.logger.info("Using CPU for inference")
        else:
            device = torch.device(self.config.device)
        
        return device
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for inference monitoring"""
        logging.basicConfig(
            level=getattr(logging, self.config.log_level),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('medical_inference.log'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)
    
    def _load_model(self):
        """Load trained model with error handling"""
        try:
            model_path = Path(self.config.model_path)
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load model checkpoint
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # Initialize model architecture
            self.model = MedicalCNN(num_classes=2)
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.to(self.device)
            self.model.eval()
            
            self.logger.info(f"Model loaded successfully from {model_path}")
            
            # Log model metadata if available
            if 'metadata' in checkpoint:
                metadata = checkpoint['metadata']
                self.logger.info(f"Model trained with: {metadata.get('args', {})}")
                
        except Exception as e:
            self.logger.error(f"Failed to load model: {str(e)}")
            raise
    
    def _setup_transforms(self):
        """Setup image preprocessing transforms"""
        self.transforms = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    
    def _validate_image(self, image: Union[str, Path, Image.Image, np.ndarray]) -> Image.Image:
        """Validate and convert image to PIL format"""
        try:
            if isinstance(image, (str, Path)):
                # Load from file path
                image_path = Path(image)
                if not image_path.exists():
                    raise FileNotFoundError(f"Image file not found: {image_path}")
                image = Image.open(image_path)
            
            elif isinstance(image, np.ndarray):
                # Convert numpy array to PIL
                if image.ndim == 3 and image.shape[2] == 3:
                    image = Image.fromarray(image.astype(np.uint8))
                elif image.ndim == 2:
                    image = Image.fromarray(image.astype(np.uint8), mode='L')
                else:
                    raise ValueError(f"Unsupported numpy array shape: {image.shape}")
            
            elif not isinstance(image, Image.Image):
                raise ValueError(f"Unsupported image type: {type(image)}")
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Validate image dimensions
            width, height = image.size
            if width < 32 or height < 32:
                raise ValueError(f"Image too small: {width}x{height}. Minimum size is 32x32")
            
            return image
            
        except Exception as e:
            self.logger.error(f"Image validation failed: {str(e)}")
            raise
    
    def _preprocess_image(self, image: Image.Image) -> torch.Tensor:
        """Preprocess image for model input"""
        try:
            # Apply transforms
            tensor = self.transforms(image)
            
            # Add batch dimension
            tensor = tensor.unsqueeze(0)
            
            # Move to device
            tensor = tensor.to(self.device)
            
            return tensor
            
        except Exception as e:
            self.logger.error(f"Image preprocessing failed: {str(e)}")
            raise
    
    def _calculate_uncertainty(self, probabilities: torch.Tensor) -> float:
        """Calculate model uncertainty using entropy"""
        # Avoid log(0) by adding small epsilon
        eps = 1e-8
        probs = probabilities + eps
        
        # Calculate entropy as uncertainty measure
        entropy = -(probs * torch.log(probs)).sum().item()
        
        # Normalize by max entropy for binary classification
        max_entropy = -np.log(0.5) * 2
        normalized_uncertainty = entropy / max_entropy
        
        return normalized_uncertainty
    
    def _determine_risk_level(self, confidence: float, uncertainty: float) -> str:
        """Determine clinical risk level based on confidence and uncertainty"""
        if confidence >= self.config.confidence_threshold and uncertainty <= self.config.uncertainty_threshold:
            return 'LOW'
        elif confidence >= 0.6 and uncertainty <= 0.5:
            return 'MEDIUM'
        else:
            return 'HIGH'
    
    def _format_result(self, probabilities: torch.Tensor, processing_time: float, 
                      uncertainty: float, metadata: Dict = None) -> InferenceResult:
        """Format inference results with medical context"""
        
        # Get prediction and confidence
        probs_numpy = probabilities.cpu().numpy()[0]
        predicted_idx = np.argmax(probs_numpy)
        prediction = self.class_names[predicted_idx]
        confidence = float(probs_numpy[predicted_idx])
        
        # Create probability dictionary
        prob_dict = {name: float(prob) for name, prob in zip(self.class_names, probs_numpy)}
        
        # Determine risk level
        risk_level = self._determine_risk_level(confidence, uncertainty)
        
        return InferenceResult(
            prediction=prediction,
            confidence=confidence,
            probabilities=prob_dict,
            risk_level=risk_level,
            uncertainty=uncertainty,
            processing_time=processing_time,
            timestamp=datetime.now().isoformat(),
            metadata=metadata or {}
        )
    
    def predict_single(self, image: Union[str, Path, Image.Image, np.ndarray], 
                      metadata: Dict = None) -> InferenceResult:
        """
        Predict single image with comprehensive error handling
        
        Args:
            image: Input image (file path, PIL Image, or numpy array)
            metadata: Optional metadata to include in result
            
        Returns:
            InferenceResult with prediction, confidence, and medical context
        """
        start_time = time.time()
        
        try:
            # Validate and preprocess image
            pil_image = self._validate_image(image)
            input_tensor = self._preprocess_image(pil_image)
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(input_tensor)
                probabilities = F.softmax(outputs, dim=1)
            
            # Calculate uncertainty
            uncertainty = self._calculate_uncertainty(probabilities)
            
            # Calculate processing time
            processing_time = time.time() - start_time
            
            # Format and return result
            result = self._format_result(probabilities, processing_time, uncertainty, metadata)
            
            self.logger.info(
                f"Inference completed: {result.prediction} "
                f"(confidence: {result.confidence:.3f}, "
                f"uncertainty: {result.uncertainty:.3f}, "
                f"risk: {result.risk_level})"
            )
            
            return result
            
        except Exception as e:
            self.logger.error(f"Inference failed: {str(e)}")
            raise
    
    def predict_batch(self, images: List[Union[str, Path, Image.Image, np.ndarray]], 
                     metadata_list: List[Dict] = None) -> List[InferenceResult]:
        """
        Batch prediction for multiple images
        
        Args:
            images: List of input images
            metadata_list: Optional list of metadata for each image
            
        Returns:
            List of InferenceResult objects
        """
        if not images:
            raise ValueError("Empty image list provided")
        
        if metadata_list is None:
            metadata_list = [{}] * len(images)
        
        if len(metadata_list) != len(images):
            raise ValueError("Metadata list length must match images list length")
        
        results = []
        batch_start_time = time.time()
        
        self.logger.info(f"Starting batch inference for {len(images)} images")
        
        # Process images in batches
        for i in range(0, len(images), self.config.batch_size):
            batch_images = images[i:i + self.config.batch_size]
            batch_metadata = metadata_list[i:i + self.config.batch_size]
            
            batch_results = []
            
            try:
                # Preprocess batch
                batch_tensors = []
                valid_indices = []
                
                for j, image in enumerate(batch_images):
                    try:
                        pil_image = self._validate_image(image)
                        tensor = self._preprocess_image(pil_image)
                        batch_tensors.append(tensor)
                        valid_indices.append(j)
                    except Exception as e:
                        self.logger.warning(f"Skipping image {i+j}: {str(e)}")
                        # Add error result for failed image
                        error_result = InferenceResult(
                            prediction="ERROR",
                            confidence=0.0,
                            probabilities={"NORMAL": 0.0, "PNEUMONIA": 0.0},
                            risk_level="HIGH",
                            uncertainty=1.0,
                            processing_time=0.0,
                            timestamp=datetime.now().isoformat(),
                            metadata={"error": str(e), **batch_metadata[j]}
                        )
                        batch_results.append(error_result)
                
                # Run batch inference
                if batch_tensors:
                    batch_tensor = torch.cat(batch_tensors, dim=0)
                    
                    start_time = time.time()
                    with torch.no_grad():
                        outputs = self.model(batch_tensor)
                        probabilities = F.softmax(outputs, dim=1)
                    processing_time = time.time() - start_time
                    
                    # Process results
                    for k, valid_idx in enumerate(valid_indices):
                        prob_tensor = probabilities[k:k+1]
                        uncertainty = self._calculate_uncertainty(prob_tensor)
                        
                        result = self._format_result(
                            prob_tensor, 
                            processing_time / len(valid_indices),
                            uncertainty,
                            batch_metadata[valid_idx]
                        )
                        
                        # Insert result at correct position
                        while len(batch_results) <= valid_idx:
                            batch_results.append(None)
                        batch_results[valid_idx] = result
                
                results.extend([r for r in batch_results if r is not None])
                
            except Exception as e:
                self.logger.error(f"Batch processing failed: {str(e)}")
                # Add error results for the entire batch
                for j, metadata in enumerate(batch_metadata):
                    error_result = InferenceResult(
                        prediction="ERROR",
                        confidence=0.0,
                        probabilities={"NORMAL": 0.0, "PNEUMONIA": 0.0},
                        risk_level="HIGH",
                        uncertainty=1.0,
                        processing_time=0.0,
                        timestamp=datetime.now().isoformat(),
                        metadata={"error": str(e), **metadata}
                    )
                    results.append(error_result)
        
        total_time = time.time() - batch_start_time
        self.logger.info(f"Batch inference completed in {total_time:.2f}s for {len(images)} images")
        
        return results
    
    def get_model_info(self) -> Dict:
        """Get model information and capabilities"""
        return {
            "model_type": "MedicalCNN",
            "classes": self.class_names,
            "input_size": (224, 224),
            "device": str(self.device),
            "confidence_threshold": self.config.confidence_threshold,
            "uncertainty_threshold": self.config.uncertainty_threshold,
            "capabilities": [
                "Chest X-ray analysis",
                "Pneumonia detection",
                "Confidence scoring",
                "Uncertainty quantification",
                "Risk level assessment"
            ]
        }
    
    def export_results_json(self, results: List[InferenceResult], filepath: str):
        """Export results to JSON format"""
        json_data = {
            "model_info": self.get_model_info(),
            "inference_timestamp": datetime.now().isoformat(),
            "total_images": len(results),
            "results": [
                {
                    "prediction": r.prediction,
                    "confidence": r.confidence,
                    "probabilities": r.probabilities,
                    "risk_level": r.risk_level,
                    "uncertainty": r.uncertainty,
                    "processing_time": r.processing_time,
                    "timestamp": r.timestamp,
                    "metadata": r.metadata
                }
                for r in results
            ]
        }
        
        with open(filepath, 'w') as f:
            json.dump(json_data, f, indent=2)
        
        self.logger.info(f"Results exported to {filepath}")


def create_sample_inference_script():
    """Create a sample script showing how to use the inference pipeline"""
    
    script_content = '''
# Sample Medical Image Inference Script
# Usage: python run_inference.py --model_path model.pth --image_path image.jpg

import argparse
from pathlib import Path
from medical_inference import MedicalImageInference, InferenceConfig

def main():
    parser = argparse.ArgumentParser(description='Medical Image Inference')
    parser.add_argument('--model_path', type=str, required=True, help='Path to trained model')
    parser.add_argument('--image_path', type=str, help='Path to single image')
    parser.add_argument('--image_dir', type=str, help='Path to directory of images')
    parser.add_argument('--output_path', type=str, default='inference_results.json',
                       help='Path to save results')
    parser.add_argument('--confidence_threshold', type=float, default=0.8,
                       help='Confidence threshold for risk assessment')
    
    args = parser.parse_args()
    
    # Setup inference configuration
    config = InferenceConfig(
        model_path=args.model_path,
        confidence_threshold=args.confidence_threshold
    )
    
    # Initialize inference pipeline
    inference = MedicalImageInference(config)
    
    # Run inference
    if args.image_path:
        # Single image inference
        result = inference.predict_single(args.image_path)
        print(f"Prediction: {result.prediction}")
        print(f"Confidence: {result.confidence:.3f}")
        print(f"Risk Level: {result.risk_level}")
        
    elif args.image_dir:
        # Batch inference
        image_dir = Path(args.image_dir)
        image_paths = list(image_dir.glob('*.jpg')) + list(image_dir.glob('*.jpeg'))
        
        results = inference.predict_batch(image_paths)
        
        # Print summary
        print(f"Processed {len(results)} images")
        pneumonia_count = sum(1 for r in results if r.prediction == 'PNEUMONIA')
        print(f"Pneumonia detected: {pneumonia_count}")
        print(f"Normal: {len(results) - pneumonia_count}")
        
        # Export results
        inference.export_results_json(results, args.output_path)
        print(f"Results saved to {args.output_path}")

if __name__ == '__main__':
    main()
'''
    
    return script_content


if __name__ == "__main__":
    # Demo code
    print("Medical Image Inference Pipeline")
    print("=" * 40)
    print("Features:")
    print("✓ Production-ready error handling")
    print("✓ Batch processing capabilities")
    print("✓ Medical-grade confidence scoring")
    print("✓ Uncertainty quantification")
    print("✓ Risk level assessment")
    print("✓ Comprehensive logging")
    print("✓ JSON export functionality")
    
    # Show sample usage
    sample_script = create_sample_inference_script()
    
    with open('/Users/shivangpatel/Documents/GitHub/crtx.in/ai-medical-imaging/run_inference.py', 'w') as f:
        f.write(sample_script)
    
    print(f"\nSample inference script created: run_inference.py")