export interface GSIResult {
  gsi_score: number; // 0 to 100
  soe_pct: number;   // Stage of Extraction %
  status_category: "Safe" | "Semi-Critical" | "Critical" | "Over-Exploited";
  color_hex: string;
  recharge_vs_discharge_ratio: number;
}

export function calculateGSI(
  water_level_mbgl: number,
  annual_recharge_mcm: number,
  annual_extraction_mcm: number,
  rainfall_deficit_pct: number = 0
): GSIResult {
  // Stage of Groundwater Extraction (SOE) = (Extraction / Recharge) * 100
  const raw_soe = annual_recharge_mcm > 0 ? (annual_extraction_mcm / annual_recharge_mcm) * 100 : 100;
  const soe_pct = Math.round(raw_soe * 10) / 10;
  
  // Depth factor score (0-100, where 0m bgl = 100 score, >30m bgl = 0 score)
  const depth_score = Math.max(0, 100 - (water_level_mbgl * 3.33));
  
  // SOE factor score (100 if SOE <= 70%, 0 if SOE >= 140%)
  const soe_score = Math.max(0, Math.min(100, 100 - ((raw_soe - 70) * 1.43)));
  
  // Rainfall score
  const rain_score = Math.max(0, Math.min(100, 50 - (rainfall_deficit_pct * 1.5)));
  
  // Weighted Composite GSI Score
  const gsi_score = Math.round((depth_score * 0.35) + (soe_score * 0.45) + (rain_score * 0.20));
  
  let status_category: GSIResult["status_category"] = "Safe";
  let color_hex = "#10B981"; // green
  
  if (soe_pct > 100 || water_level_mbgl > 20) {
    status_category = "Over-Exploited";
    color_hex = "#EF4444"; // red
  } else if (soe_pct > 90 || water_level_mbgl > 15) {
    status_category = "Critical";
    color_hex = "#F97316"; // orange
  } else if (soe_pct > 70 || water_level_mbgl > 10) {
    status_category = "Semi-Critical";
    color_hex = "#F59E0B"; // yellow
  }
  
  const ratio = annual_recharge_mcm > 0 ? Math.round((annual_extraction_mcm / annual_recharge_mcm) * 100) / 100 : 1;

  return {
    gsi_score,
    soe_pct,
    status_category,
    color_hex,
    recharge_vs_discharge_ratio: ratio
  };
}
