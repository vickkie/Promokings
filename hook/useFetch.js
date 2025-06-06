import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { BACKEND_PORT } from "@env";

// const BACKEND_PORT = "http://192.168.100.218:3000";

console.log(BACKEND_PORT);

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
      const startTime = Date.now(); // Start time for response time logging

      const url = `${BACKEND_PORT}/api/${endpoint}`;

      console.log(url);

      const headers = {};

      if (requiresAuth && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      if (skipCache) {
        headers["X-Skip-Cache"] = "true"; // Add skip cache header if needed
      }

      axios
        .get(url, { headers })
        .then((response) => {
          const endTime = Date.now(); // End time for response time logging
          const responseTime = endTime - startTime; // Calculate response time

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
          console.log(err);
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
      fetchData();
    }
  }, [endpoint, token]);

  return { data, isLoading, error, errorMessage, statusCode, refetch };
};

export default useFetch;
