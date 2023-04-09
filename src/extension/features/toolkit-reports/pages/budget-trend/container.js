import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { BudgetTrendComponent } from './component';

function mapReportContextToProps(context) {
  console.log({ context });
  return {
    ...context,
  };
}

export const BudgetTrend = withReportContext(mapReportContextToProps)(BudgetTrendComponent);
