import Link from 'next/link';
import Icon from '@/components/Icon';
import CodeBlock from '@/components/CodeBlock';
import DocsToc from '@/components/DocsToc';
import AnimLibrary from '@/components/AnimLibrary';
import { icon, total, categories } from '@/lib/data';

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
];
const DUR = { draw: 1000, fillIn: 1000, popIn: 800, fadeIn: 800, slideIn: 800, riseIn: 800, dropIn: 800, grow: 900, growX: 800, pop: 800, breathe: 1300, jelly: 1100, swing: 1400, wiggle: 1100, tilt: 1100, nod: 1000, strike: 1100, hop: 1000, lift: 1000, sink: 1000, nudge: 1000, nudgeBack: 1000, float: 1600, flip: 1200, spin: 1500, spinBack: 1500, spinHalf: 1200, sweep: 1600, sweepHour: 1600, blink: 900, shake: 1000, pulseRing: 1200, orbit: 1600, stretch: 1000 };

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
        <p>A classic script with every icon inside (about 2.4 MB). Works from <code>file://</code>, with no network and no module loader.</p>
        <CodeBlock lang="html" code={'<script src="tlp-icons.all.js"></script>\n<tlp-icon name="bell"></tlp-icon>'} />

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
            <tr><td><code>trigger</code></td><td><code>hover</code> <code>loop</code> <code>click</code> <code>none</code></td><td><code>hover</code></td><td>When the animation plays.</td></tr>
            <tr><td><code>duotone</code></td><td>boolean</td><td>off</td><td>Soft tinted fill on the icon&apos;s main body.</td></tr>
            <tr><td><code>flip</code></td><td><code>rtl</code> <code>x</code></td><td>off</td><td>Mirror in right-to-left pages, or always.</td></tr>
          </tbody>
        </table>

        <h3 id="triggers">Triggers</h3>
        <Demo>
          <Cell name="heart" caption="hover" />
          <Cell name="loader-circle" caption="loop" trigger="loop" />
          <Cell name="party-popper" caption="click me" trigger="click" />
          <Cell name="folder" caption="duotone" duotone />
          <Cell name="arrow-right" caption='flip="x"' flip="x" />
        </Demo>
        <CodeBlock lang="html" code={'<tlp-icon name="heart"></tlp-icon>                         <!-- hover (default) -->\n<tlp-icon name="loader-circle" trigger="loop"></tlp-icon>  <!-- again and again -->\n<tlp-icon name="party-popper" trigger="click"></tlp-icon>  <!-- on click -->\n<tlp-icon name="anchor" trigger="none"></tlp-icon>         <!-- only el.play() -->'} />

        <h2 id="frameworks">Frameworks</h2>
        <p>Import the element once at startup, then use <code>&lt;tlp-icon&gt;</code> anywhere. This website is built with Next.js and uses the package exactly like this.</p>
        <h3 id="react">React / Next.js</h3>
        <CodeBlock lang="jsx" code={"'use client';\nimport 'tlp-icons/element';\n\nexport function SaveButton() {\n  return (\n    <button>\n      <tlp-icon name=\"save\" /> Save\n    </button>\n  );\n}"} />
        <p>For server components, import the element once in a small client component (for example in your root layout). With TypeScript, declare the tag:</p>
        <CodeBlock lang="ts" title="tlp-icon.d.ts" code={"declare namespace JSX {\n  interface IntrinsicElements {\n    'tlp-icon': { name: string; size?: string | number; stroke?: string | number;\n      trigger?: 'hover' | 'loop' | 'click' | 'none'; duotone?: boolean | ''; flip?: 'rtl' | 'x' };\n  }\n}"} />
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
        <p>Every choreography is built from these 34 animations. Entrances bring a part into place; gestures move it and return exactly to rest. All keyframes are prefixed <code>tlp-</code> so they never clash with Tailwind or your CSS. Hover a tile:</p>
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
