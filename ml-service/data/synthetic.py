import numpy as np
import pandas as pd

def generate_synthetic_portfolios(n: int) -> pd.DataFrame:
    """
    Generates n synthetic portfolios with the required columns for training.
    """
    np.random.seed(42)
    
    # Generate random features
    equity_pct = np.random.uniform(0, 100, n)
    debt_pct = 100 - equity_pct
    fund_count = np.random.randint(1, 20, n)
    top_fund_concentration = np.random.uniform(0.1, 1.0, n)
    top_category_concentration = np.random.uniform(0.2, 1.0, n)
    amc_concentration = np.random.uniform(0.1, 1.0, n)
    sip_consistency_score = np.random.uniform(0.0, 1.0, n)
    xirr = np.random.uniform(-5.0, 35.0, n)
    tenure_months = np.random.randint(6, 120, n)
    goal_tenure_delta = np.random.randint(-24, 24, n)
    monthly_sip_total = np.random.uniform(500, 50000, n)
    goal_encoded = np.random.randint(0, 5, n)
    
    # Generate labels: 0 = sound, 1 = anomalous
    # Portfolios are flagged as anomalous if:
    # - fund_count is very high (> 15)
    # - concentration is extremely high (> 0.9)
    # - negative xirr for long tenure
    # - debt/equity allocation mismatch
    label = np.zeros(n, dtype=int)
    for i in range(n):
        anomalous_conditions = [
            fund_count[i] > 15,
            top_fund_concentration[i] > 0.9,
            xirr[i] < 0 and tenure_months[i] > 36,
            sip_consistency_score[i] < 0.2
        ]
        if sum(anomalous_conditions) >= 2 or (xirr[i] < -10):
            label[i] = 1
            
    df = pd.DataFrame({
        "equity_pct": equity_pct,
        "debt_pct": debt_pct,
        "fund_count": fund_count,
        "top_fund_concentration": top_fund_concentration,
        "top_category_concentration": top_category_concentration,
        "amc_concentration": amc_concentration,
        "sip_consistency_score": sip_consistency_score,
        "xirr": xirr,
        "tenure_months": tenure_months,
        "goal_tenure_delta": goal_tenure_delta,
        "monthly_sip_total": monthly_sip_total,
        "goal_encoded": goal_encoded,
        "label": label
    })
    
    return df
