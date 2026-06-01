import os
from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from model.train import train_model, MODEL_PATH
from model.predict import predict_portfolio

app = FastAPI(title="FinAnalysis ML Microservice")

# CORS middleware config
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://localhost:5000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PortfolioRowSchema(BaseModel):
    type: str
    sipAmount: float
    invested: float
    currentValue: float
    startDate: str

class AssessmentSchema(BaseModel):
    age: int
    goal: str
    ageRange: Optional[str] = None
    lifeStage: Optional[str] = None
    investmentTenure: Optional[str] = None
    isCompletePortfolio: Optional[bool] = None
    investmentStyle: Optional[str] = None
    expectedReturn: Optional[str] = None
    riskBehavior: Optional[str] = None

class AnalyseRequest(BaseModel):
    rows: List[PortfolioRowSchema]
    assessment: AssessmentSchema

class AnalyseResponse(BaseModel):
    isAnomaly: bool
    anomalyScore: float
    flags: List[str]

class RetrainResponse(BaseModel):
    success: bool
    metrics: Dict[str, float]

class HealthResponse(BaseModel):
    model_config = {'protected_namespaces': ()}
    status: str
    model_loaded: bool

# Auto-train on startup if model doesn't exist
@app.on_event("startup")
def startup_event():
    if not os.path.exists(MODEL_PATH):
        print("No saved model found. Training initial model...")
        try:
            metrics = train_model()
            print(f"Initial model trained. Metrics: {metrics}")
        except Exception as e:
            print(f"Failed to auto-train model on startup: {e}")
    else:
        print("Saved model found. Loaded successfully.")

@app.post("/analyse", response_model=AnalyseResponse)
def analyse_portfolio(req: AnalyseRequest):
    try:
        # Convert request models to dictionaries for prediction engine
        rows_dict = [r.dict() for r in req.rows]
        assessment_dict = req.assessment.dict()
        
        result = predict_portfolio(rows_dict, assessment_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/retrain", response_model=RetrainResponse)
def retrain_model(x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")):
    admin_key = os.getenv("ADMIN_KEY")
    if not admin_key:
        raise HTTPException(status_code=500, detail="Server misconfiguration: ADMIN_KEY not set")
    if not x_admin_key or x_admin_key != admin_key:
        raise HTTPException(status_code=403, detail="Forbidden: Invalid Admin Key")
        
    try:
        metrics = train_model()
        return {
            "success": True,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", response_model=HealthResponse)
def health_check():
    model_loaded = os.path.exists(MODEL_PATH)
    return {
        "status": "ok",
        "model_loaded": model_loaded
    }
