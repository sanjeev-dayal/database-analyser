# proj2

This project is a full-stack data analysis application that lets users upload CSV datasets, validate and profile them, generate questions, and run SQL-based analysis through a web interface.

It is composed of:
- a FastAPI backend for data processing, validation, and API endpoints
- a React + Vite frontend for the user experience
- a local upload storage system for datasets and generated DuckDB databases

## Project overview

The application flow is:
1. Upload a CSV file from the frontend.
2. The backend validates the file and creates a DuckDB database.
3. The system analyzes the dataset schema and generates insights or questions.
4. Users can explore the dataset and run queries through the UI.

## Folder structure

```text
proj2/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── upload.py
│   │   │   ├── validation.py
│   │   │   ├── categories.py
│   │   │   ├── query.py
│   │   │   ├── questions.py
│   │   │   ├── execute_question.py
│   │   │   ├── profile.py
│   │   │   └── dashboard.py
│   │   └── services/
│   │       ├── database_service.py
│   │       ├── dataset_loader_service.py
│   │       ├── schema_service.py
│   │       ├── validation_service.py
│   │       ├── profile_service.py
│   │       ├── category_service.py
│   │       ├── question_service.py
│   │       ├── ai_service.py
│   │       └── sql_safety_service.py
│   └── requirements.txt
├── db-analyser/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── uploads/
│   └── generated dataset folders and DuckDB files
├── sample_upload.csv
├── README.md
└── requirements.txt
```

## Backend details

The backend is built with FastAPI and handles:
- file uploads and storage
- CSV validation and schema inspection
- dataset profiling and categorization
- SQL query execution with safety checks
- AI-assisted question generation

### Backend setup
1. Open the project root.
2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
3. Install the backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the API server:
   ```powershell
   cd backend
   uvicorn app.main:app --reload
   ```

The backend API will be available at http://localhost:8000, and interactive docs will be available at http://localhost:8000/docs.

## Frontend details

The frontend is built with React, TypeScript, Vite, and Tailwind-style UI components. It provides the interface for:
- uploading datasets
- exploring dataset profiles
- viewing generated questions and insights
- running queries and viewing results

### Frontend setup
1. Change into the frontend folder:
   ```powershell
   cd db-analyser
   ```
2. Install the frontend dependencies:
   ```powershell
   npm install
   ```
3. Start the development server:
   ```powershell
   npm run dev
   ```

The frontend will be available at http://localhost:5173.

## Dependency management

- Python backend dependencies are listed in [requirements.txt](requirements.txt).
- Frontend dependencies are managed in [db-analyser/package.json](db-analyser/package.json).

## Notes

- The uploaded CSV files and generated DuckDB databases are stored under the uploads directory.
- The sample dataset file [sample_upload.csv](sample_upload.csv) can be used to test the workflow.
