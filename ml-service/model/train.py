import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.metrics import f1_score, precision_score, recall_score
from data.synthetic import generate_synthetic_portfolios

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "saved_models", "model.joblib")

def train_model() -> dict:
    # 1. Generate 150 synthetic labelled portfolios
    df = generate_synthetic_portfolios(150)
    
    feature_cols = [
        "equity_pct", "debt_pct", "fund_count", "top_fund_concentration",
        "top_category_concentration", "amc_concentration", "sip_consistency_score",
        "xirr", "tenure_months", "goal_tenure_delta", "monthly_sip_total", "goal_encoded"
    ]
    
    X_labeled = df[feature_cols].values
    y_labeled = df["label"].values # 0 = sound, 1 = anomalous
    
    # 2. Train Isolation Forest on labeled data
    model = IsolationForest(contamination=0.5, random_state=42)
    model.fit(X_labeled)
    
    # 3. Self-training:
    # Generate some unlabelled portfolios to run pseudo-labeling
    df_unlabeled = generate_synthetic_portfolios(100)
    X_unlabeled = df_unlabeled[feature_cols].values
    
    # Predict raw scores
    preds = model.predict(X_unlabeled)
    pseudo_labels = np.where(preds == -1, 1, 0)
    
    # Calculate anomaly score (lower score_samples means outlier)
    anomaly_scores = 1.0 - model.score_samples(X_unlabeled) # higher = outlier
    
    # Confidence is how far it is from the threshold (0.5 represents uncertain)
    confidences = np.abs(anomaly_scores - 0.5) * 2.0
    
    # Select high confidence pseudo labels (> 0.7)
    high_conf_indices = np.where(confidences > 0.7)[0]
    
    if len(high_conf_indices) > 0:
        X_pseudo = X_unlabeled[high_conf_indices]
        y_pseudo = pseudo_labels[high_conf_indices]
        
        # Combine original labeled and pseudo labeled data
        X_combined = np.vstack([X_labeled, X_pseudo])
        combined_anomaly_ratio = float(np.sum(y_labeled) + np.sum(y_pseudo)) / len(X_combined)
        combined_anomaly_ratio = max(0.01, min(0.49, combined_anomaly_ratio))
        
        # Retrain model
        model = IsolationForest(contamination=combined_anomaly_ratio, random_state=42)
        model.fit(X_combined)
    
    # Calculate metrics on labeled training set
    preds_labeled = model.predict(X_labeled)
    y_pred = np.where(preds_labeled == -1, 1, 0)
    
    f1 = f1_score(y_labeled, y_pred, zero_division=0)
    precision = precision_score(y_labeled, y_pred, zero_division=0)
    recall = recall_score(y_labeled, y_pred, zero_division=0)
    
    # 4. Save model to saved_models/
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    
    return {
        "f1": float(f1),
        "precision": float(precision),
        "recall": float(recall)
    }
