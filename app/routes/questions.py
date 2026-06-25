from fastapi import APIRouter, HTTPException
from pathlib import Path
from pydantic import BaseModel
import pandas as pd

from app.services.schema_service import analyze_dataframe
from app.services.question_service import build_questions

router = APIRouter()


class QuestionRequest(BaseModel):
    category: str


@router.post("/api/datasets/{dataset_id}/questions")
def get_questions(dataset_id: str, request: QuestionRequest):
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
                detail="Dataset not found or questions are not supported for this file type yet."
            )

        schema = analyze_dataframe(df)
        questions = build_questions(schema, request.category)

        return {
            "dataset_id": dataset_id,
            "category": request.category,
            "question_count": len(questions),
            "questions": questions
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate questions: {str(error)}"
        )