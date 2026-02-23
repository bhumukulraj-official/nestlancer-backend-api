resource "aws_elasticache_subnet_group" "main" {
  name       = "nestlancer-${var.environment}"
  subnet_ids = var.subnet_ids
}

resource "aws_security_group" "redis" {
  name_prefix = "nestlancer-${var.environment}-redis-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}

resource "aws_elasticache_replication_group" "cache" {
  replication_group_id = "nestlancer-${var.environment}-cache"
  description          = "Nestlancer ${var.environment} Redis cache"
  node_type            = var.node_type
  num_cache_clusters   = var.num_cache_clusters
  engine_version       = "7.1"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  automatic_failover_enabled = var.num_cache_clusters > 1

  parameter_group_name = aws_elasticache_parameter_group.main.name
}

resource "aws_elasticache_parameter_group" "main" {
  family = "redis7"
  name   = "nestlancer-${var.environment}-params"

  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }
}
