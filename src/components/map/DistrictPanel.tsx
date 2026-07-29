// =============================================================================
// DistrictPanel — Floating right panel when a district is selected on the map
// =============================================================================

import React from 'react';
import {
  X, MapPin, Activity, WifiOff, TrendingDown, TrendingUp,
  Minus, Droplets, CloudRain, Brain, Lightbulb, AlertTriangle,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { WaterLevelChart } from '@/components/charts';
import { RISK_COLORS } from '@/constants';
import { MOCK_ALERTS } from '@/constants/mockData';
import { formatDistanceToNow } from 'date-fns';

export function DistrictPanel() {
  const { state, selectDistrict } = useApp();
  const district = state.selectedDistrict;

  if (!district) return null;

  const districtAlerts = MOCK_ALERTS.filter(a => a.districtId === district.id);
  const riskColor = RISK_COLORS[district.riskLevel];

  const TrendIcon = district.trend === 'up' ? TrendingUp
    : district.trend === 'down' ? TrendingDown
    : Minus;

  return (
    <div
      className="absolute right-4 top-4 bottom-4 z-[999] w-80 flex flex-col bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden animate-[fadeInUp_0.2s_ease-out]"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100" style={{ borderLeft: `4px solid ${riskColor}` }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{district.name}</h2>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
              <MapPin size={11} className="text-gray-400" />
              {district.state}
            </div>
          </div>
          <button
            onClick={() => selectDistrict(null)}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Health Score */}
        <div className="mt-3 flex items-center gap-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
          <div className="relative w-12 h-12 shrink-0">
            <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#E5E7EB" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="22"
                fill="none"
                stroke={riskColor}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - district.healthScore / 100)}`}
              />
            </svg>
            <span
              className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800"
            >
              {district.healthScore}
            </span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Health Status</p>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge variant={district.riskLevel} size="sm" />
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-0.5 text-xs font-medium" style={{ color: district.trend === 'down' ? '#DC2626' : district.trend === 'up' ? '#059669' : '#4B5563' }}>
                <TrendIcon size={11} />
                <span className="capitalize">{district.trend}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'GW Depth', value: `${district.groundwaterDepth} m BGL`, icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Rainfall', value: `${district.rainfall} mm`, icon: CloudRain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Active DWLR', value: district.activeSensors.toString(), icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Offline DWLR', value: district.offlineSensors.toString(), icon: WifiOff, color: 'text-gray-500', bg: 'bg-gray-100' },
          ].map(metric => (
            <div key={metric.label} className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`p-1 rounded ${metric.bg} ${metric.color}`}>
                  <metric.icon size={11} />
                </span>
                <span className="text-[10px] font-medium text-gray-500">{metric.label}</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Extraction vs Recharge */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2.5">
          <h3 className="text-xs font-semibold text-gray-700">Water Balance (MCM/yr)</h3>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Recharge</span>
              <span className="text-green-700 font-semibold">{district.rechargeRate} MCM</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 rounded-full" style={{ width: `${Math.min(100, (district.rechargeRate / 15) * 100)}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500 font-medium">Extraction</span>
              <span className="text-red-600 font-semibold">{district.extractionRate} MCM</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-red-600 rounded-full" style={{ width: `${Math.min(100, (district.extractionRate / 15) * 100)}%` }} />
            </div>
          </div>
        </div>

        {/* 30-Day Trend Chart */}
        <div className="border border-gray-100 rounded-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 mb-2">Groundwater Trend (30-day)</h3>
          <WaterLevelChart
            labels={district.waterLevelHistory.slice(-10).map((_, i) => `D-${10 - i}`)}
            depthData={district.waterLevelHistory.slice(-10).map(r => r.depth)}
            height={100}
          />
        </div>

        {/* Recent Alerts */}
        {districtAlerts.length > 0 && (
          <div className="space-y-1.5">
            <h3 className="text-xs font-semibold text-gray-700 flex items-center gap-1">
              <AlertTriangle size={12} className="text-amber-500" />
              Active Alerts ({districtAlerts.length})
            </h3>
            <div className="space-y-1.5">
              {districtAlerts.slice(0, 2).map(alert => (
                <div key={alert.id} className={`p-2.5 rounded border text-xs ${
                  alert.severity === 'critical' ? 'bg-red-50 border-red-100 text-red-800' :
                  alert.severity === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                  'bg-blue-50 border-blue-100 text-blue-800'
                }`}>
                  <p className="font-semibold">{alert.type}</p>
                  <p className="text-gray-600 mt-0.5 leading-snug">{alert.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decision Support Placeholder */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain size={13} className="text-blue-700" />
            <h4 className="text-xs font-semibold text-blue-800">Forecast / Interventions</h4>
          </div>
          <p className="text-[11px] text-gray-600 leading-normal">
            Automated recommendations for this region are managed in the <span className="font-semibold text-blue-700">Decision Support</span> workspace.
          </p>
        </div>

      </div>
    </div>
  );
}
