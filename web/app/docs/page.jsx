import Link from 'next/link';
import Icon from '@/components/Icon';
import CodeBlock from '@/components/CodeBlock';
import DocsToc from '@/components/DocsToc';
import AnimLibrary from '@/components/AnimLibrary';
import { icon, total, categories, stats } from '@/lib/data';

export const metadata = {
  title: 'Documentation',
  description: 'Install and use tlp-icons animated icons in HTML, React, Angular, Vue and Svelte: attributes, styling, the hover rule, JavaScript API and the animation library.',
  alternates: { canonical: '/docs/' },
};

const TOC = [
  { id: 'install', title: 'Installation' },
  { id: 'usage', title: 'Basic usage' },
  { id: 'attributes', title: 'Attributes', sub: true },
  { id: 'triggers', title: 'Triggers', sub: true },
  { id: 'frameworks', title: 'Frameworks' },
  { id: 'react', title: 'React / Next.js', sub: true },
  { id: 'react18', title: 'React 18 wrapper', sub: true },
  { id: 'angular', title: 'Angular', sub: true },
  { id: 'vue', title: 'Vue / Nuxt', sub: true },
  { id: 'styling', title: 'Styling' },
  { id: 'hover', title: 'The hover rule' },
  { id: 'api', title: 'JavaScript API' },
  { id: 'animations', title: 'Animation library' },
  { id: 'a11y', title: 'Accessibility' },
  { id: 'rtl', title: 'Right-to-left' },
  { id: 'custom', title: 'Custom choreography' },
  { id: 'build', title: 'Build from source' },
];

const LIB = [
  ['draw', 'signature', 'entrance'], ['fillIn', 'file', 'entrance'], ['popIn', 'star', 'entrance'], ['fadeIn', 'ghost', 'entrance'],
  ['slideIn', 'arrow-right', 'entrance'], ['riseIn', 'arrow-up', 'entrance'], ['dropIn', 'droplet', 'entrance'], ['grow', 'chart-column', 'entrance', 'bottom'],
  ['growX', 'align-left', 'entrance', 'left'], ['pop', 'heart', 'gesture'], ['breathe', 'heart-pulse', 'gesture'], ['jelly', 'smile', 'gesture'],
  ['swing', 'bell', 'gesture', 'top'], ['wiggle', 'phone', 'gesture'], ['tilt', 'search', 'gesture'], ['nod', 'pencil', 'gesture', 'bottom left'],
  ['strike', 'gavel', 'gesture', 'bottom left'], ['hop', 'rabbit', 'gesture'], ['lift', 'arrow-big-up', 'gesture'], ['sink', 'arrow-big-down', 'gesture'],
  ['nudge', 'arrow-big-right', 'gesture'], ['nudgeBack', 'arrow-big-left', 'gesture'], ['float', 'cloud', 'gesture'], ['flip', 'credit-card', 'gesture'],
  ['spin', 'settings', 'turn'], ['spinBack', 'rotate-ccw', 'turn'], ['spinHalf', 'hourglass', 'turn'], ['sweep', 'clock', 'turn'],
  ['sweepHour', 'clock-9', 'turn'], ['blink', 'eye', 'gesture'], ['shake', 'triangle-alert', 'gesture'], ['pulseRing', 'circle-dot', 'gesture'],
  ['orbit', 'orbit', 'turn'], ['stretch', 'move-horizontal', 'gesture'],
  ['zoomIn', 'zoom-in', 'entrance'], ['spiralIn', 'spiral', 'entrance'], ['swingIn', 'label', 'entrance', 'top'], ['flipIn', 'id', 'entrance'],
  ['focusIn', 'aperture', 'entrance'], ['bloom', 'flower', 'entrance'], ['rollIn', 'coin', 'entrance'], ['buzz', 'vibrate', 'gesture'],
  ['tap', 'click', 'gesture'], ['press', 'power', 'gesture'], ['beat', 'heart-handshake', 'gesture'], ['flicker', 'flame', 'gesture', 'bottom'],
  ['twinkle', 'sparkle', 'gesture'], ['sway', 'plant', 'gesture', 'bottom'], ['flutter', 'flag-up', 'gesture', 'left'], ['bob', 'ship', 'gesture'],
  ['drive', 'truck', 'gesture', 'bottom'], ['launch', 'rocket', 'gesture'], ['roll', 'ball-basketball', 'turn'], ['tada', 'gift', 'gesture'],
  ['rubber', 'mood-smile', 'gesture'], ['rattle', 'dice', 'gesture'], ['spring', 'rabbit', 'gesture', 'bottom'], ['knock', 'door', 'gesture', 'left'],
  ['wave', 'hand', 'gesture', 'bottom'], ['pendulum', 'metronome', 'gesture', 'top'], ['twirl', 'whirl', 'turn'], ['flipY', 'flip-vertical', 'gesture'],
  ['drip', 'droplet', 'gesture'], ['fall', 'parachute', 'gesture'], ['retrace', 'scribble', 'gesture'], ['peek', 'ghost', 'gesture', 'bottom'],
  ['slideInBack', 'arrow-left', 'entrance'], ['unfold', 'details', 'entrance', 'top'], ['stampIn', 'sos', 'entrance'], ['bounceIn', 'ball-tennis', 'entrance'],
  ['whooshIn', 'boom', 'entrance'], ['elasticIn', 'chart-donut', 'entrance'], ['typeIn', 'bold', 'entrance'], ['drawReverse', 'arrow-merge', 'entrance'],
  ['slideDown', 'helmet', 'entrance'], ['emerge', 'mountain', 'entrance', 'bottom'], ['jump', 'gymnastics', 'gesture', 'bottom'], ['scan', 'texture', 'gesture'],
  ['scanX', 'aspect-ratio', 'gesture'], ['glow', 'bulb', 'gesture'], ['dim', 'zzz', 'gesture'], ['inhale', 'lungs', 'gesture'],
  ['squeeze', 'components', 'gesture'], ['pump', 'plug', 'gesture'], ['shuttle', 'protocol', 'gesture'], ['dash', 'trailer', 'gesture'],
  ['recoil', 'bomb', 'gesture'], ['throb', 'atom-2', 'gesture'], ['refill', 'battery-4', 'gesture', 'left'], ['equalize', 'chart-bar-popular', 'gesture', 'bottom'],
  ['blip', 'point', 'gesture'], ['dig', 'shovel', 'gesture'], ['stir', 'whisk', 'gesture'], ['stamp', 'rubber-stamp', 'gesture', 'bottom'],
  ['pour', 'amphora', 'gesture'], ['magnify', 'photo', 'gesture'], ['spinFast', 'propeller', 'turn'], ['windUp', 'spool', 'turn'],
  ['tumble', 'icosahedron', 'turn'], ['halfBack', 'square-rotated', 'turn'],
];
const DUR = { draw: 1000, fillIn: 1000, popIn: 800, fadeIn: 800, slideIn: 800, riseIn: 800, dropIn: 800, grow: 900, growX: 800, pop: 800, breathe: 1300, jelly: 1100, swing: 1400, wiggle: 1100, tilt: 1100, nod: 1000, strike: 1100, hop: 1000, lift: 1000, sink: 1000, nudge: 1000, nudgeBack: 1000, float: 1600, flip: 1200, spin: 1500, spinBack: 1500, spinHalf: 1200, sweep: 1600, sweepHour: 1600, blink: 900, shake: 1000, pulseRing: 1200, orbit: 1600, stretch: 1000,
  zoomIn: 900, spiralIn: 1100, swingIn: 1200, flipIn: 1000, focusIn: 1100, bloom: 1100, rollIn: 1100, buzz: 900, tap: 1100, press: 900, beat: 1100, flicker: 1200, twinkle: 900, sway: 1800, flutter: 1300, bob: 1700, drive: 1100, launch: 1200, roll: 1400, tada: 1100, rubber: 1000, rattle: 900, spring: 1100, knock: 900, wave: 1400, pendulum: 1900, twirl: 1300, flipY: 1100, drip: 1300, fall: 1300, retrace: 1300, peek: 1000,
  slideInBack: 800, unfold: 900, stampIn: 800, bounceIn: 1100, whooshIn: 900, elasticIn: 1100, typeIn: 1000, drawReverse: 1000, slideDown: 800, emerge: 900,
  jump: 1200, scan: 1600, scanX: 1600, glow: 1300, dim: 1100, inhale: 1700, squeeze: 1000, pump: 1100, shuttle: 1500, dash: 1000,
  recoil: 900, throb: 1400, refill: 1500, equalize: 1200, blip: 700, dig: 1300, stir: 1400, stamp: 1100, pour: 1700, magnify: 1300,
  spinFast: 1400, windUp: 1600, tumble: 1300, halfBack: 1200 };

function demos() {
  return LIB.map(([anim, base, kind, origin]) => {
    const b = icon(base) || icon('circle');
    const own = b.m.filter(s => s[1] === anim);
    let ic;
    if (own.length) ic = { svg: b.svg, m: own };
    else if (anim === 'fillIn' && /class="d( [^"]*)?"/.test(b.svg)) ic = { svg: b.svg.replace(/class="d( [^"]*)?"/, 'class="d p9"'), m: [['p9', 'fillIn', DUR.fillIn, 0]] };
    else ic = { svg: b.svg, m: [['all', anim, DUR[anim], 0, ...(origin ? [origin] : [])]] };
    return { anim, kind, icon: ic };
  });
}

function Demo({ children }) {
  return <div className="not-prose my-5 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-5 text-brand shadow-card">{children}</div>;
}
function Cell({ name, caption, ...rest }) {
  return (
    <div className="tile-host flex min-w-24 flex-col items-center gap-2 rounded-xl p-3 transition hover:bg-brand-soft">
      <Icon name={name} size="32" {...rest} />
      <span className="font-mono text-[11px] text-ink-2">{caption || name}</span>
    </div>
  );
}

export default function Docs() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 pt-10 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block"><DocsToc items={TOC} /></aside>
      <article className="prose-doc max-w-3xl pb-10">
        <p className="text-sm font-semibold text-brand">Documentation</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-ink">Getting started with tlp-icons</h1>
        <p className="mt-4 text-lg">{total().toLocaleString('en')} icons in {categories().length} categories, every one animated. One small custom element, <code>&lt;tlp-icon&gt;</code>, works in plain HTML and every framework. No dependencies.</p>

        <h2 id="install">Installation</h2>
        <h3>npm</h3>
        <CodeBlock lang="bash" code="npm install tlp-icons" />
        <h3>CDN, no build step</h3>
        <p>Loads the element and fetches only the categories your page uses.</p>
        <CodeBlock lang="html" code={'<script type="module" src="https://unpkg.com/tlp-icons/dist/tlp-icon.js"></script>\n\n<tlp-icon name="bell"></tlp-icon>'} />
        <h3>Offline, one file</h3>
        <p>A classic script with every icon inside (about 2.3 MB, 390 KB gzip), in the <code>tlp-icons-data</code> package. Works from <code>file://</code>, with no network and no module loader.</p>
        <CodeBlock lang="bash" code="npm install tlp-icons-data" />
        <CodeBlock lang="html" code={'<script src="node_modules/tlp-icons-data/tlp-icons.all.js"></script>\n<tlp-icon name="bell"></tlp-icon>'} />

        <h2 id="usage">Basic usage</h2>
        <p>Write the element with an icon <code>name</code>. Find names in the <Link href="/icons/">icon gallery</Link>. Hover these:</p>
        <Demo>{['bell', 'clock', 'settings', 'trash', 'cloud-rain', 'lock'].map(n => <Cell key={n} name={n} />)}</Demo>
        <CodeBlock lang="html" code={'<tlp-icon name="bell"></tlp-icon>\n<tlp-icon name="settings" size="32" stroke="1.5"></tlp-icon>'} />

        <h3 id="attributes">Attributes</h3>
        <table>
          <thead><tr><th>Attribute</th><th>Values</th><th>Default</th><th>What it does</th></tr></thead>
          <tbody>
            <tr><td><code>name</code></td><td>icon name or alias</td><td></td><td>Which icon to show.</td></tr>
            <tr><td><code>size</code></td><td>number (px) or CSS length</td><td><code>24</code></td><td>Width and height (same as <code>--tlp-size</code>).</td></tr>
            <tr><td><code>stroke</code></td><td>number</td><td><code>2</code></td><td>Stroke width in the 24×24 grid (same as <code>--tlp-stroke</code>).</td></tr>
            <tr><td><code>trigger</code></td><td><code>hover</code> <code>hold</code> <code>loop</code> <code>click</code> <code>none</code></td><td><code>hover</code></td><td>When the animation plays. <code>hold</code>: plays to its peak on hover, stays, returns when the mouse leaves.</td></tr>
            <tr><td><code>duotone</code></td><td>boolean</td><td>off</td><td>Soft tinted fill on the icon&apos;s main body.</td></tr>
            <tr><td><code>flip</code></td><td><code>rtl</code> <code>x</code></td><td>off</td><td>Mirror in right-to-left pages, or always.</td></tr>
            <tr><td><code>animated</code></td><td><code>false</code></td><td>animated</td><td>Static icon that never animates.</td></tr>
          </tbody>
        </table>

        <h3 id="triggers">Triggers</h3>
        <Demo>
          <Cell name="heart" caption="hover" />
          <Cell name="trash" caption="hold" trigger="hold" />
          <Cell name="bell" caption='animated="false"' animated={false} />
          <Cell name="loader-circle" caption="loop" trigger="loop" />
          <Cell name="party-popper" caption="click me" trigger="click" />
          <Cell name="folder" caption="duotone" duotone />
          <Cell name="arrow-right" caption='flip="x"' flip="x" />
        </Demo>
        <CodeBlock lang="html" code={'<tlp-icon name="heart"></tlp-icon>                         <!-- hover (default) -->\n<tlp-icon name="trash" trigger="hold"></tlp-icon>          <!-- hover: animate and stay, back on leave -->\n<tlp-icon name="bell" animated="false"></tlp-icon>         <!-- static, never animates -->\n<tlp-icon name="loader-circle" trigger="loop"></tlp-icon>  <!-- again and again -->\n<tlp-icon name="party-popper" trigger="click"></tlp-icon>  <!-- on click -->\n<tlp-icon name="anchor" trigger="none"></tlp-icon>         <!-- only el.play() -->'} />

        <h2 id="frameworks">Frameworks</h2>
        <p>Import the element once at startup, then use <code>&lt;tlp-icon&gt;</code> anywhere. This website is built with Next.js and uses the package exactly like this.</p>
        <h3 id="react">React / Next.js</h3>
        <CodeBlock lang="jsx" code={"'use client';\nimport 'tlp-icons/element';\n\nexport function SaveButton() {\n  return (\n    <button>\n      <tlp-icon name=\"save\" /> Save\n    </button>\n  );\n}"} />
        <p>The import is safe during server rendering. TypeScript types for the tag ship with the package (since 0.2.0): add one import and <code>name</code>, <code>trigger</code> and <code>flip</code> are type-checked.</p>
        <CodeBlock lang="ts" code={"import 'tlp-icons/jsx'; // types <tlp-icon> in JSX (React 18 and 19)"} />
        <h3 id="react18">React 18 wrapper</h3>
        <p>React 18 turns boolean props into strings. Use the tiny optional wrapper instead of the bare tag:</p>
        <CodeBlock lang="jsx" code={"import { TlpIcon } from 'tlp-icons/react';\n\n<TlpIcon name=\"heart\" size={32} duotone className=\"like\" />"} />
        <h3 id="angular">Angular</h3>
        <CodeBlock lang="ts" code={"// main.ts\nimport 'tlp-icons/element';\n\n// any component\n@Component({\n  selector: 'app-toolbar',\n  schemas: [CUSTOM_ELEMENTS_SCHEMA],\n  template: `<button><tlp-icon name=\"bell\"></tlp-icon> Alerts</button>`,\n})\nexport class ToolbarComponent {}"} />
        <h3 id="vue">Vue / Nuxt</h3>
        <CodeBlock lang="ts" code={"// main.ts\nimport 'tlp-icons/element';\n\n// vite.config.ts\nvue({ template: { compilerOptions: { isCustomElement: tag => tag === 'tlp-icon' } } })"} />
        <CodeBlock lang="vue" code={"<template>\n  <tlp-icon :name=\"done ? 'circle-check' : 'circle'\" />\n</template>"} />

        <h2 id="styling">Styling</h2>
        <p>Icons use <code>currentColor</code>, so they take the text color. Theme them with CSS variables:</p>
        <CodeBlock lang="css" code={'tlp-icon { --tlp-size: 20px; --tlp-stroke: 1.75; }\n.danger  { color: #dc2626; }   /* icon color = text color */\n.card    { --tlp-duo: .22; }    /* duotone strength */'} />

        <h2 id="hover">The hover rule</h2>
        <p>Hovering an icon animates it. Hovering anything else walks up to the nearest element that holds <b>exactly one</b> icon (a button, a menu item) and animates that one. If it reaches an element with <b>several</b> icons first (a card, a menu, a table row), nothing animates. An animation always plays to the end.</p>
        <Demo>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white"><Icon name="send" size="18" stroke="2" /> Send</button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-soft px-4 text-sm font-semibold text-brand"><Icon name="download" size="18" stroke="2" /> Download</button>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-paper px-4 py-3 text-sm text-ink-2">This card has three icons, so hovering its text does nothing <Icon name="bell" size="20" /><Icon name="mail" size="20" /><Icon name="calendar" size="20" /></div>
        </Demo>

        <h2 id="api">JavaScript API</h2>
        <CodeBlock lang="js" code={"const el = document.querySelector('tlp-icon');\nel.play();                         // play once\nel.setAttribute('name', 'bell');   // swap the icon\n\nimport { icons, categories, getSvg, getIcon } from 'tlp-icons';\ngetSvg('bell');                                // static SVG markup\ngetSvg('bell', { size: 32, stroke: 1.5, duotone: true });\ngetSvg('bell', { animated: true });            // motion baked in\nicons.bell;  // { svg, m: [[part, anim, dur, delay, origin?], ...] }\n\nimport { config, register } from 'tlp-icons/element';\nconfig.speed = 0.8;   // default 0.6 (about 0.9 s per icon)"} />
        <p>Importing <code>icons</code> pulls in the whole set. In pages, prefer <code>&lt;tlp-icon&gt;</code>: it downloads one category at a time.</p>

        <h2 id="animations">Animation library</h2>
        <p>Every choreography is built from these {stats().animations} animations. Entrances bring a part into place; gestures move it and return exactly to rest. All keyframes are prefixed <code>tlp-</code> so they never clash with Tailwind or your CSS. Hover a tile:</p>
        <AnimLibrary demos={demos()} />

        <h2 id="a11y">Accessibility</h2>
        <ul>
          <li>Icons are decorative by default (<code>aria-hidden</code>). When an icon carries meaning, add <code>role=&quot;img&quot;</code> and <code>aria-label</code>.</li>
          <li>With <code>prefers-reduced-motion</code> enabled, icons never animate.</li>
          <li>Animations are short (0.9 s on average, 1.6 s at most) and always end exactly at rest.</li>
        </ul>

        <h2 id="rtl">Right-to-left</h2>
        <p>Motion follows the drawing: an arrow pointing right moves right. On RTL pages, mirror directional icons with <code>flip=&quot;rtl&quot;</code>; their motion flips with them.</p>
        <CodeBlock lang="html" code={'<html dir="rtl">\n  <button><tlp-icon name="arrow-right" flip="rtl"></tlp-icon> التالي</button>'} />

        <h2 id="custom">Custom choreography</h2>
        <p>Improve one icon with <code>overrides/&lt;name&gt;.json</code>, or add your own drawing to <code>originals/</code>. Tag moving pieces with <code>p1</code>…<code>p4</code>, the main body with <code>d</code>, then list the steps:</p>
        <CodeBlock lang="json" code={'{\n  "name": "court-hearing",\n  "category": "legal",\n  "svg": "<path class=\\"d p1\\" d=\\"...\\"/><g class=\\"p2\\">...</g>",\n  "motion": [\n    { "part": "p1", "anim": "fillIn", "dur": 900, "delay": 0 },\n    { "part": "p2", "anim": "strike", "dur": 1200, "delay": 150, "origin": "5px 19px" }\n  ]\n}'} />

        <h2 id="build">Build from source</h2>
        <CodeBlock lang="bash" code={'git clone https://github.com/Tamer-Mansour/tlp-icons\ncd tlp-icons\nnpm run build      # offline: upstream/ + config/ + overrides/ + originals/ -> dist/\nnpm test           # offline test suite\nnpm run sync       # online: latest Lucide + Tabler, then rebuild\n\ncd web && npm install && npm run dev   # this website'} />
      </article>
    </div>
  );
}
