import re


BLOCKED_KEYWORDS = [
    "drop",
    "delete",
    "update",
    "insert",
    "alter",
    "create",
    "attach",
    "detach",
    "copy",
    "install",
    "load",
    "export",
    "import",
    "pragma",
    "call",
    "vacuum"
]


def validate_sql(query: str) -> str:
    """
    Validates SQL before it is executed.

    Returns a cleaned safe query.
    Raises ValueError if the query is unsafe.
    """

    if not query or not query.strip():
        raise ValueError("SQL query cannot be empty.")

    cleaned_query = query.strip()

    # Remove one final semicolon so SELECT ...; is accepted
    if cleaned_query.endswith(";"):
        cleaned_query = cleaned_query[:-1].strip()

    # Block multiple statements such as: SELECT ...; DROP TABLE ...
    if ";" in cleaned_query:
        raise ValueError("Only one SQL statement is allowed.")

    lower_query = cleaned_query.lower()

    # Only allow SELECT or WITH queries
    if not (
        lower_query.startswith("select")
        or lower_query.startswith("with")
    ):
        raise ValueError("Only SELECT or WITH queries are allowed.")

    # Block dangerous SQL words
    for keyword in BLOCKED_KEYWORDS:
        pattern = rf"\b{keyword}\b"

        if re.search(pattern, lower_query):
            raise ValueError(
                f"Unsafe SQL keyword detected: {keyword.upper()}"
            )

    # Require use of the uploaded dataset table
    if not re.search(r"\bdata\b", lower_query):
        raise ValueError(
            "Queries must use the uploaded dataset table named 'data'."
        )

    # Add a maximum result limit if the query does not have one
    if not re.search(r"\blimit\s+\d+\b", lower_query):
        cleaned_query = f"{cleaned_query} LIMIT 1000"

    return cleaned_query