from fastapi import APIRouter, HTTPException

from app.services.dataset_loader_service import load_dataset_dataframe
from app.services.validation_service import validate_dataframe

router = APIRouter()


@router.get("/api/datasets/{dataset_id}/validation")
def get_validation(dataset_id: str):
    try:
        df = load_dataset_dataframe(dataset_id)

        validation_result = validate_dataframe(df)

        return {
            "dataset_id": dataset_id,
            "validation": validation_result
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not validate dataset: {str(error)}"
        )