import { useState, useEffect } from "react";
import axios from "axios";
// const dontenv = require("dotenv");
// const mock = require("../assets/data/mockdata.json");

const useFetch = () => {
  // dontenv.config();

  // console.log(mock);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // const port = process.env.BACKEND_PORT;

  const fetchData = async () => {
    setIsLoading(true);
    setError(null); // Reset error state before fetching data

    try {
      const response = await axios.get(`http://192.168.100.229:3000/api/products`);
      // const response = await axios.get(`${port}/api/products`);
      // const response = { data: mock }; // Mocking the API responsea
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
