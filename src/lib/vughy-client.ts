import axios from "axios";

const BASE_URL = "https://migrate.vughy.com/visaclapapi_yam/api";

function getApiKey(): string {
  return process.env.VUGHY_API_KEY || "";
}

function createClient() {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Origin: "localhost",
      "x-DomainKey": getApiKey(),
    },
    timeout: 20000,
  });
}

/** POST with form-urlencoded body (API requires formdata, not JSON) */
export async function postForm<T = unknown>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const client = createClient();
  const formBody = new URLSearchParams(params).toString();
  const { data } = await client.post<T>(endpoint, formBody, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export default createClient();
