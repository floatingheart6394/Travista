const API_URL = "http://localhost:8000";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export const fetchTodos = async () => {
  const res = await fetch(`${API_URL}/todos`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const createTodo = async (todo) => {
  const res = await fetch(`${API_URL}/todos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(todo),
  });
  return res.json();
};

export const updateTodo = async (id, updates) => {
  await fetch(`${API_URL}/todos/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
};

export const deleteTodo = async (id) => {
  await fetch(`${API_URL}/todos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};
