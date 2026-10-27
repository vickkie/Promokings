import React from "react";
import StaffProfileSettings from "../StaffProfileSettings";
import Icon from "../../../constants/icons";
import { COLORS } from "../../../constants";

const FinanceSettings = () => (
  <StaffProfileSettings
    role="finance"
    profileRoute="FinanceProfile"
    bottomItems={[
      {
        label: "Financial Report",
        route: "FinanceReportScreen",
        icon: <Icon name="treebox" size={24} color={COLORS.primary} />,
      },
    ]}
  />
);

export default FinanceSettings;
