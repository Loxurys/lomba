import type { Product, Recipe, Stock, Transaction } from "./app-data";

export type AppState = {
  stocks: Stock[];
  products: Product[];
  recipes: Recipe[];
  transactions: Transaction[];
  demoData: boolean;
};

type RemoteState = { state: AppState; updatedAt: string };

const endpoint = (code: string) => `/api/state/${encodeURIComponent(code)}`;

async function readError(response: Response) {
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message || "Koneksi ke penyimpanan online gagal.";
}

export async function getRemoteState(code: string): Promise<RemoteState | null> {
  const response = await fetch(endpoint(code));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<RemoteState>;
}

export async function saveRemoteState(code: string, state: AppState) {
  const response = await fetch(endpoint(code), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<{ updatedAt: string }>;
}

export async function checkoutRemote(
  code: string,
  items: Array<{ productId: string; quantity: number }>,
  method: string,
) {
  const response = await fetch(`${endpoint(code)}/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, method }),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json() as Promise<
    RemoteState & { sale: AppState["transactions"][number] }
  >;
}

export const normalizeAccessCode = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);

export const makeAccessCode = () =>
  Array.from(crypto.getRandomValues(new Uint32Array(2)))
    .map((value) => value.toString(36).toUpperCase())
    .join("")
    .slice(0, 8);
