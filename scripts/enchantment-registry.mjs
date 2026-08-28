/**
 * @file enchantment-registry.mjs
 * Continuous 10x Granular Engine Registry with Ranged/Melee Filtering & Multi-Fusions
 */

export const SPECIAL_MATERIALS = {
  steel: { name: "Steel", hardnessMod: 0, hpMult: 1.0, costMod: 0 },
  adamantine: { name: "Adamantine", hardnessMod: 100, hpMult: 1.33, costMod: 3000, desc: "Bypasses hardness under 200. DR / adamantine." },
  mithral: { name: "Mithral", hardnessMod: 0, hpMult: 1.5, costMod: 1000, acpBonus: 30, dexBonus: 20, desc: "Lightened frame; counts as one category lighter." },
  coldiron: { name: "Cold Iron", hardnessMod: 0, hpMult: 1.0, costMod: 200, desc: "Overcomes DR of fey and demons." },
  silversheen: { name: "Alchemical Silver", hardnessMod: -20, hpMult: 1.0, costMod: 100, desc: "Overcomes DR of lycanthropes/undead (-10 base damage)." },
  darkwood: { name: "Darkwood", hardnessMod: -20, hpMult: 1.0, costMod: 300, acpBonus: 20, desc: "Halves weapon/armor weight." },
  dragonhide: { name: "Dragonhide", hardnessMod: 50, hpMult: 1.25, costMod: 1500, desc: "Immune to specific dragon energy type." }
};

export const WEAPON_ENCHANTMENTS = {
  // Elemental & Core (Allowed on Both)
  flaming: { baseName: "Flaming", cost: 1, isDice: true, numDice: 1, type: "fire", allowed: "both" },
  frost: { baseName: "Frost", cost: 1, isDice: true, numDice: 1, type: "cold", allowed: "both" },
  shock: { baseName: "Shock", cost: 1, isDice: true, numDice: 1, type: "electric", allowed: "both" },
  corrosive: { baseName: "Corrosive", cost: 1, isDice: true, numDice: 1, type: "acid", allowed: "both" },
  holy: { baseName: "Holy", cost: 2, isDice: true, numDice: 2, type: "holy", allowed: "both" },
  speed: { baseName: "Speed", cost: 3, isDice: false, title: "of Speed", allowed: "both", note: "Grants one additional attack at highest BAB during full-attack." },
  thundering: { baseName: "Thundering", cost: 1, isDice: false, title: "Thundering", allowed: "both", note: "Deals extra sonic damage on a successful critical hit." },
  bane: { baseName: "Bane", cost: 1, isDice: false, title: "Bane", allowed: "both", note: "Enhancement bonus is +2 higher against a designated foe, and deals +2d60 damage." },
  ghost_touch: { baseName: "Ghost Touch", cost: 1, isDice: false, title: "Ghost Touch", allowed: "both", note: "Deals normal damage to incorporeal creatures." },

  // Melee Exclusives
  vicious: { baseName: "Vicious", cost: 1, isDice: true, numDice: 2, type: "untyped", allowed: "melee", recoilNote: "Deals 1d60 disruptive recoil damage back to the wielder upon striking." },
  keen: { baseName: "Keen", cost: 1, isDice: false, title: "Keen", allowed: "melee", actionMod: (action) => { let cCrit = action.critRange ?? 191; action.critRange = Math.max(100, 201 - ((201 - cCrit) * 2)); }, note: "Doubles the weapon's base critical threat window." },
  vorpal: { baseName: "Vorpal", cost: 5, isDice: false, title: "Vorpal", allowed: "melee", note: "On a natural 200 attack roll, confirming critical instantly severs head." },
  defending: { baseName: "Defending", cost: 1, isDice: false, title: "of Defense", allowed: "melee", note: "Allows wielder to allocate enhancement bonus to Armor AC." },

  // Ranged Exclusives
  distance: { baseName: "Distance", cost: 1, isDice: false, title: "of Distance", allowed: "ranged", note: "Doubles the weapon's range increment." },
  returning: { baseName: "Returning", cost: 1, isDice: false, title: "Returning", allowed: "ranged", note: "Returns to the thrower just before their next turn." },
  seeking: { baseName: "Seeking", cost: 1, isDice: false, title: "Seeking", allowed: "ranged", note: "Ignores any miss chance from concealment." }
};

export const ARMOR_ENCHANTMENTS = {
  shadow: { baseName: "Shadow", cost: 1, type: "skill", target: "skill.ste", bonusMath: (mult) => Math.round(50 * mult) },
  slick: { baseName: "Slick", cost: 1, type: "skill", target: "skill.esc", bonusMath: (mult) => Math.round(50 * mult) },
  fortification_light: { baseName: "Fortification (Light)", cost: 1, title: "Light Fortified", note: "25% chance to negate critical hits and precision sneak attacks." },
  fortification_medium: { baseName: "Fortification (Medium)", cost: 3, title: "Medium Fortified", note: "50% chance to negate critical hits and precision sneak attacks." },
  fortification_heavy: { baseName: "Fortification (Heavy)", cost: 5, title: "Heavy Fortified", note: "75% chance to negate critical hits and precision sneak attacks." },
  spell_resistance: { baseName: "Spell Resistance", cost: 2, type: "sr", bonusMath: (mult) => Math.round(130 * mult) },
  invulnerability: { baseName: "Invulnerability", cost: 3, title: "of Invulnerability", note: "Grants Damage Reduction 50/magic (scaled to 10x)." }
};

export const COMPOUND_FUSIONS = {
  // Base enhancements + Single Property
  "1_flaming": "Cinder", "2_flaming": "Sunstrike", "3_flaming": "Pyreforged", "4_flaming": "Hellfire Sovereign", "5_flaming": "Solaris Prime",
  "1_frost": "Hoarfrost", "2_frost": "Winterguard", "3_frost": "Rimevein", "4_frost": "Glacial Monarch", "5_frost": "Absolute Aegis",
  "1_shock": "Spark", "2_shock": "Stormstrike", "3_shock": "Tempestborn", "4_shock": "Thunderlord", "5_shock": "Aether-Voltage",
  "1_corrosive": "Caustic Bite", "2_corrosive": "Venomvein", "3_corrosive": "Blightforged", "4_corrosive": "Abyssal Maw", "5_corrosive": "Oblivion Core",
  "1_holy": "Blessed Light", "2_holy": "Sanctified Dawn", "3_holy": "Empyreal Wrath", "4_holy": "Seraphic Decree", "5_holy": "Hand of Heaven",
  "1_shadow": "Duskveil", "2_shadow": "Nightward", "3_shadow": "Umbral Cloak", "4_shadow": "Voidwalker", "5_shadow": "Eclipse Prime",
  "1_slick": "Glider", "2_slick": "Eelskin", "3_slick": "Liquidform", "4_slick": "Phase-Weft", "5_slick": "Flowmaster",

  // Multi-Property Fusions (Alphabetical Keys)
  "corrosive_flaming": "Slag",
  "flaming_frost": "Frostfire",
  "flaming_shock": "Plasma",
  "corrosive_shock": "Battery",
  "frost_shock": "Superconductor",
  "corrosive_frost": "Cryoblight",
  "holy_vicious": "Zealot's Wrath",
  "corrosive_flaming_frost_shock": "Omni-Elemental"
};