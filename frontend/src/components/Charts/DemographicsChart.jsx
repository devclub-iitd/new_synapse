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

  const theme = document.documentElement.getAttribute('data-theme');
  const textColor = theme === 'light' ? '#1e293b' : '#f1f5f9';
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
        onClick: (evt, legendItem, legend) => {
          const chart = legend.chart;
          chart.toggleDataVisibility(legendItem.index);
          chart.update();
        },
        labels: {
          color: textColor,
          font: { size: isMobile ? 10 : 12 },
          boxWidth: 12,
          boxHeight: 12,
          padding: 10,
          // Prevent any truncation
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return chart.data.labels.map((label, i) => {
              const isHidden = !chart.getDataVisibility(i);
              return {
                text: label,
                fillStyle: isHidden ? 'rgba(128,128,128,0.3)' : datasets[0].backgroundColor[i],
                strokeStyle: isHidden ? 'rgba(128,128,128,0.3)' : datasets[0].borderColor[i],
                lineWidth: 1,
                hidden: isHidden,
                fontColor: isHidden ? 'rgba(150,150,150,0.5)' : textColor,
                textDecoration: isHidden ? 'line-through' : '',
                index: i,
              };
            });
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

// import React from 'react';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
// import { Doughnut, Bar } from 'react-chartjs-2';

// ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// const COLORS = [
//   { bg: 'rgba(124, 58, 237, 0.75)',  border: 'rgba(124, 58, 237, 1)' },
//   { bg: 'rgba(59, 130, 246, 0.75)',  border: 'rgba(59, 130, 246, 1)' },
//   { bg: 'rgba(16, 185, 129, 0.75)',  border: 'rgba(16, 185, 129, 1)' },
//   { bg: 'rgba(239, 68, 68, 0.75)',   border: 'rgba(239, 68, 68, 1)' },
//   { bg: 'rgba(245, 158, 11, 0.75)',  border: 'rgba(245, 158, 11, 1)' },
//   { bg: 'rgba(236, 72, 153, 0.75)',  border: 'rgba(236, 72, 153, 1)' },
//   { bg: 'rgba(20, 184, 166, 0.75)',  border: 'rgba(20, 184, 166, 1)' },
//   { bg: 'rgba(251, 146, 60, 0.75)',  border: 'rgba(251, 146, 60, 1)' },
//   { bg: 'rgba(163, 230, 53, 0.75)',  border: 'rgba(163, 230, 53, 1)' },
// ];

// const DemographicsChart = ({ type, data, title }) => {
//   if (!data || Object.keys(data).length === 0) {
//     return (
//       <div style={{
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         height: '200px', color: 'var(--text-muted)', fontSize: '0.88rem',
//         border: '1px dashed var(--border-primary)', borderRadius: '12px',
//       }}>
//         No registration data yet
//       </div>
//     );
//   }

//   const labels = Object.keys(data);
//   const values = Object.values(data);
//   const isMobile = window.innerWidth < 768;

//   const chartData = {
//     labels,
//     datasets: [{
//       label: 'Registrations',
//       data: values,
//       backgroundColor: COLORS.map(c => c.bg),
//       borderColor: COLORS.map(c => c.border),
//       borderWidth: 1.5,
//       hoverOffset: 6,
//     }],
//   };

//   const textColor = getComputedStyle(document.documentElement)
//     .getPropertyValue('--text-primary').trim() || '#f1f5f9';
//   const mutedColor = getComputedStyle(document.documentElement)
//     .getPropertyValue('--text-muted').trim() || '#64748b';
//   const gridColor = getComputedStyle(document.documentElement)
//     .getPropertyValue('--border-primary').trim() || 'rgba(255,255,255,0.08)';

//   const options = {
//     responsive: true,
//     maintainAspectRatio: false,
//     layout: {
//       // Extra bottom padding so legend labels don't clip
//       padding: { top: 8, bottom: isMobile ? 4 : 8, left: 8, right: 8 },
//     },
//     plugins: {
//       // Legend always at bottom — avoids the side-by-side width fight
//       legend: {
//         position: 'bottom',
//         align: 'center',
//         labels: {
//           color: textColor,
//           font: { size: isMobile ? 10 : 11, family: 'Inter, sans-serif' },
//           boxWidth: 10,
//           boxHeight: 10,
//           padding: isMobile ? 10 : 16,
//           // Full label text, no truncation
//           generateLabels: (chart) => {
//             const ds = chart.data.datasets[0];
//             return chart.data.labels.map((label, i) => ({
//               text: label,
//               fillStyle: ds.backgroundColor[i],
//               strokeStyle: ds.borderColor[i],
//               lineWidth: 1,
//               hidden: false,
//               index: i,
//             }));
//           },
//         },
//       },
//       title: { display: false },
//       tooltip: {
//         backgroundColor: 'rgba(15,17,24,0.92)',
//         borderColor: 'rgba(255,255,255,0.08)',
//         borderWidth: 1,
//         titleColor: textColor,
//         bodyColor: mutedColor,
//         padding: 12,
//         callbacks: {
//           label: (ctx) => `  ${ctx.label}: ${ctx.parsed} registrations`,
//         },
//       },
//     },
//     scales: type === 'bar' ? {
//       y: { ticks: { color: textColor }, grid: { color: gridColor } },
//       x: { ticks: { color: textColor }, grid: { display: false } },
//     } : {},
//   };

//   // Height:
//   //   doughnut: 340px desktop, 300px mobile — enough room for chart + bottom legend
//   //   bar: 280px always
//   const height = type === 'doughnut'
//     ? (isMobile ? '300px' : '340px')
//     : '280px';

//   return (
//     <div style={{ position: 'relative', width: '100%', height }}>
//       {type === 'doughnut'
//         ? <Doughnut data={chartData} options={options} />
//         : <Bar data={chartData} options={options} />
//       }
//     </div>
//   );
// };

// export default DemographicsChart;