from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.dataset_loader_service import load_dataset_dataframe

from app.services.schema_service import analyze_dataframe
from app.services.question_service import build_questions
from app.services.ai_service import generate_ai_questions

router = APIRouter()


class QuestionRequest(BaseModel):
    category: str
    use_ai: bool = True


@router.post("/api/datasets/{dataset_id}/questions")
def get_questions(dataset_id: str, request: QuestionRequest):
    try:
        df = load_dataset_dataframe(dataset_id)

        schema = analyze_dataframe(df)
        
        # Always generate rule-based questions first
        fallback_questions = build_questions(
            schema,
            request.category
        )

        # If user chooses no AI, return rules only
        if not request.use_ai:
            return {
                "dataset_id": dataset_id,
                "category": request.category,
                "source": "rule_based",
                "question_count": len(fallback_questions),
                "questions": fallback_questions
            }

        # Send only a few rows, never entire dataset
        sample_rows = df.head(5).to_dict(
            orient="records"
        )

        ai_questions = generate_ai_questions(
            schema=schema,
            category=request.category,
            sample_rows=sample_rows,
            fallback_questions=fallback_questions
        )

        # If AI fails or returns no valid questions, use fallback
        if not ai_questions:
            return {
                "dataset_id": dataset_id,
                "category": request.category,
                "source": "rule_based_fallback",
                "question_count": len(fallback_questions),
                "questions": fallback_questions
            }

        return {
            "dataset_id": dataset_id,
            "category": request.category,
            "source": "openrouter_free",
            "question_count": len(ai_questions),
            "questions": ai_questions
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not generate questions: {str(error)}"
        )