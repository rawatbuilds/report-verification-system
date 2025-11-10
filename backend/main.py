from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from column_validator import router as column_validator_router
from report_difference_analyzer import router as report_analyzer_router
import sys
sys.stdout.reconfigure(encoding='utf-8')

app = FastAPI(title="Report Verification System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register both modules
app.include_router(column_validator_router, prefix="/column-validator")
app.include_router(report_analyzer_router, prefix="/report-difference-analyzer")

@app.get("/")
def root():
    return {"message": "✅ Backend running with Column Validator & Report Analyzer!"}

