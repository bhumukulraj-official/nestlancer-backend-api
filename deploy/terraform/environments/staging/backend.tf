terraform {
  backend "s3" {
    bucket         = "nestlancer-terraform-state"
    key            = "staging/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "nestlancer-terraform-locks"
    encrypt        = true
  }
}
