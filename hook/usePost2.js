import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_PORT } from "@env";

const usePost2 = (endpoint, requiresAuth = false, token = null) => {
  const backendUrl = BACKEND_PORT;
  let [updateStatus, setUpdateStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [data, setData] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const isDevelopment = process.env.NODE_ENV === "development";

  const handleApiCall = () => {
    const url = `${backendUrl}/api/${endpoint}`;
    // Create a headers object
    const headers = {};
    // console.log(url);

    // Check if authorization is required and token is provided
    if (requiresAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    } else if (requiresAuth) {
      // console.warn("Authorization is required but no token was provided.");
    }

    return axios.post(url, data, {
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
    // console.log(error);
  };

  const handleFinally = () => {
    setIsLoading(false);
  };

  const updateData = () => {
    if (!data) return;

    setIsLoading(true);
    setError(false);
    setErrorMessage(null);

    handleApiCall().then(handleSuccess).catch(handleError).finally(handleFinally);
  };

  useEffect(() => {
    if (endpoint && data) {
      updateData();
    }
  }, [endpoint, data]);

  const postData = (data) => {
    // console.log(data);
    setData(data);
  };

  return { responseData, updateStatus, setUpdateStatus, isLoading, error, errorMessage, postData };
};

export default usePost2;
