import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup, containerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class ClearSelection extends Feature {
  uncheckTransactions = () => {
    let accountsController = controllerLookup('accounts');

    try {
      accountsController.set('areAllTransactionsSet', false);
      containerLookup('service:accounts').areChecked.setEach('isChecked', false);
      accountsController.send('closeModal');
    } catch (exception) {
      accountsController.send('closeModal');
      this.logFeatureError(exception);
    }
  };

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('modal', 'didRender', this.insertClearSelection, {
      guard: () => document.querySelector('.modal-account-edit-transaction-list') !== null,
    });
  }

  destroy() {
    $('#tk-clear-selection, #tk-clear-selection + li').remove();
  }

  insertClearSelection = (element) => {
    if (element.querySelector('#tk-clear-selection') !== null) {
      return;
    }

    const menuText = l10n('toolkit.accountsClearSelection', 'Clear Selection');

    // Note that ${menuText} was intentionally placed on the same line as the <i> tag to
    // prevent the leading space that occurs as a result of using a multi-line string.
    // Using a dedent function would allow it to be placed on its own line which would be
    // more natural.
    //
    // The second <li> functions as a separator on the menu after the feature menu item.
    $('.modal-account-edit-transaction-list .modal-list').prepend(
      $(`<li id="tk-clear-selection">
          <button class="button-list ynab-toolkit-clear-selection">
            <i class="ynab-new-icon flaticon stroke minus-2"></i>${menuText}
          </button>
        </li>
        <li><hr /><li>
      `).on('click', () => {
        this.uncheckTransactions();
      })
    );
  };
}
