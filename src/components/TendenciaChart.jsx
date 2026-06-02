// ============================================================
// components/TendenciaChart.jsx — Gráfico de barras Chart.js
// Fix responsivo: el canvas vive dentro de un wrapper con
// altura fija en CSS, no inline. maintainAspectRatio: false
// necesita un padre con dimensiones definidas para funcionar.
// ============================================================
import { useEffect, useRef } from 'react';
import {
  Chart, BarController, BarElement,
  CategoryScale, LinearScale, Tooltip, Legend,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const FONT = "'Share Tech Mono', monospace";

export default function TendenciaChart({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.mes),
        datasets: [
          {
            label: 'Inspecciones',
            data: data.map(d => d.inspecciones),
            backgroundColor: 'rgba(0,180,255,0.5)',
            borderColor: '#00b4ff',
            borderWidth: 1,
            borderRadius: 3,
          },
          {
            label: 'Reemplazos',
            data: data.map(d => d.reemplazos),
            backgroundColor: 'rgba(255,107,0,0.5)',
            borderColor: '#ff6b00',
            borderWidth: 1,
            borderRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,   // el padre controla la altura
        animation: { duration: 400 },
        plugins: {
          legend: {
            labels: {
              color: '#8892b0',
              font: { family: FONT, size: 11 },
              boxWidth: 12,
              padding: 14,
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#8892b0', font: { family: FONT, size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.04)' },
          },
          y: {
            ticks: { color: '#8892b0', font: { family: FONT, size: 10 } },
            grid:  { color: 'rgba(255,255,255,0.06)' },
          },
        },
      },
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [data]);

  // El div.chart-canvas-wrap tiene la altura fija definida en CSS.
  // El canvas llena el 100% de ese contenedor → Chart.js lo respeta.
  return (
    <div className="chart-canvas-wrap chart-canvas-wrap--bar">
      <canvas ref={canvasRef} />
    </div>
  );
}
