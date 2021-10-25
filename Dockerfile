#---- Base ----
FROM node:14.18.1-bullseye-slim AS base

LABEL org.opencontainers.image.authors="wiston666@gmail.com"

# Create app directory
WORKDIR /usr/src/app

RUN mkdir ./template

COPY cli/package.json cli/tsconfig.json cli/src/ cli/bin/ ./
COPY cli/src/ ./src/
COPY cli/bin/ ./bin/
COPY cli/template/package.json cli/template/tsconfig.json cli/template/next*.js ./template/
COPY cli/template/src/ ./template/src/
COPY tsconfig.json /usr/src/tsconfig.json

#---- Dependencies ----
FROM base AS dependencies

# install ALL node_modules, including 'devDependencies'
RUN npm install && \
  cd template && yarn install && \
  cd .. && npm run build

# RUN rm -rf node_modules/* && \
#   npm install --only=production && \
#   cd template && yarn install --production
#

#---- Production ----
FROM base AS release
# copy production node_modules
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=dependencies /usr/src/app/template/node_modules ./template/node_modules
COPY --from=dependencies /usr/src/app/dist ./dist
COPY --from=dependencies /usr/src/app/template/dist ./template/dist

RUN npm link --only=production

ENTRYPOINT ["terraform-visual"]
