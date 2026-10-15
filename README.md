# ivCAMPUS plugin for OX App Suite

An OX App Suite frontend plugin that adds **ivCAMPUS** as an app in App Suite. The plugin loads the
ivCAMPUS web app in an iframe and keeps it supplied with the user's App Suite data.

The plugin is a thin integration layer. The ivCAMPUS web app, its API and its identity provider run
separately and are not part of this repository.

## What the plugin does

- Registers the app `app.ivicos-campus/ivCampus` ("ivCAMPUS") and puts it first in the App Suite
  launcher.
- Loads the ivCAMPUS web app (the `baseUrl` setting) in an iframe.
- When the iframe has loaded, it fetches today's appointments, mail and tasks from the App Suite
  APIs and sends them to the iframe with `postMessage` (type `ox-apps-data`).
- Listens for create, update and delete events on those APIs, and polls every `autoRefresh` seconds.
  Changed data is sent to the iframe again.
- Handles `ox-open-item` and `ox-add-item` messages from the iframe. These open an appointment, task
  or mail natively in App Suite, or start creating a new one.
- Adds a settings pane (department, notifications, auto-refresh interval, profile update).

Messages are only sent to, and only accepted from, the origin of `baseUrl`.

The source lives in [`src/com.example/ivCampus`](src/com.example/ivCampus).

## Deploying to an App Suite installation

### 1. Build the image

```sh
docker build -t <your-registry>/ivcampus-ox-plugin:1.1.0 .
```

The image serves the built plugin with nginx on port 8080. Tagged releases (`v*.*.*`) are also
built by GitHub Actions and pushed to ivicos' own registry, which is private. To run the plugin in
your own infrastructure, build the image yourself. The Helm chart is attached to each
[GitHub release](https://github.com/ivicos-GmbH/ox-frontend-plugin/releases).

### 2. Deploy it

The Helm chart is in [`helm/frontend-plugin-example`](helm/frontend-plugin-example). Point it at
your image:

```sh
helm upgrade --install ivcampus-plugin ./helm/frontend-plugin-example \
  --set defaultRegistry=<your-registry> \
  --set image.repository=ivcampus-ox-plugin \
  --set image.tag=1.1.0 \
  --set imagePullSecrets=null
```

Then register the service as a frontend plugin with your App Suite UI middleware, the same way as
any other App Suite frontend plugin.

### 3. Enable the capability

The plugin only loads for users who have the `ivcampus` capability (see
[`manifest.json`](src/com.example/ivCampus/manifest.json)). Enable it in the middleware, for
example:

```properties
com.openexchange.capability.ivcampus=true
```

### 4. Configure the settings

The plugin reads its settings from the namespace `app.ivicos-campus/ivCampus`. Set the deployment
values in the middleware, for example in `/opt/open-xchange/etc/settings/ivcampus.properties`:

```properties
app.ivicos-campus/ivCampus//baseUrl=https://<campus-origin>/ox/auth?tenant=<tenant-id>
app.ivicos-campus/ivCampus//apiBaseUrl=https://<api-origin>/v1/idp
```

| Setting | Description | Compiled default |
|---|---|---|
| `baseUrl` | URL of the ivCAMPUS web app loaded in the iframe. `?tenant=<id>` selects the Keycloak of the App Suite deployment. | ivicos staging |
| `apiBaseUrl` | ivCAMPUS backend used for profile updates | ivicos beta |
| `autoRefresh` | Polling interval in seconds | `30` |
| `department` | Shown in the settings pane | `IT` |
| `notifications` | Shown in the settings pane | `true` |

The compiled defaults point at ivicos test environments. Set `baseUrl` and `apiBaseUrl` explicitly
in every production deployment. ivicos provides the values (origins and tenant ID) for each
deployment.

The same image works for every deployment, so there is no need to rebuild it per installation.

## Development

Requirements: Node.js and pnpm.

```sh
pnpm i        # install dependencies
pnpm dev      # dev server on https://localhost:3000, proxies to a remote App Suite
pnpm build    # production build into dist/
pnpm lint     # ESLint
```

Copy `.env.defaults` to `.env` and adjust it. The most important variable is `SERVER`, the App Suite
installation the dev server proxies to.

For HTTPS, the dev server expects a certificate in `ssl/host.key` and `ssl/host.crt`. Create one with
[mkcert](https://github.com/FiloSottile/mkcert) or point `HOST_KEY` and `HOST_CRT` elsewhere.

### Module imports

- `$/…` are modules provided by App Suite at runtime, for example `$/io.ox/core/extensions`. They
  are not bundled.
- `@/…` are modules from this repository, for example `@/com.example/ivCampus/main`. They are
  bundled.

If you move the plugin out of the `com.example` namespace, update the proxy key
`'^(?!\\/(com\\.example|@vite|@fs)).*$'` in [`vite.config.js`](vite.config.js).

## Origin and other examples

This repository is based on Open-Xchange's App Suite frontend plugin example. The original example
plugins are still in [`src/com.example`](src/com.example) (`my-app`, `my-iframe-app`,
`my-extension`, `my-notification`, `my-portal-widget`, `my-simple-app`, `custom-i18n`). They are
not part of ivCAMPUS.

## Changes and license

See [CHANGELOG.md](CHANGELOG.md) for the release history.

Licensed under AGPL-3.0-or-later (see [`license-header`](license-header) and `package.json`).
