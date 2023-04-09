import * as React from 'react';
import { LabeledCheckbox } from 'toolkit-reports/common/components/labeled-checkbox';

export function BudgetTrendComponent({ budgets, filters }) {
  const [showDelta, setShowDelta] = React.useState(false);
  const [showFutureMonths, setShowFutureMonths] = React.useState(false);
  const { categoryMap, headerValues, categories } = React.useMemo(() => {
    const _categoryMap = new Map();
    const _headerValues = ['Category', 'Subcategory'];

    const _budgets = [...budgets];

    _budgets
      .filter((budget) =>
        showFutureMonths
          ? budget.monthlyBudget.month._internalUTCMoment._d >= filters.dateFilter.fromDate
          : budget.monthlyBudget.month._internalUTCMoment._d <= filters.dateFilter.toDate &&
            budget.monthlyBudget.month._internalUTCMoment._d >= filters.dateFilter.fromDate
      )
      .sort(
        (a, b) =>
          a.monthlyBudget.month._internalUTCMoment._d - b.monthlyBudget.month._internalUTCMoment._d
      )
      .forEach((budget) => {
        const dateValue = budget.monthlyBudget.month._internalUTCMoment._i;
        const date = new Date(...dateValue);
        _headerValues.push(date.toLocaleDateString());
        budget.monthlyBudget.subCategoryBudgets.forEach((subCategoryBudget) => {
          const categoryName = subCategoryBudget.subCategory.masterCategory.name;
          const subcategoryName = subCategoryBudget.subCategory.name;
          const mapName = `${categoryName}|${subcategoryName}`;
          const data = subCategoryBudget.monthlySubCategoryBudgetCalculation;
          if (
            !data.isTombstone &&
            !subCategoryBudget.subCategory.isHidden &&
            !['Internal Master Category', 'Credit Card Payments'].includes(categoryName)
          ) {
            if (!_categoryMap.has(mapName)) {
              _categoryMap.set(mapName, []);
            }

            _categoryMap.get(mapName).push({
              date,
              data,
              subCategoryName: subCategoryBudget.subCategory.name,
              categoryName: subCategoryBudget.subCategory.masterCategory.name,
              balance: showDelta ? data.balance - data.balancePreviousMonth : data.balance,
              goal: {
                goalCreatedOn: subCategoryBudget.subCategory.goalCreatedOn,
                goalFrequency: subCategoryBudget.subCategory.goalFrequency,
                goalFrequencyModifier: subCategoryBudget.subCategory.goalFrequencyModifier,
                goalTargetAmount: subCategoryBudget.subCategory.goalTargetAmount,
                goalTargetDate: subCategoryBudget.subCategory.goalTargetDate,
                goalType: subCategoryBudget.subCategory.goalType,
              },
            });
          }
        });
      });

    const _categories = [..._categoryMap.keys()].sort();

    _headerValues.push('Total');

    return {
      categories: _categories,
      categoryMap: _categoryMap,
      headerValues: _headerValues,
    };
  }, [budgets, showDelta, showFutureMonths, filters]);

  return (
    <div className="tk-flex tk-flex-column tk-flex-grow" style={{ overflow: 'auto' }}>
      <div className="tk-flex tk-pd-05 tk-border-b">
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            id="tk-balance-trend-delta-checkbox"
            checked={showDelta}
            label="Show Monthly Change"
            onChange={() => setShowDelta(!showDelta)}
          />
        </div>
        <div className="tk-pd-x-1">
          <LabeledCheckbox
            id="tk-balance-trend-show-future-months"
            checked={showFutureMonths}
            label="Show Future Months"
            onChange={() => setShowFutureMonths(!showFutureMonths)}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            {headerValues.map((text) => (
              <th>{text}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => {
            return (
              <tr key={cat}>
                <td style={{ whiteSpace: 'nowrap' }}>{cat.split('|')[0]}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{cat.split('|')[1]}</td>
                {categoryMap.get(cat).map((item) => {
                  //console.log(values.balance, values);
                  return <td>{item.balance !== 0 ? `${item.balance / 1000}` : ''}</td>;
                })}
                <td>
                  {categoryMap.get(cat).reduce((accum, item) => accum + item.balance, 0) / 1000}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
