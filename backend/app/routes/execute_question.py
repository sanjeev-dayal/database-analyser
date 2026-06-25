from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any

from app.services.sql_safety_service import validate_sql
from app.services.database_service import run_safe_query

router = APIRouter()


class ChartConfig(BaseModel):
    type: str = "bar"
    x: str = "label"
    y: str = "value"


class ExecuteQuestionRequest(BaseModel):
    title: str
    description: str = ""
    sql: str
    chart: ChartConfig


def create_summary(rows: list[dict], chart: ChartConfig) -> str:
    """
    Creates a simple readable insight from the first result row.
    """

    if not rows:
        return "No data was returned for this question."

    first_row = rows[0]

    label = first_row.get(chart.x)
    value = first_row.get(chart.y)

    if label is not None and value is not None:
        return f"Top result: {label} with a value of {value}."

    return f"Query returned {len(rows)} rows."


@router.post("/api/datasets/{dataset_id}/execute-question")
def execute_question(
    dataset_id: str,
    request: ExecuteQuestionRequest
):
    try:
        # Validate SQL again even if it came from AI
        safe_sql = validate_sql(request.sql)

        # Run query against this dataset's DuckDB database
        rows = run_safe_query(dataset_id, safe_sql)

        if rows:
            available_columns = rows[0].keys()

            if request.chart.x not in available_columns:
                raise ValueError(
                    f"Chart x-axis column '{request.chart.x}' was not returned by the query."
                )

            if request.chart.y not in available_columns:
                raise ValueError(
                    f"Chart y-axis column '{request.chart.y}' was not returned by the query."
                )

        summary = create_summary(rows, request.chart)
        summary = create_summary(rows, request.chart)

        return {
            "dataset_id": dataset_id,
            "title": request.title,
            "description": request.description,
            "executed_query": safe_sql,
            "chart": request.chart.model_dump(),
            "row_count": len(rows),
            "rows": rows,
            "summary": summary
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
            status_code=500,
            detail=f"Could not execute question: {str(error)}"
        )