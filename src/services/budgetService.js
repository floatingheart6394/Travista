/**
 * Budget Service - Handles all budget and expense operations
 * Including receipt scanning with OCR and category detection
 */

const API_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Scan a receipt image and extract expense data
 * Uses OCR with intelligent category detection
 * Accuracy: 85-95% for amounts, 75-90% for categories
 */
export async function scanReceipt(imageFile) {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch(`${API_URL}/ai/scan-receipt`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        status: "error",
        error: error.detail || "Failed to scan receipt",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Receipt scan failed:", error);
    return {
      status: "error",
      error: error.message,
    };
  }
}

/**
 * Add a new expense to the database
 */
export async function addExpense(expenseData) {
  try {
    const response = await fetch(`${API_URL}/budget/expense`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      body: JSON.stringify(expenseData),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        status: "error",
        error: error.detail || "Failed to add expense",
      };
    }

    return {
      status: "success",
      data: await response.json(),
    };
  } catch (error) {
    console.error("Add expense failed:", error);
    return {
      status: "error",
      error: error.message,
    };
  }
}

/**
 * Fetch all expenses for a trip
 */
export async function fetchExpenses(tripId) {
  try {
    const response = await fetch(
      `${API_URL}/budget/expenses/?trip_id=${tripId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    if (!response.ok) {
      return {
        status: "error",
        data: [],
      };
    }

    return {
      status: "success",
      data: await response.json(),
    };
  } catch (error) {
    console.error("Fetch expenses failed:", error);
    return {
      status: "error",
      data: [],
    };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(expenseId) {
  try {
    const response = await fetch(`${API_URL}/budget/expense/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    });

    if (!response.ok) {
      return {
        status: "error",
        error: "Failed to delete expense",
      };
    }

    return {
      status: "success",
    };
  } catch (error) {
    console.error("Delete expense failed:", error);
    return {
      status: "error",
      error: error.message,
    };
  }
}

/**
 * Get confidence badge color based on confidence percentage
 */
export function getConfidenceBadgeColor(confidence) {
  if (confidence >= 85) return "green";
  if (confidence >= 70) return "yellow";
  if (confidence >= 55) return "orange";
  return "red";
}

/**
 * Get confidence badge text
 */
export function getConfidenceBadgeText(confidence) {
  if (confidence >= 85) return "High Confidence ✓";
  if (confidence >= 70) return "Good Confidence";
  if (confidence >= 55) return "Fair Confidence";
  return "Low Confidence";
}
