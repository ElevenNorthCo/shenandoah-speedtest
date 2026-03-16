import { useState, useCallback, useRef } from 'react';
import { runSpeedTest, type SpeedTestResult, type TestPhase, type TestProgress } from '../lib/speedtest';
import { detectIsp, matchCarrier, type IspInfo } from '../lib/ispDetect';
import { reverseGeocode, snapToNearestTown, type TownInfo } from '../lib/geocode';

// Geographic center of the Shenandoah Valley — last-resort fallback
// so every result always has a coordinate and appears on the map
const VALLEY_CENTER: TownInfo = {
  town: 'Shenandoah Valley',
  region: 'VA',
  lat: 38.72,
  lng: -78.85,
};

export interface SpeedTestState {
  phase: TestPhase;
  progress: number;
  currentMbps: number;
  statusMessage: string;
  result: SpeedTestResult | null;
  ispInfo: IspInfo | null;
  townInfo: TownInfo | null;
  detectedCarrier: string;
  error: string | null;
}

const initialState: SpeedTestState = {
  phase: 'idle',
  progress: 0,
  currentMbps: 0,
  statusMessage: '',
  result: null,
  ispInfo: null,
  townInfo: null,
  detectedCarrier: '',
  error: null,
};

export function useSpeedTest() {
  const [state, setState] = useState<SpeedTestState>(initialState);
  const abortRef = useRef(false);

  const startTest = useCallback(async () => {
    abortRef.current = false;
    setState({ ...initialState, phase: 'ping', statusMessage: 'ESTABLISHING CONNECTION...' });

    try {
      // Kick off location/ISP detection in parallel with the test
      const locationPromise = navigator.geolocation
        ? new Promise<GeolocationPosition | null>(resolve => {
            navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
              timeout: 8000,
              maximumAge: 60000,
            });
          })
        : Promise.resolve(null);

      const ispPromise = detectIsp();

      // Run the speed test
      const result = await runSpeedTest((progress: TestProgress) => {
        if (abortRef.current) return;
        setState(prev => ({
          ...prev,
          phase: progress.phase,
          progress: progress.progress,
          currentMbps: progress.currentMbps,
          statusMessage: progress.statusMessage,
        }));
      });

      if (abortRef.current) return;

      // Get ISP and location results
      const [position, ispInfo] = await Promise.all([locationPromise, ispPromise]);

      let townInfo: TownInfo;
      if (position) {
        // Best source: browser GPS
        townInfo = await reverseGeocode(position.coords.latitude, position.coords.longitude);
      } else if (ispInfo.lat && ispInfo.lng) {
        // Good fallback: ISP-detected location
        townInfo = await reverseGeocode(ispInfo.lat, ispInfo.lng);
      } else {
        // Last resort: snap to nearest known Valley town using a central coordinate.
        // This ensures every result has a lat/lng and shows on the map.
        townInfo = snapToNearestTown(VALLEY_CENTER.lat, VALLEY_CENTER.lng);
      }

      const detectedCarrier = matchCarrier(ispInfo.isp);

      setState(prev => ({
        ...prev,
        phase: 'complete',
        progress: 100,
        result,
        ispInfo,
        townInfo,
        detectedCarrier,
        error: null,
      }));
    } catch (err) {
      if (abortRef.current) return;
      setState(prev => ({
        ...prev,
        phase: 'error',
        error: err instanceof Error ? err.message : 'Speed test failed. Please try again.',
      }));
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current = true;
    setState(initialState);
  }, []);

  return { state, startTest, reset };
}
