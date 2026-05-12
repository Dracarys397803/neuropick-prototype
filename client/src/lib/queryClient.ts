import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * 全局 react-query 客户端。
 *
 * 现状:本项目走 mock 数据打分(见 lib/scoring + data/products),还没调后端 API。
 * `apiRequest` / `getQueryFn` 临时保留,作为将来接真实后端推荐接口时的脚手架,
 * 其中 `queryClient` 本身由 App.tsx 的 QueryClientProvider 使用。
 *
 * TODO(api): 一旦 /api/recommend 上线,把 apiRequest / getQueryFn 接入 useQuery,
 * 并把 Home/Result 里的同步 mock 打分改成 useQuery 加载。
 */
const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(`${API_BASE}${url}`, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(`${API_BASE}${queryKey.join("/")}`);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
