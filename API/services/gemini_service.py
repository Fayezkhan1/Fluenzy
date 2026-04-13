import os
import json
from google import genai

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
client = genai.Client(api_key=GEMINI_API_KEY)

SYSTEM_PROMPT = """Analyze the following conversation transcript for grammatical errors made by the user only (not the AI).
For each error found, list it in this format:
1. "original text" → "corrected text" - brief explanation

If no grammatical errors are found, respond with: "No grammatical errors detected."

Only analyze the lines that start with "user:" - ignore AI responses."""

DETAILED_PROMPT = """You are an expert English grammar coach. Analyze ONLY the user's lines (lines starting with "user:") in this conversation transcript.

Return a JSON object with this exact structure:
{
  "errors": [
    {
      "original": "the exact phrase the user said that contains the error",
      "corrected": "the corrected version of that phrase",
      "explanation": "brief, friendly explanation of the mistake",
      "category": "one of: Tense, Subject-Verb Agreement, Article, Preposition, Word Choice, Sentence Structure, Punctuation, Spelling, Other",
      "severity": "minor or major"
    }
  ],
  "annotated_lines": [
    {
      "role": "user or AI",
      "text": "original message text",
      "error_indices": [
        {
          "start": 0,
          "end": 10,
          "corrected": "corrected phrase",
          "explanation": "brief explanation"
        }
      ]
    }
  ],
  "summary": {
    "total_errors": 0,
    "categories": {"Tense": 0, "Subject-Verb Agreement": 0, "Article": 0, "Preposition": 0, "Word Choice": 0, "Sentence Structure": 0, "Other": 0},
    "overall_feedback": "2-3 sentence encouraging summary of the user's grammar performance"
  }
}

Rules:
- Only flag real grammatical errors, not stylistic choices
- error_indices must have accurate character positions within the text field
- If no errors, return errors: [], annotated_lines with all lines but empty error_indices, and summary with total_errors: 0
- Return ONLY valid JSON, no markdown, no extra text"""

def analyze_grammar(transcripts):
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"{SYSTEM_PROMPT}\n\nTranscript:\n{transcripts}"
    )
    return response.text

def analyze_grammar_detailed(transcripts):
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"{DETAILED_PROMPT}\n\nTranscript:\n{transcripts}"
    )
    raw = response.text.strip()
    # strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
