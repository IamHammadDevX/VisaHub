import axios from "axios";

const BASE_URL = "https://migrate.vughy.com/visaclapapi_yam/api";

const API_KEY = process.env.VUGHY_API_KEY || "";

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Origin: "localhost",
    "x-DomainKey": API_KEY,
  },
  timeout: 15000,
});

/** POST with form-urlencoded body (API requires formdata, not JSON) */
export async function postForm<T = unknown>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const formBody = new URLSearchParams(params).toString();
  const { data } = await client.post<T>(endpoint, formBody, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export default client;
