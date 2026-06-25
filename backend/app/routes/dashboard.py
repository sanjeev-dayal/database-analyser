from fastapi import APIRouter, HTTPException

from app.services.dataset_loader_service import load_dataset_dataframe
from app.services.schema_service import analyze_dataframe
from app.services.validation_service import validate_dataframe
from app.services.profile_service import build_profile
from app.services.category_service import detect_categories

router = APIRouter()


@router.get("/api/datasets/{dataset_id}/dashboard")
def get_dashboard(dataset_id: str):
    try:
        # Load uploaded CSV / Excel file
        df = load_dataset_dataframe(dataset_id)

        # Analyze columns and data types
        schema = analyze_dataframe(df)

        # Check missing values, duplicates, etc.
        validation = validate_dataframe(df)

        # Build dashboard statistics
        profile = build_profile(df, schema, validation)

        # Detect useful analysis categories
        categories = detect_categories(schema)

        return {
            "dataset_id": dataset_id,
            "schema": schema,
            "validation": validation,
            "profile": profile,
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
            detail=f"Could not build dashboard: {str(error)}"
        )