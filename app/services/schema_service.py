import pandas as pd


def analyze_dataframe(df: pd.DataFrame) -> dict:
    column_details = []

    for column in df.columns:
        column_details.append({
            "name": str(column),
            "data_type": str(df[column].dtype),
            "missing_values": int(df[column].isna().sum()),
            "unique_values": int(df[column].nunique())
        })

    numeric_columns = df.select_dtypes(include="number").columns.tolist()

    categorical_columns = df.select_dtypes(
        include=["object", "category", "bool"]
    ).columns.tolist()

    return {
        "row_count": int(df.shape[0]),
        "column_count": int(df.shape[1]),
        "columns": column_details,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns
    }