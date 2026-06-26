from typing import Any


def quote_column(column: str) -> str:
    return f'"{column.replace(chr(34), chr(34) * 2)}"'


def normalize(text: str) -> str:
    return (
        str(text)
        .lower()
        .replace("_", " ")
        .replace("-", " ")
        .strip()
    )


def find_columns(columns: list[str], keywords: list[str]) -> list[str]:
    matches = []

    for column in columns:
        column_name = normalize(column)

        if any(keyword in column_name for keyword in keywords):
            matches.append(column)

    return matches


def make_count_question(group_column: str) -> dict:
    return {
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
    }


def make_sum_question(group_column: str, numeric_column: str) -> dict:
    return {
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
    }


def make_average_question(group_column: str, numeric_column: str) -> dict:
    return {
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
    }


def scope_columns(columns: list[str], category_columns: list[str]) -> list[str]:
    if not category_columns:
        return columns

    allowed = set(category_columns)
    return [column for column in columns if column in allowed]


def time_to_seconds_sql(column: str) -> str:
    quoted = quote_column(column)

    return f"""(
        EXTRACT(HOUR FROM CAST({quoted} AS TIME)) * 3600
        + EXTRACT(MINUTE FROM CAST({quoted} AS TIME)) * 60
        + EXTRACT(SECOND FROM CAST({quoted} AS TIME))
    )"""


def build_numeric_summary_questions(numeric_columns: list[str]) -> list[dict]:
    questions = []

    for numeric_column in numeric_columns[:4]:
        questions.append({
            "title": f"What is the average {numeric_column}?",
            "description": f"Calculate the average value of {numeric_column}.",
            "sql": f"""
                SELECT
                    'Average' AS label,
                    AVG({quote_column(numeric_column)}) AS value
                FROM data
                LIMIT 1
            """,
            "chart": {
                "type": "bar",
                "x": "label",
                "y": "value"
            }
        })
        questions.append({
            "title": f"What is the total {numeric_column}?",
            "description": f"Calculate the total value of {numeric_column}.",
            "sql": f"""
                SELECT
                    'Total' AS label,
                    SUM({quote_column(numeric_column)}) AS value
                FROM data
                LIMIT 1
            """,
            "chart": {
                "type": "bar",
                "x": "label",
                "y": "value"
            }
        })

    return questions


def make_date_trend_question(date_column: str) -> dict:
    return {
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
    }


def build_attendance_questions(
    columns: list[str],
    date_columns: list[str],
    time_columns: list[str]
) -> list[dict]:
    questions = []

    employee_columns = find_columns(
        columns,
        ["employee", "staff", "worker", "person", "name"]
    )

    if employee_columns:
        employee_column = employee_columns[0]
        questions.append(make_count_question(employee_column))

        if time_columns:
            check_in = time_columns[0]

            questions.append({
                "title": f"Which {employee_column} has the latest average {check_in}?",
                "description": f"Compare average {check_in} time by {employee_column}.",
                "sql": f"""
                    SELECT
                        {quote_column(employee_column)} AS label,
                        AVG({time_to_seconds_sql(check_in)}) AS value
                    FROM data
                    GROUP BY {quote_column(employee_column)}
                    ORDER BY value DESC
                    LIMIT 10
                """,
                "chart": {
                    "type": "bar",
                    "x": "label",
                    "y": "value"
                }
            })

    if date_columns:
        questions.append(make_date_trend_question(date_columns[0]))

    return questions


def build_finance_questions(
    numeric_columns: list[str],
    categorical_columns: list[str],
) -> list[dict]:
    finance_columns = find_columns(
        numeric_columns,
        ["revenue", "sales", "profit", "cost", "price", "discount", "amount", "margin"]
    )

    if not finance_columns:
        finance_columns = numeric_columns[:3]

    if not finance_columns:
        return []

    group_columns = [
        column for column in categorical_columns
        if not any(word in normalize(column) for word in ["id", "date", "time"])
    ]

    if not group_columns:
        return build_numeric_summary_questions(finance_columns)

    questions = []

    for numeric_column in finance_columns[:3]:
        for group_column in group_columns[:3]:
            questions.append(make_sum_question(group_column, numeric_column))
            questions.append(make_average_question(group_column, numeric_column))

    return questions


def build_geography_questions(
    columns: list[str],
    numeric_columns: list[str]
) -> list[dict]:
    questions = []

    geography_columns = find_columns(
        columns,
        ["country", "state", "city", "region", "location", "territory"]
    )

    for geography_column in geography_columns[:3]:
        questions.append(make_count_question(geography_column))

        for numeric_column in numeric_columns[:2]:
            questions.append(
                make_sum_question(geography_column, numeric_column)
            )

    return questions


def build_product_questions(
    columns: list[str],
    numeric_columns: list[str]
) -> list[dict]:
    questions = []

    product_columns = find_columns(
        columns,
        ["product", "item", "category", "subcategory", "brand", "sku", "stock"]
    )

    for product_column in product_columns[:3]:
        questions.append(make_count_question(product_column))

        for numeric_column in numeric_columns[:2]:
            questions.append(
                make_sum_question(product_column, numeric_column)
            )

    return questions


def build_generic_questions(
    numeric_columns: list[str],
    categorical_columns: list[str],
    date_columns: list[str]
) -> list[dict]:
    questions = []

    usable_groups = [
        column for column in categorical_columns
        if "id" not in normalize(column)
    ]

    for group_column in usable_groups[:4]:
        questions.append(make_count_question(group_column))

    for numeric_column in numeric_columns[:3]:
        for group_column in usable_groups[:3]:
            questions.append(make_sum_question(group_column, numeric_column))
            questions.append(make_average_question(group_column, numeric_column))

    if date_columns:
        questions.append(make_date_trend_question(date_columns[0]))

    return questions


def build_customer_questions(
    categorical_columns: list[str],
    metric_columns: list[str]
) -> list[dict]:
    if not categorical_columns:
        return []

    questions = []
    customer_column = categorical_columns[0]
    questions.append(make_count_question(customer_column))

    for numeric_column in metric_columns[:2]:
        questions.append(make_sum_question(customer_column, numeric_column))
        questions.append(make_average_question(customer_column, numeric_column))

    return questions


def build_orders_questions(
    columns: list[str],
    numeric_columns: list[str],
    categorical_columns: list[str]
) -> list[dict]:
    questions = []

    order_columns = find_columns(
        columns + categorical_columns,
        ["order", "invoice", "transaction", "quantity", "ship", "delivery", "status", "return"]
    )

    if order_columns:
        order_column = order_columns[0]
        questions.append(make_count_question(order_column))

        if numeric_columns:
            for numeric_column in numeric_columns[:2]:
                questions.append(make_sum_question(order_column, numeric_column))
                questions.append(make_average_question(order_column, numeric_column))

    return questions


def build_time_questions(
    date_columns: list[str],
    time_columns: list[str]
) -> list[dict]:
    questions = []

    if date_columns:
        questions.append(make_date_trend_question(date_columns[0]))

    if time_columns:
        questions.append({
            "title": f"Which {time_columns[0]} value appears most often?",
            "description": f"Count records grouped by {time_columns[0]}.",
            "sql": f"""
                SELECT
                    {quote_column(time_columns[0])} AS label,
                    COUNT(*) AS value
                FROM data
                GROUP BY {quote_column(time_columns[0])}
                ORDER BY value DESC
                LIMIT 10
            """,
            "chart": {
                "type": "bar",
                "x": "label",
                "y": "value"
            }
        })

    return questions


def build_questions(
    schema: dict[str, Any],
    category: str,
    category_columns: list[str] | None = None
) -> list[dict]:
    category_columns = category_columns or []
    all_columns = [item["name"] for item in schema["columns"]]

    columns = scope_columns(all_columns, category_columns)
    numeric_columns = scope_columns(schema.get("numeric_columns", []), category_columns)
    categorical_columns = scope_columns(schema.get("categorical_columns", []), category_columns)
    date_columns = scope_columns(schema.get("date_columns", []), category_columns)
    time_columns = scope_columns(schema.get("time_columns", []), category_columns)
    metric_columns = numeric_columns or schema.get("numeric_columns", [])

    normalized_category = normalize(category)

    if "attendance" in normalized_category or "time tracking" in normalized_category:
        questions = build_attendance_questions(
            columns,
            date_columns,
            time_columns
        )

    elif any(keyword in normalized_category for keyword in [
        "employee", "hr", "staff", "department"
    ]):
        questions = build_attendance_questions(
            columns,
            date_columns,
            time_columns
        )

    elif "finance" in normalized_category or "sales" in normalized_category:
        questions = build_finance_questions(
            numeric_columns,
            categorical_columns,
        )

    elif "geography" in normalized_category:
        questions = build_geography_questions(
            columns,
            metric_columns
        )

    elif any(keyword in normalized_category for keyword in [
        "product", "inventory", "item", "sku", "brand", "supplier"
    ]):
        questions = build_product_questions(
            columns,
            metric_columns
        )

    elif any(keyword in normalized_category for keyword in [
        "customer", "client", "buyer", "member", "account", "segment"
    ]):
        questions = build_customer_questions(
            categorical_columns,
            metric_columns
        )

    elif any(keyword in normalized_category for keyword in [
        "order", "operations", "transaction", "invoice", "delivery", "return", "shipping", "status"
    ]):
        questions = build_orders_questions(
            columns,
            metric_columns,
            categorical_columns
        )

    elif "numeric analysis" in normalized_category:
        questions = build_numeric_summary_questions(numeric_columns)

    elif "categorical analysis" in normalized_category:
        questions = build_generic_questions(
            metric_columns,
            categorical_columns,
            date_columns
        )

    elif any(keyword in normalized_category for keyword in [
        "time analysis", "time", "date analysis", "date"
    ]):
        questions = build_time_questions(date_columns, time_columns)

    else:
        questions = build_generic_questions(
            metric_columns,
            categorical_columns,
            date_columns
        )

    if not questions:
        if numeric_columns and not categorical_columns:
            questions = build_numeric_summary_questions(numeric_columns)
        else:
            questions = build_generic_questions(
                metric_columns,
                categorical_columns,
                date_columns
            )

    # Remove repeated titles
    unique_questions = []
    seen_titles = set()

    for question in questions:
        if question["title"] not in seen_titles:
            unique_questions.append(question)
            seen_titles.add(question["title"])

    return unique_questions[:10]