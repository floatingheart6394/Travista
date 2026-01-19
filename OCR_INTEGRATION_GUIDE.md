# 📸 OCR Integration Guide - Travista RAG Bot

## Overview

The OCR (Optical Character Recognition) module enables Travista to extract text from travel documents like:
- **Flight bookings & itineraries**
- **Hotel reservations**
- **Travel insurance documents**
- **Maps & destination guides**
- **Receipts & expense documents**

The extracted text is then processed through the RAG pipeline for intelligent travel assistance.

---

## ✅ Features

### 1. **Accurate Text Extraction**
- Supports: JPG, PNG, BMP, TIFF formats
- **Preprocessing**: Automatic grayscale conversion, contrast enhancement, upscaling
- **Confidence Scoring**: 0-100% accuracy measurement
- **Quality Levels**: Very Low, Low, Moderate, High, Very High

### 2. **Travel Document Analysis**
- Extracts travel keywords (flight, hotel, price, date)
- Detects potential prices ($100, €50, £75)
- Identifies travel dates (Jan 20-25, 2026)
- Classifies documents as travel-related

### 3. **RAG Integration**
- Combines OCR + RAG for context-aware responses
- Answers questions about extracted travel information
- Provides travel tips based on document content

### 4. **Advanced Image Processing**
- Automatic contrast enhancement
- Image upscaling for small documents (< 300px width)
- Artifact removal and text cleanup
- Per-word confidence tracking

---

## 🔧 Installation

### Backend Requirements

```bash
cd backend
pip install pytesseract pillow python-multipart
```

### System Requirement: Tesseract-OCR

**Windows:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install (default location: `C:\Program Files\Tesseract-OCR`)
3. Pytesseract will auto-detect the installation

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### Verify Installation

```bash
# Test that pytesseract can find Tesseract
python -c "import pytesseract; from PIL import Image; pytesseract.pytesseract.pytesseract_cmd = r'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'; print('✓ Tesseract OK')"
```

---

## 🚀 Backend API Endpoints

### 1. **POST /ai/ocr** - Extract Text from Image

**Request:**
```javascript
const formData = new FormData();
formData.append('file', imageFile); // File object from input

const response = await fetch('http://localhost:8000/ai/ocr', {
  method: 'POST',
  body: formData
});
```

**Response (200 OK):**
```json
{
  "status": "success",
  "text": "Flight Booking Confirmation AA1234 New York to Paris Jan 20 2026",
  "raw_text": "...",
  "confidence": 85.5,
  "confidence_level": "high",
  "character_count": 145,
  "word_count": 12,
  "error": null
}
```

**Error Response:**
```json
{
  "status": "error",
  "text": "",
  "confidence": 0,
  "confidence_level": "very low",
  "error": "Tesseract OCR engine not installed..."
}
```

---

### 2. **POST /ai/ocr-with-rag** - OCR + RAG Processing

Combines OCR text extraction with RAG for intelligent responses.

**Request:**
```javascript
const response = await fetch('http://localhost:8000/ai/ocr-with-rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ocr_text: "Budget flight to Paris €150 recommendations?"
  })
});
```

**Response:**
```json
{
  "status": "success",
  "question": "Budget flight to Paris €150 recommendations?",
  "answer": "Based on travel guides, budget airlines to Paris include...",
  "context": "Popular Destinations: Paris is one of Europe's top destinations...",
  "source": "OCR+RAG"
}
```

---

### 3. **POST /ai/analyze-travel-document** - Travel Document Analysis

Analyzes documents and extracts travel-specific information.

**Request:**
```javascript
const formData = new FormData();
formData.append('file', hotelReceiptImage);

const response = await fetch('http://localhost:8000/ai/analyze-travel-document', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "status": "success",
  "extracted_text": "Hotel Ritz Paris 15 Place Vendôme €200/night...",
  "confidence": 78.3,
  "travel_analysis": {
    "travel_keywords_found": ["hotel", "address", "price"],
    "potential_prices": ["€200"],
    "potential_dates": ["Jan 20", "Jan 27"],
    "is_travel_document": true
  }
}
```

---

## 💻 Frontend Service Layer

### Usage in React Components

```javascript
import { 
  ocrExtractText, 
  ocrChatWithRAG, 
  analyzeTravelDocument 
} from '../services/ragService';

// 1. Extract text from image
const ocrResult = await ocrExtractText(imageFile);
console.log(`Extracted ${ocrResult.wordCount} words (${ocrResult.confidence.toFixed(1)}% confident)`);

// 2. Process through RAG
const ragResult = await ocrChatWithRAG(ocrResult.text);
console.log('AI Response:', ragResult.answer);

// 3. Analyze travel document
const analysis = await analyzeTravelDocument(passportImage);
console.log('Travel keywords:', analysis.travelAnalysis.keywords);
```

### Complete Example in AIPage.jsx

```jsx
import { ocrExtractText, ocrChatWithRAG } from '../services/ragService';

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  
  // Extract text
  const ocrResult = await ocrExtractText(file);
  
  if (ocrResult.status === 'success') {
    // Show preview
    console.log(`Confidence: ${ocrResult.confidenceLevel}`);
    
    // Process through RAG
    const ragResult = await ocrChatWithRAG(ocrResult.text);
    
    // Display AI response
    addMessage({
      role: 'ai',
      text: ragResult.answer,
      source: 'OCR+RAG'
    });
  }
};
```

---

## 📊 Confidence Scoring

The OCR engine returns confidence scores (0-100%) for extracted text:

| Score | Level | Reliability | Action |
|-------|-------|------------|--------|
| 90-100% | Very High | Excellent | Trust extraction fully |
| 75-89% | High | Good | Use with confidence |
| 60-74% | Moderate | Fair | Review extraction |
| 40-59% | Low | Poor | Manual verification needed |
| 0-39% | Very Low | Very Poor | Re-scan image |

**Improving Confidence:**
- Use high-resolution images (300+ DPI)
- Ensure good lighting on documents
- Scan straight, not at angles
- Remove glare and shadows
- Use black text on white background

---

## 🎯 Use Cases

### 1. **Flight Booking Analysis**
```
User uploads: flight_booking.pdf screenshot
OCR extracts: "AA1234 New York to Paris Jan 20 2026"
RAG responds: "Based on travel guides, here's info about Paris..."
```

### 2. **Hotel Price Comparison**
```
User uploads: multiple hotel screenshots
OCR extracts prices: ["$150/night", "€120/night", "$180/night"]
RAG responds: "Budget-friendly option is the €120/night hotel..."
```

### 3. **Travel Expense Tracking**
```
User uploads: expense receipts
OCR extracts: prices, dates, merchants
RAG computes: total spending, budget analysis
```

### 4. **Destination Guide Consultation**
```
User uploads: destination guide image
OCR extracts: attractions, opening hours, prices
RAG responds: personalized recommendations
```

---

## 🧪 Testing

### Run OCR Tests

```bash
# Unit tests for OCR functions
python test_ocr.py

# Expected output:
# ✓ TEST 1: Basic OCR Text Extraction
# ✓ TEST 2: Travel Document Analysis
# ✓ TEST 3: Text Cleaning & Normalization
# ✓ TEST 4: Confidence Level Descriptions
```

### Manual Testing with Backend

```bash
# Terminal 1: Start backend
cd backend
uvicorn app.main:app --reload

# Terminal 2: Test OCR endpoint
curl -X POST http://localhost:8000/ai/ocr \
  -F "file=@travel_document.jpg"
```

### Test with Frontend

1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `npm run dev`
3. Open: `http://localhost:5173/ai`
4. Click 📤 upload button
5. Select travel document image
6. See OCR preview + AI response

---

## ⚠️ Troubleshooting

### Error: "Tesseract OCR engine not installed"

**Solution:**
1. Download from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to default location
3. Restart Python/backend
4. Verify: `tesseract --version` in terminal

### Low Confidence Scores (< 60%)

**Solutions:**
- Use high-contrast images
- Ensure text is horizontal
- Avoid blurry/skewed images
- Try PNG format instead of JPG
- Increase image resolution

### "File size exceeds 10MB limit"

**Solution:** Compress image before uploading
```bash
# Using ImageMagick
convert large.jpg -quality 85 -resize 80% compressed.jpg
```

### Empty Text Extracted

**Possible causes:**
- Image contains handwritten text (OCR works best with printed text)
- Text color is too light/background too dark
- Image is at an angle
- Text is in unsupported language

---

## 🔐 Security Considerations

1. **File Size Limit**: 10MB maximum per image
2. **Supported Formats**: JPG, PNG, BMP, TIFF only
3. **API Rate Limiting**: Implement per-user limits in production
4. **Data Privacy**: OCR results are not logged or stored
5. **Virus Scanning**: Consider implementing file scanning for production

---

## 📈 Performance Notes

- **Processing Time**: 1-3 seconds per image (depends on size)
- **Memory Usage**: ~200MB per image during processing
- **Accuracy**: 85-95% for printed documents in English
- **Scaling**: FAISS vector store handles embeddings efficiently

---

## 🚀 Future Enhancements

- [ ] Multi-language OCR support (Spanish, French, German, etc.)
- [ ] Handwriting recognition
- [ ] Receipt itemization extraction
- [ ] Form field auto-fill
- [ ] Document type classification
- [ ] Batch processing for multiple images
- [ ] Document comparison (price matching across hotels)

---

## 📚 API Reference

See [OCR_API_REFERENCE.md](./OCR_API_REFERENCE.md) for detailed endpoint documentation.

---

## 💡 Tips for Best Results

1. **Document Preparation**
   - Ensure good lighting
   - Scan at 300 DPI minimum
   - Keep text straight (0°-15° angle maximum)
   - Avoid shadows and glare

2. **Image Format**
   - PNG: Better for sharp text
   - JPG: Smaller file size (use quality 85+)
   - TIFF: Professional document format

3. **Post-Processing**
   - Review extracted text
   - Correct any obvious errors
   - Use RAG to get context-aware corrections

4. **Error Handling**
   - Provide user feedback on confidence score
   - Suggest re-scanning if confidence < 70%
   - Show extracted text for user review

---

## 📞 Support

For issues with:
- **Tesseract installation**: Visit https://github.com/UB-Mannheim/tesseract/wiki
- **OCR accuracy**: Check image quality, try preprocessing
- **API errors**: Check backend logs with `--log-level debug`
- **Integration questions**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

