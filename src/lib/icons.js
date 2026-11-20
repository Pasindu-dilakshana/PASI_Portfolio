// Central icon registry. Content stores icons as strings; this maps them to components.
// Generic icons use friendly keys ("network"), brand logos use their Simple Icons name ("SiCisco").
import {
  PiGraph, PiLockKey, PiCode, PiWrench, PiTreeStructure, PiPulse, PiWaves, PiShoppingBag,
  PiBookOpen, PiSparkle, PiFingerprint, PiEye, PiGlobe, PiCloud, PiDatabase, PiCpu,
  PiTerminalWindow, PiBroadcast, PiHardDrives, PiWifiHigh, PiBug, PiRobot, PiPaintBrush,
  PiDeviceMobile, PiChartLineUp, PiStack, PiFlask, PiCertificate, PiTrophy, PiMedal,
  PiStudent, PiStar, PiLightning, PiBrowser, PiPlugsConnected, PiNetwork, PiCar, PiMapTrifold,
  PiChatCircleDots, PiKey, PiHandshake, PiMicrophoneStage, PiFlag, PiCube,
} from 'react-icons/pi'
import {
  SiCisco, SiLinux, SiWireshark, SiPython, SiGit, SiReact, SiJavascript, SiMysql, SiDocker,
  SiPostgresql, SiNodedotjs, SiTailwindcss, SiVmware, SiUbuntu, SiGithub, SiOpenjdk, SiKalilinux,
  SiVirtualbox, SiFigma, SiNginx, SiGooglecloud, SiMongodb, SiFastapi, SiExpress, SiVite,
  SiGnubash, SiTypescript, SiHtml5, SiVercel, SiCloudflare, SiFortinet, SiPaloaltonetworks,
  SiJunipernetworks, SiMikrotik, SiPfsense,
} from 'react-icons/si'

export const GENERIC_ICONS = {
  network: PiGraph, lock: PiLockKey, code: PiCode, wrench: PiWrench, tree: PiTreeStructure,
  pulse: PiPulse, waves: PiWaves, bag: PiShoppingBag, book: PiBookOpen, sparkle: PiSparkle,
  fingerprint: PiFingerprint, eye: PiEye, globe: PiGlobe, cloud: PiCloud, database: PiDatabase,
  cpu: PiCpu, terminal: PiTerminalWindow, broadcast: PiBroadcast, server: PiHardDrives,
  wifi: PiWifiHigh, bug: PiBug, robot: PiRobot, brush: PiPaintBrush, mobile: PiDeviceMobile,
  chart: PiChartLineUp, stack: PiStack, flask: PiFlask, certificate: PiCertificate,
  trophy: PiTrophy, medal: PiMedal, student: PiStudent, star: PiStar, bolt: PiLightning,
  browser: PiBrowser, plug: PiPlugsConnected, topology: PiNetwork, car: PiCar, map: PiMapTrifold,
  chat: PiChatCircleDots, key: PiKey, handshake: PiHandshake, stage: PiMicrophoneStage,
  flag: PiFlag, cube: PiCube,
}

export const BRAND_ICONS = {
  SiCisco, SiLinux, SiWireshark, SiPython, SiGit, SiReact, SiJavascript, SiMysql, SiDocker,
  SiPostgresql, SiNodedotjs, SiTailwindcss, SiVmware, SiUbuntu, SiGithub, SiOpenjdk, SiKalilinux,
  SiVirtualbox, SiFigma, SiNginx, SiGooglecloud, SiMongodb, SiFastapi, SiExpress, SiVite,
  SiGnubash, SiTypescript, SiHtml5, SiVercel, SiCloudflare, SiFortinet, SiPaloaltonetworks,
  SiJunipernetworks, SiMikrotik, SiPfsense,
}

export function getIcon(name, fallback = PiCube) {
  return GENERIC_ICONS[name] || BRAND_ICONS[name] || fallback
}

export const ACHIEVEMENT_TYPE_ICON = {
  Certification: PiCertificate,
  Award: PiTrophy,
  Competition: PiMedal,
  Academic: PiStudent,
  Course: PiBookOpen,
  Volunteering: PiHandshake,
  Talk: PiMicrophoneStage,
  Other: PiStar,
}
export const ACHIEVEMENT_TYPES = Object.keys(ACHIEVEMENT_TYPE_ICON)

// Accent hues used only for project cover art.
export const ACCENTS = {
  lime: '#c6f24e',
  sky: '#6cc7ff',
  amber: '#f5b947',
  coral: '#ff7a59',
  violet: '#a58bff',
  mint: '#4fe0b0',
}
