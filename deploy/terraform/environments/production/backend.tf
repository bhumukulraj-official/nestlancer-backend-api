terraform {
  backend "s3" {
    bucket         = "nestlancer-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "nestlancer-terraform-locks"
    encrypt        = true
  }
}
