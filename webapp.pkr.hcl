packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "app_name" {
  type    = string
  default = "webapp" 
}

source "amazon-ebs" "ubuntu" {
  // profile       = "dev"
  ami_name        = "csye6225-${var.app_name}-${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}" 
  instance_type = "t2.small"
  // region        = "us-west-2"
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
  default = "./"  // Changed to root directory
}

build {
  name = "user-creation-testing"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "shell" {
    script = "${var.webapp_code_dir}/systemsetup.sh"
  }

  provisioner "file" {
    source      = "${var.webapp_code_dir}"
    destination = "/opt/apps/webapp"
  }

  provisioner "file" {
    source      = "${var.webapp_code_dir}/myapp.service"
    destination = "/home/ubuntu/myapp.service"
  }

  provisioner "shell" {
    script = "${var.webapp_code_dir}/app.sh"
  }
}
