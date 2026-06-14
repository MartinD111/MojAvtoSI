# S3 Object Lock — WORM backups (#5)

Ransomware and a compromised/rogue admin both try the same thing: delete the
backups, then extort. **Object Lock in compliance mode** makes that impossible —
once written, an object cannot be deleted or overwritten until its retention
period expires, *not even by the AWS account root*.

This is for the **backup bucket**, separate from `S3_BUCKET` (system files) and
R2 (public images).

## Create the locked bucket (Object Lock must be enabled at creation)

```bash
aws s3api create-bucket \
  --bucket mojavto-backups \
  --region eu-central-1 \
  --create-bucket-configuration LocationConstraint=eu-central-1 \
  --object-lock-enabled-for-bucket

# Versioning is required for Object Lock and is auto-enabled, but set it explicitly:
aws s3api put-bucket-versioning \
  --bucket mojavto-backups \
  --versioning-configuration Status=Enabled

# Default retention: every uploaded object is locked for 30 days, COMPLIANCE mode.
aws s3api put-object-lock-configuration \
  --bucket mojavto-backups \
  --object-lock-configuration '{
    "ObjectLockEnabled": "Enabled",
    "Rule": { "DefaultRetention": { "Mode": "COMPLIANCE", "Days": 30 } }
  }'
```

- **COMPLIANCE** (not GOVERNANCE): no user, role, or root can shorten/remove the
  lock. GOVERNANCE can be bypassed with a special permission — don't use it for
  ransomware protection.
- **Block Public Access**: ON. **Default encryption**: SSE-S3 or SSE-KMS.
- Backups are write-only for the app role: grant `s3:PutObject` but **not**
  `s3:DeleteObject*` / `PutObjectRetention` (downgrade) to the backup IAM role.
- Add a lifecycle rule to expire *non-current* versions after the retention
  window so storage cost stays bounded while the lock period is honored.

## What writes here
Logical DB dumps (`pg_dump`) from a scheduled job and any periodic data exports.
Supabase Pro also keeps its own PITR backups — this is the independent,
immutable, off-platform copy.
