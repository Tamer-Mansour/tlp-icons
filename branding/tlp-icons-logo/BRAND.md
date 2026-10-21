# tlp-icons — Product identity

## Product

tlp-icons is an open-source animated icon library for web interfaces. It supports plain HTML and several UI frameworks, with motion tailored to the individual icon and support for reduced-motion preferences.

Source: [Tamer-Mansour/tlp-icons](https://github.com/Tamer-Mansour/tlp-icons).

## Logo concept

**An icon comes to life.** A circle, square and rounded triangle form a compact collection; a fourth, softer glyph lifts out of the grid, with two small motion accents. The collection represents the library, while the moving shape expresses its focus on animation.

The product has its own symbol. It does not use the TLP parent monogram or the TLP-Desk screen-and-hand mark. The optional horizontal lockup uses the product name `tlp-icons` beside its independent symbol.

## Palette

The shared TLP palette connects this product to the parent brand:

| Role | Colour | HEX |
|---|---|---|
| Primary shapes and name | Burgundy | `#741D3D` |
| Moving glyph and motion accents | Rose | `#BE617A` |
| Background | Ivory | `#FAF4ED` |
| Body text | Ink | `#2B2228` |
| Supporting surfaces | Sage | `#A9B9AE` |

## Usage

- Use the two-colour symbol on light backgrounds.
- Use the white version on dark backgrounds and the single-colour version where only one ink is available.
- Preserve the spacing and proportions of the four shapes.
- Leave clear space around the symbol of at least half the circle's diameter.
- Use the simplified `tlp-icons-small.svg` at small sizes; it omits the motion accents.
- Keep Burgundy or Ink for small text on Ivory. Rose is an accent, not the small-body-text colour.
- Do not mirror the identity for RTL interfaces; position the symbol and accompanying text according to the layout.

## Motion

`tlp-icons-hover.svg` animates only the upper-right glyph and its accents when hovered, then returns to rest. It includes a `prefers-reduced-motion` rule. Use it inline or as an SVG document via `<object>`; CSS hover inside an SVG does not activate when it is embedded with `<img>`.

## Production

The concept image was generated with the built-in image-generation tool. The final logo was rebuilt as precise vector geometry and imported into the live VectorCraft desktop document. The masters contain editable shapes and curves, with no raster image objects. SVG lockup text is outlined.

This is a proposed identity asset package. The GitHub repository and deployed site were not modified.
