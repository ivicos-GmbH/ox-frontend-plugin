# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-09-24

One image now serves every OX deployment. Each deployment configures it from its own middleware,
with no rebuild.

### Added

- `apiBaseUrl` setting: the ivCAMPUS backend address used for profile updates. Set it per
  deployment in `/opt/open-xchange/etc/settings/ivcampus.properties`:
  `app.ivicos-campus/ivCampus//apiBaseUrl=<backend URL>`

### Changed

- The backend address was hard-coded in `utils/constants.js` and could not be overridden. It is
  now read from the `apiBaseUrl` setting at call time.
- The compiled default for `apiBaseUrl` points at the canonical beta identity provider
  (`…/beta/idp/default`) instead of the `ox-iframe-login` branch deployment.
- ivCAMPUS now reads `?tenant=<id>` on `baseUrl` to pick the OX deployment's Keycloak, e.g.
  `…/ox/auth?tenant=hsk`. Without it, the demo deployment is assumed. The plugin passes `baseUrl`
  through unchanged.

### Removed

- `oidcIssuer`, `oidcClientId` and `oidcRedirectUri` settings. Nothing read them: the OIDC login
  runs in ivCAMPUS, not in the plugin.

### Fixed

- The email address in the profile-update request is now URL-encoded, so addresses containing `+`
  work.

## [1.0.0] - 2026-06-03

### Added

- ivCAMPUS plugin (`src/com.example/ivCampus`) — embeds the ivCAMPUS web app in an OX App Suite iframe
- Fetches today's calendar appointments, mail, and tasks from OX APIs and sends to iframe via `postMessage`
- Real-time data sync: listens for create/update/delete events and re-sends updated data to iframe
- Handles `ox-open-item` and `ox-add-item` postMessages from iframe to open/create OX items natively
- Support for creating appointments, tasks, and mail from iframe actions
- Auto-refresh (polling) for periodic data updates
- User settings pane (`baseUrl`, `department`, `notifications`, `autoRefresh`)
- Profile update trigger via settings UI
- Contact image fetching and user data forwarding on iframe load
- GitHub Actions CI workflow: lint, build, and artifact verification on PRs
- GitHub Actions release workflow: Docker image push to IONOS registry, Helm chart packaging, GitHub Release creation
- Self-contained Helm chart (no external registry dependency)

### Changed

- Migrated from GitLab CI to GitHub Actions
- Helm chart removed `ox-common` library dependency; replaced with local `_helpers.tpl`
- Dockerfile uses `pnpm install --frozen-lockfile` for reproducible builds
- Docker image based on distroless nginx


[1.1.0]: https://github.com/ivicos-GmbH/ox-frontend-plugin/releases/tag/v1.1.0
[1.0.0]: https://github.com/ivicos-GmbH/ox-frontend-plugin/releases/tag/v1.0.0
