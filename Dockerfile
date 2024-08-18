# Set SPT Version
ARG SPT_VERSION=3.9.5

# Base image with common dependencies
FROM node:20.11.1-alpine AS base
RUN apk update && \
    apk --no-cache --update add libgcc libstdc++ libc6-compat supervisor && \
    rm -rf /var/cache/apk/*

FROM alpine as git
RUN apk add git git-lfs

# Fetch server components and build
FROM git AS fetch
ARG SPT_VERSION
ARG GIT_CLONE_PROTECTION_ACTIVE=false
WORKDIR /repo
RUN git clone https://dev.sp-tarkov.com/SPT/Server.git . && \
    git checkout tags/$SPT_VERSION && \
    git lfs fetch  && \
    git lfs pull

FROM node:20.11.1-alpine AS sptbuilder
RUN apk add git git-lfs
WORKDIR /app
COPY --from=fetch /repo .
WORKDIR /app/project
RUN yarn
RUN yarn run build:release

# Build the Nextjs App
FROM base AS builder
ARG SPT_VERSION
ENV NEXT_PUBLIC_SPT_VERSION=${SPT_VERSION}
WORKDIR /app/web
COPY web/package*.json ./
RUN npm install
COPY web/ .
RUN npm run build

# Final image combining everything
FROM base
WORKDIR /app

ENV NODE_ENV production

# Copy the built Next.js app
COPY --from=builder /app/web/public /app/web/public
COPY --from=builder /app/web/.next/standalone /app/web/
COPY --from=builder /app/web/.next/static /app/web/.next/static
COPY web/binaries /app/web/node_modules/node-7z-archive/binaries

# Copy the build SPT Server
COPY --from=sptbuilder /app/project/build /app
RUN cp -R /app/SPT_Data/Server /app/SPT_Data/Server.backup
RUN mkdir -p /app/BepInEx/plugins
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
VOLUME /app/user
VOLUME /app/SPT_Data/Server

# Copy Supervisord config
COPY supervisord.conf .

# Chown app
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Expose ports (adjust if necessary)
EXPOSE 3000

# Entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]