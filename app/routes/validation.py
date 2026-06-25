from fastapi import APIRouter, HTTPException
from pathlib import Path
import pandas as pd

from app.services.validation_service import validate_dataframe

router = APIRouter()


@router.get("/api/datasets/{dataset_id}/validation")
def get_validation(dataset_id: str):
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
                detail="Dataset not found or validation is not supported for this file type yet."
            )

        validation_result = validate_dataframe(df)

        return {
            "dataset_id": dataset_id,
            "validation": validation_result
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not validate dataset: {str(error)}"
        )