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
      Environment = "staging"
      Project     = "nestlancer"
      ManagedBy   = "terraform"
    }
  }
}

module "vpc" {
  source = "../../modules/vpc"

  environment     = "staging"
  vpc_cidr        = var.vpc_cidr
  azs             = var.availability_zones
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets
}

module "rds" {
  source = "../../modules/rds"

  environment        = "staging"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  instance_class     = "db.t3.medium"
  allocated_storage  = 50
  db_name            = "nestlancer_staging"
  multi_az           = false
  read_replica_count = 0
}

module "elasticache" {
  source = "../../modules/elasticache"

  environment = "staging"
  vpc_id      = module.vpc.vpc_id
  subnet_ids  = module.vpc.private_subnet_ids
  node_type   = "cache.t3.small"
  num_cache_clusters = 1
}

module "s3" {
  source = "../../modules/s3"

  environment = "staging"
}

module "eks" {
  source = "../../modules/eks"

  environment        = "staging"
  vpc_id             = module.vpc.vpc_id
  subnet_ids         = module.vpc.private_subnet_ids
  cluster_version    = "1.29"
  node_instance_type = "t3.medium"
  min_nodes          = 2
  max_nodes          = 4
}

module "secrets_manager" {
  source = "../../modules/secrets-manager"

  environment = "staging"
}
