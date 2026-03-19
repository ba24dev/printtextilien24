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

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = null;
    return redisClient;
  }

  redisClient = Redis.fromEnv();
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
    throw new Error("UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set");
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
