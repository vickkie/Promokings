import { useState } from "react";
import axios from "axios";
import { BACKEND_PORT } from "@env"; // Import the env variable in react native defined in babel.conf

const useDelete = (baseEndpoint) => {
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const deleteData = async (id, onSuccessCallback) => {
    setIsDeleting(true);
    setErrorStatus(null); // Reset error state before updating data

    try {
      // console.log(`${baseEndpoint}${id}`);
      const response = await axios.delete(`${BACKEND_PORT}/api/${baseEndpoint}${id}`); // Use the environment variable

      setDeleteStatus(response.status);
      if (onSuccessCallback) {
        onSuccessCallback(); // Call the callback function
      }
    } catch (error) {
      setErrorStatus(error.message);
      setDeleteStatus(null); // Reset deleteStatus in case of error
    } finally {
      setIsDeleting(false);
    }
  };

  const redelete = (id, onSuccessCallback) => {
    deleteData(id, onSuccessCallback);
  };

  return { deleteStatus, isDeleting, errorStatus, redelete };
};

export default useDelete;
