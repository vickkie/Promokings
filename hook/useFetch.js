import { useState, useEffect, useCallback } from "react";
import { api, apiUrl } from "../utils/api";

const useFetch = (endpoint, requiresAuth = false, token = null) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [statusCode, setStatusCode] = useState(null);

  // Function to handle the API call
  const fetchData = useCallback(
    (skipCache = false) => {
      setIsLoading(true);
      setError(null); // Reset error state before fetching data
      Date.now(); // Start time for response time logging

      const url = apiUrl(endpoint);

      const headers = {};

      if (requiresAuth && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (skipCache) {
        headers["X-Skip-Cache"] = "true"; // Add skip cache header if needed
      }

      api
        .get(url, { headers })
        .then((response) => {
          Date.now(); // End time for response time logging
 // Calculate response time

          setData(response.data); // Save the fetched data
          setStatusCode(response?.status);
          setErrorMessage(null);
          setError(false);
        })
        .catch((err) => {
          const message = err.response?.data?.message || err.message || "An error occurred";
          setErrorMessage(message);
          setStatusCode(err.response?.status || null);
          setError(true);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [endpoint, requiresAuth, token]
  );

  const refetch = () => {
    // setIsLoading(true);

    fetchData(true); // Pass `true` to skip cache when refetching
  };

  useEffect(() => {
    if (endpoint) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy sync-state pattern kept to preserve behavior
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional minimal dep set to avoid refetch loops
  }, [endpoint, token]);

  return { data, isLoading, error, errorMessage, statusCode, refetch };
};

export default useFetch;
