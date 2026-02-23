resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = var.s3_bucket_domain
    origin_id   = "S3-nestlancer-${var.environment}"
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "Nestlancer ${var.environment} CDN"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-nestlancer-${var.environment}"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = { Name = "nestlancer-${var.environment}-cdn" }
}
