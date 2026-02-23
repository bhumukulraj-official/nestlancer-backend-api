output "endpoint" { value = aws_db_instance.primary.endpoint }
output "replica_endpoints" { value = aws_db_instance.read_replica[*].endpoint }
output "port" { value = aws_db_instance.primary.port }
