from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class AutocompleteRequest(BaseModel):
    code: str
    cursorPosition: int
    language: str

class AutocompleteResponse(BaseModel):
    suggestion: str

@router.post("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete(req: AutocompleteRequest):
    before = req.code[: req.cursorPosition]

    if before.endswith("def "):
        return {"suggestion": "my_function():\n    pass"}
    if before.endswith("import "):
        return {"suggestion": "sys"}
    if before.rstrip().endswith("print("):
        return {"suggestion": '"hello")'}

    return {"suggestion": "# suggestion: consider adding a helper function"}

