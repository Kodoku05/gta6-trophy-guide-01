# Leonida Field Guide

Plan a Grand Theft Auto VI platinum run with this static checklist for all 55 PlayStation 5 trophies. Trophy cards contain original earning advice, public references and a suggested place in a six-stage roadmap. Search and category or grade filters help narrow the list, while a spoiler switch conceals unearned story names and descriptions. Browser storage remembers earned trophies, and JSON import and export let you move that progress between browsers.

The roadmap highlights Lucia's optional Chapter 1 meditation as a precaution: whether that early session is required remains unconfirmed, so take it before advancing.

Run the preview server from this directory:

```sh
node serve.ts
```

Visit http://localhost:8080 in a browser. The page reads its JavaScript, CSS and trophy JSON from the local server. Normal checklist use needs no external service; following a reference opens a public website.

Build the submission package with:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The builder places the app and four supplied screenshots in `out/`, then creates `out/dossier.json` using the bundled vendor writer. Screenshot routes, viewport sizes and descriptions are recorded in `shots.json`. Node 22 or newer is required by the builder; setting `MAKEFUN_OUTPUT_DIR` selects the destination instead of its default `/output`.
