import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

print("Groq LLM ready.")

def generate_answer(question: str, context_chunks: list[str]) -> str:
    context = "\n\n".join(context_chunks[:3])

    prompt = f"""You are a financial document analyst. Answer the question using only the context below.
If the answer is not in the context, say "I could not find this information in the document."

Context:
{context}

Question: {question}

Answer:"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
        temperature=0.2
    )

    return response.choices[0].message.content.strip()