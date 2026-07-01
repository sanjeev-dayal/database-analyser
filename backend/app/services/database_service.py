import duckdb
from pathlib import Path
import math
from datetime import date, datetime, time
import pandas as pd
from app.services.dataset_loader_service import get_dataset_database_path


def serialize_value(value):
    if value is None:
        return None

    if isinstance(value, (str, int, bool)):
        return value

    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value

    if isinstance(value, (datetime, date, time)):
        return value.isoformat()

    if hasattr(value, "item"):
        return serialize_value(value.item())

    return str(value)


def serialize_rows(records: list[dict]) -> list[dict]:
    return [
        {key: serialize_value(value) for key, value in row.items()}
        for row in records
    ]

def create_dataset_database(df: pd.DataFrame, dataset_id: str) -> str:
    """
    Creates one DuckDB database for one uploaded dataset.
    The uploaded DataFrame is stored in a table called 'data'.
    """

    dataset_folder = Path("uploads") / dataset_id
    dataset_folder.mkdir(parents=True, exist_ok=True)

    db_path = get_dataset_database_path(dataset_id, ensure_exists=False)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    connection = None

    try:
        connection = duckdb.connect(str(db_path))

        # Register DataFrame temporarily inside DuckDB
        connection.register("uploaded_df", df)

        # Create a permanent table named data
        connection.execute("""
            CREATE OR REPLACE TABLE data AS
            SELECT * FROM uploaded_df
        """)

        return str(db_path)

    finally:
        if connection is not None:
            connection.close()


def run_safe_query(dataset_id: str, query: str) -> list[dict]:
    """
    Runs a SQL query against the uploaded dataset's DuckDB file.
    We will add stronger SQL safety rules in the next task.
    """

    db_path = get_dataset_database_path(dataset_id)

    if not db_path.exists():
        raise FileNotFoundError("Dataset database does not exist.")

    connection = None

    try:
        connection = duckdb.connect(str(db_path), read_only=True)

        result_df = connection.execute(query).fetchdf()

        return serialize_rows(result_df.to_dict(orient="records"))

    finally:
        if connection is not None:
            connection.close()