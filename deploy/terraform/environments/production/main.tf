terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "production"
      Project     = "nestlancer"
      ManagedBy   = "terraform"
    }
  }
}

module "vpc" {
  source = "../../modules/vpc"

  environment     = "production"
  vpc_cidr        = var.vpc_cidr
  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
}

module "rds" {
  source = "../../modules/rds"

  environment        = "production"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  instance_class     = "db.r6g.large"
  allocated_storage  = 200
  db_name            = "nestlancer"
  multi_az           = true
  read_replica_count = 1
}

module "elasticache" {
  source = "../../modules/elasticache"

  environment = "production"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  node_type   = "cache.r6g.large"
  num_cache_clusters = 2
}

module "s3" {
  source = "../../modules/s3"
  environment = "production"
}

module "cloudfront" {
  source = "../../modules/cloudfront"
  environment = "production"
  s3_bucket_domain = module.s3.public_bucket_domain
}

module "ses" {
  source = "../../modules/ses"
  environment = "production"
  domain      = "nestlancer.com"
}

module "eks" {
  source = "../../modules/eks"

  environment        = "production"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  cluster_version    = "1.29"
  node_instance_type = "t3.large"
  min_nodes          = 3
  max_nodes          = 10
}

module "rabbitmq" {
  source = "../../modules/rabbitmq"

  environment   = "production"
  vpc_id        = module.vpc.vpc_id
  subnet_ids    = module.vpc.private_subnet_ids
  instance_type = "mq.m5.large"
}

module "secrets_manager" {
  source = "../../modules/secrets-manager"
  environment = "production"
}
