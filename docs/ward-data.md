# Registration ward directory

`src/lib/northern-ward-options.json` contains the electoral ward names used by the dependent State → LGA → Ward registration controls. It covers the northern states and the FCT already offered by the form.

The data is a snapshot of the INEC CVR portal, as captured in the public `saidiadegoke/nigeria-inec-geo` dataset on 10 August 2026. The dataset reports 8,809 registration areas and documents that one duplicate INEC portal record with no polling units was removed. Ward names are preserved as served by INEC. The source project notes that spellings, abbreviations, and boundaries should be verified against INEC because this is a snapshot, not a live feed.

Source: [nigeria-inec-geo](https://github.com/saidiadegoke/nigeria-inec-geo) and [INEC Polling Units Directory](https://www.inecnigeria.org/polling-units/). The generated app data uses only state/LGA/ward names; it excludes polling-unit, coordinate, and voter records.

To rebuild the app subset from a refreshed source snapshot, save its `data/wards.json` file as `tmp/inec-wards-source.json` and run `node scripts/build-northern-ward-options.mjs`. The generator fails if any state/LGA offered by the registration form cannot be matched, so dataset changes must be reviewed before deployment.
