/* tlp-icons 0.1.0 - MIT. Icons from Lucide 1.55.0 (ISC), Tabler Icons 3.49.0 (MIT). Generated file, do not edit. */
import { setLoader, register } from './core.js';
import { MANIFEST, ALIASES } from './manifest.js';
register({}, ALIASES);
const pending = {};
setLoader(name => {
  const cat = MANIFEST[name];
  if (!cat) return null;
  return pending[cat] || (pending[cat] = import(`./icons/${cat}.js`).then(m => register(m.default)));
});
export * from './core.js';
export { TlpIcon } from './element.js';
