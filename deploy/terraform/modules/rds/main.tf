resource "aws_db_subnet_group" "main" {
  name       = "nestlancer-${var.environment}"
  subnet_ids = var.subnet_ids
  tags       = { Name = "nestlancer-${var.environment}-db-subnet" }
}

resource "aws_security_group" "rds" {
  name_prefix = "nestlancer-${var.environment}-rds-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "primary" {
  identifier           = "nestlancer-${var.environment}"
  engine               = "postgres"
  engine_version       = "16.2"
  instance_class       = var.instance_class
  allocated_storage    = var.allocated_storage
  max_allocated_storage = var.allocated_storage * 2
  db_name              = var.db_name
  username             = "nestlancer_admin"
  manage_master_user_password = true

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  multi_az               = var.multi_az

  backup_retention_period = 7
  storage_encrypted       = true
  deletion_protection     = var.environment == "production"

  performance_insights_enabled = true
  monitoring_interval          = 60

  tags = { Name = "nestlancer-${var.environment}-primary" }
}

resource "aws_db_instance" "read_replica" {
  count               = var.read_replica_count
  identifier          = "nestlancer-${var.environment}-replica-${count.index + 1}"
  replicate_source_db = aws_db_instance.primary.identifier
  instance_class      = var.instance_class

  vpc_security_group_ids = [aws_security_group.rds.id]

  tags = { Name = "nestlancer-${var.environment}-replica-${count.index + 1}" }
}
