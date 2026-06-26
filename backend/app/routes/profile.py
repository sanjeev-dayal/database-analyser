from fastapi import APIRouter, HTTPException

from app.services.dataset_loader_service import load_dataset_dataframe
from app.services.schema_service import analyze_dataframe
from app.services.validation_service import validate_dataframe
from app.services.profile_service import build_profile

router = APIRouter()


@router.get("/api/datasets/{dataset_id}/profile")
def get_profile(dataset_id: str):
    try:
        df = load_dataset_dataframe(dataset_id)

        schema = analyze_dataframe(df)
        validation = validate_dataframe(df)
        profile = build_profile(df, schema, validation)

        return {
            "dataset_id": dataset_id,
            "profile": profile
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not profile dataset: {str(error)}"
        )