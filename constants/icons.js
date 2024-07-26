import React from "react";
import HomeIcon from "../assets/svg/home.svg";
import SearchIcon from "../assets/svg/search.svg";
import SearchCircleIcon from "../assets/svg/search-circle.svg";
import UserIcon from "../assets/svg/user.svg";
import UserIconHand from "../assets/svg/user-handup.svg";
import UserCircleIcon from "../assets/svg/user-circle.svg";
import MenuIcon from "../assets/svg/menu.svg";
import Menu2Icon from "../assets/svg/menu2.svg";
import CartIcon from "../assets/svg/cart.svg";
import TrolleyIcon from "../assets/svg/cart-trolley.svg";
import TuningIcon from "../assets/svg/tuning-2.svg";
import CarouselIcon from "../assets/svg/carousel.svg";
import HeartIcon from "../assets/svg/heart.svg";
import Backbutton from "../assets/svg/backbutton.svg";
import Location from "../assets/svg/location.svg";
import PencilIcon from "../assets/svg/pencil.svg";
import Delivery from "../assets/svg/delivery.svg";

import HomeFilledIcon from "../assets/svg/home-filled.svg";
import UserCircleFilledIcon from "../assets/svg/user-circle-filled.svg";
import Menu2filledIcon from "../assets/svg/menu2-filled.svg";
import SearchCircleFilledIcon from "../assets/svg/search-circle-filled.svg";
import HeartFilledIcon from "../assets/svg/heart-filled.svg";
import CloseCircleIcon from "../assets/svg/close-circle.svg";
import DeleteIcon from "../assets/svg/delete.svg";
import MinusIcon from "../assets/svg/minus-circle.svg";
import AddIcon from "../assets/svg/add-circle.svg";
import DownIcon from "../assets/svg/down.svg";
import UpIcon from "../assets/svg/up.svg";
import LogoutIcon from "../assets/svg/logout.svg";
import Message from "../assets/svg/message-circle.svg";
import MessageHelp from "../assets/svg/message-help.svg";
import MessageFilled from "../assets/svg/message-filled.svg";
import Customerservice from "../assets/svg/customer-service.svg";
import Bellfilled from "../assets/svg/bell-filled.svg";
import Faqs from "../assets/svg/faqs.svg";
import Forward from "../assets/svg/forward.svg";
import CameraFilled from "../assets/svg/camera-filled.svg";
import SendFilled from "../assets/svg/send-filled.svg";
import Cancel from "../assets/svg/cancel.svg";
import Cartcheck from "../assets/svg/cart-check.svg";

const iconMap = {
  home: HomeIcon,
  search: SearchIcon,
  user: UserIcon,
  menu: MenuIcon,
  cart: CartIcon,
  backbutton: Backbutton,
  tuning: TuningIcon,
  carousel: CarouselIcon,
  homefilled: HomeFilledIcon,
  usercircle: UserCircleIcon,
  usercirclefilled: UserCircleFilledIcon,
  menu2: Menu2Icon,
  menu2filled: Menu2filledIcon,
  searchcircle: SearchCircleIcon,
  searchcirclefilled: SearchCircleFilledIcon,
  heart: HeartIcon,
  heartfilled: HeartFilledIcon,
  close: CloseCircleIcon,
  location: Location,
  delete: DeleteIcon,
  minus: MinusIcon,
  add: AddIcon,
  up: UpIcon,
  down: DownIcon,
  userhandup: UserIconHand,
  delivery: Delivery,
  trolley: TrolleyIcon,
  pencil: PencilIcon,
  logout: LogoutIcon,
  message: Message,
  messagehelp: MessageHelp,
  messagefilled: MessageFilled,
  customerservice: Customerservice,
  bellfilled: Bellfilled,
  faqs: Faqs,
  forward: Forward,
  camerafilled: CameraFilled,
  sendfilled: SendFilled,
  cancel: Cancel,
  cartcheck: Cartcheck,
};

const Icon = ({ name, size = 24, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found.`);
    return null;
  }

  return <IconComponent width={size} height={size} {...props} />;
};

export default Icon;
