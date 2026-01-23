"""
OCR Service for extracting text from images.
Uses Pytesseract for high-accuracy optical character recognition.
Supports JPG, PNG, BMP, TIFF formats.
"""

import pytesseract  # type: ignore
from PIL import Image  # type: ignore
import io
import re
from datetime import datetime
from typing import Dict, List, Tuple, Optional
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Users\reshm\AppData\Local\Programs\Tesseract-OCR\tesseract.exe"
)

def preprocess_image(image: Image.Image) -> Image.Image:
    """
    Preprocess image for better OCR accuracy.
    - Convert to grayscale
    - Increase contrast
    - Resize if too small
    - Enhance sharpness
    """
    try:
        # Convert to RGB first, then grayscale for better quality
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Significantly upscale image for better text recognition (especially small text like dates)
        width, height = image.size
        scale_factor = 3  # Aggressive scaling
        if width < 1200:
            scale_factor = max(1200 / width, 3)
        new_size = (int(width * scale_factor), int(height * scale_factor))
        image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Convert to grayscale
        img_gray = image.convert('L')
        
        # Enhance contrast for better text recognition
        from PIL import ImageEnhance  # type: ignore
        enhancer = ImageEnhance.Contrast(img_gray)
        img_enhanced = enhancer.enhance(2.5)  # Higher contrast
        
        # Enhance brightness
        enhancer_bright = ImageEnhance.Brightness(img_enhanced)
        img_enhanced = enhancer_bright.enhance(1.2)
        
        # Enhance sharpness to improve text clarity
        enhancer_sharp = ImageEnhance.Sharpness(img_enhanced)
        img_enhanced = enhancer_sharp.enhance(2.0)  # More sharpness
        
        return img_enhanced
    except Exception as e:
        print(f"[OCR DEBUG] Error in preprocess_image: {e}")
        # Return original grayscale if preprocessing fails
        return image.convert('L')


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
        
        # Try multiple PSM (Page Segmentation Mode) configurations for better results
        # PSM 6: Assume a single uniform block of text (default, good for receipts)
        # PSM 3: Fully automatic page segmentation (better for complex layouts)
        extracted_text = ""
        best_confidence = 0
        
        for psm_mode in [6, 3, 4]:
            try:
                config = f'--psm {psm_mode}'
                text_attempt = pytesseract.image_to_string(processed_image, lang=lang, config=config)
                data_attempt = pytesseract.image_to_data(processed_image, output_type='dict', lang=lang, config=config)
                
                # Calculate confidence
                confidences = [int(conf) for conf in data_attempt['conf'] if int(conf) > 0]
                avg_conf = sum(confidences) / len(confidences) if confidences else 0
                
                # Use the result with best confidence
                if avg_conf > best_confidence:
                    best_confidence = avg_conf
                    extracted_text = text_attempt
                    data = data_attempt
            except Exception as e:
                print(f"[OCR DEBUG] PSM {psm_mode} failed: {e}")
                continue
        
        # Fallback to default if all PSM modes failed
        if not extracted_text:
            extracted_text = pytesseract.image_to_string(processed_image, lang=lang)
            data = pytesseract.image_to_data(processed_image, output_type='dict', lang=lang)
        
        # Calculate average confidence (filter out zero values)
        confidences = [int(conf) for conf in data['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else best_confidence
        
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
    
    # Remove special characters that are OCR artifacts (keep common date separators like /)
    text = re.sub(r'[^\w\s\.\,\!\?\-\:\;\(\)\'\"&/]', '', text)
    
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
    try:
        if not text or not text.strip():
            return {
                "vendor": "Receipt Item",
                "amount": None,
                "amount_confidence": 0,
                "category": "shopping",
                "category_confidence": 0,
                "category_scores": {},
                "detected_date": None,
                "text": text
            }
        
        text_lower = text.lower()
    
        # DATE DETECTION (detect a receipt/bill date)
        print(f"\n[OCR DEBUG] === DATE DETECTION ===")
        print(f"[OCR DEBUG] Searching in text of length: {len(text)}")
        print(f"[OCR DEBUG] First 500 chars of text:\n{text[:500]}")
        
        # Quick test: Does the date string exist in the text?
        if "Date :" in text or "Date:" in text:
            print(f"[OCR DEBUG] ✓ Found 'Date :' or 'Date:' in text")
            # Extract the line containing Date
            for line in text.split('\n'):
                if 'Date' in line and '/' in line:
                    print(f"[OCR DEBUG] Date line found: '{line}'")
        
        # Look for dates - prioritize most specific patterns first
        date_patterns = [
            # Exact "Date : XX/XX/XXXX" format (with space after colon)
            r"Date\s*:\s*(\d{1,2}/\d{1,2}/\d{4})",  # Date : 09/01/2026
            r"Date\s*[:=]\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",  # Date: 09/01/2026
            # Standard formats - prioritize 4-digit years
            r"\b(\d{2}/\d{2}/\d{4})\b",  # 09/01/2026 (full year, 2-digit day/month)
            r"\b(\d{1,2}[/-]\d{1,2}[/-]\d{4})\b",  # 9/1/2026 (full year)
            # Month names
            r"(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{2,4})?",  # Jan 22 2026
            r"\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4}",  # 22 Jan 2026
            # Context-aware: Look near Time field
            r"Time[^\n]*\n[^\n]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",  # Date near Time line
            r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})[^\n]*Time",  # Date before Time
            # Near Bill No
            r"Bill\s*No[^\n]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",  # Date on same line as Bill No
            # Aggressive - with lots of whitespace/noise
            r"(\d{1,2})\s*[/\-\.]\s*(\d{1,2})\s*[/\-\.]\s*(\d{4})",  # Spaces around separators (4-digit year)
            # Compressed formats like 1801/26
            r"\b(\d{2})(\d{2})/(\d{2,4})\b",
            r"\b(\d{2})/(\d{2})(\d{2,4})\b",
        ]

        def _parse_date_str(s: str) -> Optional[str]:
            """Convert a matched date string to ISO YYYY-MM-DD if possible."""
            original = s
            s_clean = s.replace("\n", " ").replace("\r", "").strip()
            # Handle compressed day+month forms like 1801/26 -> 18/01/26
            compressed_dm_y = re.match(r'^(\d{2})(\d{2})/(\d{2,4})$', s_clean)
            if compressed_dm_y:
                s_clean = f"{compressed_dm_y.group(1)}/{compressed_dm_y.group(2)}/{compressed_dm_y.group(3)}"
            compressed_d_mm = re.match(r'^(\d{2})/(\d{2})(\d{2,4})$', s_clean)
            if compressed_d_mm:
                s_clean = f"{compressed_d_mm.group(1)}/{compressed_d_mm.group(2)}/{compressed_d_mm.group(3)}"
            # Remove extra spaces around separators
            s_clean = re.sub(r'\s+', ' ', s_clean)
            s_clean = re.sub(r'\s*[/\-\.]\s*', '/', s_clean)  # Normalize separators (escape hyphen)
            
            fmt_candidates = [
                "%d/%m/%Y", "%m/%d/%Y", "%d/%m/%y", "%m/%d/%y",
                "%d-%m-%Y", "%d-%m-%y", "%m-%d-%Y", "%m-%d-%y",
                "%b %d %Y", "%b %d, %Y", "%B %d %Y", "%B %d, %Y",
                "%d %b %Y", "%d %B %Y", "%d %b, %Y", "%d %B, %Y",
                "%b %d", "%B %d", "%d %b", "%d %B",
            ]
            for fmt in fmt_candidates:
                try:
                    dt = datetime.strptime(s_clean, fmt)
                    # If year parsed below 2000 and the original looked like a 2-digit year, bump to 2000s
                    parts = re.split(r'[/-]', s_clean)
                    year_token = parts[-1] if parts else ""
                    if dt.year < 2000 and len(year_token) <= 2:
                        dt = dt.replace(year=2000 + (dt.year % 100))
                    # If year missing in format, default to current year
                    if dt.year < 1900:
                        dt = dt.replace(year=datetime.utcnow().year)
                    return dt.strftime("%Y-%m-%d")
                except ValueError:
                    continue
            return None

        detected_date = None
        for pattern in date_patterns:
            try:
                matches = re.findall(pattern, text, re.IGNORECASE)
                print(f"[OCR DEBUG] Pattern '{pattern[:50]}...'")
                print(f"[OCR DEBUG]   -> Matches: {matches} (type: {type(matches[0]) if matches else 'N/A'})")
                for match in matches:
                    try:
                        print(f"[OCR DEBUG]   -> Processing match: {match} (type: {type(match)})")
                        # Handle both string matches and tuple matches (from grouped patterns)
                        if isinstance(match, tuple):
                            # For patterns with groups, reconstruct the date
                            if len(match) >= 3:
                                match_str = f"{match[0]}/{match[1]}/{match[2]}"
                            else:
                                match_str = "/".join(str(m) for m in match)
                        else:
                            match_str = match
                        
                        print(f"[OCR DEBUG]   -> match_str: '{match_str}'")
                        
                        # Filter out address-like dates (e.g., 11/2 from "11/2 NT NAGAR")
                        # Valid dates should have day <= 31, month <= 12, and year >= 2000
                        parts = match_str.split('/')
                        print(f"[OCR DEBUG]   -> parts: {parts}")
                        if len(parts) >= 3:
                            try:
                                day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                                print(f"[OCR DEBUG]   -> Parsed: day={day}, month={month}, year={year}")
                                # Skip if it looks like an address (no year or invalid year)
                                if year < 100:  # 2-digit year
                                    year += 2000
                                if year < 2000 or year > 2099:
                                    print(f"[OCR DEBUG]   -> Skipping invalid year: {year}")
                                    continue
                                if day > 31 or month > 12 or day < 1 or month < 1:
                                    print(f"[OCR DEBUG]   -> Skipping invalid date: day={day}, month={month}")
                                    continue
                            except (ValueError, IndexError) as e:
                                print(f"[OCR DEBUG]   -> Parsing error: {e}")
                                pass
                        
                        parsed = _parse_date_str(match_str)
                        print(f"[OCR DEBUG]   -> _parse_date_str returned: {parsed}")
                        print(f"[OCR DEBUG]   -> '{match_str}' parsed to: {parsed}")
                        if parsed:
                            detected_date = parsed
                            print(f"[OCR DEBUG]   -> SUCCESS! Using date: {detected_date}")
                            break
                    except Exception as e:
                        print(f"[OCR DEBUG]   -> Error processing match '{match}': {e}")
                        continue
                if detected_date:
                    break
            except Exception as e:
                print(f"[OCR DEBUG] Error with pattern '{pattern}': {e}")
                continue
        
        if not detected_date:
            print(f"[OCR DEBUG] No date detected from any pattern")
        print(f"[OCR DEBUG] Final detected_date: {detected_date}")
        
        # AMOUNT DETECTION (enhanced with more patterns)
        amount_patterns = [
            # Pattern 1: total/amount keywords with currency symbols and numbers
            r'(?:total|subtotal|amount|price|cost|paid|due|balance|sum)[\s:]*[\$€£₹]?\s*([0-9]+[.,][0-9]{2})',
            # Pattern 2: Currency symbol followed by amount
            r'[\$€£₹]\s*([0-9]+[.,][0-9]{2})',
            # Pattern 3: Amount with currency code
            r'([0-9]+[.,][0-9]{2})\s*(?:USD|EUR|GBP|INR|RS|dollars?|euros?|pounds?|rupees?)',
            # Pattern 4: Standalone amounts (decimal format)
            r'\b([0-9]{1,6}[.,][0-9]{2})\b',
            # Pattern 5: Total line with equals
            r'(?:total|amount|sum)\s*[=:]\s*[\$€£₹]?\s*([0-9]+[.,][0-9]{2})',
        ]
        
        detected_amounts = []
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # Replace comma with period for decimal conversion
                    amount_str = match.replace(',', '.')
                    amount_val = float(amount_str)
                    # Filter out unrealistic amounts (e.g., dates like 01.25)
                    if 0.01 <= amount_val <= 999999:
                        detected_amounts.append(amount_val)
                except (ValueError, AttributeError):
                    continue
        
        # Get the highest amount (likely the total) if multiple amounts found
        # Or use the first valid amount if only one
        final_amount = max(detected_amounts) if detected_amounts else None
        amount_confidence = 0
        if detected_amounts:
            # Higher confidence if we found "total" or similar keyword
            has_total_keyword = bool(re.search(r'(?:total|subtotal|amount|sum)[\s:=]*[\$€£₹]?\s*[0-9]+', text_lower))
            base_confidence = 90 if has_total_keyword else 75
            amount_confidence = min(95, base_confidence + len(detected_amounts) * 3)
        
        # VENDOR DETECTION (enhanced extraction)
        vendor_name = ""
        
        # Try multiple strategies for vendor name extraction
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        
        # Strategy 1: First non-empty line that looks like a business name
        for line in lines[:6]:  # Check first few lines
            # Skip lines that are just numbers or addresses
            if re.match(r'^[A-Za-z][A-Za-z\s&\'\-\.]{2,40}$', line) and not re.search(r'\d{3,}', line):
                vendor_name = line[:40]
                break

        # Strategy 1b: Prefer lines mentioning biryani/briyani/biriyani or royal
        if not vendor_name:
            for line in lines[:8]:
                low = line.lower()
                if any(k in low for k in ['biryani', 'briyani', 'biriyani', 'royal']):
                    vendor_name = line[:40]
                    break
        
        # Strategy 2: Look for business name patterns
        if not vendor_name:
            name_patterns = [
                r'(?:from|at|vendor|merchant|store|shop)[\s:]+([A-Za-z][A-Za-z\s&\'\-\.]{2,40})',
                r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})',  # Title case names
            ]
            for pattern in name_patterns:
                match = re.search(pattern, text)
                if match:
                    vendor_name = match.group(1).strip()[:40]
                    break
        
        # Strategy 3: Use best-looking early line (longest alpha section) as fallback
        if not vendor_name and lines:
            candidates = []
            for line in lines[:6]:
                clean = re.sub(r'[^A-Za-z\s&\'\-\.]', '', line)
                alpha_len = len(re.findall(r'[A-Za-z]', clean))
                candidates.append((alpha_len, clean.strip()))
            best = max(candidates, key=lambda x: x[0]) if candidates else None
            if best and best[0] >= 4:
                vendor_name = best[1][:40]
        
        # CATEGORY DETECTION (food / accommodation / transport / shopping / activities / misc)
        category_keywords = {
            # Food & dining: hotels/restaurants/eateries
            'food': [
                'restaurant', 'resto', 'dining', 'food', 'eatery', 'biryani', 'briyani', 'baker', 'bakery',
                'cafe', 'coffee', 'tea', 'snack', 'meal', 'lunch', 'dinner', 'breakfast', 'canteen', 'kitchen',
                'grill', 'bar', 'pub', 'hotel', 'chicken', 'noodle', 'noodles', 'fried', 'rice', 'egg'
            ],
            # Accommodation: lodging/stay/rooms
            'accommodation': [
                'lodge', 'lodging', 'stay', 'room', 'rooms', 'resort', 'inn', 'motel', 'guest house',
                'homestay', 'hostel', 'suite', 'accommodation', 'night', 'bed', 'hotel'
            ],
            # Transport: travel tickets/fare/carriers
            'transport': [
                'travel', 'travels', 'taxi', 'cab', 'uber', 'lyft', 'ola', 'bus', 'coach', 'train', 'rail',
                'metro', 'tram', 'ferry', 'flight', 'airline', 'airways', 'boarding', 'fare', 'ticket',
                'parking', 'toll', 'fuel', 'petrol', 'diesel', 'gas'
            ],
            # Shopping: traders/shops/stores/textiles/cloth purchases
            'shopping': [
                'trader', 'traders', 'shop', 'shops', 'store', 'stores', 'mart', 'market', 'supermarket',
                'grocery', 'provision', 'provisions', 'textile', 'textiles', 'cloth', 'clothing', 'garment',
                'apparel', 'boutique', 'retail', 'outlet', 'purchase', 'purchases', 'electronics', 'hardware'
            ],
            # Activities: movies/tourist entries/events
            'activities': [
                'movie', 'cinema', 'theater', 'theatre', 'park', 'zoo', 'museum', 'gallery', 'tour', 'tourist',
                'attraction', 'ticket', 'tickets', 'entry', 'admission', 'show', 'event', 'concert', 'festival',
                'ride', 'amusement', 'experience'
            ],
            # Misc fallback keywords to bias if seen
            'miscellaneous': ['misc', 'other']
        }
        
        category_scores = {}
        # Check both full text and vendor name
        for category, keywords in category_keywords.items():
            text_score = sum(text_lower.count(kw) for kw in keywords)
            vendor_score = sum(vendor_name.lower().count(kw) for kw in keywords) * 4 if vendor_name else 0
            category_scores[category] = text_score + vendor_score
        
        # Determine category based on scores
        max_score = max(category_scores.values()) if category_scores else 0
        if max_score > 0:
            detected_category = max(category_scores.items(), key=lambda x: x[1])[0]
            category_confidence = min(95, 70 + max_score * 8)
        else:
            # Default to miscellaneous when nothing matches
            detected_category = "miscellaneous"
            category_confidence = 40
        
        return {
            "vendor": vendor_name or "Receipt Item",
            "amount": round(final_amount, 2) if final_amount else None,
            "amount_confidence": round(amount_confidence, 1),
            "category": detected_category,
            "category_confidence": round(category_confidence, 1),
            "category_scores": category_scores,
            "detected_date": detected_date,
            "text": text
        }
    
    except Exception as e:
        print(f"[OCR DEBUG] ERROR in extract_receipt_data: {e}")
        import traceback
        traceback.print_exc()
        return {
            "vendor": "Receipt Item",
            "amount": None,
            "amount_confidence": 0,
            "category": "shopping",
            "category_confidence": 0,
            "category_scores": {},
            "detected_date": None,
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
