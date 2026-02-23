output "app_secret_arn" { value = aws_secretsmanager_secret.app_secrets.arn }
output "db_secret_arn" { value = aws_secretsmanager_secret.db_credentials.arn }
output "jwt_secret_arn" { value = aws_secretsmanager_secret.jwt_secrets.arn }
output "payment_secret_arn" { value = aws_secretsmanager_secret.payment_secrets.arn }
