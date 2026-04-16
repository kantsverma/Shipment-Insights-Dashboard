from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io

# Import your services
from services.csv_parser import validate_and_parse_csv
from services.nl_query_engine import process_nl_query

app = FastAPI()

# IMPORTANT: Ensure CORS allows your frontend port (usually 5173 for Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory database for the uploaded dataframe
state = {"df": None}

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    contents = await file.read()
    df, error = validate_and_parse_csv(contents)
    
    if error:
        raise HTTPException(status_code=400, detail=error)
    
    state["df"] = df
    return {
        "message": "File uploaded successfully",
        "columns": df.columns.tolist(),
        "rows": len(df)
    }

# This was likely missing or misspelled in your previous run
@app.get("/query")
async def query_data(q: str):
    if state["df"] is None:
        raise HTTPException(status_code=400, detail="Please upload a CSV file first.")
    
    # Pass the dataframe and the natural language string to the engine
    result = process_nl_query(state["df"], q)
    return result

if __name__ == "__main__":
    import uvicorn
    # Local development
    # uvicorn.run(app, host="127.0.0.1", port=8000)

    # Render / production
    uvicorn.run(app, host="0.0.0.0", port=8000)    
