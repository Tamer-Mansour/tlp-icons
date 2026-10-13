# Notice

tlp-icons is released under the MIT License (see `LICENSE`). It contains icon geometry from the following
open-source projects. Their full license texts ship in `licenses/` (in both npm packages) and on the website at
https://tlp-icons.netlify.app/licenses/.

| Source | License | Copyright | Website | Icons |
| --- | --- | --- | --- | --- |
| Lucide | ISC | Copyright (c) 2026 Lucide Icons and Contributors (icons derived from Feather: MIT, Copyright (c) 2013-present Cole Bemis) | https://lucide.dev | icons with `source: "lucide"` |
| Tabler Icons | MIT | Copyright (c) 2020-2026 Paweł Kuna | https://tabler.io/icons | icons with `source: "tabler"` |
| tlp-icons originals | MIT | Copyright (c) 2026 tlp-icons contributors | https://github.com/Tamer-Mansour/tlp-icons | icons with `source: "tlp"` |

Every icon's source is recorded in the dataset (`tlp-icons-data`, field `source`) and shown on its page on the
website, so you can always tell which license applies to which icon. All three licenses allow commercial use,
modification and redistribution; keep this notice and the license texts when you redistribute the package.

What tlp-icons adds on top of the upstream geometry: the curated category taxonomy, the motion choreographies
(hand-made overrides and the rule engine output), part tagging of the SVG elements, the runtime, and the
"tlp-icons originals" (icons drawn for this project, in `originals/`).

## What is not included

tlp-icons does **not** contain icons, fonts or artwork from Font Awesome, Material Design Icons / Material Symbols,
Heroicons, Ionicons, Bootstrap Icons, Phosphor, Iconoir, Simple Icons or any other icon set besides the sources listed
above. The tlp originals are drawn from scratch for this project on our own 24×24 grid; they are not traced from or
derived from other icon sets. No icon fonts and no font files are shipped. Any similarity in subject (a bell is a
bell) follows from the subject, not from copying.

If you believe an icon infringes your rights, open an issue at https://github.com/Tamer-Mansour/tlp-icons/issues
and it will be reviewed and, where justified, removed in the next release.

## Trademarks

The **Brands** category (icons named `brand-*`, from Tabler Icons) shows logos that are trademarks of their
respective owners (for example Facebook, Instagram and WhatsApp are trademarks of Meta Platforms, Inc.).
They are included only to identify those products and services. Their inclusion does not imply any
affiliation with or endorsement by the trademark owners. Follow each owner's brand guidelines when you use them;
some guidelines do not allow logos to be altered or animated, so use `animated="false"` for those.
The tlp originals contain no company names, logos or trademarks.
