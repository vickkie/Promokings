import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_PORT } from "@env"; // Import the env variable in react native defined in babel.conf

const usePost = (endpoint) => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const updateData = async () => {
    if (!data) return;

    setIsLoading(true);
    setError(null); // Reset error state before updating data

    try {
      const response = await axios.post(`${BACKEND_PORT}/api/${endpoint}`, data);

      console.log(data);
      setUpdateStatus(response.status);
    } catch (error) {
      setError(error.message);
      setUpdateStatus(null); // Reset updateStatus in case of error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (endpoint && data) {
      updateData();
    }
  }, [endpoint, data]);

  const addCart = (data) => {
    setData(data);
    console.log(data);
  };

  return { updateStatus, isLoading, error, addCart };
};

export default usePost;
