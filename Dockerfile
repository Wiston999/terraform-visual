#---- Base ----
FROM node:14.18.1-bullseye-slim AS base

LABEL org.opencontainers.image.authors="wiston666@gmail.com"

# Create app directory
WORKDIR /usr/src/app

COPY cli/ ./
COPY tsconfig.json /usr/src/tsconfig.json

# Cleanup stuff from development environment
RUN find . -name node_modules -type d | xargs rm -rf && \
  find . -name package-lock.json -delete

#---- Dependencies ----
FROM base AS dependencies

RUN npm install --only=production && \
  cp -R node_modules prod_node_modules

# install ALL node_modules, including 'devDependencies'
RUN npm install && \
  cd template && yarn install --prod && \
  cd .. && npm run build

#---- Production ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /usr/src/app/prod_node_modules ./node_modules

RUN npm link --only=production

ENTRYPOINT ["terraform-visual"]
