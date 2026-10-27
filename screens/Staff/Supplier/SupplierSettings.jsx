import React from "react";
import StaffProfileSettings from "../StaffProfileSettings";
import Icon from "../../../constants/icons";
import { COLORS, ROLES } from "../../../constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SupplierSettings = () => (
  <StaffProfileSettings
    role={ROLES.SUPPLIER}
    profileRoute="SupplierProfile"
    messageRoute="ChatListScreen"
    messageIcon={<Icon name="discuss" size={28} color={COLORS.primary} />}
    profileLabel="Account profile"
    aboutLabel="About Us"
    nameBadgeColor={COLORS.secondary}
    allowDeleteAccount={false}
    topItems={[
      {
        label: "Company profile",
        route: "CompanyProfile",
        icon: <MaterialCommunityIcons name="office-building" size={24} color={COLORS.primary} />,
      },
    ]}
    bottomItems={[
      {
        label: "Payment Details",
        route: "SupplierPaymentProfile",
        icon: <MaterialCommunityIcons name="bank" size={24} color={COLORS.primary} />,
      },
    ]}
  />
);

export default SupplierSettings;
