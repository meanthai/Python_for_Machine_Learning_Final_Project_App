import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import uvicorn 

from sklearn.base import clone, BaseEstimator, RegressorMixin
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.ensemble import StackingRegressor
from sklearn.linear_model import Ridge
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import IterativeImputer
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, accuracy_score, precision_score, recall_score, f1_score, roc_curve, auc
from sklearn.metrics import cohen_kappa_score
from sklearn.model_selection import StratifiedKFold
from scipy.optimize import minimize
from sklearn.ensemble import VotingRegressor, RandomForestRegressor, GradientBoostingRegressor, HistGradientBoostingRegressor, ExtraTreesRegressor
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.pipeline import Pipeline
from lightgbm import LGBMRegressor
from xgboost import XGBRegressor
from catboost import CatBoostRegressor
import numpy as np
from sklearn.base import clone

# estimators = [
#     ('catboost', CatBoostRegressor(verbose=0, random_state=42)),
#     ('lightgbm', LGBMRegressor(random_state=42)),
#     ('xgboost', XGBRegressor(objective='reg:squarederror', random_state=42)),
# ]

# ensemble_model = StackingRegressor(
#     estimators=estimators,
#     final_estimator=Ridge()  # Optional, but improves performance
# )


app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class InputSample(BaseModel):
    SDS_Score_Weighted: float = 0.0
    Internet_Hours_Age: float = 0.0
    Physical_Height_Age: float = 0.0
    Basic_Demos_Sex: float = 0.0
    PreInt_FGC_CU_PU: float = 0.0

mapping_features = {
    "Physical_Height_Age": "Physical-Height_Age",
    "Basic_Demos_Sex": "Basic_Demos-Sex"
}

def threshold_Rounder(oof_non_rounded, thresholds):
    return np.where(oof_non_rounded < thresholds[0], 0,
                np.where(oof_non_rounded < thresholds[1], 1,
                    np.where(oof_non_rounded < thresholds[2], 2, 3)))

thresholds = [0.5, 1.5, 2.5]  

simple_features = ['SDS_Score_Weighted', 'Internet_Hours_Age', 'Physical_Height_Age', 
                  'Basic_Demos_Sex', 'PreInt_FGC_CU_PU']

model = None

new_data = {
    'SDS_Score_Weighted': 13.850357,
    'Internet_Hours_Age': 15.0,
    'Physical-Height_Age': 584.2,
    'Basic_Demos-Sex': 0.0,
    'PreInt_FGC_CU_PU': 0.0
}

def load_model():
    global model
    try:
        model = joblib.load("stacking_model.pkl")
        print("Model ok!!!")
    except Exception as e:
        print("Failed to load model:", e)
        raise e

def map_field_names(input_dict, mapping_dict):
    mapped_dict = {}
    for key, value in input_dict.items():
        mapped_key = mapping_dict.get(key, key)
        mapped_dict[mapped_key] = value
    return mapped_dict

@app.post("/api/predict")
def predictx(input: InputSample):
    try:
        input = input.model_dump()
        print("input: ", input)
        mapped_input = map_field_names(input, mapping_features)

        input_df = pd.DataFrame([mapped_input])
        raw_pred = model.predict(input_df)[0]
        final_pred = threshold_Rounder(np.array([raw_pred]), thresholds)[0]
        
        return {
            "success": True,
            "prediction": int(final_pred)
        }
    except Exception as e:
        print("Prediction error:", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    try:
        load_model()

        uvicorn.run(app, host="0.0.0.0", port=8053, loop="asyncio")
        print("successfully initialize the fastapi application")
    except Exception as e:
        print("Errors with the fastapi app initialization: ", e)