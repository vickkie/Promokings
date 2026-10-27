import { useState, useEffect } from "react";
import { api, apiUrl } from "../utils/api";
import logger from "../utils/logger";

const usePost = (endpoint, requiresAuth = false, token = null) => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [data, setData] = useState(null);
  const [responseData, setResponseData] = useState(null);

  const handleApiCall = () => {
    const url = apiUrl(endpoint);
    const headers = {};

    if (requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (requiresAuth) {
      logger.warn("Authorization is required but no token was provided.");
    }

    return api.post(url, data, {
      headers,
      validateStatus: (status) => status >= 200 && status < 300,
    });
  };

  const handleSuccess = (response) => {
    setUpdateStatus(response.status);
    setResponseData(response.data);
    const message = response?.data?.message || response.message;
    setErrorMessage(message);
  };

  const handleError = (error) => {
    setError(true);
    const message = error.response?.data?.message || error.message || "An error occurred";
    setErrorMessage(message);
    setUpdateStatus(null);
    logger.error(error);
  };

  const updateData = () => {
    if (!data) return;

    setIsLoading(true);
    setError(false);
    setErrorMessage(null);

    handleApiCall()
      .then(handleSuccess)
      .catch(handleError)
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (endpoint && data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- legacy sync-state pattern kept to preserve behavior
      updateData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional minimal dep set to avoid refetch loops
  }, [endpoint, data]);

  const postData = (data) => {
    setData(data);
  };

  return { responseData, updateStatus, setUpdateStatus, isLoading, error, errorMessage, postData };
};

export default usePost;
