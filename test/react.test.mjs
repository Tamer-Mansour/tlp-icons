// tlp-icons/react: server rendering must not crash and must emit the right attributes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { ROOT } from './helpers.mjs';

test('React wrapper server-renders <tlp-icon> with attributes, className, style and aria-* (no DOM)', () => {
  const html = execFileSync(process.execPath, ['--input-type=module', '-e', `
    import { createElement } from 'react';
    import { renderToString } from 'react-dom/server';
    import { TlpIcon } from 'tlp-icons/react';
    const out = renderToString(createElement('div', null,
      createElement(TlpIcon, { name: 'bell', size: 20, stroke: 1.5, trigger: 'loop', duotone: true, flip: 'rtl', className: 'icon', style: { color: 'red' }, 'aria-label': 'Alerts' }),
      createElement(TlpIcon, { name: 'heart', duotone: false })));
    console.log(out);
  `], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  assert.match(html, /<tlp-icon[^>]*name="bell"/);
  for (const a of ['size="20"', 'stroke="1.5"', 'trigger="loop"', 'duotone=""', 'flip="rtl"', 'class="icon"', 'aria-label="Alerts"', 'color:red']) assert.ok(html.includes(a), `missing ${a} in ${html}`);
  const heart = html.match(/<tlp-icon[^>]*name="heart"[^>]*>/)[0];
  assert.ok(!heart.includes('duotone'), `duotone=false must not render the attribute: ${heart}`);
});
