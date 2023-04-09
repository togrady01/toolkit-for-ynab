import {
  Browser,
  BrowserExtensionPrefix,
  Environment,
  ExtensionIdEnvironmentMap,
} from 'toolkit/core/common/constants';

export const getBrowser = () => {
  if (typeof browser !== 'undefined') {
    return browser;
  }

  if (typeof chrome !== 'undefined') {
    return chrome;
  }
};

export function getBrowserName() {
  const _browser = getBrowser(); // browser is global so use _ to namespace
  const URL = _browser.runtime.getURL('');

  if (URL.startsWith(BrowserExtensionPrefix[Browser.Chrome])) {
    return Browser.Chrome;
  }
  if (URL.startsWith(BrowserExtensionPrefix[Browser.Firefox])) {
    return Browser.Firefox;
  }
  if (URL.startsWith(BrowserExtensionPrefix[Browser.Edge])) {
    return Browser.Edge;
  }

  return '';
}

export function getEnvironment() {
  const _browser = getBrowser(); // browser is global so use _ to namespace
  const extensionId = _browser.runtime.id;

  const environment = ExtensionIdEnvironmentMap[extensionId];
  return environment || Environment.Development;
}
