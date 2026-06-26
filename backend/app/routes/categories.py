from fastapi import APIRouter, HTTPException

from app.services.dataset_loader_service import load_dataset_dataframe
from app.services.schema_service import analyze_dataframe
from app.services.category_service import detect_categories

router = APIRouter()


@router.get("/api/datasets/{dataset_id}/categories")
def get_categories(dataset_id: str):
    try:
        df = load_dataset_dataframe(dataset_id)

        schema = analyze_dataframe(df)
        categories = detect_categories(schema)

        return {
            "dataset_id": dataset_id,
            "categories": categories
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate categories: {str(error)}"
        )