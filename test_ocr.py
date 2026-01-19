"""
Test OCR functionality with sample image processing.
Tests text extraction, confidence scoring, and travel document analysis.
"""

import os
import sys
from pathlib import Path

# Setup path
sys.path.insert(0, str(Path(__file__).parent / "backend"))
os.chdir(Path(__file__).parent / "backend")
os.environ["OPENAI_API_KEY"] = "test-key"

from app.ocr.ocr_service import (  # type: ignore
    extract_text_from_image,
    extract_travel_info,
    clean_text,
    get_confidence_level
)
from PIL import Image, ImageDraw, ImageFont  # type: ignore
import io


def create_test_image_with_text():
    """Create a simple test image with travel-related text."""
    img = Image.new('RGB', (400, 300), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use default font, fallback to simple font
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    text = """Flight Booking Confirmation
    
Passenger: John Doe
Flight: AA1234
From: New York (JFK)
To: Paris (CDG)
Date: Jan 20, 2026
Price: $1500
    
Hotel Reservation
Ritz Paris
Address: 15 Place Vendôme
Check-in: Jan 20
Check-out: Jan 27
Cost: €150/night
    
Total Trip Budget: €2500"""
    
    draw.text((20, 30), text, fill='black', font=font)
    
    # Convert to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    return img_bytes.getvalue()


def test_ocr_basic():
    """Test basic OCR functionality."""
    print("\n" + "="*60)
    print("TEST 1: Basic OCR Text Extraction")
    print("="*60)
    
    # Create test image
    image_bytes = create_test_image_with_text()
    print(f"✓ Created test image ({len(image_bytes)} bytes)")
    
    # Extract text
    try:
        result = extract_text_from_image(image_bytes)
        print(f"\nOCR Result:")
        print(f"  Status: {result.get('status')}")
        print(f"  Confidence: {result.get('confidence')}%")
        print(f"  Confidence Level: {result.get('confidence_level')}")
        print(f"  Characters: {result.get('character_count')}")
        print(f"  Words: {result.get('word_count')}")
        
        if result.get('status') == 'success':
            print(f"\nExtracted Text Preview:")
            text = result.get('text', '')
            print(f"  {text[:200]}..." if len(text) > 200 else f"  {text}")
        else:
            print(f"⚠️ Error: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ OCR failed: {str(e)}")
        print("   Make sure Tesseract-OCR is installed from:")
        print("   https://github.com/UB-Mannheim/tesseract/wiki")


def test_travel_info_extraction():
    """Test travel information extraction from text."""
    print("\n" + "="*60)
    print("TEST 2: Travel Document Analysis")
    print("="*60)
    
    sample_text = """Flight Booking Confirmation
    
Passenger: Jane Smith
Flight: UA5678 to Tokyo (NRT)
Date: February 15 - March 5, 2026
Price: $2800
    
Hotel: Shinjuku Prince Hotel
Address: 1-30-1 Nishi-Shinjuku
Rooms: 10 nights at $120/night = $1200
    
Travel Insurance: $150
Total Budget: €4150"""
    
    analysis = extract_travel_info(sample_text)
    
    print(f"\nTravel Analysis Results:")
    print(f"  Is Travel Document: {analysis['is_travel_document']}")
    print(f"  Travel Keywords Found: {', '.join(analysis['travel_keywords_found'][:5])}...")
    print(f"  Potential Prices: {analysis['potential_prices']}")
    print(f"  Potential Dates: {analysis['potential_dates']}")


def test_text_cleaning():
    """Test text cleaning functionality."""
    print("\n" + "="*60)
    print("TEST 3: Text Cleaning & Normalization")
    print("="*60)
    
    messy_text = "Paris   to   Rome  \n\n  Budget:  $500-700  @@  Best hotels ###"
    cleaned = clean_text(messy_text)
    
    print(f"Original: {repr(messy_text)}")
    print(f"Cleaned:  {repr(cleaned)}")


def test_confidence_levels():
    """Test confidence level descriptions."""
    print("\n" + "="*60)
    print("TEST 4: Confidence Level Descriptions")
    print("="*60)
    
    test_scores = [95, 80, 65, 45, 25]
    for score in test_scores:
        level = get_confidence_level(score)
        print(f"  Confidence {score}% → {level}")


if __name__ == "__main__":
    print("\n🚀 Travista OCR Test Suite")
    print("=" * 60)
    
    try:
        test_ocr_basic()
        test_travel_info_extraction()
        test_text_cleaning()
        test_confidence_levels()
        
        print("\n" + "="*60)
        print("✓ All tests completed!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Test suite failed: {str(e)}")
        import traceback
        traceback.print_exc()
