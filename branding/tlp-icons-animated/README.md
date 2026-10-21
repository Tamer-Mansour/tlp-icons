# tlp-icons — Animated logo

The circle, square and triangle arrive in sequence. The rose glyph blooms into place, lifts with a small spring motion, then settles. A quiet hold makes the loop comfortable to watch.

The original logo geometry and TLP colours are preserved. There is no audio.

## Files

| File | Use |
|---|---|
| `preview.html` | Open locally in a browser; includes Replay, Pause and Loop controls |
| `tlp-icons-animated.svg` | Transparent, continuously repeating vector animation; 5.2 seconds per cycle |
| `tlp-icons-intro-once.svg` | Plays once and holds the complete logo; suited to a website header or intro |
| `tlp-icons-animated.gif` | Shareable 640 × 640 animation on the TLP ivory background |
| `tlp-icons-animated.mp4` | 640 × 640 video, 25 fps, ivory background |
| `tlp-icons-static.svg` | Static fallback |
| `palette.css` | Shared colour variables |

Both SVG animations respect `prefers-reduced-motion` and show the static logo when reduced motion is enabled. GIF and MP4 do not respond to that preference automatically; use the SVG on websites when possible.

## Website use

No dependencies are required:

```html
<img
  src="/assets/tlp-icons-intro-once.svg"
  width="160"
  height="160"
  alt="tlp-icons"
/>
```

The animated SVG runs automatically, including when embedded with `<img>`. Use `tlp-icons-animated.svg` for the continuous loop. The one-shot version holds the final logo instead of disappearing.

## Validation

Rendered in Chrome. Replay, pause, loop switching, reduced-motion behavior and the one-shot final state were checked. GIF duration is 5.2 seconds. The GitHub repository was not changed.
