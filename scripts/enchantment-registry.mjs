/**
 * @file enchantment-registry.mjs
 * Continuous 10x Granular Engine Registry with Gems, Art Objects, Thematic Presets, and Deep Custom Properties
 */

export const SPECIAL_MATERIALS = {
  base: { name: "Base", hardnessMod: 0, hpMult: 1.0, weightMult: 1.0, costMod: 0, desc: "Standard native material of the base item." },
  steel: { name: "Steel", hardnessMod: 0, hpMult: 1.0, weightMult: 1.0, costMod: 0, desc: "Standard forged steel." },
  adamantine: { name: "Adamantine", hardnessMod: 100, hpMult: 1.33, weightMult: 1.0, costMod: 3000, desc: "Bypasses hardness under 200. DR / adamantine." },
  mithral: { name: "Mithral", hardnessMod: 0, hpMult: 1.5, weightMult: 0.5, costMod: 1000, acpBonus: 30, dexBonus: 20, asfBonus: 10, desc: "Halves weight; counts as one category lighter; -10% ASF; reduces ACP." },
  coldiron: { name: "Cold Iron", hardnessMod: 0, hpMult: 1.0, weightMult: 1.0, costMod: 200, desc: "Overcomes DR of fey and demons." },
  silversheen: { name: "Alchemical Silver", hardnessMod: -20, hpMult: 1.0, weightMult: 1.0, costMod: 100, desc: "Overcomes DR of lycanthropes/undead (-10 base damage)." },
  darkwood: { name: "Darkwood", hardnessMod: -20, hpMult: 1.0, weightMult: 0.5, costMod: 300, acpBonus: 20, asfBonus: 10, desc: "Halves weapon/shield weight; -10% ASF; reduces ACP." },
  dragonhide: { name: "Dragonhide", hardnessMod: 50, hpMult: 1.25, weightMult: 1.0, costMod: 1500, desc: "Immune to specific dragon energy type." }
};

export const WEAPON_ENCHANTMENTS = {
  flaming: { baseName: "Flaming", cost: 1, isDice: true, numDice: 1, type: "fire", allowed: "both" },
  frost: { baseName: "Frost", cost: 1, isDice: true, numDice: 1, type: "cold", allowed: "both" },
  shock: { baseName: "Shock", cost: 1, isDice: true, numDice: 1, type: "electric", allowed: "both" },
  corrosive: { baseName: "Corrosive", cost: 1, isDice: true, numDice: 1, type: "acid", allowed: "both" },
  holy: { baseName: "Holy", cost: 2, isDice: true, numDice: 2, type: "holy", allowed: "both" },
  speed: { baseName: "Speed", cost: 3, isDice: false, title: "of Speed", allowed: "both", note: "Grants one additional attack at highest BAB during full-attack." },
  thundering: { baseName: "Thundering", cost: 1, isDice: false, title: "Thundering", allowed: "both", note: "Deals extra sonic damage on a successful critical hit." },
  bane: { baseName: "Bane", cost: 1, isDice: false, title: "Bane", allowed: "both", note: "Enhancement bonus is +2 higher against a designated foe, and deals +2d60 damage." },
  ghost_touch: { baseName: "Ghost Touch", cost: 1, isDice: false, title: "Ghost Touch", allowed: "both", note: "Deals normal damage to incorporeal creatures." },

  vicious: { baseName: "Vicious", cost: 1, isDice: true, numDice: 2, type: "untyped", allowed: "melee", recoilNote: "Deals 1d60 disruptive recoil damage back to the wielder upon striking." },
  keen: { baseName: "Keen", cost: 1, isDice: false, title: "Keen", allowed: "melee", actionMod: (action) => { let cCrit = action.critRange ?? 191; action.critRange = Math.max(100, 201 - ((201 - cCrit) * 2)); }, note: "Doubles the weapon's base critical threat window." },
  vorpal: { baseName: "Vorpal", cost: 5, isDice: false, title: "Vorpal", allowed: "melee", note: "On a natural 200 attack roll, confirming critical instantly severs head." },
  defending: { baseName: "Defending", cost: 1, isDice: false, title: "of Defense", allowed: "melee", note: "Allows wielder to allocate enhancement bonus to Armor AC." },

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
  "1_flaming": "Cinder", "2_flaming": "Sunstrike", "3_flaming": "Pyreforged", "4_flaming": "Hellfire Sovereign", "5_flaming": "Solaris Prime",
  "1_frost": "Hoarfrost", "2_frost": "Winterguard", "3_frost": "Rimevein", "4_frost": "Glacial Monarch", "5_frost": "Absolute Aegis",
  "1_shock": "Spark", "2_shock": "Stormstrike", "3_shock": "Tempestborn", "4_shock": "Thunderlord", "5_shock": "Aether-Voltage",
  "1_corrosive": "Caustic Bite", "2_corrosive": "Venomvein", "3_corrosive": "Blightforged", "4_corrosive": "Abyssal Maw", "5_corrosive": "Oblivion Core",
  "1_holy": "Blessed Light", "2_holy": "Sanctified Dawn", "3_holy": "Empyreal Wrath", "4_holy": "Seraphic Decree", "5_holy": "Hand of Heaven",
  "1_shadow": "Duskveil", "2_shadow": "Nightward", "3_shadow": "Umbral Cloak", "4_shadow": "Voidwalker", "5_shadow": "Eclipse Prime",
  "1_slick": "Glider", "2_slick": "Eelskin", "3_slick": "Liquidform", "4_slick": "Phase-Weft", "5_slick": "Flowmaster",

  "corrosive_flaming": "Slag",
  "flaming_frost": "Frostfire",
  "flaming_shock": "Plasma",
  "corrosive_shock": "Battery",
  "frost_shock": "Superconductor",
  "corrosive_frost": "Cryoblight",
  "holy_vicious": "Zealot's Wrath",
  "corrosive_flaming_frost_shock": "Omni-Elemental"
};

export const LEVEL_LOOT_TIERS = {
  1:  { maxEnh: 0, maxItemPrice: 300,    propChance: 0.00, matChance: 0.05, goldBase: 260 },
  2:  { maxEnh: 0, maxItemPrice: 600,    propChance: 0.05, matChance: 0.08, goldBase: 550 },
  3:  { maxEnh: 0, maxItemPrice: 1000,   propChance: 0.10, matChance: 0.12, goldBase: 800 },
  4:  { maxEnh: 1, maxItemPrice: 2000,   propChance: 0.20, matChance: 0.15, goldBase: 1150 },
  5:  { maxEnh: 1, maxItemPrice: 3000,   propChance: 0.30, matChance: 0.20, goldBase: 1550 },
  6:  { maxEnh: 1, maxItemPrice: 4500,   propChance: 0.40, matChance: 0.25, goldBase: 2000 },
  7:  { maxEnh: 2, maxItemPrice: 7000,   propChance: 0.50, matChance: 0.30, goldBase: 2600 },
  8:  { maxEnh: 2, maxItemPrice: 10000,  propChance: 0.60, matChance: 0.35, goldBase: 3350 },
  9:  { maxEnh: 2, maxItemPrice: 14000,  propChance: 0.70, matChance: 0.40, goldBase: 4250 },
  10: { maxEnh: 3, maxItemPrice: 20000,  propChance: 0.75, matChance: 0.45, goldBase: 5450 },
  11: { maxEnh: 3, maxItemPrice: 28000,  propChance: 0.80, matChance: 0.50, goldBase: 7000 },
  12: { maxEnh: 3, maxItemPrice: 38000,  propChance: 0.85, matChance: 0.55, goldBase: 9000 },
  13: { maxEnh: 4, maxItemPrice: 50000,  propChance: 0.90, matChance: 0.60, goldBase: 11600 },
  14: { maxEnh: 4, maxItemPrice: 65000,  propChance: 0.95, matChance: 0.65, goldBase: 15000 },
  15: { maxEnh: 4, maxItemPrice: 85000,  propChance: 1.00, matChance: 0.70, goldBase: 19500 },
  16: { maxEnh: 5, maxItemPrice: 110000, propChance: 1.00, matChance: 0.75, goldBase: 25000 },
  17: { maxEnh: 5, maxItemPrice: 150000, propChance: 1.00, matChance: 0.80, goldBase: 32000 },
  18: { maxEnh: 5, maxItemPrice: 200000, propChance: 1.00, matChance: 0.85, goldBase: 41000 },
  19: { maxEnh: 5, maxItemPrice: 275000, propChance: 1.00, matChance: 0.90, goldBase: 53000 },
  20: { maxEnh: 5, maxItemPrice: 400000, propChance: 1.00, matChance: 1.00, goldBase: 67000 }
};

// ─── GEMS, JEWELRY & ART OBJECTS ────────────────────────────────────────────
export const GEMSTONE_DATA = [
  { name: "Banded Agate", basePrice: 10, img: "icons/commodities/gems/gem-rough-grey.webp" },
  { name: "Tiger Eye", basePrice: 10, img: "icons/commodities/gems/gem-rough-cushion-yellow.webp" },
  { name: "Bloodstone", basePrice: 50, img: "icons/commodities/gems/gem-rough-oval-red.webp" },
  { name: "Moonstone", basePrice: 50, img: "icons/commodities/gems/gem-faceted-round-white.webp" },
  { name: "Onyx", basePrice: 50, img: "icons/commodities/gems/gem-faceted-cushion-black.webp" },
  { name: "Amber", basePrice: 100, img: "icons/commodities/gems/gem-rough-pear-orange.webp" },
  { name: "Jade", basePrice: 100, img: "icons/commodities/gems/gem-rough-emerald-green.webp" },
  { name: "Freshwater Pearl", basePrice: 100, img: "icons/commodities/gems/pearl-white.webp" },
  { name: "Alexandrite", basePrice: 500, img: "icons/commodities/gems/gem-faceted-radiant-teal.webp" },
  { name: "Black Pearl", basePrice: 500, img: "icons/commodities/gems/pearl-black.webp" },
  { name: "Deep Blue Sapphire", basePrice: 1000, img: "icons/commodities/gems/gem-faceted-cushion-blue.webp" },
  { name: "Fiery Ruby", basePrice: 1000, img: "icons/commodities/gems/gem-faceted-heart-red.webp" },
  { name: "Flawless Emerald", basePrice: 1000, img: "icons/commodities/gems/gem-faceted-emerald-green.webp" },
  { name: "Brilliant Diamond", basePrice: 5000, img: "icons/commodities/gems/gem-faceted-round-white.webp" },
  { name: "Star Sapphire", basePrice: 5000, img: "icons/commodities/gems/gem-faceted-radiant-blue.webp" },
  { name: "Jacinth of the Sun", basePrice: 10000, img: "icons/commodities/gems/gem-faceted-cushion-orange.webp" }
];

export const ART_OBJECTS_DATA = [
  { name: "Silver-Plated Chalice", basePrice: 55, img: "icons/sundries/gaming/cup-goblet-silver.webp" },
  { name: "Carved Bone Statuette", basePrice: 100, img: "icons/commodities/treasure/token-bone-carved.webp" },
  { name: "Gold-Embroidered Velvet Cloak", basePrice: 150, img: "icons/equipment/back/cloak-heavy-fur-red.webp" },
  { name: "Jeweled Silver Mirror", basePrice: 350, img: "icons/commodities/treasure/mirror-silver-ornate.webp" },
  { name: "Gilded Idol of an Ancient Deity", basePrice: 500, img: "icons/commodities/treasure/figurine-gold-cat.webp" },
  { name: "Ceremonial Electrum Dagger with Rubies", basePrice: 750, img: "icons/weapons/daggers/dagger-jeweled-red.webp" },
  { name: "Solid Gold Holy Reliquary", basePrice: 1200, img: "icons/commodities/treasure/urn-gold-jeweled.webp" },
  { name: "Imperial Jeweled Crown", basePrice: 3000, img: "icons/equipment/head/crown-jeweled-gold.webp" },
  { name: "Platinum Scepter of Dominion", basePrice: 7500, img: "icons/weapons/staves/scepter-platinum-jeweled.webp" }
];

// ─── THEMATIC ENCOUNTER PRESETS ─────────────────────────────────────────────
export const THEMATIC_PRESETS = {
  none: {
    label: "None (Standard Random)",
    materialBias: ["base", "steel", "mithral", "adamantine"],
    propertyBias: [],
    categoryWeights: { weapons: 1, armor: 1, wondrous: 1, potions: 1, scrolls: 1, wands: 1 }
  },
  undead_crypt: {
    label: "💀 Undead Crypt / Catacombs",
    materialBias: ["silversheen", "coldiron", "base"],
    propertyBias: ["holy", "ghost_touch", "defending"],
    gemBias: ["Onyx", "Bloodstone", "Moonstone"],
    artBias: ["Carved Bone Statuette", "Solid Gold Holy Reliquary"],
    categoryWeights: { weapons: 2, armor: 1, wondrous: 1, potions: 1, scrolls: 2 }
  },
  dragon_lair: {
    label: "🐉 Dragon Lair / Hoard",
    materialBias: ["dragonhide", "adamantine", "mithral", "steel"],
    propertyBias: ["flaming", "frost", "shock", "corrosive", "speed"],
    gemBias: ["Fiery Ruby", "Flawless Emerald", "Deep Blue Sapphire", "Brilliant Diamond"],
    artBias: ["Imperial Jeweled Crown", "Platinum Scepter of Dominion", "Jeweled Silver Mirror"],
    categoryWeights: { weapons: 2, armor: 2, wondrous: 3, rings: 2, rods: 1 }
  },
  feywild_glade: {
    label: "🧚 Feywild Glade / Sylvan Court",
    materialBias: ["darkwood", "mithral", "silversheen"],
    propertyBias: ["keen", "speed", "seeking", "returning"],
    gemBias: ["Freshwater Pearl", "Alexandrite", "Amber", "Jade"],
    artBias: ["Gold-Embroidered Velvet Cloak", "Silver-Plated Chalice"],
    categoryWeights: { weapons: 1, wondrous: 3, potions: 2, wands: 2, rings: 1 }
  },
  abyssal_rift: {
    label: "🔥 Abyssal Rift / Infernal Forge",
    materialBias: ["adamantine", "coldiron", "steel"],
    propertyBias: ["vicious", "corrosive", "flaming", "vorpal"],
    gemBias: ["Bloodstone", "Onyx", "Fiery Ruby"],
    artBias: ["Gilded Idol of an Ancient Deity", "Ceremonial Electrum Dagger with Rubies"],
    categoryWeights: { weapons: 3, armor: 2, wondrous: 1, staves: 1 }
  },
  arcane_vault: {
    label: "🔮 Arcane Sanctum / High Wizard Vault",
    materialBias: ["mithral", "darkwood", "base"],
    propertyBias: ["spell_resistance", "defending", "thundering"],
    gemBias: ["Deep Blue Sapphire", "Star Sapphire", "Alexandrite"],
    artBias: ["Platinum Scepter of Dominion", "Jeweled Silver Mirror"],
    categoryWeights: { wands: 3, scrolls: 3, staves: 2, rods: 2, wondrous: 3, rings: 2 }
  }
};