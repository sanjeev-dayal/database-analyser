# 📊 Database Analyzer

An AI-powered database and dataset analysis backend built with **FastAPI**, **DuckDB**, **Pandas**, and **LLMs**. The application allows users to upload CSV or Excel datasets, automatically profile and validate the data, generate analytical questions using AI, and execute safe SQL queries for interactive data exploration.

---

## ✨ Features

### 📁 Dataset Upload
- Upload CSV and Excel datasets
- Automatically stores uploaded datasets
- Creates an isolated DuckDB database for every dataset

### 🔍 Schema Detection
Automatically identifies:
- Numeric columns
- Categorical columns
- Date columns
- Time columns
- Boolean columns

### 📈 Data Profiling
Generates:
- Summary statistics
- Date ranges
- Top categorical values
- Numeric insights
- Dataset metadata

### ✅ Data Validation
Detects:
- Missing values
- Empty columns
- Duplicate rows
- Negative numeric values
- Data quality warnings

### 🤖 AI Question Generation
Uses an LLM (via OpenRouter) to generate meaningful analytical questions based on:
- Dataset schema
- Sample records
- Dataset category

Each generated question includes:
- SQL query
- Chart configuration
- Human-readable description

### 🗂 Automatic Dataset Categorization

Automatically classifies uploaded datasets into domains such as:

- Sales & Finance
- Employee & HR
- Attendance & Time Tracking
- Customer
- Product & Inventory
- Geography
- Orders & Operations
- Time Analysis

### 🛡 SQL Safety

Before executing queries, the system validates SQL by:

- Allowing only `SELECT` and `WITH` statements
- Blocking destructive SQL commands
- Preventing multiple SQL statements
- Rejecting dangerous keywords

### ⚡ Safe SQL Execution

Queries are executed against isolated DuckDB databases, returning results as JSON for easy frontend visualization.

---

# 🏗 Architecture

```
Client
   │
   ▼
FastAPI REST API
   │
   ├── Upload Service
   ├── Validation Service
   ├── Schema Service
   ├── Profile Service
   ├── Category Service
   ├── AI Service
   ├── SQL Safety Service
   └── DuckDB Database
```

---

# 📂 Project Structure

```
database_analyzer/
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── upload.py
│   │   │   ├── validation.py
│   │   │   ├── profile.py
│   │   │   ├── categories.py
│   │   │   ├── questions.py
│   │   │   ├── execute_question.py
│   │   │   ├── query.py
│   │   │   └── dashboard.py
│   │   │
│   │   ├── services/
│   │   │   ├── ai_service.py
│   │   │   ├── database_service.py
│   │   │   ├── dataset_loader_service.py
│   │   │   ├── schema_service.py
│   │   │   ├── validation_service.py
│   │   │   ├── profile_service.py
│   │   │   ├── question_service.py
│   │   │   ├── category_service.py
│   │   │   └── sql_safety_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── uploads/
│   └── tests/
│
└── README.md
```

---

# 🚀 Getting Started

## Clone the repository

```bash
git clone https://github.com/<your-username>/database-analyzer.git

cd database-analyzer/backend
```

---

## Create a virtual environment

```bash
python -m venv .venv
```

Activate it

**Windows**

```bash
.venv\Scripts\activate
```

**Linux / macOS**

```bash
source .venv/bin/activate
```

---

## Install dependencies

```bash
pip install -r requirements.txt
```

---

## Configure Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
OPENROUTER_API_KEY=your_api_key
```

---

## Run the server

```bash
uvicorn app.main:app --reload
```

---

## Open API Documentation

```
http://localhost:8000/docs
```

---

# 📡 Main API Endpoints

| Endpoint | Description |
|-----------|-------------|
| `/` | Home |
| `/api/health` | Health check |
| `/upload` | Upload dataset |
| `/validation` | Validate uploaded dataset |
| `/profile` | Dataset profile |
| `/categories` | Dataset categorization |
| `/questions` | Generate AI questions |
| `/execute-question` | Execute generated SQL |
| `/query` | Execute custom SQL |
| `/dashboard` | Dashboard analytics |

---

# 🧠 Technologies Used

- Python
- FastAPI
- DuckDB
- Pandas
- OpenRouter API
- OpenAI SDK
- Uvicorn
- Pydantic

---

# 🔒 Security

The application includes several safety mechanisms:

- Read-only SQL execution
- SQL keyword filtering
- Single-statement enforcement
- Isolated database per dataset
- Query validation before execution

---

# 📈 Future Enhancements

- Authentication & user accounts
- Multi-dataset comparison
- Dashboard persistence
- Scheduled reports
- Interactive chart generation
- Database connectors (PostgreSQL, MySQL, SQL Server)
- Natural language to SQL improvements
- Export reports (PDF/Excel)

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📄 License

This project is intended for educational and research purposes. Add an appropriate open-source license (MIT, Apache 2.0, etc.) before public distribution.

---

## 👨‍💻 Author

Developed as an AI-powered data analysis backend using FastAPI, DuckDB, and LLM-assisted analytics.
