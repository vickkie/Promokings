import StaffProfileSettings from "../StaffProfileSettings";
import { ROLES } from "../../../constants";

const DispatcherSettings = () => (
  <StaffProfileSettings role={ROLES.DISPATCHER} profileRoute="DispatcherProfile" messageRoute="ChatListScreen" />
);

export default DispatcherSettings;
