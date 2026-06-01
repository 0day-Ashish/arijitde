import numpy as np
from typing import List, Dict, Any
from datetime import datetime

GOAL_HORIZONS = {
    "WEALTH_CREATION": 120.0,
    "RETIREMENT": 240.0,
    "HOUSE_PURCHASE": 60.0,
    "CHILD_EDUCATION": 120.0,
    "MARRIAGE": 36.0,
    "PASSIVE_INCOME": 60.0,
    "TAX_SAVING": 12.0,
    "NOT_SURE_YET": 36.0,
    # Legacy
    "SHORT_TERM": 24.0,
    "LONG_TERM": 60.0,
    "EXPLORING": 36.0
}

GOAL_ENCODING = {
    "WEALTH_CREATION": 0.0,
    "RETIREMENT": 1.0,
    "HOUSE_PURCHASE": 2.0,
    "CHILD_EDUCATION": 3.0,
    "MARRIAGE": 4.0,
    "PASSIVE_INCOME": 5.0,
    "TAX_SAVING": 6.0,
    "NOT_SURE_YET": 7.0,
    # Legacy
    "SHORT_TERM": 8.0,
    "LONG_TERM": 9.0,
    "EXPLORING": 7.0
}

def build_feature_vector(rows: List[Dict[str, Any]], assessment: Dict[str, Any]) -> List[float]:
    # Calculate basic sums
    total_invested = sum(r["invested"] for r in rows)
    total_current_value = sum(r["currentValue"] for r in rows)
    fund_count = len(rows)
    
    if total_invested <= 0:
        total_invested = 1.0 # Avoid division by zero
        
    equity_invested = sum(r["invested"] for r in rows if r["type"] == "SIP")
    debt_invested = sum(r["invested"] for r in rows if r["type"] == "LUMPSUM")
    
    equity_pct = (equity_invested / total_invested) * 100.0
    debt_pct = (debt_invested / total_invested) * 100.0
    
    # Top fund concentration
    max_fund_invested = max(r["invested"] for r in rows) if rows else 0.0
    top_fund_concentration = max_fund_invested / total_invested
    top_category_concentration = top_fund_concentration
    amc_concentration = top_fund_concentration
    
    # SIP consistency score
    sip_count = sum(1 for r in rows if r["type"] == "SIP")
    sip_consistency_score = sip_count / fund_count if fund_count > 0 else 0.0
    
    # Average tenure
    now = datetime.utcnow()
    tenures = []
    for r in rows:
        dt_str = r["startDate"]
        if isinstance(dt_str, str):
            # Parse ISO date string (removing trailing 'Z' if present)
            if dt_str.endswith("Z"):
                dt_str = dt_str[:-1]
            try:
                dt = datetime.fromisoformat(dt_str)
            except ValueError:
                dt = datetime.strptime(dt_str.split("T")[0], "%Y-%m-%d")
        else:
            dt = dt_str
            
        diff_years = (now - dt).days / 365.25
        tenures.append(max(0.01, diff_years))
        
    avg_tenure_years = sum(tenures) / len(tenures) if tenures else 0.01
    years = max(0.01, avg_tenure_years)
    
    # XIRR calculation
    xirr = ((total_current_value - total_invested) / total_invested) / years * 100.0 if total_invested > 1.0 else 0.0
    
    # Tenure in months
    tenure_months = years * 12.0
    
    goal = assessment.get("goal", "EXPLORING")
    goal_horizon_months = GOAL_HORIZONS.get(goal, 36.0)
    goal_tenure_delta = abs(goal_horizon_months - tenure_months)
    
    monthly_sip_total = sum(r["sipAmount"] for r in rows if r["type"] == "SIP")
    goal_encoded = GOAL_ENCODING.get(goal, 4.0)
    
    return [
        equity_pct,
        debt_pct,
        float(fund_count),
        top_fund_concentration,
        top_category_concentration,
        amc_concentration,
        sip_consistency_score,
        xirr,
        tenure_months,
        goal_tenure_delta,
        monthly_sip_total,
        goal_encoded
    ]
