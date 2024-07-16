import React from "react";
import HomeIcon from "../assets/svg/home.svg";
import SearchIcon from "../assets/svg/search.svg";
import SearchCircleIcon from "../assets/svg/search-circle.svg";
import UserIcon from "../assets/svg/user.svg";
import UserCircleIcon from "../assets/svg/user-circle.svg";
import MenuIcon from "../assets/svg/menu.svg";
import Menu2Icon from "../assets/svg/menu2.svg";
import CartIcon from "../assets/svg/cart.svg";
import TuningIcon from "../assets/svg/tuning-2.svg";
import CarouselIcon from "../assets/svg/carousel.svg";
import HeartIcon from "../assets/svg/heart.svg";
import Backbutton from "../assets/svg/backbutton.svg";
import Location from "../assets/svg/location.svg";

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
