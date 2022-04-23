import { withReportContext } from 'toolkit-reports/common/components/report-context';
import { AgeOfMoneyComponent } from './component';

function mapReportContextToProps(context) {
  console.log({ context });
  return {
    ...context,
  };
}

export const AgeOfMoney = withReportContext(mapReportContextToProps)(AgeOfMoneyComponent);
