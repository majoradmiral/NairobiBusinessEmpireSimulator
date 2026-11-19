import type { Commodity, District, DistrictId, MarketState } from '../sim/types';

export const DISTRICTS: District[] = [
  { id: 'cbd', name: 'CBD', center: { lat: -1.2834, lng: 36.8219 }, zone: 'cbd', footTraffic: 0.82, rentIndex: 2.4, enforcement: 0.7, landValue: 0.9, vitality: 0.8, sentiment: 0.5 },
  { id: 'westlands', name: 'Westlands', center: { lat: -1.2636, lng: 36.8006 }, zone: 'cbd', footTraffic: 0.74, rentIndex: 2.1, enforcement: 0.4, landValue: 0.85, vitality: 0.82, sentiment: 0.62 },
  { id: 'eastleigh', name: 'Eastleigh', center: { lat: -1.283, lng: 36.846 }, zone: 'market', footTraffic: 0.78, rentIndex: 1.3, enforcement: 0.55, landValue: 0.55, vitality: 0.7, sentiment: 0.46 },
  { id: 'kibra', name: 'Kibra', center: { lat: -1.304, lng: 36.797 }, zone: 'informal', footTraffic: 0.6, rentIndex: 0.7, enforcement: 0.65, landValue: 0.3, vitality: 0.48, sentiment: 0.4 },
  { id: 'gikomba', name: 'Gikomba', center: { lat: -1.286, lng: 36.838 }, zone: 'market', footTraffic: 0.88, rentIndex: 1.1, enforcement: 0.75, landValue: 0.5, vitality: 0.66, sentiment: 0.52 },
  { id: 'kilimani', name: 'Kilimani', center: { lat: -1.293, lng: 36.788 }, zone: 'residential', footTraffic: 0.55, rentIndex: 1.9, enforcement: 0.3, landValue: 0.78, vitality: 0.72, sentiment: 0.6 },
  { id: 'embakasi', name: 'Embakasi', center: { lat: -1.319, lng: 36.931 }, zone: 'informal', footTraffic: 0.5, rentIndex: 0.8, enforcement: 0.45, landValue: 0.35, vitality: 0.52, sentiment: 0.44 },
  { id: 'thika', name: 'Thika Road Corridor', center: { lat: -1.25, lng: 36.85 }, zone: 'corridor', footTraffic: 0.68, rentIndex: 1.0, enforcement: 0.5, landValue: 0.48, vitality: 0.6, sentiment: 0.5 },
  { id: 'chuo', name: 'Chuo University Town', center: { lat: -1.29, lng: 36.93 }, zone: 'university', footTraffic: 0.7, rentIndex: 0.9, enforcement: 0.35, landValue: 0.4, vitality: 0.64, sentiment: 0.58 },
];

export const COMMODITIES: Commodity[] = [
  { id: 'mboga', name: 'Mama mboga vegetables', basePrice: 40, elasticity: 0.7, transportSensitivity: 0.5 },
  { id: 'mitumba', name: 'Gikomba second-hand clothes', basePrice: 350, elasticity: 0.9, transportSensitivity: 0.3 },
  { id: 'maize', name: 'Maize flour', basePrice: 120, elasticity: 0.5, transportSensitivity: 0.6 },
  { id: 'matatu', name: 'Matatu rides', basePrice: 60, elasticity: 0.6, transportSensitivity: 1.0 },
  { id: 'airtime', name: 'Mobile airtime', basePrice: 100, elasticity: 0.3, transportSensitivity: 0.1 },
];

export function makeDistricts(): Record<DistrictId, District> {
  return Object.fromEntries(DISTRICTS.map((district) => [district.id, { ...district }]));
}

export function makeCommodities(): Record<string, Commodity> {
  return Object.fromEntries(COMMODITIES.map((commodity) => [commodity.id, { ...commodity }]));
}

export function makeMarkets(): Record<string, MarketState> {
  const markets: Record<string, MarketState> = {};
  for (const district of DISTRICTS) {
    for (const commodity of COMMODITIES) {
      const key = `${district.id}:${commodity.id}`;
      markets[key] = {
        key,
        districtId: district.id,
        commodityId: commodity.id,
        supply: 60,
        demand: 70,
        price: commodity.basePrice,
        inventory: 20,
      };
    }
  }
  return markets;
}

export function universityDistrictId(): DistrictId {
  return DISTRICTS.find((district) => district.zone === 'university')?.id ?? DISTRICTS[0].id;
}
