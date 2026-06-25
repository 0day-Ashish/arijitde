import numpy as np
import pandas as pd

def generate_synthetic_portfolios(n_samples: int = 150) -> pd.DataFrame:
    # 75 sound, 75 anomalous
    n_sound = n_samples // 2
    n_anom = n_samples - n_sound
    
    np.random.seed(42)
    
    data = []
    
    # Sound portfolios
    for _ in range(n_sound):
        age = np.random.randint(22, 60)
        goal_encoded = np.random.randint(0, 5) # 0 to 4
        
        # Age benchmarks for equity
        if age < 30:
            equity_pct = np.random.uniform(70, 90)
        elif age <= 40:
            equity_pct = np.random.uniform(60, 75)
        else:
            equity_pct = np.random.uniform(30, 58)
        
        debt_pct = 100 - equity_pct
        fund_count = np.random.randint(3, 7) # 3 to 6
        top_fund_concentration = np.random.uniform(0.15, 0.38) # under 40%
        top_category_concentration = top_fund_concentration
        amc_concentration = top_fund_concentration
        sip_consistency_score = np.random.uniform(0.5, 1.0) # > 50% SIP
        xirr = np.random.uniform(8.0, 20.0) # > 8%
        
        # Goal horizons mapping
        horizons = [120, 240, 24, 60, 36]
        goal_horizon = horizons[goal_encoded]
        
        # Sound tenure months
        tenure_months = np.random.uniform(max(6, goal_horizon - 20), goal_horizon + 20)
        goal_tenure_delta = abs(goal_horizon - tenure_months)
        monthly_sip_total = np.random.uniform(2000, 30000)
        
        data.append({
            "equity_pct": equity_pct,
            "debt_pct": debt_pct,
            "fund_count": float(fund_count),
            "top_fund_concentration": top_fund_concentration,
            "top_category_concentration": top_category_concentration,
            "amc_concentration": amc_concentration,
            "sip_consistency_score": sip_consistency_score,
            "xirr": xirr,
            "tenure_months": tenure_months,
            "goal_tenure_delta": goal_tenure_delta,
            "monthly_sip_total": monthly_sip_total,
            "goal_encoded": float(goal_encoded),
            "label": 0 # sound
        })
        
    # Anomalous portfolios
    for _ in range(n_anom):
        # Create anomalies by breaking rules
        anomaly_type = np.random.randint(0, 5)
        
        age = np.random.randint(22, 60)
        goal_encoded = np.random.randint(0, 5)
        horizons = [120, 240, 24, 60, 36]
        goal_horizon = horizons[goal_encoded]
        
        # Base sound values
        equity_pct = np.random.uniform(70, 90) if age < 30 else np.random.uniform(40, 60)
        debt_pct = 100 - equity_pct
        fund_count = np.random.randint(3, 7)
        top_fund_concentration = np.random.uniform(0.15, 0.35)
        sip_consistency_score = np.random.uniform(0.5, 1.0)
        xirr = np.random.uniform(8.0, 15.0)
        tenure_months = np.random.uniform(max(6, goal_horizon - 20), goal_horizon + 20)
        goal_tenure_delta = abs(goal_horizon - tenure_months)
        monthly_sip_total = np.random.uniform(2000, 20000)
        
        # Inject anomalies
        if anomaly_type == 0:
            # Overconcentration: single fund > 40%
            top_fund_concentration = np.random.uniform(0.45, 0.85)
        elif anomaly_type == 1:
            # Low SIP consistency: irregular pattern
            sip_consistency_score = np.random.uniform(0.0, 0.25)
        elif anomaly_type == 2:
            # Negative returns: portfolio losing value
            xirr = np.random.uniform(-15.0, -1.0)
        elif anomaly_type == 3:
            # Goal mismatch: delta > 60 months
            tenure_months = np.random.uniform(1, 10) if goal_horizon > 100 else np.random.uniform(150, 200)
            goal_tenure_delta = abs(goal_horizon - tenure_months)
        elif anomaly_type == 4:
            # Under-diversification: less than 2 funds
            fund_count = 1
            top_fund_concentration = 1.0
            sip_consistency_score = 1.0 if np.random.rand() > 0.5 else 0.0
            
        top_category_concentration = top_fund_concentration
        amc_concentration = top_fund_concentration
        
        data.append({
            "equity_pct": equity_pct,
            "debt_pct": debt_pct,
            "fund_count": float(fund_count),
            "top_fund_concentration": top_fund_concentration,
            "top_category_concentration": top_category_concentration,
            "amc_concentration": amc_concentration,
            "sip_consistency_score": sip_consistency_score,
            "xirr": xirr,
            "tenure_months": tenure_months,
            "goal_tenure_delta": goal_tenure_delta,
            "monthly_sip_total": monthly_sip_total,
            "goal_encoded": float(goal_encoded),
            "label": 1 # anomaly
        })
        
    return pd.DataFrame(data)
