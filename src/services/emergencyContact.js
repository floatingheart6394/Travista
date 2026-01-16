const API_BASE = import.meta.env.VITE_API_BASE_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchEmergencyContacts() {
  const res = await fetch(`${API_BASE}/emergency-contacts/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to fetch emergency contacts");
  }

  return res.json();
}

export async function addEmergencyContact(data) {
  const res = await fetch(`${API_BASE}/emergency-contacts/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.detail || "Failed to add contact");
  }

  return result;
}

export async function deleteEmergencyContact(id) {
  const res = await fetch(`${API_BASE}/emergency-contacts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete contact");
  }
}
