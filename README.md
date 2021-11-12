# Terraform Visual

[![CI](https://github.com/Wiston999/terraform-visual/actions/workflows/push.yml/badge.svg)](https://github.com/Wiston999/terraform-visual/actions/workflows/push.yml)

Terraform Visual is a simple but powerful tool to help you understand your Terraform plan easily.

![Demo.gif](https://github.com/Wiston999/terraform-visual/blob/master/docs/demo.gif?raw=true)

# How to use it

### Using [Terraform Visual](https://hieven.github.io/terraform-visual/)
Please note that this method uses the Terraform Visual version from original author. User interface may be different from
other methods.
I'll try to publish my own Github Pages in the future, but in the meanwhile the only way to use an online version is
using original author Github Page.

For people who want to quickly experience how Terraform Visual looks like

1. Generate Terraform plan in JSON format

```shell
$ terraform plan -out=plan.out                # Run plan and output as a file
$ terraform show -json plan.out > plan.json   # Read plan file and output it in JSON format
```

2. Visit [Terraform Visual](https://hieven.github.io/terraform-visual/)

3. Upload Terraform JSON to the platform

### Using [Docker image as CLI](https://github.com/Wiston999/terraform-visual/pkgs/container/terraform-visual)
For people who don't like to upload Terraform plan to public internet. You can use Docker image as a CLI command.

1. Pull docker image
```sh
# Using Yarn
$ docker pull ghcr.io/wiston999/terraform-visual:master

```

2. Convert Terraform Plan into JSON File
```sh
$ terraform plan -out=plan.out                # Run plan and output as a file
$ terraform show -json plan.out > plan.json   # Read plan file and output it in JSON format
```

3. Create Terraform Visual Report
```sh
$ docker run --rm -it \
  -v $(pwd)/plan.json:/tmp/plan.json -v $(pwd):/tmp \
  ghcr.io/wiston999/terraform-visual:master \
  terraform-visual --plan /tmp/plan.json --out /tmp
```

4. Browse The Report
```sh
$ open terraform-visual-report/index.html
```

### Using [Docker](https://github.com/Wiston999/terraform-visual/pkgs/container/terraform-visual)

For people who likes Terraform Visual and want to integrate it into existing CI/CD pipeline.

The Docker image only includes Terraform visual CLI.

You can "install" Terraform Visual CLI into your existing CI/CD Docker image following these steps:

1. Convert your Dockerfile to builder pattern. More info [here](https://docs.docker.com/develop/develop-images/multistage-build/)

2. Once your Dockerfile uses builder pattern, add
```
FROM ghcr.io/wiston999/terraform-visual:master as tfvisual
```
before the original `FROM`

3. Add the following steps to your Dockerfile
```
COPY --from=tfvisual /usr/local/bin/node /usr/local/bin/node
COPY --from=tfvisual /usr/local/lib/node_modules/@terraform-visual /usr/local/lib/node_modules/@terraform-visual
COPY --from=tfvisual /usr/src/app /usr/src/app
RUN printf "===> Installing terraform-visual...\n" && \
  ln -sf /usr/src/app/bin/index.js /usr/local/bin/terraform-visual
```

