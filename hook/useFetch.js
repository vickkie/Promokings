import { useState, useEffect } from "react";
import axios from "axios";
import { BACKEND_PORT } from "@env"; // Import the env variable in react native defined in babel.conf

const useFetch = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before fetching data

    try {
      const response = await axios.get(`${BACKEND_PORT}/api/products`); // Use the environment variable
      // const response = await axios.get(`http://192.168.100.250:3001/api/products`);
      setData(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    setIsLoading(true);
    fetchData();
  };

  return { data, isLoading, error, refetch };
};

export default useFetch;
