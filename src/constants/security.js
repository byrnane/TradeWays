// Security status thresholds and colors for EVE Online systems
export const SECURITY_THRESHOLDS = {
  HIGH_SEC_MAX: 1.0,
  HIGH_SEC_MIN: 0.6,
  LOW_SEC_MAX: 0.5,
  LOW_SEC_MIN: 0.1,
  NULL_SEC: 0.0
}

export const SECURITY_COLORS = {
  // High-sec colors
  '1.0': 'bg-[#00FF66]/20 text-[#00FF66]',  // Ярко-зелёный
  '0.9': 'bg-[#1AFF4D]/20 text-[#1AFF4D]',  // Зелёный
  '0.8': 'bg-[#66FF33]/20 text-[#66FF33]',  // Жёлто-зелёный
  '0.7': 'bg-[#99FF00]/20 text-[#99FF00]',  // Салатовый
  '0.6': 'bg-[#CCFF00]/20 text-[#CCFF00]',  // Жёлтый
  
  // Low-sec colors
  '0.5': 'bg-[#FFCC00]/20 text-[#FFCC00]',  // Жёлто-оранжевый
  '0.4': 'bg-[#FF9900]/20 text-[#FF9900]',  // Оранжевый
  '0.3': 'bg-[#FF6600]/20 text-[#FF6600]',  // Тёмно-оранжевый
  '0.2': 'bg-[#FF3300]/20 text-[#FF3300]',  // Оранжево-красный
  '0.1': 'bg-[#FF0000]/20 text-[#FF0000]',  // Красный
  
  // Null-sec
  '0.0': 'bg-[#990000]/20 text-[#990000]',  // Тёмно-красный / бордовый
  
  // Special space types
  WORMHOLE: 'bg-[#7A3DF0]/20 text-[#7A3DF0]',      // Фиолетовый
  ABYSSAL: 'bg-[#00C8FF]/20 text-[#00C8FF]',        // Неоново-синий
  POCHVEN: 'bg-[#7F1D1D]/20 text-[#7F1D1D]',       // Гнилой красно-фиолетовый
  
  // Fallback colors
  HIGH_SEC_FALLBACK: 'bg-green-500/20 text-green-400',
  LOW_SEC_FALLBACK: 'bg-yellow-500/20 text-yellow-400',
  NULL_SEC_FALLBACK: 'bg-red-500/20 text-red-400'
}

export const SYSTEM_ID_RANGES = {
  WORMHOLE_MIN: 31000000,
  WORMHOLE_MAX: 32000000,
  POCHVEN_MIN: 20000000,
  POCHVEN_MAX: 21000000
}

export const SPECIAL_SPACE_KEYWORDS = {
  WORMHOLE: 'wormhole',
  ABYSSAL: 'abyssal',
  POCHVEN: 'pochven'
}
