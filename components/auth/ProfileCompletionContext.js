import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./AuthContext";
import { BACKEND_PORT } from "@env";

const ProfileCompletionContext = createContext();

// Define different required fields for staff and customers
const staffRequiredFields = ["username", "email", "password", "position", "fullName", "staffId", "phoneNumber"];
const staffPositionSpecificFields = {
  driver: ["vehicle", "numberPlate"],
};
const staffRoles = ["inventory", "finance", "admin", "driver", "sales", "supplier", "dispatcher", "customerservice"];

const customerRequiredFields = ["username", "email", "password", "location", "phoneNumber", "firstname", "lastname"];

const supplierRequiredFields = ["name", "email", "phoneNumber", "address"];

const ProfileCompletionProvider = ({ children }) => {
  const { userData } = useContext(AuthContext);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [missingFields, setMissingFields] = useState([]);
  const [message, setMessage] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  // Local calculation for staff
  const updateLocalProfileCompletionForStaff = async (user) => {
    let completedCount = 0;
    let missing = [];

    if (user.position === "supplier") {
      supplierRequiredFields.forEach((field) => {
        if (!user[field]) {
          missing.push(field);
        } else {
          completedCount++;
        }
      });
    } else {
      staffRequiredFields.forEach((field) => {
        if (!user[field]) {
          missing.push(field);
        } else {
          completedCount++;
        }
      });

      if (user.position in staffPositionSpecificFields) {
        staffPositionSpecificFields[user.position].forEach((field) => {
          if (!user[field]) {
            missing.push(field);
          } else {
            completedCount++;
          }
        });
      }
    }

    const totalFields =
      user.position === "supplier"
        ? supplierRequiredFields.length
        : staffRequiredFields.length + (staffPositionSpecificFields[user.position]?.length || 0);
    const completion = ((completedCount / totalFields) * 100).toFixed(2);

    setCompletionPercentage(completion);
    setMissingFields(missing);
    setIsComplete(missing.length === 0);
    await AsyncStorage.setItem("profileCompletion", JSON.stringify({ completion, missing }));
  };

  // Local calculation for customer
  const updateLocalProfileCompletionForCustomer = async (user) => {
    let completedCount = 0;
    let missing = [];

    customerRequiredFields.forEach((field) => {
      if (!user[field]) {
        missing.push(field);
      } else {
        completedCount++;
      }
    });

    const totalFields = customerRequiredFields.length;
    const completion = ((completedCount / totalFields) * 100).toFixed(2);

    setCompletionPercentage(completion);
    setMissingFields(missing);
    await AsyncStorage.setItem("profileCompletion", JSON.stringify({ completion, missing }));
  };

  // API call to sync profile completion from the backend
  const syncProfileCompletionFromServer = async () => {
    if (!userData) return;

    let endpoint = "";
    // console.log(userData?._id);
    if (staffRoles.includes(userData.position)) {
      endpoint = `${BACKEND_PORT}/api/staff/v1/incomplete/${userData._id}`;

      console.log(endpoint);
    } else {
      endpoint = `${BACKEND_PORT}/api/user/v1/incomplete/${userData._id}`;
    }

    try {
      const response = await fetch(endpoint);
      // console.log(response.status);
      if (response.status === 200) {
        const data = await response.json();
        // console.log(data);
        setCompletionPercentage(data.completionPercentage);
        setMissingFields(data.incompleteFields);
        setMessage(data.message);
        setIsComplete(data.isComplete);
        await AsyncStorage.setItem("profileCompletion", JSON.stringify(data));
      } else {
        console.error("Failed to fetch profile completion from server");
      }
    } catch (error) {
      console.error("Error syncing profile completion:", error);
    }
  };

  useEffect(() => {
    if (userData) {
      // Check role and update locally first for instant UI feedback
      if (userData.role === "staff") {
        updateLocalProfileCompletionForStaff(userData);
      } else {
        updateLocalProfileCompletionForCustomer(userData);
      }
      // Then sync with the server
      syncProfileCompletionFromServer();
    }
  }, [userData]);

  const refreshProfileCompletion = async () => {
    const storedCompletion = await AsyncStorage.getItem("profileCompletion");
    if (storedCompletion) {
      const { completion, missing } = JSON.parse(storedCompletion);
      setCompletionPercentage(completion);
      setMissingFields(missing);
      setMessage(message);
      setIsComplete(isComplete);
    }
  };

  return (
    <ProfileCompletionContext.Provider
      value={{
        completionPercentage,
        missingFields,
        message,
        isComplete,
        refreshProfileCompletion,
        syncProfileCompletionFromServer,
      }}
    >
      {children}
    </ProfileCompletionContext.Provider>
  );
};

export { ProfileCompletionContext, ProfileCompletionProvider };
