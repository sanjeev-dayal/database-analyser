from typing import Any


def quote_column(column: str) -> str:
    """
    Makes column names safe for DuckDB SQL.
    Example: Order Date -> "Order Date"
    """
    return f'"{column.replace(chr(34), chr(34) * 2)}"'


def build_questions(schema: dict[str, Any], category: str) -> list[dict]:
    """
    Creates rule-based question objects.

    Each question has:
    - title: shown in React
    - sql: executed later
    - chart: frontend chart instructions
    """

    columns = [item["name"] for item in schema["columns"]]
    numeric_columns = schema.get("numeric_columns", [])
    categorical_columns = schema.get("categorical_columns", [])
    date_columns = schema.get("date_columns", [])
    time_columns = schema.get("time_columns", [])

    questions = []

    # Pick useful category/group columns
    group_columns = [
        col for col in categorical_columns
        if col.lower() not in {"id", "employee_id", "order_id", "product_id"}
    ]

    # ----------------------------
    # Generic numeric questions
    # ----------------------------
    for numeric_column in numeric_columns[:3]:
        for group_column in group_columns[:3]:
            questions.append({
                "title": f"Which {group_column} has the highest total {numeric_column}?",
                "description": f"Compare total {numeric_column} across {group_column}.",
                "sql": f"""
                    SELECT
                        {quote_column(group_column)} AS label,
                        SUM({quote_column(numeric_column)}) AS value
                    FROM data
                    GROUP BY {quote_column(group_column)}
                    ORDER BY value DESC
                    LIMIT 10
                """,
                "chart": {
                    "type": "bar",
                    "x": "label",
                    "y": "value"
                }
            })

            questions.append({
                "title": f"What is the average {numeric_column} by {group_column}?",
                "description": f"Compare average {numeric_column} across {group_column}.",
                "sql": f"""
                    SELECT
                        {quote_column(group_column)} AS label,
                        AVG({quote_column(numeric_column)}) AS value
                    FROM data
                    GROUP BY {quote_column(group_column)}
                    ORDER BY value DESC
                    LIMIT 10
                """,
                "chart": {
                    "type": "bar",
                    "x": "label",
                    "y": "value"
                }
            })

    # ----------------------------
    # Generic record-count questions
    # ----------------------------
    for group_column in group_columns[:5]:
        questions.append({
            "title": f"Which {group_column} appears most frequently?",
            "description": f"Count records for each {group_column}.",
            "sql": f"""
                SELECT
                    {quote_column(group_column)} AS label,
                    COUNT(*) AS value
                FROM data
                GROUP BY {quote_column(group_column)}
                ORDER BY value DESC
                LIMIT 10
            """,
            "chart": {
                "type": "bar",
                "x": "label",
                "y": "value"
            }
        })

    # ----------------------------
    # Date trend questions
    # ----------------------------
    for date_column in date_columns[:1]:
        questions.append({
            "title": f"What is the record trend over {date_column}?",
            "description": f"Count records by {date_column}.",
            "sql": f"""
                SELECT
                    {quote_column(date_column)} AS label,
                    COUNT(*) AS value
                FROM data
                GROUP BY {quote_column(date_column)}
                ORDER BY label
                LIMIT 1000
            """,
            "chart": {
                "type": "line",
                "x": "label",
                "y": "value"
            }
        })

    # ----------------------------
    # Time questions
    # ----------------------------
    if time_columns and group_columns:
        time_column = time_columns[0]
        group_column = group_columns[0]

        questions.append({
            "title": f"Which {group_column} has the latest average {time_column}?",
            "description": f"Compare average {time_column} by {group_column}.",
            "sql": f"""
                SELECT
                    {quote_column(group_column)} AS label,
                    AVG(
                        EXTRACT(
                            EPOCH FROM CAST({quote_column(time_column)} AS TIME)
                        )
                    ) AS value
                FROM data
                GROUP BY {quote_column(group_column)}
                ORDER BY value DESC
                LIMIT 10
            """,
            "chart": {
                "type": "bar",
                "x": "label",
                "y": "value"
            }
        })

    # Category filtering:
    # For now we return the best 10 generic questions.
    # In the next version, category-specific rules will prioritize
    # Finance / HR / Product / Geography questions.
    return questions[:10]