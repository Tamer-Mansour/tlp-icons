// toolbar.component.ts (Angular 17+, standalone)
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import 'tlp-icons/element';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <button type="button"><tlp-icon name="bell"></tlp-icon> Alerts</button>
    <tlp-icon [attr.name]="icon" trigger="loop"></tlp-icon>
  `,
})
export class ToolbarComponent {
  icon = 'loader-circle';
}
