# Printed SVG Tool

p5.js prototype that turns filled SVG artwork into a 3D-printer-style toolpath preview.

- Paste or upload an SVG.
- Adjust nozzle width, infill density, infill angle, shell count, shell spacing, outer stroke count, and simulated layer offset.
- Export PNG or editable SVG toolpaths.

Run locally from the workspace root:

```sh
python3 -m http.server 8899
```

Then open:

```text
http://localhost:8899/lab/printed-svg-tool/
```
