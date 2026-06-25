from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.database_service import run_safe_query
from app.services.sql_safety_service import validate_sql

router = APIRouter()


class QueryRequest(BaseModel):
    query: str


@router.post("/api/datasets/{dataset_id}/query")
def run_query(dataset_id: str, request: QueryRequest):
    try:
        safe_query = validate_sql(request.query)

        rows = run_safe_query(dataset_id, safe_query)

        return {
            "dataset_id": dataset_id,
            "executed_query": safe_query,
            "row_count": len(rows),
            "rows": rows
        }

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=f"Query failed: {str(error)}"
        )