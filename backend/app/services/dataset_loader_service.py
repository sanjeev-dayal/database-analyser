from pathlib import Path
import pandas as pd


UPLOADS_DIR = Path("uploads")


def get_dataset_folder(dataset_id: str) -> Path:
    """
    Returns the folder for one uploaded dataset.
    Raises FileNotFoundError if it does not exist.
    """
    dataset_folder = UPLOADS_DIR / dataset_id

    if not dataset_folder.exists():
        raise FileNotFoundError("Dataset ID was not found.")

    return dataset_folder


def load_dataset_dataframe(dataset_id: str) -> pd.DataFrame:
    """
    Loads a CSV or Excel dataset into a Pandas DataFrame.
    """
    dataset_folder = get_dataset_folder(dataset_id)

    csv_file = dataset_folder / "original.csv"
    xlsx_file = dataset_folder / "original.xlsx"
    xls_file = dataset_folder / "original.xls"

    if csv_file.exists():
        return pd.read_csv(csv_file)

    if xlsx_file.exists():
        return pd.read_excel(xlsx_file)

    if xls_file.exists():
        return pd.read_excel(xls_file)

    raise FileNotFoundError(
        "Dataset file was not found or this file type is not supported yet."
    )


def get_dataset_database_path(dataset_id: str, ensure_exists: bool = True) -> Path:
    """
    Returns the DuckDB path for one dataset.

    If ensure_exists is True, this function raises FileNotFoundError when the
    database file does not exist yet. That allows the upload flow to create the
    database file before it is required for later queries.
    """
    dataset_folder = get_dataset_folder(dataset_id)
    db_path = dataset_folder / "dataset.duckdb"

    if ensure_exists and not db_path.exists():
        raise FileNotFoundError(
            "Dataset database was not found. Upload the dataset again."
        )

    return db_path