"""
OCR Service for extracting text from images.
Uses Pytesseract for high-accuracy optical character recognition.
Supports JPG, PNG, BMP, TIFF formats.
"""

import pytesseract  # type: ignore
from PIL import Image  # type: ignore
import io
import re
from typing import Dict, List, Tuple
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Users\reshm\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
)

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image for better OCR accuracy.
    - Convert to grayscale
    - Increase contrast
    - Resize if too small
    """
    # Convert to grayscale
    img_gray = image.convert('L')
    
    # Enhance contrast for better text recognition
    from PIL import ImageEnhance  # type: ignore
    enhancer = ImageEnhance.Contrast(img_gray)
    img_enhanced = enhancer.enhance(2.0)
    
    # Resize if image is too small (less than 300px width)
    width, height = img_enhanced.size
    if width < 300:
        scale_factor = 300 / width
        new_size = (int(width * scale_factor), int(height * scale_factor))
        img_enhanced = img_enhanced.resize(new_size, Image.Resampling.LANCZOS)
    
    return img_enhanced


def extract_text_from_image(image_bytes: bytes, lang: str = "eng") -> Dict:
    """
    Extract text from image using Pytesseract.
    
    Args:
        image_bytes: Image file bytes
        lang: Tesseract language code (default: "eng" for English)
    
    Returns:
        Dict with extracted text and confidence metrics
    """
    try:
        # Open image from bytes
        image = Image.open(io.BytesIO(image_bytes))
        
        # Preprocess for better accuracy
        processed_image = preprocess_image(image)
        
        # Extract text using Pytesseract
        extracted_text = pytesseract.image_to_string(processed_image, lang=lang)
        
        # Get detailed data with confidence scores
        data = pytesseract.image_to_data(processed_image, output_type='dict', lang=lang)
        
        # Calculate average confidence (filter out zero values)
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        # Clean up extracted text
        cleaned_text = clean_text(extracted_text)
        
        return {
            "status": "success",
            "text": cleaned_text,
            "raw_text": extracted_text,
            "confidence": round(avg_confidence, 2),
            "character_count": len(cleaned_text),
            "word_count": len(cleaned_text.split()),
            "confidence_level": get_confidence_level(avg_confidence)
        }
    
    except Exception as e:
        error_msg = str(e)
        # Check if it's a Tesseract installation issue
        if "tesseract" in error_msg.lower() or "not found" in error_msg.lower():
            return {
                "status": "error",
                "error": "Tesseract OCR engine not installed. Please install Tesseract-OCR from https://github.com/UB-Mannheim/tesseract/wiki",
                "text": "",
                "confidence": 0
            }
        else:
            return {
                "status": "error",
                "error": f"OCR processing failed: {error_msg}",
                "text": "",
                "confidence": 0
            }


def clean_text(text: str) -> str:
    """
    Clean extracted text by removing extra whitespace and noise.
    """
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters that are OCR artifacts
    text = re.sub(r'[^\w\s\.\,\!\?\-\:\;\(\)\'\"&]', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def get_confidence_level(confidence: float) -> str:
    """
    Get confidence level description based on percentage.
    """
    if confidence >= 90:
        return "very high"
    elif confidence >= 75:
        return "high"
    elif confidence >= 60:
        return "moderate"
    elif confidence >= 40:
        return "low"
    else:
        return "very low"


def extract_travel_info(text: str) -> Dict:
    """
    Extract travel-related information from OCR text.
    Looks for patterns like:
    - Dates (e.g., "Jan 15-20")
    - Prices (e.g., "$100", "€50")
    - Locations/Countries
    - Common travel keywords
    """
    travel_keywords = [
        'hotel', 'flight', 'booking', 'reservation', 'ticket',
        'airport', 'airline', 'train', 'bus', 'transit',
        'address', 'location', 'destination', 'arrival', 'departure',
        'date', 'time', 'price', 'cost', 'payment', 'receipt',
        'passenger', 'guest', 'visitor', 'tourist'
    ]
    
    text_lower = text.lower()
    found_keywords = [kw for kw in travel_keywords if kw in text_lower]
    
    # Extract potential prices ($ or € or numbers followed by currency)
    prices = re.findall(r'[\$€£][0-9]+\.?[0-9]*|[0-9]+\.?[0-9]*\s*(?:USD|EUR|GBP|dollars|euros|pounds)', text)
    
    # Extract potential dates
    dates = re.findall(r'\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}\b', text)
    
    return {
        "travel_keywords_found": found_keywords,
        "potential_prices": list(set(prices)),
        "potential_dates": list(set(dates)),
        "is_travel_document": len(found_keywords) > 0
    }


def ocr_with_rag(text: str, rag_pipeline) -> Dict:
    """
    Analyze OCR-extracted text and provide intelligent insights.
    Detects document type and provides relevant information.
    """
    try:
        from app.core.openai_client import ask_openai
        
        # Create a contextual prompt for analyzing the document
        analysis_prompt = f"""
You are Tavi, an AI assistant analyzing an uploaded document.

Based on the text below, provide a brief 2-3 sentence summary of what this document is and any relevant insights.
If it's a receipt/ticket, mention the key details. If it's travel info, highlight important points.
Be concise and helpful.

Document Text:
{text[:500]}

Your analysis:
"""
        
        answer = ask_openai(analysis_prompt)
        
        return {
            "status": "success",
            "question": "Document Analysis",
            "answer": answer,
            "context": text[:300],  # Show snippet of extracted text
            "source": "OCR+AI Analysis"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "question": "Document Analysis"
        }


def extract_receipt_data(text: str) -> Dict:
    """
    Extract expense-related data from receipt OCR text.
    Focuses on: vendor name, total amount, category
    
    Returns high-accuracy detection with confidence scores
    """
    text_lower = text.lower()
    
    # AMOUNT DETECTION (high accuracy)
    amount_patterns = [
        r'(?:total|subtotal|amount|price|cost|paid|due|balance)[\s:]*[\$€£₹]?\s*([0-9]+\.?[0-9]*)',
        r'[\$€£₹]\s*([0-9]+\.?[0-9]*)',
        r'([0-9]+\.?[0-9]*)\s*(?:USD|EUR|GBP|INR|dollars|euros|pounds|rupees)',
    ]
    
    detected_amounts = []
    for pattern in amount_patterns:
        matches = re.findall(pattern, text_lower)
        detected_amounts.extend([float(m) for m in matches if m])
    
    # Get the highest amount (likely the total)
    final_amount = max(detected_amounts) if detected_amounts else None
    amount_confidence = min(95, 85 + len(detected_amounts) * 5) if detected_amounts else 0
    
    # VENDOR DETECTION (restaurant/shop name)
    vendor_keywords = {
        'restaurant': ['restaurant', 'cafe', 'dining', 'bistro', 'tavern', 'pizzeria', 'diner'],
        'hotel': ['hotel', 'inn', 'lodge', 'motel', 'resort', 'guest house', 'airbnb'],
        'shop': ['shop', 'store', 'market', 'supermarket', 'mall', 'retail', 'boutique'],
        'transport': ['uber', 'taxi', 'bus', 'train', 'flight', 'airline', 'metro'],
        'attraction': ['museum', 'theater', 'cinema', 'park', 'tour', 'attraction', 'ticket'],
    }
    
    # Try to extract shop/restaurant name (usually at top or after date)
    vendor_name = ""
    name_patterns = [
        r'^[\s\*]*([A-Za-z\s&\-]+?)[\s\*]*\n',  # First line
        r'(?:receipt from|at|from)\s+([A-Za-z\s&\-]+)',  # After "at" or "from"
    ]
    for pattern in name_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            vendor_name = match.group(1).strip()
            break
    
    # CATEGORY DETECTION (food/stay/transport/shopping/activities)
    category_keywords = {
        'food': ['restaurant', 'cafe', 'food', 'pizza', 'burger', 'meal', 'lunch', 'dinner', 'breakfast', 'coffee', 'tea', 'snack', 'bakery', 'deli'],
        'stay': ['hotel', 'motel', 'inn', 'resort', 'lodge', 'airbnb', 'accommodation', 'room', 'bed', 'night'],
        'transport': ['uber', 'taxi', 'bus', 'train', 'flight', 'airline', 'metro', 'transit', 'transportation', 'ticket', 'fare'],
        'shopping': ['shop', 'store', 'market', 'mall', 'retail', 'boutique', 'supermarket', 'shopping', 'purchase'],
        'activities': ['museum', 'theater', 'cinema', 'park', 'tour', 'attraction', 'ticket', 'entrance', 'admission', 'experience'],
    }
    
    category_scores = {}
    for category, keywords in category_keywords.items():
        score = sum(text_lower.count(kw) for kw in keywords)
        category_scores[category] = score
    
    detected_category = max(category_scores.items(), key=lambda x: x[1])[0] if max(category_scores.values()) > 0 else "shopping"
    category_confidence = min(95, 70 + category_scores[detected_category] * 8)
    
    return {
        "vendor": vendor_name or "Receipt",
        "amount": round(final_amount, 2) if final_amount else None,
        "amount_confidence": round(amount_confidence, 1),
        "category": detected_category,
        "category_confidence": round(category_confidence, 1),
        "category_scores": category_scores,
        "text": text
    }


def detect_expense_category(text: str) -> tuple[str, float]:
    """
    Intelligent expense category detection with confidence score.
    
    Args:
        text: Extracted receipt text
    
    Returns:
        Tuple of (category_name, confidence_percentage)
    """
    receipt_data = extract_receipt_data(text)
    return receipt_data['category'], receipt_data['category_confidence']
