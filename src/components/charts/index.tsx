// =============================================================================
// Chart Components — All Chart.js chart wrappers (Light Enterprise Theme)
// =============================================================================

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '@/constants';

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement, BarElement,
  ArcElement, Filler, Tooltip, Legend,
);

// ── Shared Light Chart Options ────────────────────────────────────────────────
const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 600, easing: 'easeOutCubic' as const },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1F2937',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      titleColor: '#F9FAFB',
      bodyColor: '#D1D5DB',
      padding: 8,
      cornerRadius: 6,
      boxPadding: 4,
    },
  },
  scales: {
    x: {
      border: { display: false },
      grid: { color: '#E5E7EB', drawTicks: false },
      ticks: { color: '#4B5563', font: { size: 11, family: 'Inter' } },
    },
    y: {
      border: { display: false },
      grid: { color: '#E5E7EB', drawTicks: false },
      ticks: { color: '#4B5563', font: { size: 11, family: 'Inter' } },
    },
  },
};

// ── Water Level (Line) ────────────────────────────────────────────────────────
interface WaterLevelChartProps {
  labels: string[];
  depthData: number[];
  height?: number;
}

export function WaterLevelChart({ labels, depthData, height = 220 }: WaterLevelChartProps) {
  const data = {
    labels,
    datasets: [{
      label: 'Depth (m BGL)',
      data: depthData,
      borderColor: '#1967D2', // Enterprise Blue
      backgroundColor: 'rgba(25, 103, 210, 0.04)',
      fill: true,
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 2.5,
      pointBackgroundColor: '#1967D2',
    }],
  };

  return (
    <div style={{ height }}>
      <Line data={data} options={{
        ...BASE_OPTIONS,
        scales: {
          ...BASE_OPTIONS.scales,
          y: { 
            ...BASE_OPTIONS.scales.y, 
            reverse: true, 
            title: { display: true, text: 'Depth (m BGL)', color: '#4B5563', font: { size: 11, weight: 'normal' } } 
          },
        },
      }} />
    </div>
  );
}

// ── Extraction vs Recharge (Bar) ──────────────────────────────────────────────
interface ExtractionChartProps {
  labels: string[];
  extractionData: number[];
  rechargeData: number[];
  height?: number;
}

export function ExtractionChart({ labels, extractionData, rechargeData, height = 220 }: ExtractionChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: 'Extraction',
        data: extractionData,
        backgroundColor: 'rgba(220, 38, 38, 0.75)', // Critical Red
        borderColor: '#DC2626',
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: 'Recharge',
        data: rechargeData,
        backgroundColor: 'rgba(5, 150, 105, 0.75)', // Stable Green
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={{
        ...BASE_OPTIONS,
        plugins: {
          ...BASE_OPTIONS.plugins,
          legend: {
            display: true,
            position: 'top' as const,
            labels: { color: '#374151', font: { size: 11 }, boxWidth: 10, boxHeight: 10 },
          },
        },
      }} />
    </div>
  );
}

// ── Rainfall (Bar) ────────────────────────────────────────────────────────────
interface RainfallChartProps {
  labels: string[];
  data: number[];
  height?: number;
}

export function RainfallChart({ labels, data: rainfallData, height = 220 }: RainfallChartProps) {
  const chartData = {
    labels,
    datasets: [{
      label: 'Rainfall (mm)',
      data: rainfallData,
      backgroundColor: 'rgba(37, 99, 235, 0.7)', // Moderate Blue
      borderColor: '#2563EB',
      borderWidth: 1,
      borderRadius: 3,
    }],
  };

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={BASE_OPTIONS} />
    </div>
  );
}

// ── Risk Distribution (Doughnut) ──────────────────────────────────────────────
interface RiskDistributionChartProps {
  data: number[];
  height?: number;
}

export function RiskDistributionChart({ data: riskData, height = 200 }: RiskDistributionChartProps) {
  const chartData = {
    labels: ['Critical', 'High', 'Moderate', 'Low', 'Stable'],
    datasets: [{
      data: riskData,
      backgroundColor: [
        '#DC2626', // Critical
        '#D97706', // High
        '#2563EB', // Moderate
        '#059669', // Low
        'rgba(5, 150, 105, 0.5)', // Stable
      ],
      borderColor: '#FFFFFF',
      borderWidth: 2,
      hoverOffset: 4,
    }],
  };

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        cutout: '70%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom' as const,
            labels: { color: '#374151', font: { size: 11 }, boxWidth: 8, padding: 10 },
          },
          tooltip: BASE_OPTIONS.plugins.tooltip,
        },
      }} />
    </div>
  );
}

// ── Prediction Line (with confidence band placeholder) ────────────────────────
interface PredictionChartProps {
  labels: string[];
  predicted: number[];
  confLow: number[];
  confHigh: number[];
  historical?: number[];
  height?: number;
}

export function PredictionChart({ labels, predicted, confLow, confHigh, historical, height = 260 }: PredictionChartProps) {
  const datasets = [
    ...(historical ? [{
      label: 'Historical',
      data: historical,
      borderColor: '#2563EB',
      backgroundColor: 'transparent',
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 2,
    }] : []),
    {
      label: 'Predicted',
      data: predicted,
      borderColor: '#D97706',
      backgroundColor: 'rgba(217, 119, 6, 0.04)',
      tension: 0.35,
      borderWidth: 2,
      pointRadius: 2.5,
      fill: false,
      borderDash: [4, 4],
    },
    {
      label: 'Confidence Range Upper',
      data: confHigh,
      borderColor: 'transparent',
      backgroundColor: 'rgba(217, 119, 6, 0.05)',
      tension: 0.35,
      borderWidth: 0,
      pointRadius: 0,
      fill: '+1',
    },
    {
      label: 'Confidence Range Lower',
      data: confLow,
      borderColor: 'rgba(217, 119, 6, 0.2)',
      backgroundColor: 'transparent',
      tension: 0.35,
      borderWidth: 1,
      pointRadius: 0,
      borderDash: [2, 2],
    },
  ];

  return (
    <div style={{ height }}>
      <Line
        data={{ labels, datasets }}
        options={{
          ...BASE_OPTIONS,
          plugins: {
            ...BASE_OPTIONS.plugins,
            legend: {
              display: true,
              position: 'top' as const,
              labels: {
                color: '#374151',
                font: { size: 11 },
                boxWidth: 10,
                filter: (item) => !['Confidence Range Upper', 'Confidence Range Lower'].includes(item.text),
              },
            },
          },
          scales: {
            ...BASE_OPTIONS.scales,
            y: { ...BASE_OPTIONS.scales.y, reverse: true },
          },
        }}
      />
    </div>
  );
}

// ── Trend Sparkline (tiny line chart) ─────────────────────────────────────────
interface TrendSparklineProps {
  data: number[];
  color?: 'royal' | 'emerald' | 'amber' | 'red' | 'sky';
  height?: number;
  width?: number;
}

const SPARK_COLORS = {
  royal: '#1967D2',
  emerald: '#059669',
  amber: '#D97706',
  red: '#DC2626',
  sky: '#2563EB',
};

export function TrendSparkline({ data, color = 'royal', height = 32, width = 80 }: TrendSparklineProps) {
  const lineColor = SPARK_COLORS[color] ?? '#1967D2';

  const chartData = {
    labels: data.map((_, i) => i.toString()),
    datasets: [{
      data,
      borderColor: lineColor,
      backgroundColor: 'transparent',
      fill: false,
      tension: 0.3,
      borderWidth: 1.5,
      pointRadius: 0,
    }],
  };

  return (
    <div style={{ height, width, display: 'inline-block' }}>
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        elements: { point: { radius: 0 } },
      }} />
    </div>
  );
}
