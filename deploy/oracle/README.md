# Oracle Hosted Beta Assets

These templates document the canonical hosted beta layout for the `oracle-neon-upstash-deploy` change.

## Expected Layout

The templates assume the application is deployed under:

```text
/srv/duro-golpe/
  current -> /srv/duro-golpe/releases/<release-id>
  releases/
    <release-id>/
      backend/
      frontend/
      node_modules/
      package.json
  shared/
    backend.env
    frontend.env
```

- `current` is a symlink to the active release directory.
- `backend.env` and `frontend.env` stay stable across releases.
- Systemd services should point to `/srv/duro-golpe/current`.

## Files

- `Caddyfile`: single-domain reverse proxy for frontend routes, `/api/v1/*`, and `/ws`
- `duro-golpe-backend.service`: backend runtime with shared environment file
- `duro-golpe-frontend.service`: frontend runtime with shared environment file

## Release and Rollback Flow

1. Upload or build a new release under `releases/<release-id>`.
2. Install dependencies and build inside that release directory.
3. Repoint `current` to the new release.
4. Restart `duro-golpe-backend` and `duro-golpe-frontend`.
5. If verification fails, repoint `current` to the previous release and restart both services.

This layout is intentionally simple because the hosted beta runs one frontend process and one backend process on a single Oracle VM.
