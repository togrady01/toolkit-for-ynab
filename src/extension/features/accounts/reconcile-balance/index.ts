import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEntityManager } from 'toolkit/extension/utils/ynab';
const YNAB_ACCOUNTS_HEADER_BALANCES = '.accounts-header-balances';
const TK_RECONCILE_BALANCE_ID = 'tk-reconcile-balance';

export class ReconcileBalance extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    // Get the current account id and calculate the current reconciled balance
    let accountsController = controllerLookup<YNABAccountsController>('accounts');
    if (accountsController === undefined) return;
    let { selectedAccountId } = accountsController;
    let reconciledBalance = formatCurrency(this._calculateReconciledBalance(selectedAccountId));
    // Retrieve or create the reconcile balance container
    let balanceContainer = $(`#${TK_RECONCILE_BALANCE_ID}`);
    if (!balanceContainer || balanceContainer.length === 0) {
      $(YNAB_ACCOUNTS_HEADER_BALANCES).prepend(
        `<div class="tk-accounts-header-balances-reconciled">
          <span id="${TK_RECONCILE_BALANCE_ID}">${reconciledBalance}</span>
          <div class="tk-accounts-header-reconcile-balance-label">Reconciled Balance</div>
        </div>`
      );
    }

    // Update the reconcile balance with the most up to date balance
    balanceContainer.text(reconciledBalance);
    this._setFeatureVisibility(true);
  }

  destroy() {
    $('.tk-accounts-header-balances-reconciled').remove();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      this._setFeatureVisibility(false);
    }
  }

  observe(changedNodes: Set<string>) {
    if (!this.shouldInvoke()) return;

    // When the reconciled balance icon changes, reevaluate our balance
    if (
      changedNodes.has('is-reconciled-icon svg-icon lock') ||
      changedNodes.has('modal-account-reconcile-reconciled')
    ) {
      this.invoke();
    }
  }

  /**
   *
   * Calculate the a given accounts reconciled balance
   *
   */

  _calculateReconciledBalance = (accountId: string) => {
    const account = getEntityManager().getAccountById(accountId);

    return account.getTransactions().reduce((reduced, transaction) => {
      if (transaction.cleared && !transaction.isTombstone && transaction.isReconciled?.()) {
        return reduced + transaction.amount;
      }

      return reduced;
    }, 0);
  };

  _setFeatureVisibility = (visible: boolean) => {
    let featureContainer = $('.tk-accounts-header-balances-reconciled');
    if (featureContainer && featureContainer.length) {
      featureContainer.toggle(visible);
    }
  };
}
