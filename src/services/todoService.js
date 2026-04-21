const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

export const fetchTodos = async () => {
  const res = await fetch(`${BASE_URL}/todos`, {
    headers: authHeaders(),
  });
  return res.json();
};

export const createTodo = async (todo) => {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(todo),
  });
  return res.json();
};

export const updateTodo = async (id, updates) => {
  await fetch(`${BASE_URL}/todos/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(updates),
  });
};

export const deleteTodo = async (id) => {
  await fetch(`${BASE_URL}/todos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
};
