import { Feature } from 'toolkit/extension/features/feature';
import { Collections } from 'toolkit/extension/utils/collections';

export class CreditUtilization extends Feature {
  injectCSS() {
    return require('./util.css');
  }

  shouldInvoke() {
    return true;
  }

  setCcUtil(element) {
    try {
      if (element.isContentEditable) return;

      const accountId = element.dataset.accountId;
      const accountNameElem = element.querySelector('.nav-account-name');
      const accountName = accountNameElem?.title;
      if (accountId && accountName && accountName.includes('[') && accountName.includes(']')) {
        const account = Collections.accountsCollection
          .getOnBudgetAccounts()
          .find((a) => a.entityId === accountId);

        if (account.isCreditAccount) {
          const utilRaw = accountName.match(/(\[\d*\])/)?.[0];
          const util = Number(utilRaw?.match(/\d+/)?.[0]);
          const value =
            account.accountCalculation.unclearedBalance + account.accountCalculation.clearedBalance;

          if (!Number.isNaN(util) && util > 0 && value <= 0) {
            const percUtil = Math.abs(Math.round((100 * value) / 1000 / util));
            accountNameElem.innerHTML = `<span class="util ${
              percUtil <= 5 ? 'green' : 'yellow'
            }">${percUtil}%</span>${accountName.replace(utilRaw, '')}`;
          }
        }
      } else if (accountName) {
        accountNameElem.innerText = accountName;
      }
    } catch (error) {
      console.error('Failed CC UTIL');
      console.error(error);
    }
  }

  invoke() {
    this.addToolkitEmberHook('sidebar/nav-account-row', 'didRender', this.setCcUtil);
    this.addToolkitEmberHook('sidebar/nav-account-row', 'didUpdate', this.setCcUtil);
  }
}
