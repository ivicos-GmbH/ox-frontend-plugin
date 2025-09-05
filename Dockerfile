FROM registry.gitlab.com/openxchange/appsuite/web-foundation/base-images/node_builder:latest AS builder

WORKDIR /app
COPY . /app
RUN pnpm i -s

ARG APP_VERSION
ARG BUILD_TIMESTAMP
ARG CI_COMMIT_SHA

RUN pnpm build

RUN echo "add_header version \"$CI_COMMIT_SHA\";" >> headers.conf
RUN echo "types {\n application/javascript mjs; \n}" >> mjs-mimetypes.conf

FROM registry.gitlab.com/openxchange/appsuite/web-foundation/base-images/distroless/nginx:latest
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/headers.conf /app/mjs-mimetypes.conf /etc/nginx/conf.d/
