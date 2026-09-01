import os
import httpx
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("GROQ_API_KEY")
print("Testing GROQ API KEY:", key[:10] if key else "None")

headers = {
    "Authorization": f"Bearer {key}",
    "Content-Type": "application/json"
}

try:
    response = httpx.get("https://api.groq.com/openai/v1/models", headers=headers, timeout=10.0)
    print("STATUS CODE:", response.status_code)
    if response.status_code == 200:
        models = [m["id"] for m in response.json().get("data", [])]
        print("ACTIVE GROQ MODELS:", models)
    else:
        print("ERROR RESPONSE:", response.text)
except Exception as e:
        print("HTTP EXCEPTION:", e)
