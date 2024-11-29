import axios from 'axios';

const BASE_URL = 'https://hst-api.wialon.com/wialon/ajax.html';

export interface WialonVehicleData {
  plateNumber: string;
  fuelConsumption: number;
  fuelFilled: number;
  fuelDrain: number;
  travelledKM: number;
  engineHours: number;
  ecoDriver: number;
  driverRank: number;
  tripCount: number;
}

export interface WialonCredentials {
  apiToken?: string;
}

export const loginToWialon = async (credentials: WialonCredentials): Promise<string | null> => {
  try {
    if (!credentials.apiToken) {
      throw new Error('API token is required');
    }

    const response = await axios.get(`${BASE_URL}`, {
      params: {
        svc: 'token/login',
        token: credentials.apiToken
      }
    });

    if (response.data.error) {
      throw new Error(`Login failed: ${response.data.error}`);
    }

    return response.data.eid;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

export const fetchVehicleData = async (
  sid: string, 
  vehicleId: string, 
  credentials: WialonCredentials
): Promise<WialonVehicleData | null> => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        svc: 'core/search_items',
        sid,
        params: JSON.stringify({
          id: vehicleId,
          flags: 1
        })
      }
    });

    if (response.data.error) {
      throw new Error(`Data fetch failed: ${response.data.error}`);
    }

    const vehicle = response.data.items[0];
    return {
      plateNumber: vehicle.nm,
      fuelConsumption: vehicle.prp.fuel_consumption,
      fuelFilled: vehicle.prp.fuel_filled,
      fuelDrain: vehicle.prp.fuel_drain,
      travelledKM: vehicle.prp.mileage,
      engineHours: vehicle.prp.engine_hours,
      ecoDriver: vehicle.prp.eco_driver_score,
      driverRank: vehicle.prp.driver_rank,
      tripCount: vehicle.prp.trip_count
    };
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return null;
  }
};

export const executeWialonReport = async (
  sid: string,
  type: string,
  params: any,
  credentials: WialonCredentials
) => {
  try {
    const response = await axios.get(`${BASE_URL}`, {
      params: {
        svc: 'report/exec_report',
        sid,
        params: JSON.stringify({
          reportResourceId: params.resourceId,
          reportTemplateId: params.templateId,
          reportObjectId: params.unitId,
          reportObjectSecId: 0,
          interval: {
            from: Date.now() / 1000 - parseInt(params.interval),
            to: Date.now() / 1000,
            flags: 0
          }
        })
      }
    });

    if (response.data.error) {
      throw new Error(`Report execution failed: ${response.data.error}`);
    }

    return response.data;
  } catch (error) {
    console.error('Error executing report:', error);
    throw error;
  }
};