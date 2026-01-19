# 🚀 OCR Setup - Quick Start

## Installation (2 minutes)

### Step 1: Install Python Packages
```bash
cd backend
pip install pytesseract pillow python-multipart
```

### Step 2: Install Tesseract-OCR Engine (System Level)

**Windows:**
1. Download: https://github.com/UB-Mannheim/tesseract/wiki
2. Click "Download" → Select the latest .exe installer
3. Run installer, keep default path: `C:\Program Files\Tesseract-OCR`
4. Finish installation
5. Restart your terminal/IDE

**macOS:**
```bash
brew install tesseract
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

### Step 3: Verify Installation

```bash
# Check Tesseract is installed
tesseract --version

# Test Python imports
python -c "from app.ocr.ocr_service import extract_text_from_image; print('✓ OCR Ready')"
```

---

## Testing (1 minute)

```bash
# Run OCR test suite
cd c:\Users\sunil\Travista
python test_ocr.py

# Expected output:
# ✓ TEST 1: Basic OCR Text Extraction
# ✓ TEST 2: Travel Document Analysis
# ✓ TEST 3: Text Cleaning & Normalization
# ✓ TEST 4: Confidence Level Descriptions
# ✓ All tests completed!
```

---

## Using OCR in Frontend

### Backend Already Running?

```bash
# Terminal 1 - Backend
cd backend
export OPENAI_API_KEY="your-openai-key"
uvicorn app.main:app --reload
```

```bash
# Terminal 2 - Frontend
npm run dev
```

### Access OCR in UI

1. Open: http://localhost:5173
2. Click "AI Assistant"
3. Click the **📤 Upload** button (left of text input)
4. Select a travel document (screenshot, PDF image, booking confirmation)
5. See:
   - OCR text extraction preview
   - Confidence score
   - Character/word count
   - AI-generated response with travel context

---

## API Usage Examples

### JavaScript/React

```javascript
// In your React component
import { ocrExtractText, ocrChatWithRAG } from '../services/ragService';

// Handle file upload
const handleUpload = async (file) => {
  // Step 1: Extract text
  const ocr = await ocrExtractText(file);
  console.log(`Extracted: ${ocr.wordCount} words (${ocr.confidence.toFixed(1)}%)`);
  
  // Step 2: Get AI response
  const response = await ocrChatWithRAG(ocr.text);
  console.log('AI says:', response.answer);
};
```

### cURL (Command Line)

```bash
# Extract text from image
curl -X POST http://localhost:8000/ai/ocr \
  -F "file=@flight_booking.jpg" | jq

# Output includes:
# {
#   "status": "success",
#   "text": "...",
#   "confidence": 85.5,
#   "confidence_level": "high"
# }
```

### Python Backend

```python
from app.ocr.ocr_service import extract_text_from_image, extract_travel_info

# Read image file
with open('receipt.jpg', 'rb') as f:
    image_bytes = f.read()

# Extract text
result = extract_text_from_image(image_bytes)
print(f"Extracted: {result['text']}")
print(f"Confidence: {result['confidence']}%")

# Analyze travel content
travel_data = extract_travel_info(result['text'])
print(f"Prices found: {travel_data['potential_prices']}")
print(f"Dates found: {travel_data['potential_dates']}")
```

---

## 📊 Confidence Levels Guide

| Confidence | Level | What to Do |
|-----------|-------|-----------|
| 90-100% | Very High | ✓ Trust fully |
| 75-89% | High | ✓ Use with confidence |
| 60-74% | Moderate | ⚠️ Review the text |
| 40-59% | Low | ⚠️ Manual check recommended |
| < 40% | Very Low | ✗ Rescan document |

**How to improve:**
- Use high-resolution images (300+ DPI)
- Ensure good lighting (no shadows/glare)
- Scan straight (not at angles)
- Use dark text on light background

---

## Supported Image Formats

✓ **Supported:**
- JPG / JPEG
- PNG
- BMP
- TIFF

✗ **Not Supported:**
- PDF (extract image first)
- GIF (static image OK, animated not)
- WebP
- SVG

**Converting formats:**
```bash
# macOS/Linux
convert input.pdf[0] output.jpg

# Or use online tools: https://convert.cloudconvert.com/pdf-to-jpg
```

---

## Common Issues & Fixes

### ❌ "Tesseract not found"
→ Install Tesseract (see Step 2 above) and restart terminal

### ❌ "Very low confidence (< 50%)"
→ Try a clearer image, better lighting, higher resolution

### ❌ "File too large"
→ Max size 10MB, compress image first

### ❌ "Empty text extracted"
→ Image may have handwritten text (OCR works best with printed text)

---

## Next Steps

1. ✅ Install Tesseract
2. ✅ Test with `python test_ocr.py`
3. ✅ Start backend: `cd backend && uvicorn app.main:app --reload`
4. ✅ Start frontend: `npm run dev`
5. ✅ Try uploading a travel document

---

## 📚 More Info

- [Full OCR Guide](./OCR_INTEGRATION_GUIDE.md)
- [Backend API Reference](./API_REFERENCE.md)
- [RAG Bot Documentation](./RAG_BOT_GUIDE.md)

