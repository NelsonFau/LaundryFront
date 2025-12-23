import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL; // ej: https://xxxxx.ngrok-free.dev

export const http = axios.create({
  baseURL, // <- CLAVE: absoluto, no "/api"
  headers: { "Content-Type": "application/json" },
});
