import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_PORT } from "@env"; // Import the env variable in react native defined in babel.conf

const useUpdate = (endpoint) => {
  const [updateStatus, setUpdateStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateData = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before updating data

    try {
      const response = await axios.put(`${BACKEND_PORT}/api/${endpoint}`); // Use the environment variable
      setUpdateStatus(response.status);
    } catch (error) {
      setError(error.message);
      setUpdateStatus(null); // Reset updateStatus in case of error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (endpoint) {
      updateData();
    }
  }, [endpoint]);

  const reupdate = () => {
    setIsLoading(true);
    updateData();
  };

  return { updateStatus, isLoading, error, reupdate };
};

export default useUpdate;
