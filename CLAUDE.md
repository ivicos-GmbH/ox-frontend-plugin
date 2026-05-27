# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
pnpm i            # Install dependencies
pnpm dev          # Start dev server (default port 3000, proxies to remote OX backend)
pnpm build        # Production build → dist/
pnpm lint         # ESLint check
pnpm serve        # Preview production build
```

No automated tests exist (`pnpm test` is a no-op).

## Environment Setup

Copy `.env.defaults` to `.env` and override as needed. Key variables:

- `SERVER` — remote OX App Suite backend to proxy against (default: `https://core-ui-main.dev.oxui.de/`)
- `PORT` — dev server port (default: 3000)
- `HOST_KEY` / `HOST_CRT` — paths to TLS certificates (default: `ssl/host.key` / `ssl/host.crt`)

The `ssl/` directory contains self-signed certs for HTTPS. Generate new ones with `mkcert` if needed.

## Architecture

This is an **OX App Suite frontend plugin** built with Vite. It runs as a sidecar to the OX App Suite frontend — it does not serve its own UI independently. The dev server proxies all unknown requests to the remote OX backend so the plugin loads inside a live App Suite session.

### Module Import Convention

Two prefix schemes are used throughout the codebase:

- `$/` — external modules provided by OX App Suite core at runtime (e.g. `$/io.ox/core/extensions`, `$/jquery`, `$/underscore`). These are **not bundled** — they are resolved by `vitePluginOxExternals` at dev time and expected to be present in the host environment at runtime.
- `@/` — local plugin modules (e.g. `@/com.example/ivCampus/main`). These are bundled into the output.

### Plugin Structure

Each plugin lives under `src/com.example/<plugin-name>/` and requires:

- `manifest.json` — declares the plugin's namespace and capability requirements
- `register.js` — entry point; registers the app/extension with OX core (`ui.createApp`, `ext.point`, etc.)
- `main.js` (optional) — lazy-loaded app logic

### ivCampus Plugin (`src/com.example/ivCampus/`)

The primary plugin in this repo. It embeds an external web app (`ivCAMPUS`) inside an OX App Suite iframe app.

**Data flow:**

1. On iframe load, `main.js` fetches today's calendar appointments, mail, and tasks in parallel from the OX APIs.
2. Data is sent to the iframe via `postMessage` with type `ox-apps-data`.
3. `watchForDataChanges` registers event listeners (`create`, `update`, `delete`, `change`) on each API. On any change it refetches the affected data type and sends the full updated dataset back via `postMessage`.
4. The iframe can send `ox-open-item` or `ox-add-item` messages back to open/create OX items (appointments, tasks, mail) natively in App Suite.

**Key files:**

| File | Purpose |
|---|---|
| `main.js` | App lifecycle, iframe creation, wires all the pieces together |
| `register.js` | Registers the app with OX core and the launcher |
| `settings.js` | Plugin settings namespace (`app.ivicos-campus/ivCampus`) |
| `utils/api-fetchers.js` | Fetches today's appointments/mail/tasks from OX APIs |
| `utils/watchers.js` | Listens for API change events and re-sends data to iframe |
| `utils/postmessage.js` | `sendDataToIframe` / `sendOxDataToIframe` helpers |
| `utils/navigation.js` | Handles `ox-open-item`/`ox-add-item` postMessages, opens OX detail views |
| `utils/data-transformers.js` | Normalizes OX API response models to plain objects |
| `utils/date-helpers.js` | `getTodayRange`, `overlapsToday` |
| `utils/constants.js` | `DEFAULT_FETCH_OPTIONS` for mail/tasks/contacts |

**Settings** (stored under OX settings key `app.ivicos-campus/ivCampus`):
- `baseUrl` — URL of the ivCAMPUS web app loaded in the iframe
- `department`, `notifications`, `autoRefresh` — surfaced in the settings pane
- `profileUpdateTrigger` — incremented to signal a profile sync from the settings UI

### Vite Plugins Used

- `vitePluginOxManifests` — serves `manifest.json` files as entry points
- `vitePluginOxExternals` — intercepts `$/…` imports and resolves them to the running OX instance
- `vitePluginOxCss` — injects CSS imports into JS
- `rollup-plugin-po2json` — compiles `.po` locale files from `src/i18n/` into `example.pot`

### Proxy Configuration

The dev server proxies `/ajax`, `/api`, `/help`, `/meta`, and `/socket.io/appsuite` to the `SERVER` backend. When changing the plugin namespace from `com.example` to something else, update the proxy key regex in `vite.config.js` accordingly (see README).
