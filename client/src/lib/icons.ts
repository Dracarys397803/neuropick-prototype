/**
 * 名字 → lucide 图标组件的映射。
 *
 * 把所有项目里用到的 lucide 图标登记在这里，
 * dimensions/categories 配置只引用名字字符串，不直接 import 组件。
 */
import {
  Cpu, BatteryCharging, Feather, Monitor, Hammer, Coins,
  Camera, Headphones, Music, Network, Smartphone, Laptop,
  Tablet, Watch, Gamepad2,
  Home, Compass, Scale, Heart, FileText, MessageCircle, Trophy, UserCircle,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Cpu, BatteryCharging, Feather, Monitor, Hammer, Coins,
  Camera, Headphones, Music, Network, Smartphone, Laptop,
  Tablet, Watch, Gamepad2,
  Home, Compass, Scale, Heart, FileText, MessageCircle, Trophy, UserCircle,
};

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Cpu;
}
