import { Redis } from "@upstash/redis";

export type CustomerSessionRecord = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  updatedAt: number;
};

const KEY_PREFIX = "shopify:customer:session:";
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30;
let redisClient: Redis | null | undefined;

function sessionKey(sessionId: string): string {
  return `${KEY_PREFIX}${sessionId}`;
}

function getRedisClient(): Redis | null {
  if (redisClient !== undefined) {
    return redisClient;
  }

  // Support both legacy Upstash env names and Vercel KV names.
  const restUrl =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_URL ||
    process.env.KV_URL;
  const restToken =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.KV_REST_API_READ_ONLY_TOKEN;

  if (!restUrl || !restToken) {
    redisClient = null;
    return redisClient;
  }

  redisClient = new Redis({ url: restUrl, token: restToken });
  return redisClient;
}

export function customerSessionTtlSeconds(expiresIn?: number): number {
  if (!expiresIn || Number.isNaN(expiresIn)) return DEFAULT_TTL_SECONDS;
  return Math.max(60, Math.min(DEFAULT_TTL_SECONDS, Math.floor(expiresIn)));
}

export async function readCustomerSessionRecord(
  sessionId: string,
): Promise<CustomerSessionRecord | null> {
  const redis = getRedisClient();
  if (!redis) return null;

  const key = sessionKey(sessionId);
  const value = await redis.get<CustomerSessionRecord>(key);
  if (!value) return null;
  if (typeof value.accessToken !== "string" || !value.accessToken) {
    return null;
  }
  return value;
}

export async function writeCustomerSessionRecord(
  sessionId: string,
  record: Omit<CustomerSessionRecord, "updatedAt">,
  ttlSeconds: number,
): Promise<void> {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error(
      "Redis session store unavailable. Set UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN or KV_REST_API_URL + KV_REST_API_TOKEN (or REDIS_URL).",
    );
  }

  const key = sessionKey(sessionId);
  await redis.set(
    key,
    {
      ...record,
      updatedAt: Date.now(),
    } satisfies CustomerSessionRecord,
    {
      ex: ttlSeconds,
    },
  );
}

export async function deleteCustomerSessionRecord(sessionId: string): Promise<void> {
  const redis = getRedisClient();
  if (!redis) return;
  await redis.del(sessionKey(sessionId));
}
