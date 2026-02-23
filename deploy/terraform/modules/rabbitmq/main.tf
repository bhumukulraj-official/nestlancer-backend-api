resource "aws_mq_broker" "main" {
  broker_name = "nestlancer-${var.environment}"
  engine_type = "RabbitMQ"
  engine_version = "3.13"
  host_instance_type = var.instance_type
  deployment_mode    = var.environment == "production" ? "CLUSTER_MULTI_AZ" : "SINGLE_INSTANCE"
  publicly_accessible = false
  subnet_ids = var.environment == "production" ? var.subnet_ids : [var.subnet_ids[0]]

  security_groups = [aws_security_group.rabbitmq.id]

  user {
    username = "nestlancer"
    password = random_password.rabbitmq.result
  }

  logs {
    general = true
  }

  tags = { Name = "nestlancer-${var.environment}-rabbitmq" }
}

resource "aws_security_group" "rabbitmq" {
  name_prefix = "nestlancer-${var.environment}-rabbitmq-"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 5671
    to_port     = 5671
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/8"]
  }
}

resource "random_password" "rabbitmq" {
  length  = 32
  special = false
}
