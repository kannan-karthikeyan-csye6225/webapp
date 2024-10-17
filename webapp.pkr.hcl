packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "ubuntu" {
  access_key    = "AKIAVY2PGM26NEBQF5U6"
  secret_key    = "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"
  ami_name      = "ubuntu-app-working-build" 
  instance_type = "t2.small"
  region        = "us-west-2"
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/*ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    most_recent = true
    owners      = ["099720109477"]
  }
  ssh_username = "ubuntu"
}

variable "webapp_code_dir" {
  type    = string
  default = "./webapp/"  # Default value for local development, overridden by GitHub Actions
}

build {
  name = "user-creation-testing"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "shell" {
    script = "./systemsetup.sh"
  }

  provisioner "file" {
    source      = var.webapp_code_dir
    destination = "/opt/apps/webapp"
  }

  provisioner "file" {
    source      = "./myapp.service"
    destination = "/home/ubuntu/myapp.service"
  }

  provisioner "shell" {
    script = "./app.sh"
  }
}
