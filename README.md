# Leonida Field Guide

A static Grand Theft Auto VI guide for all 55 PlayStation 5 trophies. Each entry includes earning advice, a source link and a place in the six-stage platinum roadmap. The checklist saves progress in your browser and supports JSON progress import and export, search, trophy filters and a switch for hiding story spoilers. The early meditation opportunity is flagged as a precaution against a potentially missable trophy.

Start the local server from the repository directory:

```sh
node serve.ts
```

Open http://localhost:8080. The app loads its scripts, styles and trophy data locally, so browsing the guide does not require external services. Source links open external reference pages when selected.

Create the submission output with:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies the static app and the four supplied screenshots into `out/` and generates `out/dossier.json`. `shots.json` describes the route, viewport and subject of each screenshot. The build uses the supplied vendored dossier writer.
