import { useState } from "react";
import { api, apiUrl } from "../utils/api";

const useDelete = (baseEndpoint) => {
  const [deleteStatus, setDeleteStatus] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorStatus, setErrorStatus] = useState(null);

  const deleteData = async (id, onSuccessCallback) => {
    setIsDeleting(true);
    setErrorStatus(null); // Reset error state before updating data

    try {
      const response = await api.delete(apiUrl(`${baseEndpoint}${id}`));

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
