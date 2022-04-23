import * as React from 'react';
import Highcharts from 'highcharts';
import moment from 'moment';

export function AgeOfMoneyComponent({ budgets }) {
  const chartRef = React.useRef();
  const [chart, setChart] = React.useState();
  const data = React.useMemo(
    () =>
      budgets
        .map((budget) => [
          Number(budget.monthlyBudget.month._internalUTCMoment._d),
          budget.ageOfMoney ?? 0,
        ])
        .sort((a, b) => a[0] - b[0])
        .filter(([date]) => date <= new Date()),
    [budgets]
  );

  React.useEffect(() => {
    if (!chartRef.current) return;

    if (chart) {
      chart.destroy();
    }

    if (!data.length) return;

    let textColor = 'var(--label_primary)';

    setChart(
      new Highcharts.Chart({
        credits: false,
        title: {
          text: 'Age Of Money',
          style: { color: textColor },
        },
        chart: {
          backgroundColor: 'transparent',
          renderTo: 'tk-age-of-money-chart',
        },
        legend: {
          enabled: false,
        },
        xAxis: {
          type: 'datetime',
          title: { text: '' },
          dateTimeLabelFormats: {
            day: '%b %d',
            week: '%b %d, %y',
            month: '%b %Y',
          },
          // labels: {
          //   formatter: function () {
          //     console.log(this.value)
          //     return `${this.value.getFullYear()}-${this.value.getMonth()}`
          //   }
          // }
        },
        yAxis: {
          title: { text: '' },
        },
        series: [
          {
            data,
          },
        ],
      })
    );
  }, [chartRef, data]);

  return (
    <div className={'tk-highcharts-report-container'} id={'tk-age-of-money-chart'} ref={chartRef} />
  );
}
