import math
import random
from datetime import datetime, timedelta
from typing import Dict, Any, List

class ForecastingService:
    def generate_forecast(
        self,
        district: str,
        rainfall_trend_pct: float = 0.0,
        extraction_change_pct: float = 0.0
    ) -> Dict[str, Any]:
        """
        Generates statistical groundwater depth (m bgl - meters below ground level) forecast.
        Higher m bgl means deeper water table (worse condition).
        """
        # Baseline depth seed depending on district name length
        base_depth = 8.5 + (hash(district) % 15)
        
        # Historical 12 months data
        now = datetime.now()
        time_series = []
        
        # Monthly seasonality factors (Monsoon recharge in June-Sept decreases m bgl)
        seasonality = [0.4, 0.5, 0.3, 0.1, -0.2, -1.2, -2.5, -3.0, -2.2, -1.0, -0.2, 0.2]
        
        # Generate 12 months past data
        for i in range(12, 0, -1):
            past_date = now - timedelta(days=i * 30)
            month_idx = (past_date.month - 1) % 12
            s_effect = seasonality[month_idx]
            noise = (random.random() - 0.5) * 0.4
            
            # Trend component (+0.12m bgl depletion rate per month baseline)
            trend = (12 - i) * 0.12
            val = round(max(1.5, base_depth + trend + s_effect + noise), 2)
            
            time_series.append({
                "date": past_date.strftime("%b %Y"),
                "historical": val,
                "forecast": None,
                "lower_ci": None,
                "upper_ci": None,
                "recharge_factor": round(max(0, -s_effect * 20), 1)
            })
            
        current_depth = time_series[-1]["historical"]
        
        # Add current month point
        time_series.append({
            "date": "Current",
            "historical": current_depth,
            "forecast": current_depth,
            "lower_ci": current_depth,
            "upper_ci": current_depth,
            "recharge_factor": 15.0
        })

        # Future 6 months forecast
        last_val = current_depth
        predicted_90d = current_depth
        
        for f in range(1, 7):
            future_date = now + timedelta(days=f * 30)
            month_idx = (future_date.month - 1) % 12
            s_effect = seasonality[month_idx]
            
            # Impact of user parameter adjustments
            rain_impact = -(rainfall_trend_pct / 100.0) * 0.8
            ext_impact = (extraction_change_pct / 100.0) * 1.1
            net_monthly_delta = 0.15 + rain_impact + ext_impact + (s_effect * 0.4)
            
            last_val = max(1.0, last_val + net_monthly_delta)
            
            # Confidence bounds widen over time
            ci_spread = 0.3 + (f * 0.25)
            
            f_val = round(last_val, 2)
            lower_ci = round(max(0.5, last_val - ci_spread), 2)
            upper_ci = round(last_val + ci_spread, 2)
            
            if f == 3:
                predicted_90d = f_val
                
            time_series.append({
                "date": future_date.strftime("%b %Y"),
                "historical": None,
                "forecast": f_val,
                "lower_ci": lower_ci,
                "upper_ci": upper_ci,
                "recharge_factor": round(max(0, 20.0 - (f_val * 0.8)), 1)
            })
            
        diff = predicted_90d - current_depth
        if diff > 1.2:
            trend_status = "Rapidly Depleting (Critical)"
        elif diff > 0.4:
            trend_status = "Moderate Depletion (Warning)"
        elif diff < -0.4:
            trend_status = "Significant Recharge (Improving)"
        else:
            trend_status = "Stable Water Table"

        return {
            "district": district,
            "current_depth_mbgl": current_depth,
            "predicted_90d_depth_mbgl": predicted_90d,
            "trend_status": trend_status,
            "time_series": time_series
        }

forecasting_service = ForecastingService()
