# Pre-Deployment Checklist

## Before Deployment

- [ ] All CI checks pass (lint, test, build)
- [ ] Database migrations reviewed and tested on staging
- [ ] Environment variables updated in Infisical for target environment
- [ ] Feature flags configured for gradual rollout (if applicable)
- [ ] Rollback plan documented
- [ ] Monitoring dashboards open (Grafana)
- [ ] On-call engineer notified
- [ ] Changelog updated
- [ ] API version compatibility verified (no breaking changes in v1)
- [ ] Load testing completed for performance-sensitive changes

## During Deployment

- [ ] Watch rolling update progress in Kubernetes dashboard
- [ ] Monitor error rates in Grafana
- [ ] Check service health endpoints after deployment
- [ ] Verify database migrations applied successfully
- [ ] Check RabbitMQ consumer connections restored

## After Deployment

- [ ] Smoke tests pass (health, auth, critical endpoints)
- [ ] Error rates normal (< baseline + 1%)
- [ ] Response latency normal (p99 < 2s)
- [ ] Queue depths stable
- [ ] No alerts triggered
- [ ] Notify team of successful deployment

## Rollback Triggers

Roll back immediately if:

- Error rate > 5% for 5 minutes
- Health check failures
- Payment processing errors
- Auth service unreachable

```bash
# Rollback command
scripts/deploy/rollback.sh --service=<name>
# or rollback all
scripts/deploy/rollback.sh --all
```
