FROM registry.gitlab.open-xchange.com/appsuite/web-foundation/tools/appsuite-codeceptjs:0.6.2

WORKDIR /e2e

COPY . /e2e

RUN pnpm i -s -P && rm -rf /root/.local/share/pnpm && npx --yes clean-modules -n --yes
