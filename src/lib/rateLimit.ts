const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Prune stale entries every 5 minutes to prevent unbounded memory growth
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetAt) rateLimitMap.delete(key);
    }
}, 5 * 60 * 1000);

export function rateLimit(ip: string, maxReqs = 5, windowMs = 60_000): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }
    if (entry.count >= maxReqs) return false;
    entry.count++;
    return true;
}
