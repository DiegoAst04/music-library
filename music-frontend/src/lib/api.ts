import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // tu FastAPI local
  timeout: 15000,
});

// helpers simples
export async function apiGet<T = any>(url: string, params?: any): Promise<T> {
  const res = await api.get<T>(url, { params });
  return res.data;
}
export async function apiPost<T = any>(url: string, data?: any): Promise<T> {
  const res = await api.post<T>(url, data);
  return res.data;
}
export async function apiPatch<T = any>(url: string, data?: any): Promise<T> {
  const res = await api.patch<T>(url, data);
  return res.data;
}
export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await api.delete<T>(url);
  return res.data;
}
