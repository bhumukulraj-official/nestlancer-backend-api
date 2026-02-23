output "private_bucket_name" { value = aws_s3_bucket.private.id }
output "public_bucket_name" { value = aws_s3_bucket.public.id }
output "public_bucket_domain" { value = aws_s3_bucket.public.bucket_regional_domain_name }
