import React from "react";
import HomeIcon from "../assets/svg/home.svg";
import SearchIcon from "../assets/svg/search.svg";
import UserIcon from "../assets/svg/user.svg";
import MenuIcon from "../assets/svg/menu.svg";
import CartIcon from "../assets/svg/cart.svg";
import TuningIcon from "../assets/svg/tuning-2.svg";

const iconMap = {
  home: HomeIcon,
  search: SearchIcon,
  user: UserIcon,
  menu: MenuIcon,
  cart: CartIcon,
  tuning: TuningIcon,
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
