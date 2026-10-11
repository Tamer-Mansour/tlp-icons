/** Copy-ready usage snippets for one icon, per framework. */
export function snippets(name, { stroke, duotone } = {}) {
  let attrs = `name="${name}"`;
  if (stroke && String(stroke) !== '2') attrs += ` stroke="${stroke}"`;
  const duo = duotone ? ' duotone' : '';
  return [
    { id: 'react', label: 'React', lang: 'jsx', code: `import 'tlp-icons/element';\n\nexport function Example() {\n  return <tlp-icon ${attrs}${duotone ? ' duotone=""' : ''} />;\n}` },
    { id: 'html', label: 'HTML', lang: 'html', code: `<script type="module" src="https://unpkg.com/tlp-icons/dist/tlp-icon.js"></script>\n\n<tlp-icon ${attrs}${duo}></tlp-icon>` },
    { id: 'angular', label: 'Angular', lang: 'html', code: `<!-- main.ts: import 'tlp-icons/element';  component: schemas: [CUSTOM_ELEMENTS_SCHEMA] -->\n<tlp-icon ${attrs}${duo}></tlp-icon>` },
    { id: 'vue', label: 'Vue', lang: 'vue', code: `<!-- main.ts: import 'tlp-icons/element';  vite: isCustomElement: tag => tag === 'tlp-icon' -->\n<tlp-icon ${attrs}${duo} />` },
  ];
}

export const FRAMEWORK_TABS = [
  { id: 'react', label: 'React', lang: 'jsx', code: `import 'tlp-icons/element';\n\nexport function Toolbar() {\n  return (\n    <nav>\n      <button><tlp-icon name="bell" /> Alerts</button>\n      <button><tlp-icon name="settings" /> Settings</button>\n      <tlp-icon name="loader-circle" trigger="loop" />\n    </nav>\n  );\n}` },
  { id: 'html', label: 'HTML', lang: 'html', code: `<script type="module" src="https://unpkg.com/tlp-icons/dist/tlp-icon.js"></script>\n\n<button><tlp-icon name="bell"></tlp-icon> Alerts</button>\n<tlp-icon name="heart" size="32" duotone></tlp-icon>` },
  { id: 'angular', label: 'Angular', lang: 'ts', code: `// main.ts\nimport 'tlp-icons/element';\n\n@Component({\n  selector: 'app-toolbar',\n  schemas: [CUSTOM_ELEMENTS_SCHEMA],\n  template: \`<button><tlp-icon name="bell"></tlp-icon> Alerts</button>\`,\n})\nexport class ToolbarComponent {}` },
  { id: 'vue', label: 'Vue', lang: 'vue', code: `<script setup>\nimport 'tlp-icons/element';\n</script>\n\n<template>\n  <button><tlp-icon name="bell" /> Alerts</button>\n</template>` },
];
