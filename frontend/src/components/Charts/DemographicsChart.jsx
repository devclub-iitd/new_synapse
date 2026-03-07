// import React from 'react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
// import { Doughnut, Bar } from 'react-chartjs-2';

// // Register ChartJS components
// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// const DemographicsChart = ({ type, data, title }) => {
//   if (!data || Object.keys(data).length === 0) return <div className="text-muted small">No data yet</div>;

//   const chartData = {
//     labels: Object.keys(data),
//     datasets: [
//       {
//         label: 'Registrations',
//         data: Object.values(data),
//         backgroundColor: [
//           'rgba(124, 58, 237, 0.6)', // Purple
//           'rgba(59, 130, 246, 0.6)', // Blue
//           'rgba(16, 185, 129, 0.6)', // Green
//           'rgba(239, 68, 68, 0.6)',  // Red
//           'rgba(245, 158, 11, 0.6)', // Yellow
//         ],
//         borderColor: [
//           'rgba(124, 58, 237, 1)',
//           'rgba(59, 130, 246, 1)',
//           'rgba(16, 185, 129, 1)',
//           'rgba(239, 68, 68, 1)',
//           'rgba(245, 158, 11, 1)',
//         ],
//         borderWidth: 1,
//       },
//     ],
//   };

//   const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#f1f5f9';
//   const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border-primary').trim() || 'rgba(255,255,255,0.08)';

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: { position: 'right', labels: { color: textColor } },
//       title: { display: true, text: title, color: textColor }
//     },
//     scales: type === 'bar' ? {
//       y: { ticks: { color: textColor }, grid: { color: gridColor } },
//       x: { ticks: { color: textColor }, grid: { display: false } }
//     } : {}
//   };

//   return (
//     <div className="p-3 glass-card h-100">
//       {type === 'doughnut' ? <Doughnut data={chartData} options={options} /> : <Bar data={chartData} options={options} />}
//     </div>
//   );
// };

// export default DemographicsChart;

// import React from 'react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
// import { Doughnut, Bar } from 'react-chartjs-2';

// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// const DemographicsChart = ({ type, data, title }) => {
//   if (!data || Object.keys(data).length === 0) return <div className="text-muted small">No data yet</div>;

//   const chartData = {
//     labels: Object.keys(data),
//     datasets: [{
//       label: 'Registrations',
//       data: Object.values(data),
//       backgroundColor: [
//         'rgba(124, 58, 237, 0.6)',
//         'rgba(59, 130, 246, 0.6)',
//         'rgba(16, 185, 129, 0.6)',
//         'rgba(239, 68, 68, 0.6)',
//         'rgba(245, 158, 11, 0.6)',
//         'rgba(236, 72, 153, 0.6)',
//         'rgba(20, 184, 166, 0.6)',
//       ],
//       borderColor: [
//         'rgba(124, 58, 237, 1)',
//         'rgba(59, 130, 246, 1)',
//         'rgba(16, 185, 129, 1)',
//         'rgba(239, 68, 68, 1)',
//         'rgba(245, 158, 11, 1)',
//         'rgba(236, 72, 153, 1)',
//         'rgba(20, 184, 166, 1)',
//       ],
//       borderWidth: 1,
//     }],
//   };

//   const textColor = getComputedStyle(document.documentElement)
//     .getPropertyValue('--text-primary').trim() || '#f1f5f9';
//   const gridColor = getComputedStyle(document.documentElement)
//     .getPropertyValue('--border-primary').trim() || 'rgba(255,255,255,0.08)';

//   // Move legend to bottom on mobile so it doesn't get squished
//   const isMobile = window.innerWidth < 768;
//   const legendPosition = isMobile ? 'bottom' : 'right';

//   const options = {
//     responsive: true,
//     maintainAspectRatio: true,
//     plugins: {
//       legend: {
//         position: legendPosition,
//         labels: {
//           color: textColor,
//           font: { size: isMobile ? 10 : 12 },
//           boxWidth: isMobile ? 10 : 14,
//           padding: isMobile ? 8 : 12,
//         }
//       },
//       title: {
//         display: !!title,
//         text: title,
//         color: textColor,
//         font: { size: isMobile ? 12 : 14 }
//       }
//     },
//     scales: type === 'bar' ? {
//       y: { ticks: { color: textColor }, grid: { color: gridColor } },
//       x: { ticks: { color: textColor }, grid: { display: false } }
//     } : {}
//   };

//   return (
//     <div className="demographics-chart-wrapper p-3 glass-card h-100">
//       {type === 'doughnut'
//         ? <Doughnut data={chartData} options={options} />
//         : <Bar data={chartData} options={options} />
//       }
//     </div>
//   );
// };

// export default DemographicsChart;

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const DemographicsChart = ({ type, data, title }) => {
  if (!data || Object.keys(data).length === 0) return <div className="text-muted small">No data yet</div>;

  const chartData = {
    labels: Object.keys(data),
    datasets: [{
      label: 'Registrations',
      data: Object.values(data),
      backgroundColor: [
        'rgba(124, 58, 237, 0.6)',
        'rgba(59, 130, 246, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(239, 68, 68, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(236, 72, 153, 0.6)',
        'rgba(20, 184, 166, 0.6)',
      ],
      borderColor: [
        'rgba(124, 58, 237, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(236, 72, 153, 1)',
        'rgba(20, 184, 166, 1)',
      ],
      borderWidth: 1,
    }],
  };

  const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-primary').trim() || '#f1f5f9';
  const gridColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--border-primary').trim() || 'rgba(255,255,255,0.08)';

  const isMobile = window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: isMobile ? 4 : 10,
    },
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          color: textColor,
          font: { size: isMobile ? 10 : 12 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
          // Prevent any truncation
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => ({
              text: label,
              fillStyle: datasets[0].backgroundColor[i],
              strokeStyle: datasets[0].borderColor[i],
              lineWidth: 1,
              hidden: false,
              index: i,
            }));
          },
        },
      },
      title: {
        display: false,
      },
    },
    scales: type === 'bar' ? {
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
      x: { ticks: { color: textColor }, grid: { display: false } }
    } : {}
  };

  return (
    <div className="demographics-chart-wrapper p-3 glass-card" style={{ position: 'relative', height: '100%', width: '100%' }}>
      {type === 'doughnut'
        ? <Doughnut data={chartData} options={options} />
        : <Bar data={chartData} options={options} />
      }
    </div>
  );
};

export default DemographicsChart;