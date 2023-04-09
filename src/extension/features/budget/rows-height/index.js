import { Feature } from 'toolkit/extension/features/feature';

export class RowsHeight extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./compact.css');
    }
    if (this.settings.enabled === '2') {
      return require('./slim.css');
    }
    if (this.settings.enabled === '3') {
      return require('./slim-fonts.css');
    }
    if (this.settings.enabled === '4') {
      return require('./medium.css');
    }
    if (this.settings.enabled === '5') {
      return require('./large.css');
    }
  }
}
