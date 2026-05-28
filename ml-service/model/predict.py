import os
import joblib
import numpy as np
from typing import List, Dict, Any
from model.features import build_feature_vector

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "saved_models", "model.joblib")

def predict_portfolio(rows: List[Dict[str, Any]], assessment: Dict[str, Any]) -> Dict[str, Any]:
    # Build feature vector
    features = build_feature_vector(rows, assessment)
    
    # Load model
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError("Model file not found. Please train the model first.")
        
    model = joblib.load(MODEL_PATH)
    
    # Run prediction
    X = np.array([features])
    pred = model.predict(X)[0]
    
    # IsolationForest returns -1 for anomalies, 1 for normal
    is_anomaly = bool(pred == -1)
    
    # Calculate anomaly score (higher = more anomalous)
    anomaly_score = float(1.0 - model.score_samples(X)[0])
    
    # Flag generation logic
    flags = []
    
    # Map features to variables
    fund_count = features[2]
    top_fund_concentration = features[3]
    sip_consistency_score = features[6]
    xirr = features[7]
    goal_tenure_delta = features[9]
    
    if is_anomaly:
        if top_fund_concentration > 0.4:
            flags.append("Over-concentration: single fund > 40% of portfolio")
        if sip_consistency_score < 0.3:
            flags.append("Low SIP consistency: irregular investment pattern")
        if xirr < 0:
            flags.append("Negative returns: portfolio losing value")
        if goal_tenure_delta > 60:
            flags.append("Goal mismatch: investment tenure far from goal horizon")
        if fund_count < 2:
            flags.append("Under-diversified: less than 2 funds")
            
    return {
        "isAnomaly": is_anomaly,
        "anomalyScore": anomaly_score,
        "flags": flags
    }
