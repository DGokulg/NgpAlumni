import axios from "axios";

const baseURL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "";
console.log("Using baseURL:", baseURL);

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});