import pandas as pd


def build_profile(df: pd.DataFrame, schema: dict, validation: dict) -> dict:
    numeric_stats = []

    for column in schema.get("numeric_columns", []):
        series = df[column].dropna()

        if series.empty:
            continue

        numeric_stats.append({
            "column": column,
            "min": float(series.min()),
            "max": float(series.max()),
            "mean": round(float(series.mean()), 2),
            "median": round(float(series.median()), 2),
            "sum": round(float(series.sum()), 2)
        })

    date_ranges = []

    for column in schema.get("date_columns", []):
        converted = pd.to_datetime(df[column], errors="coerce").dropna()

        if not converted.empty:
            date_ranges.append({
                "column": column,
                "min_date": str(converted.min().date()),
                "max_date": str(converted.max().date())
            })

    top_values = []

    for column in schema.get("categorical_columns", [])[:10]:
        counts = df[column].dropna().value_counts().head(5)

        top_values.append({
            "column": column,
            "values": [
                {
                    "value": str(value),
                    "count": int(count)
                }
                for value, count in counts.items()
            ]
        })

    total_missing_values = int(df.isna().sum().sum())

    return {
        "overview": {
            "row_count": int(len(df)),
            "column_count": int(len(df.columns)),
            "duplicate_rows": validation["duplicate_rows"],
            "total_missing_values": total_missing_values,
            "numeric_column_count": len(schema.get("numeric_columns", [])),
            "categorical_column_count": len(
                schema.get("categorical_columns", [])
            ),
            "date_column_count": len(schema.get("date_columns", [])),
            "time_column_count": len(schema.get("time_columns", []))
        },
        "numeric_statistics": numeric_stats,
        "date_ranges": date_ranges,
        "top_categorical_values": top_values
    }