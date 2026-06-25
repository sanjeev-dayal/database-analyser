import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).parent / "backend" / ".env"

load_dotenv(env_path)

key = os.getenv("OPENAI_API_KEY")

if key:
    print("API key found:", key[:7] + "...")
else:
    print("API key not found")