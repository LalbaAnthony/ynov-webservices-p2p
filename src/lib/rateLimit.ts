const rateMap: Record<string, number[]> = {};

export function rateLimit(ip: string, limit = 10, windowMs = 5000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  if (!rateMap[ip]) rateMap[ip] = [];

  rateMap[ip] = rateMap[ip].filter(ts => ts > windowStart);
  if (rateMap[ip].length >= limit) return false;

  rateMap[ip].push(now);
  return true;
}
