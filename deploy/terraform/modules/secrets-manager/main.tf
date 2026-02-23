resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "nestlancer/${var.environment}/app"
  description = "Nestlancer ${var.environment} application secrets"

  tags = { Name = "nestlancer-${var.environment}-app-secrets" }
}

resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "nestlancer/${var.environment}/database"
  description = "Nestlancer ${var.environment} database credentials"

  tags = { Name = "nestlancer-${var.environment}-db-credentials" }
}

resource "aws_secretsmanager_secret" "jwt_secrets" {
  name        = "nestlancer/${var.environment}/jwt"
  description = "Nestlancer ${var.environment} JWT signing secrets"

  tags = { Name = "nestlancer-${var.environment}-jwt-secrets" }
}

resource "aws_secretsmanager_secret" "payment_secrets" {
  name        = "nestlancer/${var.environment}/razorpay"
  description = "Nestlancer ${var.environment} Razorpay secrets"

  tags = { Name = "nestlancer-${var.environment}-payment-secrets" }
}
