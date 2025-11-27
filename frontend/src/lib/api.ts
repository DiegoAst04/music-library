import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // tu FastAPI local
  timeout: 15000,
});

// GET genérico
export async function apiGet<T = any>(
  url: string,
  params?: Record<string, any>
): Promise<T> {
  const res = await api.get<T>(url, { params });
  return res.data;
}

// POST genérico (crear)
export async function apiPost<T = any>(
  url: string,
  body?: any
): Promise<T> {
  const res = await api.post<T>(url, body);
  return res.data;
}

// PATCH genérico (actualizar)
export async function apiPatch<T = any>(
  url: string,
  body?: any
): Promise<T> {
  const res = await api.patch<T>(url, body);
  return res.data;
}

// DELETE genérico (eliminar)
export async function apiDelete<T = any>(
  url: string
): Promise<T> {
  const res = await api.delete<T>(url);
  return res.data;
}