import { useEffect, useState } from "react";
import { locationService } from "../services/locationService";
import { LocationEntry } from "../types/locationTypes";

export function useLocationData() {
  const [data, setData] = useState<LocationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = localStorage.getItem("accessToken");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);  // ✅ Clear previous errors
      
      const res = await locationService.getAll(accessToken || "");
      
      // ✅ Type guard for nested data structure
      if (res.data && 'data' in res.data) {
        setData(res.data.data || []);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load locations");
      setData([]);  // ✅ Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {  // ✅ Only load if token exists
      loadData();
    } else {
      setLoading(false);
      setError("No access token found");
    }
  }, []);  // ✅ Add accessToken as dependency if it can change

  return { data, loading, error, refetch: loadData };
}