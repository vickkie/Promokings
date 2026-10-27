import { ROLES } from "../constants/roles";

// Central route-name constants (MB-QUAL-009). Every Stack.Screen registered
// in App.js plus every nested tab-screen name used as a navigate() target
// lives here so call sites compile against one table instead of literals.
//
// Known dual registrations (both names currently resolve, flag for M5):
// - "EditProductList" (inventory tab) vs "EditProductsList" (root) -> same component
// - "SalesOverviews" / "SalesShipment" (sales tabs) vs "SalesOverview" /
//   "SalesShipments" (root) -> same components
// - "DriverSearch" (driver tab) vs "ShipmentSearch" (root) -> same component

const Routes = {
  // Root role navigators
  BottomNavigation: "Bottom Navigation",
  FinanceNavigation: "Finance Navigation",
  SupplierNavigation: "Supplier Navigation",
  InventoryNavigation: "Inventory Navigation",
  SalesNavigation: "Sales Navigation",
  DriverNavigation: "Driver Navigation",
  DispatchNavigation: "Dispatch Navigation",

  // Auth and shared
  Login: "Login",
  Register: "Register",
  SupplierRegister: "SupplierRegister",
  NoAccess: "NoAccess",
  Home: "Home",
  Search: "Search",
  Profile: "Profile",
  Products: "Products",
  ProductDetails: "ProductDetails",
  ProductList: "ProductList",
  Favourites: "Favourites",
  Categories: "Categories",
  Cart: "Cart",
  Checkout: "Checkout",
  Orders: "Orders",
  OrderDetails: "OrderDetails",
  OrderSuccess: "OrderSuccess",
  UserDetails: "UserDetails",
  Message: "Message",
  Help: "Help",
  HelpListScreen: "HelpListScreen",
  HelpAgentChatScreen: "HelpAgentChatScreen",
  About: "About",
  AboutUs: "AboutUs",
  Faqs: "Faqs",
  SystemMessages: "SystemMessages",
  ChatListScreen: "ChatListScreen",
  ChatScreen: "ChatScreen",

  // Inventory staff
  InventoryDashboard: "InventoryDashboard",
  InventoryMaincenter: "InventoryMaincenter",
  InventoryProfile: "InventoryProfile",
  StaffSettings: "StaffSettings",
  EditCategoriesList: "EditCategoriesList",
  EditCategory: "EditCategory",
  AddCategory: "AddCategory",
  AddProduct: "Add Product",
  EditProduct: "EditProduct",
  EditProductList: "EditProductList",
  EditProductsList: "EditProductsList",
  PreviewProduct: "PreviewProduct",
  AddBid: "AddBid",
  BidList: "BidList",
  FinalBids: "FinalBids",
  EditBid: "EditBid",
  BidDetails: "BidDetails",

  // Sales staff
  SalesDashboard: "SalesDashboard",
  OrdersSales: "OrdersSales",
  OrderSalesDetails: "OrderSalesDetails",
  EditSalesOrder: "EditSalesOrder",
  SalesOverview: "SalesOverview",
  SalesOverviews: "SalesOverviews",
  SalesData: "SalesData",
  SalesShipment: "SalesShipment",
  SalesShipments: "SalesShipments",
  DeliveryDetails: "DeliveryDetails",
  SalesProfile: "SalesProfile",
  SalesSettings: "SalesSettings",
  SalesReportScreen: "SalesReportScreen",
  BestProductList: "BestProductList",
  InvoiceScreen: "InvoiceScreen",

  // Driver staff
  DriverDashboard: "DriverDashboard",
  DriverSettings: "DriverSettings",
  DriverProfile: "DriverProfile",
  DriverSearch: "DriverSearch",
  ShipmentList: "ShipmentList",
  ShipmentHistory: "ShipmentHistory",
  ShipmentSearch: "ShipmentSearch",
  ShipmentDetails: "ShipmentDetails",
  EditShipmentDriver: "EditShipmentDriver",

  // Finance staff
  FinanceDashboard: "FinanceDashboard",
  OrderPaymentDetails: "OrderPaymentDetails",
  EditPaymentDetails: "EditPaymentDetails",
  PaymentList: "PaymentList",
  Payments: "Payments",
  PaymentsHistory: "PaymentsHistory",
  FinanceProfile: "FinanceProfile",
  FinanceSettings: "FinanceSettings",
  FinanceReportScreen: "FinanceReportScreen",
  SupplierPayments: "SupplierPayments",
  SupplierPaymentsDetails: "SupplierPaymentsDetails",
  EditSupplierPaymentDetails: "EditSupplierPaymentDetails",
  TransactionReceiptScreen: "TransactionReceiptScreen",

  // Dispatcher staff
  DispatchDashboard: "DispatchDashboard",
  DriverList: "DriverList",
  DriverDetails: "DriverDetails",
  OrderDispatch: "OrderDispatch",
  OrderDispatchDetails: "OrderDispatchDetails",
  EditDispatchOrder: "EditDispatchOrder",
  DispatchShipments: "DispatchShipments",
  DispatchSettings: "DispatchSettings",
  DispatcherProfile: "DispatcherProfile",
  DeliveryDispatchDetails: "DeliveryDispatchDetails",

  // Supplier staff
  SupplierDashboard: "SupplierDashboard",
  SupplierProfile: "SupplierProfile",
  SupplierSettings: "SupplierSettings",
  SupplierPaymentProfile: "SupplierPaymentProfile",
  CompanyProfile: "CompanyProfile",
  InventoryRequests: "InventoryRequests",
  MySupply: "MySupply",
  SupplyPayments: "SupplyPayments",
  SupplyDetails: "SupplyDetails",
  SupplyReceiptScreen: "SupplyReceiptScreen",
};

// Backend `role` claim -> home navigator. `customer` and unknown roles fall
// through to BottomNavigation by design; `admin` intentionally has no entry
// (admin users live in the separate admin app).
export const ROLE_ROUTES = {
  [ROLES.INVENTORY]: Routes.InventoryNavigation,
  [ROLES.SALES]: Routes.SalesNavigation,
  [ROLES.FINANCE]: Routes.FinanceNavigation,
  [ROLES.DRIVER]: Routes.DriverNavigation,
  [ROLES.DISPATCHER]: Routes.DispatchNavigation,
  [ROLES.SUPPLIER]: Routes.SupplierNavigation,
};

export default Routes;
