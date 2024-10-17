packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

variable "webapp_code_dir" {
  type    = string
  default = "./"
}

variable "app_name" {
  type    = string
  default = "webapp"
}

variable "region" {
  type    = string
  default = "us-west-2"
}

variable "DB_USER" {
  type    = string
  default = "default"
}

variable "DB_PASSWORD" {
  type    = string
  default = "default"
}

variable "DB_NAME" {
  type    = string
  default = "default"
}

source "amazon-ebs" "ubuntu" {
  // profile       = "dev"
  ami_name      = "csye6225-${var.app_name}-${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  instance_type = "t2.small"
  region        = var.region
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


build {
  name = "user-creation-testing"
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "shell" {
    script = "${var.webapp_code_dir}/systemsetup.sh"
    environment_vars = [
      "DB_USER=${var.DB_USER}",
      "DB_PASSWORD=${var.DB_PASSWORD}",
      "DB_NAME=${var.DB_NAME}"
    ]
  }

  provisioner "shell" {
    inline = [
      "sudo mkdir -p /opt/apps/webapp",
      "sudo chown ubuntu:ubuntu /opt/apps/webapp"
    ]
  }

  provisioner "file" {
    source      = "${var.webapp_code_dir}"
    destination = "/opt/apps/webapp"
  }

  provisioner "file" {
    source      = "${var.webapp_code_dir}/myapp.service"
    destination = "/tmp/myapp.service"
  }

  provisioner "shell" {
    inline = [
      "sudo chown -R csye6225:csye6225 /opt/apps/webapp",
      "sudo mv /tmp/myapp.service /etc/systemd/system/myapp.service",
      "sudo chown root:root /etc/systemd/system/myapp.service",
      "sudo chmod 644 /etc/systemd/system/myapp.service",
      "cd /opt/apps/webapp",
      "sudo -u csye6225 npm install",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable myapp.service",
      "sudo systemctl start myapp.service",
      "sudo systemctl status myapp.service"
    ]
  }
}
