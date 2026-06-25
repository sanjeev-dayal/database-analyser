import duckdb
from pathlib import Path
import pandas as pd
from app.services.dataset_loader_service import get_dataset_database_path

def create_dataset_database(df: pd.DataFrame, dataset_id: str) -> str:
    """
    Creates one DuckDB database for one uploaded dataset.
    The uploaded DataFrame is stored in a table called 'data'.
    """

    db_path = get_dataset_database_path(dataset_id)

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

        return result_df.to_dict(orient="records")

    finally:
        if connection is not None:
            connection.close()