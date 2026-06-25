from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import shutil
import pandas as pd
from app.services.schema_service import analyze_dataframe
from app.services.database_service import create_dataset_database

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".db", ".sqlite"}

@router.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    # Check that the user selected a file
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )

    # Get extension: orders.csv -> .csv
    suffix = Path(file.filename).suffix.lower()

    # Reject unsupported files
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only CSV, Excel, SQLite, and DB files are allowed."
        )

    # Create a unique ID for this uploaded dataset
    dataset_id = str(uuid.uuid4())

    # Example: uploads/550e8400-e29b-41d4-a716-446655440000/
    dataset_folder = UPLOAD_DIR / dataset_id
    dataset_folder.mkdir()

    # Do not use the original filename for storage
    saved_path = dataset_folder / f"original{suffix}"

    try:
        with saved_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save uploaded file: {str(error)}"
        )

    finally:
        await file.close()
    try:
        if suffix == ".csv":
            df = pd.read_csv(saved_path)

        elif suffix in {".xlsx", ".xls"}:
            df = pd.read_excel(saved_path)

        else:
            return {
                "message": "File uploaded successfully",
                "dataset_id": dataset_id,
                "filename": file.filename,
                "file_type": suffix,
                "stored_file": str(saved_path),
                "note": "SQLite scanning will be added later."
            }

        schema = analyze_dataframe(df)
        db_path = create_dataset_database(df, dataset_id)
        
    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"File was uploaded but could not be read: {str(error)}"
        )

    return {
        "message": "File uploaded and scanned successfully",
        "dataset_id": dataset_id,
        "filename": file.filename,
        "file_type": suffix,
        "stored_file": str(saved_path),
        "schema": schema,
        "database_file": db_path
    }