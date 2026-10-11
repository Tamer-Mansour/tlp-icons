// Type test: a project WITHOUT React types must still compile when it imports tlp-icons/jsx and the element.
import 'tlp-icons/jsx';
import { define } from 'tlp-icons/element';

const el = document.createElement('tlp-icon');
el.name = 'bell';
define();
