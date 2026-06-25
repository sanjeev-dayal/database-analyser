import pandas as pd


def detect_date_columns(df: pd.DataFrame) -> list:
    date_columns = []

    for column in df.columns:
        column_name = str(column).lower()

        # Detect using column name first
        date_keywords = ["date", "day", "month", "year", "dob"]

        if any(keyword in column_name for keyword in date_keywords):
            date_columns.append(str(column))
            continue

        # Try detecting date-like values in object/string columns
        if df[column].dtype == "object" or str(df[column].dtype) == "str":
            try:
                converted = pd.to_datetime(
                    df[column],
                    errors="coerce"
                )

                valid_percent = converted.notna().mean() * 100

                if valid_percent >= 80:
                    date_columns.append(str(column))

            except Exception:
                pass

    return date_columns


def detect_time_columns(df: pd.DataFrame) -> list:
    time_columns = []

    time_keywords = [
        "time",
        "check_in",
        "check_out",
        "login",
        "logout",
        "start",
        "end"
    ]

    for column in df.columns:
        column_name = str(column).lower()

        if any(keyword in column_name for keyword in time_keywords):
            time_columns.append(str(column))

    return time_columns


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
        include=["object", "category", "bool", "string"]
    ).columns.tolist()

    date_columns = detect_date_columns(df)
    time_columns = detect_time_columns(df)

    # Remove dates and times from normal categorical columns
    categorical_columns = [
        column for column in categorical_columns
        if column not in date_columns and column not in time_columns
    ]

    return {
        "row_count": int(df.shape[0]),
        "column_count": int(df.shape[1]),
        "columns": column_details,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "date_columns": date_columns,
        "time_columns": time_columns
    }