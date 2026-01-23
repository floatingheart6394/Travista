from pydantic import BaseModel
from typing import Optional, List, Dict

class AIChatRequest(BaseModel):
    message: str


class AIChatResponse(BaseModel):
    reply: str


class AIRAGRequest(BaseModel):
    question: str


class AIRAGResponse(BaseModel):
    question: str
    answer: str
    context: str
    source: str = "RAG-Enhanced"


class OCRResponse(BaseModel):
    """Response model for OCR text extraction."""
    status: str  # "success" or "error"
    text: str  # Extracted and cleaned text
    raw_text: Optional[str] = None  # Raw unprocessed text
    confidence: float  # 0-100 confidence score
    confidence_level: str  # "very high", "high", "moderate", "low", "very low"
    character_count: int
    word_count: int
    error: Optional[str] = None


class OCRWithRAGRequest(BaseModel):
    """Request for OCR + RAG processing."""
    ocr_text: str  # Text extracted from image by OCR


class OCRWithRAGResponse(BaseModel):
    """Response for OCR + RAG processing."""
    status: str
    question: str
    answer: str
    context: str
    source: str
    error: Optional[str] = None


class TravelDocumentAnalysis(BaseModel):
    """Travel document analysis from OCR text."""
    travel_keywords_found: List[str]
    potential_prices: List[str]
    potential_dates: List[str]
    is_travel_document: bool


class ReceiptScanResponse(BaseModel):
    """Receipt scanning response for budget expenses."""
    status: str  # "success" or "error"
    extracted_text: str  # Full OCR text
    vendor: str  # Shop/restaurant name
    amount: Optional[float]  # Detected amount
    amount_confidence: float  # 0-100 confidence in amount detection
    category: str  # Suggested category (food, stay, transport, shopping, activities)
    category_confidence: float  # 0-100 confidence in category
    category_scores: Dict[str, int]  # Scores for each category
    detected_date: Optional[str] = None  # ISO date (YYYY-MM-DD) if found
    error: Optional[str] = None
