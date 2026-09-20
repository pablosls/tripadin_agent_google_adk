import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "")

# Initialize supabase client if keys are present
if url and key:
    supabase: Client = create_client(url, key)
else:
    supabase = None
    print("Warning: Supabase keys not found in environment.")
