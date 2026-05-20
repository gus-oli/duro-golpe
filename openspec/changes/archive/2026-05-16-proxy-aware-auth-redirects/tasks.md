## 1. Redirect Logic

- [x] 1.1 Update frontend middleware to construct protected-route redirects from the public forwarded origin when proxy headers are present
- [x] 1.2 Preserve valid fallback behavior for local environments where forwarded headers are absent

## 2. Verification

- [x] 2.1 Add or update validation coverage for proxy-aware auth redirects so localhost-origin regressions are detectable
- [x] 2.2 Update hosted deployment documentation to include auth redirect correctness in the verification checklist
