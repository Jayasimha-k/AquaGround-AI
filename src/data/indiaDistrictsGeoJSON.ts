export interface DistrictGeoJSONFeature {
  type: "Feature";
  properties: {
    district: string;
    state: string;
    risk_level: "Safe" | "Semi-Critical" | "Critical" | "Over-Exploited";
    water_level_mbgl: number;
    gsi_score: number;
  };
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export const INDIA_DISTRICTS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        district: "Jaipur",
        state: "Rajasthan",
        risk_level: "Critical",
        water_level_mbgl: 18.4,
        gsi_score: 42
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.5, 27.2], [76.1, 27.2], [76.1, 26.6], [75.5, 26.6], [75.5, 27.2]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        district: "Jodhpur",
        state: "Rajasthan",
        risk_level: "Over-Exploited",
        water_level_mbgl: 24.1,
        gsi_score: 28
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [72.6, 26.6], [73.5, 26.6], [73.5, 25.8], [72.6, 25.8], [72.6, 26.6]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        district: "Ludhiana",
        state: "Punjab",
        risk_level: "Over-Exploited",
        water_level_mbgl: 22.8,
        gsi_score: 31
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [75.5, 31.1], [76.2, 31.1], [76.2, 30.6], [75.5, 30.6], [75.5, 31.1]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        district: "Bengaluru",
        state: "Karnataka",
        risk_level: "Semi-Critical",
        water_level_mbgl: 14.2,
        gsi_score: 58
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.4, 13.2], [77.8, 13.2], [77.8, 12.7], [77.4, 12.7], [77.4, 13.2]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        district: "Coimbatore",
        state: "Tamil Nadu",
        risk_level: "Safe",
        water_level_mbgl: 11.7,
        gsi_score: 76
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [76.7, 11.3], [77.2, 11.3], [77.2, 10.8], [76.7, 10.8], [76.7, 11.3]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        district: "Agra",
        state: "Uttar Pradesh",
        risk_level: "Critical",
        water_level_mbgl: 15.9,
        gsi_score: 46
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [77.7, 27.4], [78.3, 27.4], [78.3, 26.9], [77.7, 26.9], [77.7, 27.4]
          ]
        ]
      }
    }
  ]
};
