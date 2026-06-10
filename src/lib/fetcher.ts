import api from "./api";

/**
 * SWR-compatible fetcher.
 * Usage: useSWR('/events', fetcher)
 *
 * For endpoints requiring query params, build the URL yourself:
 *   useSWR(`/events?page=1&limit=10`, fetcher)
 */
export const fetcher = async (url: string | null) => {
  if (!url) return null;
  return api.get(url);
};
