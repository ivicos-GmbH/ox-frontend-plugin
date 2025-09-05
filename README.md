# App Suite: Frontend Plugin Example

This repository contains general [documentation](docs) for customizing and a set of examples how to write plugins.

## Configuration

### vite.config

Please adjust proxy key `'^(?!\\/(com\\.example|@vite|@fs)).*$'` when you prefix your plugin with some other namespace than `com.example` to allow local development connected to a remote server (default: <https://preview-main.k3s.os.oxui.de>).

### .env, .env.default

Please see variables defined in `.env.default` and overwrite values within a `.env` (to be created).

### HTTPS

In order to have working self signed certificates, please copy from old core `./ssl`  to `./ssl` in this project or use mkcert to create new ones. Alternatively you could overwrite environment variables HOST_KEY and HOST_CRT with a path to your `host.key` and `host.crt`.

## Getting started

Run `pnpm i` to install dependencies and then `pnpm dev` to start the dev server. Run `pnpm build` to see a production build in the dist-folder.

### Importing modules

For dynamic loading local and external modules have to be distinguished by using a prefix. Modules that are available externally (usually provided by App Suite frontend core) need to have a `$` prefix (example: `$/io.ox/core/extensions`) locally available modules start with a `@` (example: `@/com.example/my-extension/extensions`).

## Examples

### iframe app

- A minimal app that that creates a iframe and loads a url
- [Sources](src/com.example/my-iframe-app)

### Simple app

- A minimal app that that creates single window with "hello world!" as main content
- [Sources](src/com.example/my-simple-app)

### App

- A little bit more complex app with settings and styles
- [Sources](src/com.example/my-app)

### Extension

- A simple plugin that adds a action to the help dropdown via extensions
- [Sources](src/com.example/my-extension)

### Notification

- A simple plugin that adds a custom notification handler
- [Sources](src/com.example/my-notification)

### Portal widget

- Adds a widget to the portal
- [Sources](src/com.example/my-portal-widget)

### Custom translations for io.ox/core dictionary

- Override translations of `io.ox/core` dictionary with custom values. In this case, we change the name of the Portal app.
- [Sources](src/com.example/custom-i18n)

## Build, publish and deploy

### .gitlab-ci

- We use our ci-building-blocks project for all jobs
- For this we need to specify some variables in your gitlab projects settings
- Please take a look at the [README](https://gitlab.open-xchange.com/sre/ci-building-blocks) for details
- OX_PROJECT: here "frontend"
- OX_COMPONENT: here "frontend-plugin-example"
- OX_REGISTRY_TOKEN: here "harbor@frontend+frontend"
- OX_REGISTRY_USER: here "<secret-token>"
- Harbor registry
  - [frontend/frontend-plugin-example](https://registry.cloud.oxoe.io/harbor/projects/47/repositories/frontend-plugin-example)
  - [frontend/charts/frontend-plugin-example](https://registry.cloud.oxoe.io/harbor/projects/47/repositories/charts%2Ffrontend-plugin-example)
- Live deployment at <https://frontend-plugin-example-main.dev.oxui.de/appsuite/>

### Manual

```sh
cd helm
helm install/upgrade -f frontend-plugin-example/values.yaml -f values/manual.yaml plugin-example ./frontend-plugin-example
```
