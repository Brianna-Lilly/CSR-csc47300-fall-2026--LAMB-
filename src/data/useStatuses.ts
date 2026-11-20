import { useCallback, useEffect, useState } from "react";

import { fetchStatuses, type StatusMap } from "./buildingData";

export function useStatuses() {
  const [statuses, setStatuses] = useState<StatusMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    fetchStatuses()
      .then((data) => {
        setStatuses(data);
        setError("");
      })
      .catch(() => setError("Couldn't reach the server, status may be out of date."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60 * 1000);
    return () => clearInterval(timer);
  }, [refresh]);

  return { statuses, loading, error, refresh };
}
