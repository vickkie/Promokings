import StaffProfileSettings from "../StaffProfileSettings";
import { ROLES } from "../../../constants";

const DriverSettings = () => <StaffProfileSettings role={ROLES.DRIVER} profileRoute="DriverProfile" />;

export default DriverSettings;
