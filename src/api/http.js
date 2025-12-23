import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

console.log("API BASE URL =>", baseURL);

export const http = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
