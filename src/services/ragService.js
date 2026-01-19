const API_URL = "http://localhost:8000";

export const chatWithRAG = async (question) => {
  try {
    const response = await fetch(`${API_URL}/ai/rag-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      answer: data.answer,
      context: data.context,
      source: data.source,
    };
  } catch (error) {
    console.error("RAG API error:", error);
    throw error;
  }
};

export const chatWithoutRAG = async (message) => {
  try {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("Chat API error:", error);
    throw error;
  }
};
/**
 * Extract text from image using OCR
 * @param {File} imageFile - Image file (JPG, PNG, BMP, TIFF)
 * @returns {Promise<Object>} OCR result with extracted text and confidence
 */
export const ocrExtractText = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_URL}/ai/ocr`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      text: data.text,
      confidence: data.confidence,
      confidenceLevel: data.confidence_level,
      characterCount: data.character_count,
      wordCount: data.word_count,
      error: data.error,
    };
  } catch (error) {
    console.error("OCR API error:", error);
    throw error;
  }
};

/**
 * Process OCR-extracted text through RAG pipeline
 * @param {string} ocrText - Text extracted from OCR
 * @returns {Promise<Object>} RAG response with answer and context
 */
export const ocrChatWithRAG = async (ocrText) => {
  try {
    const response = await fetch(`${API_URL}/ai/ocr-with-rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ocr_text: ocrText }),
    });

    if (!response.ok) {
      throw new Error(`OCR+RAG API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      answer: data.answer,
      context: data.context,
      source: data.source,
      error: data.error,
    };
  } catch (error) {
    console.error("OCR+RAG API error:", error);
    throw error;
  }
};

/**
 * Analyze travel document from image
 * Extracts text and identifies travel-related info (prices, dates, keywords)
 * @param {File} imageFile - Travel document image
 * @returns {Promise<Object>} Document analysis with extracted info
 */
export const analyzeTravelDocument = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_URL}/ai/analyze-travel-document`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Travel analysis API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      status: data.status,
      extractedText: data.extracted_text,
      confidence: data.confidence,
      travelAnalysis: {
        keywords: data.travel_analysis?.travel_keywords_found || [],
        prices: data.travel_analysis?.potential_prices || [],
        dates: data.travel_analysis?.potential_dates || [],
        isTravelDocument: data.travel_analysis?.is_travel_document || false,
      },
      error: data.error,
    };
  } catch (error) {
    console.error("Travel analysis API error:", error);
    throw error;
  }
};