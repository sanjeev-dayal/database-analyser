import pandas as pd


def validate_dataframe(df: pd.DataFrame) -> dict:
    missing_values = []

    for column in df.columns:
        missing_count = int(df[column].isna().sum())

        if missing_count > 0:
            missing_percent = round(
                (missing_count / len(df)) * 100,
                2
            )

            missing_values.append({
                "column": str(column),
                "count": missing_count,
                "percent": missing_percent
            })

    empty_columns = []

    for column in df.columns:
        if df[column].isna().all():
            empty_columns.append(str(column))

    negative_values = []

    numeric_columns = df.select_dtypes(include="number").columns.tolist()

    for column in numeric_columns:
        negative_count = int((df[column] < 0).sum())

        if negative_count > 0:
            negative_values.append({
                "column": str(column),
                "count": negative_count
            })

    warnings = []

    if df.duplicated().sum() > 0:
        warnings.append("Duplicate rows found in dataset.")

    if missing_values:
        warnings.append("Missing values found in one or more columns.")

    if empty_columns:
        warnings.append("One or more columns are completely empty.")

    if negative_values:
        warnings.append("Negative values found in numeric columns.")

    return {
        "duplicate_rows": int(df.duplicated().sum()),
        "missing_values": missing_values,
        "empty_columns": empty_columns,
        "negative_values": negative_values,
        "warnings": warnings
    }