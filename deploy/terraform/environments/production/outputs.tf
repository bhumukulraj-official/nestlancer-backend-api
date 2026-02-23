output "vpc_id" { value = module.vpc.vpc_id }
output "eks_cluster_endpoint" { value = module.eks.cluster_endpoint }
output "rds_endpoint" { value = module.rds.endpoint }
output "redis_endpoint" { value = module.elasticache.endpoint }
output "s3_bucket_private" { value = module.s3.private_bucket_name }
output "s3_bucket_public" { value = module.s3.public_bucket_name }
output "cloudfront_domain" { value = module.cloudfront.domain_name }
