import axios from "axios";

const isServer = typeof window === "undefined";

export const api = axios.create({
  baseURL: isServer
    ? process.env.INTERNAL_API_URL
    : "/api/proxy",
});
