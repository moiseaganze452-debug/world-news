import { RATE_LIMIT_POLICIES, type RateLimitPolicyName } from "@/lib/security/rate-limit-policies";
import { logSecurityEvent } from "@/lib/security/audit-log";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  message: string;
}

/**
 * Interface commune pour un store de rate limiting. Permet de brancher
 * une implémentation distribuée (Redis/Upstash) sans changer les appelants.
 */
interface RateLimitStore {
  /** Incrémente le compteur pour `key` et retourne le total courant + reset. */
  hit(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

/**
 * Implémentation en mémoire — fonctionne immédiatement sans dépendance
 * externe. LIMITATION IMPORTANTE (transparence, §102/§19) : ce store est
 * local au process Node.js. Si l'application tourne sur plusieurs
 * instances/pods derrière un load balancer, chaque instance a son propre
 * compteur : la limite réelle globale devient approximativement
 * (limite configurée × nombre d'instances). Pour un déploiement
 * multi-instance, remplacer `memoryStore` par `createUpstashStore(...)`
 * ci-dessous (nécessite @upstash/redis et @upstash/ratelimit, non
 * installés par défaut — voir SECURITY-ARCHITECTURE.md).
 */
class MemoryRateLimitStore implements RateLimitStore {
  private buckets = new Map<string, { count: number; resetAt: number }>();

  async hit(key: string, windowMs: number) {
    const now = Date.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      const bucket = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, bucket);
      this.gc(now);
      return bucket;
    }

    existing.count += 1;
    return existing;
  }

  /** Purge périodique pour éviter une fuite mémoire non bornée. */
  private lastGc = 0;
  private gc(now: number) {
    if (now - this.lastGc < 60_000) return;
    this.lastGc = now;
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

const memoryStore = new MemoryRateLimitStore();

/**
 * NON VÉRIFIÉ / NON CÂBLÉ PAR DÉFAUT : squelette d'implémentation Redis
 * pour un déploiement production multi-instance. Nécessite les paquets
 * @upstash/redis (ou ioredis) et les variables d'environnement
 * correspondantes. Ce fichier ne les installe pas automatiquement —
 * voir §30 du cahier des charges : ne jamais ajouter une dépendance
 * sans vérification explicite par l'équipe.
 *
 * Pour activer : installer @upstash/redis, définir UPSTASH_REDIS_REST_URL
 * et UPSTASH_REDIS_REST_TOKEN, puis décommenter et utiliser
 * `resolveStore()` ci-dessous.
 */
// class UpstashRateLimitStore implements RateLimitStore {
//   constructor(private redis: import("@upstash/redis").Redis) {}
//   async hit(key: string, windowMs: number) {
//     const now = Date.now();
//     const resetAt = now + windowMs;
//     const count = await this.redis.incr(key);
//     if (count === 1) await this.redis.pexpire(key, windowMs);
//     const ttl = await this.redis.pttl(key);
//     return { count, resetAt: now + (ttl > 0 ? ttl : windowMs) };
//   }
// }

function resolveStore(): RateLimitStore {
  // Point d'extension unique : brancher Upstash ici quand disponible.
  return memoryStore;
}

/**
 * Vérifie et enregistre une tentative pour une politique + identifiant donnés.
 * `identifier` doit être une clé stable côté appelant : adresse IP pour les
 * visiteurs anonymes, `userId` pour les actions authentifiées, ou une
 * combinaison (ex: `login:${ip}:${email}`) pour cibler un compte précis.
 */
export async function checkRateLimit(
  policyName: RateLimitPolicyName,
  identifier: string
): Promise<RateLimitResult> {
  const policy = RATE_LIMIT_POLICIES[policyName];
  const store = resolveStore();
  const key = `ratelimit:${policyName}:${identifier}`;

  const { count, resetAt } = await store.hit(key, policy.windowMs);
  const success = count <= policy.limit;

  if (!success) {
    // §36/§39 — journalisation des dépassements pour détection d'abus.
    await logSecurityEvent({
      type: "rate_limit_triggered",
      metadata: { policy: policyName, identifier: maskIdentifier(identifier), count },
    });
  }

  return {
    success,
    remaining: Math.max(0, policy.limit - count),
    resetAt,
    message: policy.message,
  };
}

/**
 * Ne jamais journaliser une adresse IP ou un email en clair dans des logs
 * qui pourraient être exposés largement — on garde un identifiant tronqué
 * suffisant pour la corrélation sans exposer la donnée complète.
 */
function maskIdentifier(identifier: string): string {
  if (identifier.length <= 8) return "***";
  return `${identifier.slice(0, 4)}***${identifier.slice(-2)}`;
}
