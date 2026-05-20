# Local Tunnel Private Beta Assets

These templates document the canonical private-beta layout for the `local-tunnel-beta-deploy` change.

## Expected Runtime

The templates assume:

```text
Internet
  -> Cloudflare Tunnel public hostname
  -> local Caddy on 127.0.0.1:8080
     -> frontend on 127.0.0.1:3000
     -> backend on 127.0.0.1:3001

Managed services
  -> Neon PostgreSQL
  -> Upstash Redis
```

- The public hostname should resolve to Cloudflare Tunnel, not directly to the machine.
- The browser should only see one public origin for pages, APIs, auth redirects, and WebSockets.
- Frontend and backend remain local processes on the operator machine.

## Files

- `Caddyfile`: same-origin local reverse proxy for frontend routes, `/api/v1/*`, and `/ws`
- `cloudflared-config.yml.example`: example named-tunnel config routing the public hostname to local Caddy on `127.0.0.1:8080`

## Recommended Operator Flow

1. Configure frontend and backend `.env` files for Neon, Upstash, and the public tunnel URL.
2. Start frontend on `127.0.0.1:3000`.
3. Start backend on `127.0.0.1:3001`.
4. Start Caddy with the provided `Caddyfile` and `TUNNEL_DOMAIN`.
5. Start Cloudflare Tunnel and point it at `http://127.0.0.1:8080`.
6. Run migrations and `npm run seed:demo`.
7. Verify the public hostname before inviting beta users.
