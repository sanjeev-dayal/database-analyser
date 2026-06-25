from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd

from app.services.schema_service import analyze_dataframe
from app.services.category_service import detect_categories

router = APIRouter()


@router.get("/api/datasets/{dataset_id}/categories")
def get_categories(dataset_id: str):
    dataset_folder = Path("uploads") / dataset_id

    csv_file = dataset_folder / "original.csv"
    excel_file = dataset_folder / "original.xlsx"
    xls_file = dataset_folder / "original.xls"

    try:
        if csv_file.exists():
            df = pd.read_csv(csv_file)

        elif excel_file.exists():
            df = pd.read_excel(excel_file)

        elif xls_file.exists():
            df = pd.read_excel(xls_file)

        else:
            raise HTTPException(
                status_code=404,
                detail="Dataset not found or categories are not supported for this file type yet."
            )

        schema = analyze_dataframe(df)
        categories = detect_categories(schema)

        return {
            "dataset_id": dataset_id,
            "categories": categories
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate categories: {str(error)}"
        )