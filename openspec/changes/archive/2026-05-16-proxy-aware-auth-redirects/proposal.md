## Why

The hosted beta environment now runs the Next.js frontend behind Caddy, and protected-route redirects are incorrectly leaking `localhost:3000` into user-facing navigation. This blocks real users from reaching login and other protected flows through the public entrypoint, so the frontend needs to become proxy-aware before the hosted beta can be considered usable.

## What Changes

- Make protected-route redirects in the frontend honor the public request origin when the app is running behind a reverse proxy.
- Ensure middleware-generated redirects use forwarded host and protocol information instead of assuming the internal upstream origin.
- Verify that login and other auth-related redirect flows remain valid when the app is accessed through the Oracle-hosted beta reverse proxy.
- Document the redirect expectation in the hosted deployment context so proxy-aware behavior is treated as part of production correctness.

## Capabilities

### New Capabilities
- `proxy-aware-routing`: defines frontend redirect and request-origin behavior when the application is served behind a reverse proxy

### Modified Capabilities

## Impact

- Frontend middleware and auth-related redirect behavior
- Hosted beta validation expectations for navigation through the public origin
- Reverse-proxy correctness for login and protected route access
