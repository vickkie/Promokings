import StaffProfileSettings from "../StaffProfileSettings";
import { ROLES } from "../../../constants";

const StaffSettings = () => <StaffProfileSettings role={ROLES.INVENTORY} profileRoute="InventoryProfile" />;

export default StaffSettings;
