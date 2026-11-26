# Movie Explorer

A Node/Express/MySQL prototype that joins movie IDs with cast, crew and people.

```bash
npm ci
node --env-file=.env app.js
```

Copy `.env.example` to `.env` and supply your disposable database credentials first. The original archive does not include the populated dataset or a complete reproducible database package; server routes require tables `Movies`, `Movie_Cast`, `Movie_Crew` and `People`. Inspect the parameterized queries in `app.js` and importer before recreating the schema. `import_data.js` expects its historical source CSVs and is not a bundled-data demonstration. Full end-to-end database execution was not verified for this older prototype.
