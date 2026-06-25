from typing import Any


CATEGORY_RULES = {
    "Sales & Finance": [
        "sales", "revenue", "profit", "cost", "price",
        "discount", "amount", "income", "expense",
        "margin", "payment", "budget"
    ],
    "Employee & HR": [
        "employee", "staff", "worker", "salary",
        "department", "designation", "manager",
        "attendance", "leave", "shift"
    ],
    "Attendance & Time Tracking": [
        "checkin", "checkout", "check_in", "check_out",
        "clockin", "clockout", "hours", "working",
        "attendance", "late", "absence", "present"
    ],
    "Customer": [
        "customer", "client", "buyer", "segment",
        "member", "user", "account"
    ],
    "Product & Inventory": [
        "product", "item", "sku", "stock", "inventory",
        "category", "subcategory", "brand", "supplier"
    ],
    "Geography": [
        "country", "state", "city", "region", "location",
        "address", "postal", "zip", "territory"
    ],
    "Orders & Operations": [
        "order", "quantity", "ship", "delivery",
        "status", "transaction", "invoice", "return"
    ],
    "Time Analysis": [
        "date", "day", "month", "year", "quarter",
        "week", "time", "checkin", "checkout",
        "check_in", "check_out"
    ]
}


def normalize_column_name(column: str) -> str:
    return (
        str(column)
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .strip()
    )


def detect_categories(schema: dict[str, Any]) -> list[dict]:
    """
    Takes the schema output from analyze_dataframe()
    and returns sidebar-ready categories.
    """
    all_columns = [column["name"] for column in schema["columns"]]
    categories = []

    for category_name, keywords in CATEGORY_RULES.items():
        matched_columns = []

        for column in all_columns:
            normalized_column = normalize_column_name(column)

            for keyword in keywords:
                normalized_keyword = normalize_column_name(keyword)

                if normalized_keyword in normalized_column:
                    matched_columns.append(column)
                    break

        if matched_columns:
            categories.append({
                "name": category_name,
                "columns": sorted(set(matched_columns))
            })

    # Generic categories ensure every dataset has useful sidebar options
    if schema.get("numeric_columns"):
        categories.append({
            "name": "Numeric Analysis",
            "columns": schema["numeric_columns"]
        })

    if schema.get("categorical_columns"):
        categories.append({
            "name": "Categorical Analysis",
            "columns": schema["categorical_columns"]
        })

    if schema.get("date_columns"):
        categories.append({
            "name": "Date Analysis",
            "columns": schema["date_columns"]
        })

    if schema.get("time_columns"):
        categories.append({
            "name": "Time Analysis",
            "columns": schema["time_columns"]
        })

    # Remove duplicate category names if Time Analysis was matched twice
    unique_categories = {}

    for category in categories:
        name = category["name"]

        if name not in unique_categories:
            unique_categories[name] = category
        else:
            combined_columns = (
                unique_categories[name]["columns"]
                + category["columns"]
            )

            unique_categories[name]["columns"] = sorted(
                set(combined_columns)
            )

    return list(unique_categories.values())