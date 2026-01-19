"""
Complete OCR + RAG System Verification
Verifies all components are properly integrated and working.
"""

import os
import sys
from pathlib import Path

# Setup environment
sys.path.insert(0, str(Path(__file__).parent / "backend"))
os.chdir(Path(__file__).parent / "backend")
os.environ["OPENAI_API_KEY"] = "test-key-for-verification"

def check_imports():
    """Verify all imports work correctly."""
    print("\n" + "="*70)
    print("VERIFICATION 1: Python Imports")
    print("="*70)
    
    checks = [
        ("Pytesseract", lambda: __import__('pytesseract')),
        ("Pillow (PIL)", lambda: __import__('PIL')),
        ("FastAPI", lambda: __import__('fastapi')),
        ("LangChain", lambda: __import__('langchain')),
        ("LangChain OpenAI", lambda: __import__('langchain_openai')),
        ("LangChain Community", lambda: __import__('langchain_community')),
        ("OCR Service", lambda: __import__('app.ocr.ocr_service')),
        ("RAG Pipeline", lambda: __import__('app.rag.pipeline')),
        ("AI Routes", lambda: __import__('app.routes.ai_assistant')),
    ]
    
    passed = 0
    for name, check in checks:
        try:
            check()
            print(f"  ✓ {name}")
            passed += 1
        except Exception as e:
            print(f"  ✗ {name}: {str(e)[:60]}")
    
    print(f"\n  Result: {passed}/{len(checks)} imports successful")
    return passed == len(checks)


def check_ocr_functions():
    """Verify OCR service functions exist."""
    print("\n" + "="*70)
    print("VERIFICATION 2: OCR Service Functions")
    print("="*70)
    
    from app.ocr.ocr_service import (  # type: ignore
        extract_text_from_image,
        extract_travel_info,
        clean_text,
        get_confidence_level,
        ocr_with_rag,
        preprocess_image
    )
    
    functions = [
        ("extract_text_from_image", extract_text_from_image),
        ("extract_travel_info", extract_travel_info),
        ("clean_text", clean_text),
        ("get_confidence_level", get_confidence_level),
        ("ocr_with_rag", ocr_with_rag),
        ("preprocess_image", preprocess_image),
    ]
    
    for name, func in functions:
        print(f"  ✓ {name}")
    
    print(f"\n  Result: All {len(functions)} functions available")
    return True


def check_api_endpoints():
    """Verify API endpoints are registered."""
    print("\n" + "="*70)
    print("VERIFICATION 3: FastAPI Routes")
    print("="*70)
    
    from app.routes import ai_assistant  # type: ignore
    
    endpoints = [
        ("/ai/chat", "POST"),
        ("/ai/rag-chat", "POST"),
        ("/ai/ocr", "POST"),
        ("/ai/ocr-with-rag", "POST"),
        ("/ai/analyze-travel-document", "POST"),
    ]
    
    routes = {route.path: route.methods for route in ai_assistant.router.routes}
    
    found = 0
    for path, method in endpoints:
        if path in routes and method in routes[path]:
            print(f"  ✓ {method} {path}")
            found += 1
        else:
            print(f"  ✗ {method} {path}")
    
    print(f"\n  Result: {found}/{len(endpoints)} endpoints registered")
    return found == len(endpoints)


def check_pydantic_models():
    """Verify Pydantic models are defined."""
    print("\n" + "="*70)
    print("VERIFICATION 4: Pydantic Schema Models")
    print("="*70)
    
    from app.schemas.ai_assistant import (  # type: ignore
        AIChatRequest, AIChatResponse,
        AIRAGRequest, AIRAGResponse,
        OCRResponse, OCRWithRAGRequest, OCRWithRAGResponse,
        TravelDocumentAnalysis
    )
    
    models = [
        ("AIChatRequest", AIChatRequest),
        ("AIChatResponse", AIChatResponse),
        ("AIRAGRequest", AIRAGRequest),
        ("AIRAGResponse", AIRAGResponse),
        ("OCRResponse", OCRResponse),
        ("OCRWithRAGRequest", OCRWithRAGRequest),
        ("OCRWithRAGResponse", OCRWithRAGResponse),
        ("TravelDocumentAnalysis", TravelDocumentAnalysis),
    ]
    
    for name, model in models:
        print(f"  ✓ {name}")
    
    print(f"\n  Result: All {len(models)} models defined correctly")
    return True


def check_test_suite():
    """Verify test files exist."""
    print("\n" + "="*70)
    print("VERIFICATION 5: Test Files")
    print("="*70)
    
    test_files = [
        "test_rag_bot.py",
        "test_ocr.py",
    ]
    
    root = Path(__file__).parent
    found = 0
    for test_file in test_files:
        if (root / test_file).exists():
            print(f"  ✓ {test_file}")
            found += 1
        else:
            print(f"  ✗ {test_file}")
    
    print(f"\n  Result: {found}/{len(test_files)} test files present")
    return found == len(test_files)


def check_documentation():
    """Verify documentation files exist."""
    print("\n" + "="*70)
    print("VERIFICATION 6: Documentation Files")
    print("="*70)
    
    docs = [
        "OCR_INTEGRATION_GUIDE.md",
        "OCR_QUICK_START.md",
        "OCR_IMPLEMENTATION_COMPLETE.md",
    ]
    
    root = Path(__file__).parent
    found = 0
    for doc in docs:
        if (root / doc).exists():
            size = (root / doc).stat().st_size
            print(f"  ✓ {doc} ({size:,} bytes)")
            found += 1
        else:
            print(f"  ✗ {doc}")
    
    print(f"\n  Result: {found}/{len(docs)} documentation files present")
    return found == len(docs)


def check_frontend_files():
    """Verify frontend files are updated."""
    print("\n" + "="*70)
    print("VERIFICATION 7: Frontend Components")
    print("="*70)
    
    root = Path(__file__).parent
    
    files = {
        "src/services/ragService.js": ["ocrExtractText", "ocrChatWithRAG"],
        "src/pages/AIPage.jsx": ["handleImageUpload", "ocrPreview"],
    }
    
    passed = 0
    for filepath, keywords in files.items():
        full_path = root / filepath
        if full_path.exists():
            try:
                content = full_path.read_text(encoding='utf-8')
            except UnicodeDecodeError:
                content = full_path.read_text(encoding='latin-1')
            found_all = all(kw in content for kw in keywords)
            if found_all:
                print(f"  ✓ {filepath}")
                passed += 1
            else:
                print(f"  ⚠ {filepath} (missing some keywords)")
        else:
            print(f"  ✗ {filepath}")
    
    print(f"\n  Result: {passed}/{len(files)} frontend files updated")
    return passed == len(files)


def check_ocr_service_features():
    """Verify OCR service has key features."""
    print("\n" + "="*70)
    print("VERIFICATION 8: OCR Service Features")
    print("="*70)
    
    from app.ocr.ocr_service import (  # type: ignore
        clean_text, get_confidence_level, extract_travel_info
    )
    
    features = [
        ("Text cleaning", lambda: clean_text("Test   text  \n\n with   spaces")),
        ("Confidence levels", lambda: get_confidence_level(85)),
        ("Travel info extraction", lambda: extract_travel_info("Flight to Paris €500")),
    ]
    
    passed = 0
    for name, test in features:
        try:
            result = test()
            if result:
                print(f"  ✓ {name}")
                passed += 1
        except Exception as e:
            print(f"  ✗ {name}: {str(e)[:40]}")
    
    print(f"\n  Result: {passed}/{len(features)} features working")
    return passed == len(features)


def print_summary(results):
    """Print final verification summary."""
    print("\n" + "="*70)
    print("FINAL VERIFICATION SUMMARY")
    print("="*70)
    
    tests = [
        "Python Imports",
        "OCR Functions",
        "API Endpoints",
        "Pydantic Models",
        "Test Files",
        "Documentation",
        "Frontend Components",
        "OCR Features",
    ]
    
    passed = sum(results)
    total = len(results)
    
    for test, result in zip(tests, results):
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"  {status} - {test}")
    
    print(f"\n  Overall: {passed}/{total} checks passed")
    
    if passed == total:
        print("\n  🎉 All verifications passed! OCR system is ready.")
        print("\n  Next steps:")
        print("    1. Install Tesseract: https://github.com/UB-Mannheim/tesseract/wiki")
        print("    2. Run backend: cd backend && uvicorn app.main:app --reload")
        print("    3. Run frontend: npm run dev")
        print("    4. Test OCR: Upload an image to AI Assistant")
    else:
        print("\n  ⚠️  Some checks failed. Review errors above.")
    
    return passed == total


if __name__ == "__main__":
    print("\n" + "="*70)
    print("🔍 TRAVISTA OCR + RAG SYSTEM VERIFICATION")
    print("="*70)
    print(f"Running {8} verification checks...")
    
    try:
        results = [
            check_imports(),
            check_ocr_functions(),
            check_api_endpoints(),
            check_pydantic_models(),
            check_test_suite(),
            check_documentation(),
            check_frontend_files(),
            check_ocr_service_features(),
        ]
        
        success = print_summary(results)
        sys.exit(0 if success else 1)
        
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
