# Image provenance and permitted use

All supplied artwork was drawn for this project by `scripts/generate-store-art.py`, using a generic outbound-link shape, original geometry and a teal palette. It contains no Discord logo, borrowed screenshots, external fonts or downloaded brand assets. It is covered by the repository's MIT license.

| File under assets/ | Dimensions | Kind |
| --- | --- | --- |
| store-icon-128.png | 128 x 128 | Original RGBA icon; same bytes as the packaged 128px icon. |
| screenshot-01-baseline.png | 1280 x 800 | Actual Chromium capture of a local fixture without the extension. |
| screenshot-02-enabled.png | 1280 x 800 | Actual Chromium capture of the same fixture with the packaged extension installed. |
| promo-small.png | 440 x 280 | Illustrative promotional art, not a screenshot. |
| promo-marquee.png | 1400 x 560 | Illustrative promotional art, not a screenshot. |

The screenshots were captured by `scripts/capture-store.cjs`. Every network request is intercepted. The script serves `store/demo.html` at a matched Discord origin solely inside a disposable Chromium profile, and serves a harmless local destination for the example.com link. No Discord login, messages, cookies or private profile are used. No requests reach Discord or example.com.

The baseline capture follows a real trusted browser click that reaches the fixture's confirmation handler. The enabled capture follows a real trusted click that opens the destination without that handler, verifies opener isolation, then verifies that the sample download control still reaches its original handler without downloading anything. The script adds measured-result captions only after those assertions pass. Captures are direct viewport PNGs, without compositing or simulated Discord UI. The visible status panel is demo instrumentation, not extension UI.

`assets/capture-evidence.json` records the browser version, outcomes and SHA-256 hashes of the runtime, demo source, capture script and captures. It proves the supplied captures correspond to the checked sources, not that current live Discord behaves identically. There is no native Chrome or laptop acceptance claim. The installed extension in the original checkout was not changed.

To regenerate the art, install Pillow in your own development environment and run `python3 scripts/generate-store-art.py`. To regenerate captures, run `npm run capture:store`. To validate and package the current files, run `npm run package:store`. The image-generation dependency is not shipped to users and is not needed for ordinary packaging.
