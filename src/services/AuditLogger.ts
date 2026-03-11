import { dbPool } from "../db/pool";
import { TenantContext } from "../middleware/TenantMiddleware";

export type AuditActorType = "user" | "system" | "bot";

export interface AuditEntry {
  tenant: TenantContext;
  actorUserId?: string;
  actorType: AuditActorType;
  action: string;
  targetType: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogger {
  async log(entry: AuditEntry): Promise<void> {
    const { tenant, actorUserId, actorType, action, targetType, targetId, metadata } = entry;

    await dbPool.query(
      `
      INSERT INTO audit_logs (
        tenant_id,
        actor_user_id,
        actor_type,
        action,
        target_type,
        target_id,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        tenant.id,
        actorUserId ?? null,
        actorType,
        action,
        targetType,
        targetId ?? null,
        metadata ? JSON.stringify(metadata) : null,
      ]
    );
  }
}

