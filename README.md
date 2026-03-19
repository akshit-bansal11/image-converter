# open-tools

<p align="center">
  Open-source browser tools for image, text, and design workflows.
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6" />
  <img alt="Local-first" src="https://img.shields.io/badge/Platform-Local--first-22c55e" />
</p>

## Hero

`open-tools` turns the project into a small multi-tool platform instead of a single utility.
Each tool gets its own route under `app/(tools)/`, while shared UI, config, and conversion logic stay in `src/`.

Current tools:

- `Image Converter`
- `JSON Formatter`
- `Base64`

## Introduction

The platform is built for small, focused tasks that should feel fast in the browser and easy to extend in the codebase.
The homepage is driven by a central tool registry, so new tools can be added without scattering route metadata across the app.

The original image-converter logic has been migrated into the new structure rather than rewritten. Its existing format support, upload limits, ICO resizing behavior, and HEIF output limitation are preserved.

## Usage

### Web

1. Open the deployed app or a local running instance.
2. Pick a tool from the homepage directory.
3. Use the tool directly in the browser.

Available flows right now:

- `Image Converter`: convert supported image formats locally
- `JSON Formatter`: pretty-print or minify JSON safely
- `Base64`: encode and decode text in the browser

### Local

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

For a production build:

```bash
npm run build
npm start
```

## Image Converter Notes

- Inputs: `png`, `jpg`, `jpeg`, `webp`, `avif`, `tiff`, `heif`, `ico`
- Outputs: `png`, `jpg`, `jpeg`, `webp`, `avif`, `tiff`, `ico`
- `HEIF` / `HEIC` input is supported, but `HEIF` output is disabled in this build
- `ICO` output is automatically resized to fit the encoder limit above `512px`
- Upload guardrails: `10MB`, `4096px` max side, `20MP` max total

## Project Structure

```text
src/
  app/
    (tools)/
      image-converter/
      json-formatter/
      base64/
    api/magick-wasm/
    layout.tsx
    page.tsx
  components/
    ui/
    repository-corner.tsx
    site-footer.tsx
    tool-page-shell.tsx
  config/
    site.ts
    tools.ts
  lib/
    converters/
      image-converter/
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Repository

- Repo: `https://github.com/akshit-bansal11/image-converter`
- GitHub: `https://github.com/akshit-bansal11`
- LinkedIn: `https://www.linkedin.com/in/akshit-bansal11/`
