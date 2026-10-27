import StaffProfileSettings from "../StaffProfileSettings";
import { ROLES } from "../../../constants";

const SalesSettings = () => <StaffProfileSettings role={ROLES.SALES} profileRoute="SalesProfile" />;

export default SalesSettings;
