import { Feature } from 'toolkit/extension/features/feature';
import { pacingForCategory } from 'toolkit/extension/utils/pacing';
import { getEmberView } from 'toolkit/extension/utils/ember';

const PROGRESS_INDICATOR_WIDTH = 0.001; // Current month progress indicator width

export class BudgetProgressBars extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  destroy() {
    Array.from(document.querySelectorAll('[data-tk-progress-bars]')).forEach((element) => {
      const { tkProgressBars } = element.dataset;
      if (tkProgressBars === 'both') {
        $('div.budget-table-cell-budgeted, div.budget-table-cell-name', element).css({
          background: '',
        });
      } else {
        element.style.background = '';
      }
    });
  }

  invoke() {
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.addProgressBars, {
      debounce: 50,
    });
  }

  addGoalProgress = (element) => {
    const category = getEmberView(element.id)?.category;
    if (!category || !category.goalType) {
      return;
    }

    const { monthlySubCategoryBudgetCalculation } = category;
    if (!monthlySubCategoryBudgetCalculation) {
      return;
    }

    const { goalPercentageComplete } = monthlySubCategoryBudgetCalculation;
    const toElement =
      this.settings.enabled === 'both'
        ? element.querySelector('div.budget-table-cell-budgeted')
        : element;

    $(toElement).css(
      'background',
      `linear-gradient(
        to right,
        var(--tk-color-goal-fill) ${goalPercentageComplete}%,
        var(--table_row_background) ${goalPercentageComplete}%
      )`
    );
  };

  addPacingProgress = (element) => {
    const category = getEmberView(element.id)?.category;
    if (!category) {
      return;
    }

    const toElement =
      this.settings.enabled === 'both'
        ? element.querySelector('div.budget-table-cell-name')
        : element;

    const { isDeemphasized, budgetedPace, monthPace } = pacingForCategory(category);
    if (isDeemphasized) {
      toElement.style.background = '';
      return;
    }

    const { balancePriorToSpending } = category;
    const cappedBudgetedPace = Math.min(budgetedPace, 1);
    if (balancePriorToSpending > 0) {
      if (monthPace > budgetedPace) {
        $(toElement).css(
          'background',
          generateProgressBarStyle(
            [
              'var(--tk-color-pacing-fill)',
              'var(--table_row_background)',
              'var(--tk-color-progress-bar-month-indicator)',
              'var(--table_row_background)',
            ],
            [cappedBudgetedPace, monthPace - PROGRESS_INDICATOR_WIDTH, monthPace]
          )
        );
      } else {
        $(toElement).css(
          'background',
          generateProgressBarStyle(
            [
              'var(--tk-color-pacing-fill)',
              'var(--tk-color-progress-bar-month-indicator)',
              'var(--tk-color-pacing-fill)',
              'var(--table_row_background)',
            ],
            [monthPace - PROGRESS_INDICATOR_WIDTH, monthPace, cappedBudgetedPace]
          )
        );
      }
    } else {
      $(toElement).css(
        'background',
        generateProgressBarStyle(
          [
            'var(--table_row_background)',
            'var(--tk-color-progress-bar-month-indicator)',
            'var(--table_row_background)',
          ],
          [monthPace - PROGRESS_INDICATOR_WIDTH, monthPace]
        )
      );
    }
  };

  addProgressBars = (element) => {
    const userSetting = this.settings.enabled;
    const { tkProgressBars } = element.dataset;
    if (tkProgressBars !== userSetting) {
      if (tkProgressBars === 'both') {
        $('div.budget-table-cell-budgeted, div.budget-table-cell-name', element).css({
          background: '',
        });
      } else {
        element.style.background = '';
      }
    }

    element.dataset.tkProgressBars = this.settings.enabled;

    if (element.classList.contains('is-sub-category')) {
      const subCategory = getEmberView(element.id).category;
      if (!subCategory) {
        return;
      }

      switch (this.settings.enabled) {
        case 'goals':
          this.addGoalProgress(element);
          break;
        case 'pacing':
          this.addPacingProgress(element);
          break;
        case 'both':
          this.addGoalProgress(element);
          this.addPacingProgress(element);
          break;
      }
    }
  };
}

// Takes N colors and N-1 sorted points from (0, 1) to make color1|color2|color3 bg style.
function generateProgressBarStyle(colors, points) {
  const pointsPercent = [0, ...points, 1].map((p) => p * 100);
  return colors.reduce(
    (reduced, color, index) =>
      reduced +
      `${color} ${pointsPercent[index]}%, ${color} ${pointsPercent[index + 1]}%${
        index + 1 === colors.length ? ')' : ', '
      }`,
    'linear-gradient(to right, '
  );
}
