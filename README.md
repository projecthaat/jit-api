# HAAT JIT API Engine

Stateless Go service that compiles requested HAAT components into runtime CSS and JavaScript bundles.

## Run locally

```text
go run .
```

The service listens on `http://localhost:8080`.

Readiness is available at `GET /healthz` and returns the number of loaded components.

## Compile API

`POST /v1/compile` with `Content-Type: application/json`.

```json
{
  "$schema": "https://jit.api.projecthaat.org/schema.json",
  "client_token": "ht_live_secure_token_example",
  "session_id": "sess_production_9981",
  "requested_components": [
    {
      "tag": "slider",
      "id": "main-hero-carousel",
      "attributes": {
        "autoplay": "true",
        "interval": "4000",
        "seo-text": "Product highlights and customer stories"
      }
    }
  ]
}
```

The `seo-text` attribute is reserved for SEO optimization. It must be meaningful, non-empty text and must accurately match the visible content of the component. Do not use it for styling, tracking, or unrelated component configuration. Component-specific attributes remain available alongside it.

The complete request schema is available at [`schema.json`](schema.json). Registered component assets are listed in [`components.json`](components.json). The registry includes `slider`, `modal`, `tabs`, `toast`, and `accessibility`.

### Attributes

Platform-wide names are defined in [`reserved_attributes.json`](reserved_attributes.json). `seo-text` is reserved for SEO and must match the visible component content. Component-specific rules can be added in [`custom_attributes.json`](custom_attributes.json), including type, allowed values, and minimum values. Attributes not yet listed remain available for advanced integrations, but components must still treat all values as untrusted input.

The `tabs` component accepts `active` (integer, minimum 0), `orientation` (`horizontal` or `vertical`), and `loop` (boolean). The `toast` component accepts `open` (boolean), `duration` (integer, minimum 0), `variant` (`info`, `success`, `warning`, or `error`), and `dismissible` (boolean).

The `accessibility` component is used as `<haat-accessibility>`. It accepts `contrast`, `large-text`, `reduced-motion`, and `focus-visible` (all boolean), plus `storage` (boolean) to persist those settings in browser local storage.

The API caches registered assets in memory at startup, so request handling avoids disk I/O and is designed for millisecond-scale responses. Actual latency depends on payload size, network distance, and deployment resources; measure p95/p99 latency in the target environment before making an SLA claim.

## Production

The official endpoint is:

```text
https://jit.api.projecthaat.org/v1/compile
```

## Contributing

New components belong in `templates/{component-name}/` and must be registered in `components.json`. Please include tests or a reproducible validation step for behavior changes.

Do not add code that downloads, executes, obfuscates, persists, or self-propagates arbitrary content. Component CSS and JavaScript are reviewed as untrusted supply-chain input, and CI security checks must pass before release.

Every pull request must include a documentation-ready note in the PR description under `Documentation-ready`. This note must explain user-visible behavior, API/schema changes, migration notes, or explicitly state `No documentation change`. Changes intended for a new tag must also include release notes in the PR description.

Use the issue templates for bug reports and feature requests. See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) for the repository contribution rules.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).