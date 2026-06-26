import json
import os

from dotenv import load_dotenv
from openai import OpenAI

from app.services.sql_safety_service import validate_sql

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("OPENROUTER_API_KEY was not found in .env")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

def repair_duckdb_sql(sql: str) -> str:
    """
    Fixes common AI-generated SQL patterns that DuckDB does not accept.
    """

    sql = sql.replace("time(check_in)", "CAST(check_in AS TIME)")
    sql = sql.replace("time(check_out)", "CAST(check_out AS TIME)")

    sql = sql.replace("TIME(check_in)", "CAST(check_in AS TIME)")
    sql = sql.replace("TIME(check_out)", "CAST(check_out AS TIME)")

    return sql

def generate_ai_questions(
    schema: dict,
    category: str,
    sample_rows: list[dict],
    fallback_questions: list[dict]
) -> list[dict]:

    prompt = f"""
You are a data analytics assistant.

The uploaded dataset is stored in a DuckDB table named data.

Selected category:
{category}

Dataset schema:
{json.dumps(schema, indent=2)}

Sample rows:
{json.dumps(sample_rows, indent=2, default=str)}

Generate up to 10 useful analysis questions.

Rules:
1. Use only columns that exist in the schema.
2. Use only the table named data.
3. SQL must start with SELECT or WITH.
4. Never use INSERT, UPDATE, DELETE, DROP, CREATE, ALTER, COPY, ATTACH, file paths, or multiple SQL statements.
5. Every query must include LIMIT 1000 or less.
6. Use DuckDB-compatible SQL.
7. For time columns stored as text, use CAST(column_name AS TIME).
8. Never use time(column_name), DATE(column_name), or TIME(column_name) functions.
9. To calculate working hours, use this DuckDB pattern:
For time columns stored as text, use CAST(column AS TIME).

DuckDB does not support subtracting TIME values directly.

To calculate duration between check_in and check_out, convert each time to seconds:

(
    EXTRACT(HOUR FROM CAST(check_out AS TIME)) * 3600
    + EXTRACT(MINUTE FROM CAST(check_out AS TIME)) * 60
    + EXTRACT(SECOND FROM CAST(check_out AS TIME))
)
-
(
    EXTRACT(HOUR FROM CAST(check_in AS TIME)) * 3600
    + EXTRACT(MINUTE FROM CAST(check_in AS TIME)) * 60
    + EXTRACT(SECOND FROM CAST(check_in AS TIME))
)

Divide by 3600.0 for hours.
10. Return JSON only. No markdown.

Return exactly:

{{
  "questions": [
    {{
      "title": "Short question title",
      "description": "One sentence explanation",
      "sql": "SELECT ...",
      "chart": {{
        "type": "bar",
        "x": "label",
        "y": "value"
      }}
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="openrouter/free",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    raw_text = response.choices[0].message.content
    parsed = json.loads(raw_text)

    safe_questions = []

    for question in parsed.get("questions", []):
        try:
            repaired_sql = repair_duckdb_sql(question["sql"])
            safe_sql = validate_sql(repaired_sql)

            safe_questions.append({
                "title": question["title"],
                "description": question["description"],
                "sql": safe_sql,
                "chart": question.get(
                    "chart",
                    {
                        "type": "bar",
                        "x": "label",
                        "y": "value"
                    }
                )
            })

        except (ValueError, KeyError, TypeError):
            continue

    return safe_questions[:10]