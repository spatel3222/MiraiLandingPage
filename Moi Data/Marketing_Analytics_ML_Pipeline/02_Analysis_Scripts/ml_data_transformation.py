"""
Marketing Analytics ML Pipeline - Data Transformation & ML Automation
Advanced machine learning workflows for automated data cleaning, feature engineering, and quality scoring
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional, Tuple, Union
import asyncio
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import json
import logging
from pathlib import Path

# ML and Data Science Libraries
from sklearn.preprocessing import StandardScaler, RobustScaler, MinMaxScaler
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.cluster import DBSCAN
from sklearn.decomposition import PCA
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import category_encoders as ce

# Time Series and Advanced Analytics
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.tsa.stattools import adfuller
import networkx as nx

# ML Model Persistence
import joblib
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class MLTransformationConfig:
    """Configuration for ML data transformation pipeline"""
    outlier_contamination: float = 0.05
    feature_selection_k: int = 20
    encoding_strategy: str = 'auto'  # auto, onehot, target, binary
    scaling_method: str = 'robust'  # standard, robust, minmax
    quality_threshold: float = 0.8
    model_cache_dir: str = "models"
    enable_feature_engineering: bool = True
    enable_anomaly_detection: bool = True
    enable_clustering: bool = True
    time_window_analysis: bool = True

@dataclass
class DataQualityScore:
    """Data quality assessment results"""
    overall_score: float
    completeness_score: float
    consistency_score: float
    validity_score: float
    accuracy_score: float
    issues: List[str] = field(default_factory=list)
    recommendations: List[str] = field(default_factory=list)

class AdvancedFeatureEngineer:
    """Advanced feature engineering with ML automation"""
    
    def __init__(self, config: MLTransformationConfig):
        self.config = config
        self.encoders = {}
        self.scalers = {}
        self.feature_importance = {}
        
    async def engineer_features(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """
        Comprehensive feature engineering pipeline
        
        Args:
            df: Input DataFrame
            data_type: Type of data (shopify, meta_ads, google_ads)
            
        Returns:
            DataFrame with engineered features
        """
        logger.info(f"Starting feature engineering for {data_type} data")
        
        # Create a copy to avoid modifying original data
        engineered_df = df.copy()
        
        # 1. Temporal features
        engineered_df = await self._create_temporal_features(engineered_df)
        
        # 2. Campaign performance features
        engineered_df = await self._create_performance_features(engineered_df, data_type)
        
        # 3. UTM parameter features
        engineered_df = await self._create_utm_features(engineered_df)
        
        # 4. Statistical features
        engineered_df = await self._create_statistical_features(engineered_df)
        
        # 5. Interaction features
        engineered_df = await self._create_interaction_features(engineered_df, data_type)
        
        # 6. Text features (if applicable)
        engineered_df = await self._create_text_features(engineered_df)
        
        # 7. Categorical encoding
        engineered_df = await self._encode_categorical_features(engineered_df, data_type)
        
        logger.info(f"Feature engineering completed. Original: {df.shape[1]} features, Engineered: {engineered_df.shape[1]} features")
        
        return engineered_df

    async def _create_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create time-based features"""
        
        # Identify date columns
        date_columns = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        for date_col in date_columns:
            if date_col in df.columns:
                try:
                    # Convert to datetime if not already
                    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                    
                    # Extract temporal features
                    df[f'{date_col}_year'] = df[date_col].dt.year
                    df[f'{date_col}_month'] = df[date_col].dt.month
                    df[f'{date_col}_day'] = df[date_col].dt.day
                    df[f'{date_col}_dayofweek'] = df[date_col].dt.dayofweek
                    df[f'{date_col}_hour'] = df[date_col].dt.hour
                    df[f'{date_col}_is_weekend'] = df[date_col].dt.dayofweek.isin([5, 6]).astype(int)
                    df[f'{date_col}_quarter'] = df[date_col].dt.quarter
                    
                    # Calculate time since epoch (useful for trend analysis)
                    df[f'{date_col}_timestamp'] = df[date_col].astype('int64') // 10**9
                    
                    # Create time-based bins
                    df[f'{date_col}_time_of_day'] = pd.cut(
                        df[date_col].dt.hour,
                        bins=[0, 6, 12, 18, 24],
                        labels=['night', 'morning', 'afternoon', 'evening'],
                        include_lowest=True
                    )
                    
                except Exception as e:
                    logger.warning(f"Failed to create temporal features for {date_col}: {str(e)}")
        
        return df

    async def _create_performance_features(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Create performance-based features specific to marketing data"""
        
        if data_type == 'meta_ads' or data_type == 'google_ads':
            # Ad performance features
            if 'impressions' in df.columns and 'clicks' in df.columns:
                df['ctr'] = (df['clicks'] / df['impressions']).fillna(0)
                df['ctr_category'] = pd.cut(df['ctr'], bins=[0, 0.01, 0.02, 0.05, 1], 
                                          labels=['low', 'medium', 'high', 'very_high'])
            
            if 'spend' in df.columns and 'clicks' in df.columns:
                df['cpc'] = (df['spend'] / df['clicks']).fillna(0)
                df['cpc_efficiency'] = 1 / (1 + df['cpc'])  # Higher efficiency for lower CPC
            
            if 'conversions' in df.columns and 'clicks' in df.columns:
                df['conversion_rate'] = (df['conversions'] / df['clicks']).fillna(0)
                df['conversion_quality'] = pd.cut(df['conversion_rate'], 
                                                bins=[0, 0.01, 0.05, 0.1, 1],
                                                labels=['poor', 'fair', 'good', 'excellent'])
            
            # Cost efficiency features
            if 'spend' in df.columns and 'conversions' in df.columns:
                df['cost_per_conversion'] = (df['spend'] / df['conversions']).fillna(0)
            
            # Revenue features
            if 'revenue' in df.columns and 'spend' in df.columns:
                df['roas'] = (df['revenue'] / df['spend']).fillna(0)
                df['profit'] = df['revenue'] - df['spend']
                df['profit_margin'] = (df['profit'] / df['revenue']).fillna(0)
        
        elif data_type == 'shopify':
            # E-commerce performance features
            if 'total_price' in df.columns:
                df['order_value_category'] = pd.cut(df['total_price'],
                                                   bins=[0, 50, 100, 200, float('inf')],
                                                   labels=['low', 'medium', 'high', 'premium'])
            
            if 'quantity' in df.columns and 'total_price' in df.columns:
                df['avg_item_price'] = df['total_price'] / df['quantity']
            
            # Customer behavior features
            if 'customer_id' in df.columns:
                customer_stats = df.groupby('customer_id').agg({
                    'total_price': ['count', 'sum', 'mean'],
                    'quantity': 'sum'
                }).round(2)
                customer_stats.columns = ['order_frequency', 'total_spent', 'avg_order_value', 'total_items']
                df = df.merge(customer_stats, on='customer_id', how='left')
        
        return df

    async def _create_utm_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features from UTM parameters"""
        
        utm_columns = [col for col in df.columns if 'utm_' in col.lower()]
        
        for utm_col in utm_columns:
            if utm_col in df.columns:
                # Create UTM parameter frequency encoding
                value_counts = df[utm_col].value_counts()
                df[f'{utm_col}_frequency'] = df[utm_col].map(value_counts)
                
                # Create UTM parameter length features
                df[f'{utm_col}_length'] = df[utm_col].astype(str).str.len()
                
                # Extract keywords from UTM content/term
                if 'content' in utm_col or 'term' in utm_col:
                    df[f'{utm_col}_has_brand'] = df[utm_col].str.contains('brand|company', case=False, na=False).astype(int)
                    df[f'{utm_col}_has_promotion'] = df[utm_col].str.contains('sale|discount|promo|offer', case=False, na=False).astype(int)
        
        # Create combined UTM features
        if all(col in df.columns for col in ['utm_source', 'utm_medium', 'utm_campaign']):
            df['utm_combination'] = df['utm_source'] + '_' + df['utm_medium'] + '_' + df['utm_campaign']
            
            # UTM combination frequency
            combo_counts = df['utm_combination'].value_counts()
            df['utm_combination_frequency'] = df['utm_combination'].map(combo_counts)
        
        return df

    async def _create_statistical_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create statistical features for numerical columns"""
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Remove ID columns and already created features
        exclude_patterns = ['id', '_id', 'timestamp', '_category', '_frequency']
        numeric_columns = [col for col in numeric_columns 
                          if not any(pattern in col.lower() for pattern in exclude_patterns)]
        
        if len(numeric_columns) > 1:
            # Create rolling statistics
            for col in numeric_columns[:5]:  # Limit to first 5 to avoid explosion
                if col in df.columns:
                    # Rolling mean and std (if there's temporal ordering)
                    if len(df) > 10:
                        df[f'{col}_rolling_mean_5'] = df[col].rolling(window=5, min_periods=1).mean()
                        df[f'{col}_rolling_std_5'] = df[col].rolling(window=5, min_periods=1).std()
                    
                    # Percentile features
                    df[f'{col}_percentile'] = df[col].rank(pct=True)
                    
                    # Z-score
                    df[f'{col}_zscore'] = (df[col] - df[col].mean()) / df[col].std()
        
        return df

    async def _create_interaction_features(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Create interaction features between important variables"""
        
        if data_type in ['meta_ads', 'google_ads']:
            # Ad performance interactions
            if all(col in df.columns for col in ['ctr', 'cpc']):
                df['ctr_cpc_interaction'] = df['ctr'] * df['cpc']
            
            if all(col in df.columns for col in ['impressions', 'conversion_rate']):
                df['impression_conversion_interaction'] = df['impressions'] * df['conversion_rate']
            
            # Spend efficiency interactions
            if all(col in df.columns for col in ['spend', 'ctr']):
                df['spend_ctr_efficiency'] = df['spend'] * df['ctr']
        
        elif data_type == 'shopify':
            # E-commerce interactions
            if all(col in df.columns for col in ['quantity', 'avg_item_price']):
                df['quantity_price_interaction'] = df['quantity'] * df['avg_item_price']
        
        return df

    async def _create_text_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create features from text columns"""
        
        text_columns = df.select_dtypes(include=['object']).columns.tolist()
        
        for col in text_columns:
            if col in df.columns and df[col].dtype == 'object':
                # Basic text features
                df[f'{col}_length'] = df[col].astype(str).str.len()
                df[f'{col}_word_count'] = df[col].astype(str).str.split().str.len()
                
                # Specific keyword detection
                if 'campaign' in col.lower() or 'content' in col.lower():
                    df[f'{col}_has_numbers'] = df[col].str.contains(r'\d', na=False).astype(int)
                    df[f'{col}_has_special_chars'] = df[col].str.contains(r'[!@#$%^&*(),.?":{}|<>]', na=False).astype(int)
        
        return df

    async def _encode_categorical_features(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Encode categorical features using appropriate strategies"""
        
        categorical_columns = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Remove high cardinality columns (>50 unique values)
        categorical_columns = [col for col in categorical_columns 
                             if df[col].nunique() <= 50]
        
        for col in categorical_columns:
            if col in df.columns:
                unique_count = df[col].nunique()
                
                if unique_count <= 10:
                    # Use one-hot encoding for low cardinality
                    if f"{data_type}_{col}_encoder" not in self.encoders:
                        self.encoders[f"{data_type}_{col}_encoder"] = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
                        
                        # Fit encoder
                        encoded_values = self.encoders[f"{data_type}_{col}_encoder"].fit_transform(df[[col]])
                        feature_names = [f"{col}_{cat}" for cat in self.encoders[f"{data_type}_{col}_encoder"].categories_[0]]
                    else:
                        # Transform using existing encoder
                        encoded_values = self.encoders[f"{data_type}_{col}_encoder"].transform(df[[col]])
                        feature_names = [f"{col}_{cat}" for cat in self.encoders[f"{data_type}_{col}_encoder"].categories_[0]]
                    
                    # Add encoded features to dataframe
                    encoded_df = pd.DataFrame(encoded_values, columns=feature_names, index=df.index)
                    df = pd.concat([df, encoded_df], axis=1)
                    
                else:
                    # Use target encoding for higher cardinality
                    if f"{data_type}_{col}_target_encoder" not in self.encoders:
                        # For demonstration, use label encoding (in practice, use target encoding with a target variable)
                        self.encoders[f"{data_type}_{col}_target_encoder"] = LabelEncoder()
                        df[f"{col}_encoded"] = self.encoders[f"{data_type}_{col}_target_encoder"].fit_transform(df[col].astype(str))
                    else:
                        df[f"{col}_encoded"] = self.encoders[f"{data_type}_{col}_target_encoder"].transform(df[col].astype(str))
        
        return df

class MLDataQualityAssessor:
    """Advanced ML-based data quality assessment"""
    
    def __init__(self, config: MLTransformationConfig):
        self.config = config
        self.quality_models = {}
        
    async def assess_data_quality(self, df: pd.DataFrame, data_type: str) -> DataQualityScore:
        """
        Comprehensive data quality assessment using ML techniques
        
        Args:
            df: DataFrame to assess
            data_type: Type of data being assessed
            
        Returns:
            DataQualityScore with detailed assessment
        """
        logger.info(f"Assessing data quality for {data_type} data")
        
        # Initialize scores
        completeness_score = await self._assess_completeness(df)
        consistency_score = await self._assess_consistency(df)
        validity_score = await self._assess_validity(df, data_type)
        accuracy_score = await self._assess_accuracy(df, data_type)
        
        # Calculate overall score (weighted average)
        overall_score = (
            completeness_score * 0.3 +
            consistency_score * 0.25 +
            validity_score * 0.25 +
            accuracy_score * 0.2
        )
        
        # Generate issues and recommendations
        issues = await self._identify_issues(df, completeness_score, consistency_score, validity_score, accuracy_score)
        recommendations = await self._generate_recommendations(issues, data_type)
        
        quality_score = DataQualityScore(
            overall_score=round(overall_score, 3),
            completeness_score=round(completeness_score, 3),
            consistency_score=round(consistency_score, 3),
            validity_score=round(validity_score, 3),
            accuracy_score=round(accuracy_score, 3),
            issues=issues,
            recommendations=recommendations
        )
        
        logger.info(f"Data quality assessment completed. Overall score: {quality_score.overall_score}")
        
        return quality_score

    async def _assess_completeness(self, df: pd.DataFrame) -> float:
        """Assess data completeness"""
        
        total_cells = df.shape[0] * df.shape[1]
        missing_cells = df.isnull().sum().sum()
        completeness = 1 - (missing_cells / total_cells)
        
        return max(0, min(1, completeness))

    async def _assess_consistency(self, df: pd.DataFrame) -> float:
        """Assess data consistency using statistical methods"""
        
        consistency_scores = []
        
        # Check for duplicate rows
        duplicate_ratio = df.duplicated().sum() / len(df)
        consistency_scores.append(1 - duplicate_ratio)
        
        # Check for consistent data types
        for col in df.columns:
            if df[col].dtype == 'object':
                # Check for mixed types in string columns
                try:
                    # Attempt to convert to numeric
                    numeric_convertible = pd.to_numeric(df[col], errors='coerce').notna().sum()
                    if 0 < numeric_convertible < len(df) * 0.9:  # Mixed types detected
                        consistency_scores.append(0.5)
                    else:
                        consistency_scores.append(1.0)
                except:
                    consistency_scores.append(1.0)
        
        return np.mean(consistency_scores) if consistency_scores else 1.0

    async def _assess_validity(self, df: pd.DataFrame, data_type: str) -> float:
        """Assess data validity based on business rules"""
        
        validity_scores = []
        
        # Data type specific validity checks
        if data_type in ['meta_ads', 'google_ads']:
            # Ad spend should be positive
            if 'spend' in df.columns:
                positive_spend = (df['spend'] >= 0).sum() / len(df)
                validity_scores.append(positive_spend)
            
            # Impressions should be >= clicks
            if 'impressions' in df.columns and 'clicks' in df.columns:
                valid_impression_click = (df['impressions'] >= df['clicks']).sum() / len(df)
                validity_scores.append(valid_impression_click)
            
            # CTR should be between 0 and 1
            if 'ctr' in df.columns:
                valid_ctr = ((df['ctr'] >= 0) & (df['ctr'] <= 1)).sum() / len(df)
                validity_scores.append(valid_ctr)
                
        elif data_type == 'shopify':
            # Order total should be positive
            if 'total_price' in df.columns:
                positive_total = (df['total_price'] >= 0).sum() / len(df)
                validity_scores.append(positive_total)
            
            # Quantity should be positive
            if 'quantity' in df.columns:
                positive_quantity = (df['quantity'] > 0).sum() / len(df)
                validity_scores.append(positive_quantity)
        
        # Email format validation
        email_columns = [col for col in df.columns if 'email' in col.lower()]
        for col in email_columns:
            if col in df.columns:
                email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
                valid_emails = df[col].str.match(email_pattern, na=False).sum() / len(df)
                validity_scores.append(valid_emails)
        
        return np.mean(validity_scores) if validity_scores else 1.0

    async def _assess_accuracy(self, df: pd.DataFrame, data_type: str) -> float:
        """Assess data accuracy using outlier detection and statistical methods"""
        
        accuracy_scores = []
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        for col in numeric_columns[:5]:  # Limit to avoid long processing times
            if col in df.columns and len(df[col].dropna()) > 10:
                # Use IQR method for outlier detection
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower_bound = Q1 - 1.5 * IQR
                upper_bound = Q3 + 1.5 * IQR
                
                outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
                accuracy = 1 - (outliers / len(df))
                accuracy_scores.append(max(0, accuracy))
        
        return np.mean(accuracy_scores) if accuracy_scores else 1.0

    async def _identify_issues(self, df: pd.DataFrame, completeness: float, 
                             consistency: float, validity: float, accuracy: float) -> List[str]:
        """Identify specific data quality issues"""
        
        issues = []
        
        if completeness < 0.9:
            missing_cols = df.columns[df.isnull().any()].tolist()
            issues.append(f"High missing data in columns: {missing_cols[:5]}")
        
        if consistency < 0.8:
            duplicate_count = df.duplicated().sum()
            if duplicate_count > 0:
                issues.append(f"Found {duplicate_count} duplicate rows")
        
        if validity < 0.8:
            issues.append("Business rule violations detected in data")
        
        if accuracy < 0.8:
            issues.append("Statistical outliers detected that may indicate data quality issues")
        
        # Check for specific issues
        if df.empty:
            issues.append("Dataset is empty")
        
        if len(df.columns) == 0:
            issues.append("No columns found in dataset")
        
        return issues

    async def _generate_recommendations(self, issues: List[str], data_type: str) -> List[str]:
        """Generate actionable recommendations based on identified issues"""
        
        recommendations = []
        
        for issue in issues:
            if "missing data" in issue.lower():
                recommendations.append("Implement data imputation strategies or investigate data collection process")
            
            if "duplicate" in issue.lower():
                recommendations.append("Remove duplicate records and implement deduplication logic")
            
            if "business rule" in issue.lower():
                recommendations.append("Review data validation rules and implement data quality checks at ingestion")
            
            if "outliers" in issue.lower():
                recommendations.append("Investigate outliers and consider outlier removal or transformation strategies")
            
            if "empty" in issue.lower():
                recommendations.append("Verify data source and loading process")
        
        # Add data type specific recommendations
        if data_type in ['meta_ads', 'google_ads']:
            recommendations.append("Validate ad performance metrics against platform reporting")
        elif data_type == 'shopify':
            recommendations.append("Cross-reference e-commerce data with payment processor records")
        
        return recommendations

class AnomalyDetectionEngine:
    """Advanced anomaly detection for marketing data"""
    
    def __init__(self, config: MLTransformationConfig):
        self.config = config
        self.anomaly_models = {}
        
    async def detect_anomalies(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """
        Detect anomalies in marketing data using multiple ML techniques
        
        Args:
            df: Input DataFrame
            data_type: Type of data
            
        Returns:
            DataFrame with anomaly scores and flags
        """
        logger.info(f"Starting anomaly detection for {data_type} data")
        
        result_df = df.copy()
        
        # 1. Statistical outlier detection
        result_df = await self._statistical_outlier_detection(result_df)
        
        # 2. Isolation Forest anomaly detection
        result_df = await self._isolation_forest_detection(result_df, data_type)
        
        # 3. Clustering-based anomaly detection
        result_df = await self._clustering_based_detection(result_df, data_type)
        
        # 4. Time-series anomaly detection (if applicable)
        result_df = await self._time_series_anomaly_detection(result_df, data_type)
        
        # 5. Combine anomaly scores
        result_df = await self._combine_anomaly_scores(result_df)
        
        anomaly_count = (result_df['is_anomaly'] == True).sum()
        logger.info(f"Detected {anomaly_count} anomalies out of {len(result_df)} records")
        
        return result_df

    async def _statistical_outlier_detection(self, df: pd.DataFrame) -> pd.DataFrame:
        """Detect outliers using statistical methods"""
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        outlier_flags = []
        
        for col in numeric_columns:
            if col in df.columns and len(df[col].dropna()) > 10:
                # Z-score method
                z_scores = np.abs((df[col] - df[col].mean()) / df[col].std())
                outliers_zscore = z_scores > 3
                
                # IQR method
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                outliers_iqr = (df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))
                
                # Combine methods
                combined_outliers = outliers_zscore | outliers_iqr
                outlier_flags.append(combined_outliers)
        
        if outlier_flags:
            df['statistical_outlier'] = np.any(outlier_flags, axis=0)
        else:
            df['statistical_outlier'] = False
        
        return df

    async def _isolation_forest_detection(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Detect anomalies using Isolation Forest"""
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_columns) > 1 and len(df) > 50:
            # Prepare data for Isolation Forest
            feature_data = df[numeric_columns].fillna(0)
            
            if f"{data_type}_isolation_forest" not in self.anomaly_models:
                # Train new model
                model = IsolationForest(
                    contamination=self.config.outlier_contamination,
                    random_state=42,
                    n_estimators=100
                )
                model.fit(feature_data)
                self.anomaly_models[f"{data_type}_isolation_forest"] = model
            else:
                model = self.anomaly_models[f"{data_type}_isolation_forest"]
            
            # Predict anomalies
            anomaly_predictions = model.predict(feature_data)
            anomaly_scores = model.decision_function(feature_data)
            
            df['isolation_forest_anomaly'] = anomaly_predictions == -1
            df['isolation_forest_score'] = anomaly_scores
        else:
            df['isolation_forest_anomaly'] = False
            df['isolation_forest_score'] = 0
        
        return df

    async def _clustering_based_detection(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Detect anomalies using clustering (DBSCAN)"""
        
        numeric_columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        if len(numeric_columns) > 1 and len(df) > 50:
            # Prepare and scale data
            feature_data = df[numeric_columns].fillna(0)
            scaler = StandardScaler()
            scaled_data = scaler.fit_transform(feature_data)
            
            # Apply DBSCAN clustering
            dbscan = DBSCAN(eps=0.5, min_samples=5)
            cluster_labels = dbscan.fit_predict(scaled_data)
            
            # Points with label -1 are considered anomalies
            df['clustering_anomaly'] = cluster_labels == -1
            df['cluster_label'] = cluster_labels
        else:
            df['clustering_anomaly'] = False
            df['cluster_label'] = 0
        
        return df

    async def _time_series_anomaly_detection(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Detect time-series anomalies if temporal data is available"""
        
        # Find date columns
        date_columns = [col for col in df.columns if 'date' in col.lower() or 'time' in col.lower()]
        
        if date_columns and len(df) > 100:
            date_col = date_columns[0]
            
            try:
                # Convert to datetime and sort
                df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
                df_sorted = df.sort_values(date_col).reset_index(drop=True)
                
                # Find numeric columns for time series analysis
                numeric_cols = df_sorted.select_dtypes(include=[np.number]).columns.tolist()
                
                time_series_anomalies = []
                
                for col in numeric_cols[:3]:  # Limit to first 3 columns
                    if col in df_sorted.columns:
                        # Create time series
                        ts_data = df_sorted.set_index(date_col)[col].fillna(method='ffill')
                        
                        if len(ts_data) > 50:
                            # Simple moving average anomaly detection
                            window = min(20, len(ts_data) // 4)
                            moving_avg = ts_data.rolling(window=window).mean()
                            moving_std = ts_data.rolling(window=window).std()
                            
                            # Detect anomalies as points outside 2 standard deviations
                            upper_bound = moving_avg + 2 * moving_std
                            lower_bound = moving_avg - 2 * moving_std
                            
                            anomalies = (ts_data > upper_bound) | (ts_data < lower_bound)
                            time_series_anomalies.append(anomalies.values)
                
                if time_series_anomalies:
                    df['time_series_anomaly'] = np.any(time_series_anomalies, axis=0)
                else:
                    df['time_series_anomaly'] = False
                    
            except Exception as e:
                logger.warning(f"Time series anomaly detection failed: {str(e)}")
                df['time_series_anomaly'] = False
        else:
            df['time_series_anomaly'] = False
        
        return df

    async def _combine_anomaly_scores(self, df: pd.DataFrame) -> pd.DataFrame:
        """Combine different anomaly detection methods"""
        
        anomaly_columns = [col for col in df.columns if 'anomaly' in col and col != 'is_anomaly']
        
        if anomaly_columns:
            # Create combined anomaly score
            anomaly_count = df[anomaly_columns].sum(axis=1)
            df['anomaly_score'] = anomaly_count / len(anomaly_columns)
            
            # Flag as anomaly if detected by multiple methods
            df['is_anomaly'] = anomaly_count >= 2
        else:
            df['anomaly_score'] = 0
            df['is_anomaly'] = False
        
        return df

async def main():
    """Main function demonstrating ML data transformation pipeline"""
    
    config = MLTransformationConfig(
        outlier_contamination=0.05,
        feature_selection_k=20,
        quality_threshold=0.8,
        enable_feature_engineering=True,
        enable_anomaly_detection=True
    )
    
    # Initialize components
    feature_engineer = AdvancedFeatureEngineer(config)
    quality_assessor = MLDataQualityAssessor(config)
    anomaly_detector = AnomalyDetectionEngine(config)
    
    # Example usage with sample data
    sample_data = pd.DataFrame({
        'campaign_name': ['campaign_a', 'campaign_b', 'campaign_c'] * 100,
        'impressions': np.random.randint(1000, 10000, 300),
        'clicks': np.random.randint(10, 500, 300),
        'spend': np.random.uniform(10, 1000, 300),
        'conversions': np.random.randint(0, 50, 300),
        'date': pd.date_range('2024-01-01', periods=300, freq='D'),
        'utm_source': ['google', 'facebook', 'instagram'] * 100,
        'utm_medium': ['cpc', 'social', 'display'] * 100
    })
    
    data_type = 'meta_ads'
    
    logger.info("Starting ML data transformation pipeline demonstration")
    
    # 1. Feature Engineering
    engineered_data = await feature_engineer.engineer_features(sample_data, data_type)
    logger.info(f"Feature engineering completed: {engineered_data.shape}")
    
    # 2. Data Quality Assessment
    quality_score = await quality_assessor.assess_data_quality(engineered_data, data_type)
    logger.info(f"Data quality score: {quality_score.overall_score}")
    logger.info(f"Issues found: {quality_score.issues}")
    logger.info(f"Recommendations: {quality_score.recommendations}")
    
    # 3. Anomaly Detection
    anomaly_results = await anomaly_detector.detect_anomalies(engineered_data, data_type)
    anomaly_count = (anomaly_results['is_anomaly'] == True).sum()
    logger.info(f"Anomalies detected: {anomaly_count}/{len(anomaly_results)}")
    
    logger.info("ML data transformation pipeline demonstration completed")

if __name__ == "__main__":
    asyncio.run(main())