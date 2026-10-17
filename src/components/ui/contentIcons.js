import {
  Building2, House, Lightbulb, CircuitBoard, Cctv, ShieldCheck, Siren, BatteryCharging, Wrench,
  ClipboardList, Clock, Sparkles, IndianRupee, Users, GraduationCap, School, Hospital,
} from 'lucide-react';

/** Icons for the content in data/services.js and data/company.js (kept out of the data files). */
export const SERVICE_ICONS = {
  'building-wiring': Building2,
  'house-wiring': House,
  lighting: Lightbulb,
  panels: CircuitBoard,
  cctv: Cctv,
  earthing: ShieldCheck,
  'fire-alarm': Siren,
  'backup-power': BatteryCharging,
  amc: Wrench,
};

export const WHY_ICONS = {
  requirement: ClipboardList,
  'on-time': Clock,
  clean: Sparkles,
  safety: ShieldCheck,
  pricing: IndianRupee,
  team: Users,
};

export const CLIENT_TYPE_ICONS = {
  'Coaching institutes': GraduationCap,
  Schools: School,
  Hospitals: Hospital,
};
