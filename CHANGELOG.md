# Changelog

This project adheres to [Semantic Versioning](http://semver.org/).

## Development
- nothing yet

## v2.2.0

[diff](https://github.com/PruvoNet/cronicle-client/compare/v2.1.0...v2.2.0)

### Added

- `RequestError` and `StatusCodeError` are exported from the package root, so callers can check them with `instanceof`.

### Fixed

- A response body that is not JSON no longer throws a `SyntaxError`. A non-2xx response still rejects with a `StatusCodeError`, and `error` holds the raw text (for example, a proxy's HTML error page). A 2xx response resolves with the raw text. This matches `request-promise` in v2.0.0.
- A network failure (connection refused, DNS failure, reset) rejects with a `RequestError` instead of fetch's bare `TypeError: fetch failed`. Its `message` names the socket error (for example `connect ECONNREFUSED 127.0.0.1:3012`), as in v2.0.0. It also carries `cause`, `error` and the system `code`.

## v2.1.0

[diff](https://github.com/PruvoNet/cronicle-client/compare/v2.0.0...v2.1.0)

### Changed

- HTTP calls use Node's built-in `fetch` instead of `request-promise` (deprecated, with 11 known advisories in its dependency tree). The package now has no runtime dependencies, and `request-promise` is no longer a peer dependency.
- A non-2xx response still rejects with a `StatusCodeError` (`statusCode`, `error`), as before.

## v2.0.0

[diff](https://github.com/PruvoNet/cronicle-client/compare/v1.1.0...v2.0.0)

### Breaking

- Requires Node 18 or later. No code change from 1.1.0.

### Changed

- Published from GitHub Actions through npm trusted publishing (OIDC), with provenance.

## v1.0.1

[diff](https://github.com/PruvoNet/cronicle-client/compare/v1.0.0...v1.0.1)

### Fixed

- removed option to set api version as new version will require a new class with different types anyways...

## v1.0.0

[diff](https://github.com/PruvoNet/cronicle-client/compare/v0.2.0...v1.0.0)

### Removed

- removed option to set api version as new version will require a new class with different types anyways...

## v0.2.0

[diff](https://github.com/PruvoNet/cronicle-client/compare/v0.1.0...v0.2.0)

### Added

- allow unique id enforcement on event creation
- Error handling docs

### Fixed

- Changed some interfaces names to more suitable ones
- Changed error class name to a more suitable one

## v0.1.0

[diff](https://github.com/PruvoNet/cronicle-client/compare/v0.0.3...v0.1.0)

### Fixed

- Reduced `request-promise` min version
- Finished documentation
- Finished unit tests

### Added

- More strict typings for the timing object
- Helper methods to easily reference plugin names

## v0.0.3

[diff](https://github.com/PruvoNet/cronicle-client/compare/v0.0.2...v0.0.3)

### Fixed

- Move timing utils to separate module so we can easily extend its features in the future

## v0.0.2

[diff](https://github.com/PruvoNet/scronicle-client/compare/v0.0.1...v0.0.2)

### Fixed

- Removed redundant source map files from published package
- Re export all typings in `index.d.ts` to prevent users from needing to import typings from internal files

## v0.0.1

First version!
