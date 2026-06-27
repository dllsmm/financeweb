import React from 'react';
import {
  Briefcase,
  Laptop,
  TrendingUp,
  Utensils,
  Home,
  ShoppingBag,
  Car,
  Gamepad2,
  ShoppingBasket,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  LayoutDashboard,
  Grid,
  History,
  Settings,
  Calendar,
  Tag,
  CreditCard,
  X,
  PlusCircle,
  Search,
  FileText,
  Filter,
  TrendingDown,
  Info
} from 'lucide-react';

const iconMap = {
  Briefcase,
  Laptop,
  TrendingUp,
  Utensils,
  Home,
  ShoppingBag,
  Car,
  Gamepad2,
  ShoppingBasket,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Trash2,
  LayoutDashboard,
  Grid,
  History,
  Settings,
  Calendar,
  Tag,
  CreditCard,
  X,
  PlusCircle,
  Search,
  FileText,
  Filter,
  TrendingDown,
  Info
};

export type IconName = keyof typeof iconMap;

interface LucideIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  size?: number | string;
  className?: string;
}

export default function LucideIcon({ name, size = 20, className = '', ...props }: LucideIconProps) {
  // Safe lookup with Briefcase fallback
  const IconComponent = iconMap[name as IconName] || Briefcase;
  return <IconComponent size={size} className={className} {...props} />;
}
