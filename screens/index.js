import Search from "./Search";
import Profile from "./Profile";
import Home from "./Home";
import Cart from "./Cart";
import ProductDetails from "../components/products/ProductDetails";
import Products from "./Products";
import ProductList from "../components/products/ProductList";
import LoginPage from "./LoginPage";
import Orders from "./Orders";
import Favourites from "./Favourites";
import BackBtn from "../components/BackBtn";
import CustomButton from "../components/Button";
import Register from "./Register";
import Categories from "./Categories";
import Checkout from "./Checkout";
import UserDetails from "./UserDetails";
import LatestProducts from "../components/products/LatestProducts";
import MessageCenter from "./MessageCenter";
import Help from "./Help";
import About from "./About";
import Faqs from "./Faqs";
import SystemMessages from "./SystemMessages";
import OrderSuccess from "./OrderSuccess";
import OrderDetails from "./OrderDetails";
import AboutUs from "./AboutUs";
import SupplierRegister from "./SupplierRegister";

import EditProduct from "./Staff/Inventory/EditProduct";
import AddProduct from "./Staff/Inventory/AddProduct";
import EditProductList from "./Staff/Inventory/ProductList";
import StaffSettings from "./Staff/Inventory/Settings";
import EditCategoriesList from "./Staff/Inventory/CategoriesList";
import AddCategory from "./Staff/Inventory/AddCategory";
import EditCategory from "./Staff/Inventory/EditCategory";
import PreviewProduct from "./Staff/Inventory/PreviewProduct";
import InventoryProfile from "./Staff/Inventory/InventoryProfile";
import MainCenter from "./Staff/Inventory/MainCenter";
import AddBid from "./Staff/Inventory/AddBid";
import BidList from "./Staff/Inventory/BidList";
import FinalBids from "./Staff/Inventory/FinalBids";
import EditBid from "./Staff/Inventory/EditBid";
import BidDetails from "./Staff/Inventory/BidDetails";
//sales

import InvoiceScreen from "./Staff/Sales/InvoiceScreen";
import SalesDashboard from "./Staff/Sales/SalesDashboard";
import OrderSalesDetails from "./Staff/Sales/OrderSalesDetails";
import EditSalesOrder from "./Staff/Sales/EditOrder";
import SalesOverview from "./Staff/Sales/SalesOverview";
import SalesData from "./Staff/Sales/SalesData";
import SalesShipments from "./Staff/Sales/SalesShipment";
import DeliveryDetails from "./Staff/Sales/DeliveryDetails";
import SalesProfile from "./Staff/Sales/salesProfile";
import SalesSettings from "./Staff/Sales/SalesSettings";
import InventoryDashboard from "./Staff/Inventory/InventoryDashboard";
import OrdersSales from "./Staff/Sales/Orders";
import HelpListScreen from "./HelpListScreen";
import HelpAgentChatScreen from "./HelpAgentChatScreen";
import SalesReportScreen from "./Staff/Sales/SalesReportScreen";
import BestProductList from "./Staff/Sales/SalesBest";

//Driver
import DriverDashboard from "./Staff/Driver/DriverDashboard";
import DriverSettings from "./Staff/Driver/DriverSettings";
import DriverProfile from "./Staff/Driver/DriverProfile";
import ShipmentList from "./Staff/Driver/ShipmentList";
import ShipmentHistory from "./Staff/Driver/ShipmentsHIstory";
import ShipmentSearch from "./Staff/Driver/ShipmentSearch";
import ShipmentDetails from "./Staff/Driver/ShipmentDetails";
import EditShipmentDriver from "./Staff/Driver/EditShipment";
import PaymentList from "./Staff/Finance/PaymentsList";

//finance

import FinanceDashboard from "./Staff/Finance/FinanceDashboard";
import OrderPaymentDetails from "./Staff/Finance/OrderPaymentDetails";
import EditPaymentDetails from "./Staff/Finance/EditPaymentDetails";
import EditSupplierPaymentDetails from "./Staff/Finance/EditSupplierPaymentDetails";
import Payments from "./Staff/Finance/Payments";
import PaymentsHistory from "./Staff/Finance/PaymentsHistory";
import FinanceSettings from "./Staff/Finance/FinanceSettings";
import FinanceProfile from "./Staff/Finance/FinanceProfile";
import SupplierPayments from "./Staff/Finance/SupplierPayments";
import SupplierPaymentsDetails from "./Staff/Finance/SupplierPaymentDetails";
import TransactionReceiptScreen from "./Staff/Finance/SupplierInvoiceScreen";

//disp[atcher]

import DriverList from "./Staff/Dispatcher/DriversList";
import DispatchDashboard from "./Staff/Dispatcher/DispatchDashboard";
import EditDispatchOrder from "./Staff/Dispatcher/EditOrder";
import ChatScreen from "./ChatScreen";
import OrderDispatchDetails from "./Staff/Dispatcher/OrderSalesDetails";
import OrdersDispatch from "./Staff/Dispatcher/Orders";
import DispatchShipments from "./Staff/Dispatcher/DispatchShipment";
import DispatcherProfile from "./Staff/Dispatcher/DispatchProfile";
import DispatcherSettings from "./Staff/Dispatcher/DispatchSettings";
import DeliveryDispatchDetails from "./Staff/Dispatcher/DeliveryDetails";
import DriverDetails from "./Staff/Dispatcher/DriverDetails";

// import DriverList as D from "./Staff/Dispatcher/DriversList";

import ChatListScreen from "./ChatListScreen";

//supplier

import SupplierDashboard from "./Staff/Supplier/SupplierDashboard";
import SupplierProfile from "./Staff/Supplier/SupplierProfile";
import SupplierSettings from "./Staff/Supplier/SupplierSettings";
import InventoryRequests from "./Staff/Supplier/InventoryRequests";
import MySupply from "./Staff/Supplier/MySupply";
import SupplyPayments from "./Staff/Supplier/SupplyPayments";
import SupplyDetails from "./Staff/Supplier/SupplyDetails";
import SupplyReceiptScreen from "./Staff/Supplier/SupplyReceiptScreen";
import SupplierPaymentProfile from "./Staff/Supplier/SupplierPaymentProfile";
import CompanyProfile from "./Staff/Supplier/CompanyProfile";
import FinanceReportScreen from "./Staff/Finance/FinanceReportScreen";

export {
  ChatListScreen,
  ChatScreen,
  Home,
  OrderDetails,
  Search,
  OrderSuccess,
  Profile,
  Cart,
  ProductDetails,
  Products,
  ProductList,
  LoginPage,
  Favourites,
  Orders,
  BackBtn,
  CustomButton,
  Register,
  Categories,
  Checkout,
  UserDetails,
  LatestProducts,
  MessageCenter,
  Help,
  About,
  AboutUs,
  Faqs,
  SystemMessages,
  SupplierRegister,

  //inventory
  InventoryDashboard,
  AddProduct,
  AddBid,
  EditProductList,
  EditProduct,
  StaffSettings,
  EditCategoriesList,
  AddCategory,
  EditCategory,
  PreviewProduct,
  InventoryProfile,
  MainCenter,
  BidList,
  FinalBids,
  EditBid,
  BidDetails,

  //sales
  SalesDashboard,
  OrdersSales,
  OrderSalesDetails,
  EditSalesOrder,
  SalesOverview,
  SalesData,
  SalesShipments,
  DeliveryDetails,
  SalesProfile,
  SalesSettings,
  DriverDetails,
  InvoiceScreen,
  BestProductList,
  HelpListScreen,
  HelpAgentChatScreen,

  //Drivers
  DriverDashboard,
  DriverSettings,
  DriverProfile,
  ShipmentList,
  ShipmentHistory,
  ShipmentSearch,
  ShipmentDetails,
  EditShipmentDriver,

  //finance
  FinanceDashboard,
  OrderPaymentDetails,
  EditPaymentDetails,
  PaymentList,
  Payments,
  PaymentsHistory,
  FinanceProfile,
  FinanceSettings,
  SupplierPayments,
  SupplierPaymentsDetails,
  EditSupplierPaymentDetails,
  TransactionReceiptScreen,

  //dispatcher
  DispatchDashboard,
  EditDispatchOrder,
  OrderDispatchDetails,
  OrdersDispatch,
  DispatchShipments,
  DispatcherProfile,
  DispatcherSettings,
  DeliveryDispatchDetails,
  DriverList,

  //supplier
  SupplierDashboard,
  SupplierProfile,
  SupplierSettings,
  InventoryRequests,
  MySupply,
  SupplyPayments,
  SupplyDetails,
  SupplyReceiptScreen,
  SupplierPaymentProfile,
  CompanyProfile,
  SalesReportScreen,
  FinanceReportScreen,
};
