from fastapi import APIRouter
from pydantic import BaseModel
import re

router = APIRouter()

class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str

class AutocompleteResponse(BaseModel):
    suggestion: str

# Advanced rule patterns
PATTERNS = {
    r"def\s+\w+$": "(self):\n    \"\"\"docstring\"\"\"\n    pass",
    r"async\s+def\s+\w+$": "(self):\n    \"\"\"docstring\"\"\"\n    pass",
    r"class\s+\w+$": ":\n    def __init__(self, *args, **kwargs):\n        super().__init__(*args, **kwargs)\n        pass",
    r"if\s+\w+$": " == \"main\":\n    main()",
    r"for\s+\w+$": " in range(10):\n    pass",
    r"try$": ":\n    pass\nexcept Exception as e:\n    print(f\"Error: {e}\")",
    r"with\s+open\(\w+$": ", 'r') as f:\n    data = f.read()",
    r"import\s+$": "os, sys, json",
    r"from\s+\w+\s+import$": " *",
}

# Python keywords for prefix completion
KEYWORDS = [
    "False", "None", "True", "and", "as", "assert", "async", "await", "break",
    "class", "continue", "def", "del", "elif", "else", "except", "finally",
    "for", "from", "global", "if", "import", "in", "is", "lambda", "nonlocal",
    "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
    "print", "range", "len", "sum", "min", "max", "enumerate", "zip"
]

@router.post("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(req: AutocompleteRequest):
    code = req.code
    cursor = req.cursorPosition
    before = code[:cursor]
    
    # 1. Match complex patterns
    for pattern, sugg in PATTERNS.items():
        if re.search(pattern, before):
            return {"suggestion": sugg}
    
    # 2. Keyword prefix matching
    # Find the last word being typed
    last_word_match = re.search(r"\b(\w+)$", before)
    if last_word_match:
        last_word = last_word_match.group(1)
        # Don't suggest if it's already a full keyword
        matches = [kw for kw in KEYWORDS if kw.startswith(last_word) and kw != last_word]
        if matches:
            # Return the rest of the keyword
            return {"suggestion": matches[0][len(last_word):]}
            
    # 3. Contextual defaults
    if before.rstrip().endswith(":") or before.rstrip().endswith("("):
        return {"suggestion": "\n    pass"}
        
    return {"suggestion": " # ..."}
