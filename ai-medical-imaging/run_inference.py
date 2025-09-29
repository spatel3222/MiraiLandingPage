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