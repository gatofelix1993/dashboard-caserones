// ============================================================
// components/DisponibilidadChart.jsx — Doughnut Chart.js
// Fix responsivo: wrapper con altura fija en CSS controla
// el tamaño; el canvas nunca crece más allá del contenedor.
// ============================================================
import { useEffect, useRef } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { getOverallStatus } from '../utils/maintenance';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

const FONT = "'Share Tech Mono', monospace";

export default function DisponibilidadChart({ correas, config }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const disponibilidades = correas.map(c => {
      const ok = c.polines.filter(p => getOverallStatus(p, config) !== 'rojo').length;
      return parseFloat(((ok / c.polines.length) * 100).toFixed(1));
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: correas.map(c => `${c.id} · ${c.nombre}`),
        datasets: [{
          data: disponibilidades,
          backgroundColor: correas.map(c => c.color + '70'),
          borderColor:      correas.map(c => c.color),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,   // el padre controla la altura
        animation: { duration: 400 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#8892b0',
              font: { family: FONT, size: 10 },
              padding: 10,
              boxWidth: 12,
            },
          },
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [correas, config]);

  return (
    <div className="chart-canvas-wrap chart-canvas-wrap--donut">
      <canvas ref={canvasRef} />
    </div>
  );
}
