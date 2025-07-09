import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import {Bar} from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type MyChartProps = [
  { tgl: string, sale: number }
]

function MyChartComponent({data}: MyChartProps) {
  const options = {
    responsive: true,
    scales: {
      y: {
        ticks: {
          stepSize: 1,
          callback: function (value: number) {
            if (value >= (10 ** 9)) {
              return `${value / 10 ** 9}B`
            } else if (value >= (10 ** 6)) {
              return `${value / 10 ** 6}M`
            } else if (value >= (10 ** 3)) {
              return `${value / 10 ** 3}K`
            } else {
              return value
            }
          }
        }
      },
    },
    plugins: {
      datalabels: {
        datalabels: {
          color: 'black',
          display: function (context) {
            return context.dataset.data[context.dataIndex] > 15;
          },
          font: {
            weight: 'bold'
          },
          formatter: Math.round
        }
      }
    }
  };

  // @ts-ignore
  return <Bar data={data} options={options}/>;
}

export default MyChartComponent;