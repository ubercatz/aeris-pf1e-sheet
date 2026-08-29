/**
 * @file enchantment-registry.mjs
 * Continuous 10x Granular Engine Registry with Discrete Catalysts, Refined Material Economics, and Weighted Loot Tables
 */

export const SPECIAL_MATERIALS = {
  base: { name: "Base", hardnessMod: 0, hpMult: 1.0, weightMult: 1.0, costMod: 0, rawPrice: 5, refinedPrice: 25, unitWeight: 2.0, desc: "Standard native material of the base item." },
  steel: { name: "Steel", hardnessMod: 0, hpMult: 1.0, weightMult: 1.0, costMod: 0, rawPrice: 5, refinedPrice: 25, unitWeight: 2.0, desc: "Standard forged steel." },
  adamantine: { name: "Adamantine", hardnessMod: 100, hpMult: 1.33, weightMult: 1.0, costMod: 3000, rawPrice: 1500, refinedPrice: 6000, unitWeight: 2.0, desc: "Bypasses hardness under 200. DR / adamantine." },
  mithral: { name: "Mithral", hardnessMod: 0, hpMult: 1.5, weightMult: 0.5, costMod: 1000, acpBonus: 30, dexBonus: 20, asfBonus: 10, rawPrice: 500, refinedPrice: 2500, unitWeight: 1.0, desc: "Halves weight; counts as one category lighter; -10% ASF; reduces ACP." },
  coldiron: { name: "Cold Iron", hardnessMod: 0, hpMult: 1.0, weightMult: 1.0, costMod: 200, rawPrice: 50, refinedPrice: 200, unitWeight: 2.0, desc: "Overcomes DR of fey and demons." },
  silversheen: { name: "Alchemical Silver", hardnessMod: -20, hpMult: 1.0, weightMult: 1.0, costMod: 100, rawPrice: 25, refinedPrice: 100, unitWeight: 2.0, desc: "Overcomes DR of lycanthropes/undead (-10 base damage)." },
  darkwood: { name: "Darkwood", hardnessMod: -20, hpMult: 1.0, weightMult: 0.5, costMod: 300, acpBonus: 20, asfBonus: 10, rawPrice: 50, refinedPrice: 200, unitWeight: 1.5, desc: "Halves weapon/shield weight; -10% ASF; reduces ACP." },
  dragonhide: { name: "Dragonhide", hardnessMod: 50, hpMult: 1.25, weightMult: 1.0, costMod: 1500, rawPrice: 250, refinedPrice: 1000, unitWeight: 2.0, desc: "Immune to specific dragon energy type." }
};

// ─── UNIQUE WEAPON PROPERTIES & DEDICATED DISCRETE CATALYSTS ─────────────────
export const WEAPON_ENCHANTMENTS = {
  flaming: { 
    baseName: "Flaming", cost: 1, isDice: true, numDice: 1, type: "fire", allowed: "both",
    catalystName: "Ruby", catalystPattern: /(ruby|rubies|flame essence|fire gem|magma core)/i 
  },
  frost: { 
    baseName: "Frost", cost: 1, isDice: true, numDice: 1, type: "cold", allowed: "both",
    catalystName: "Sapphire", catalystPattern: /(sapphire|glacial shard|ice essence|frost gem)/i 
  },
  shock: { 
    baseName: "Shock", cost: 1, isDice: true, numDice: 1, type: "electric", allowed: "both",
    catalystName: "Topaz", catalystPattern: /(topaz|storm quartz|lightning gem|voltaic core)/i 
  },
  corrosive: { 
    baseName: "Corrosive", cost: 1, isDice: true, numDice: 1, type: "acid", allowed: "both",
    catalystName: "Emerald", catalystPattern: /(emerald|acid drake gland|caustic gland|vitriol)/i 
  },
  holy: { 
    baseName: "Holy", cost: 2, isDice: true, numDice: 2, type: "holy", allowed: "both",
    catalystName: "Sunstone", catalystPattern: /(sunstone|celestial feather|seraphic dust|radiant opal)/i 
  },
  speed: { 
    baseName: "Speed", cost: 3, isDice: false, title: "of Speed", allowed: "both", note: "Grants one additional attack at highest BAB during full-attack.",
    catalystName: "Quicksilver Vial", catalystPattern: /(quicksilver|tempest agate|wind runner core|chronos pearl)/i 
  },
  thundering: { 
    baseName: "Thundering", cost: 1, isDice: false, title: "Thundering", allowed: "both", note: "Deals extra sonic damage on a critical hit.",
    catalystName: "Thunderstone Core", catalystPattern: /(thunderstone core|sonic crystal|echoing geode)/i 
  },
  bane: { 
    baseName: "Bane", cost: 1, isDice: false, title: "Bane", allowed: "both", note: "+2 higher enhancement & +2d60 vs designated creature type.",
    catalystName: "Slayer's Heartstone", catalystPattern: /(slayer's heartstone|blood agate|nemesis dust)/i 
  },
  ghost_touch: { 
    baseName: "Ghost Touch", cost: 1, isDice: false, title: "Ghost Touch", allowed: "both", note: "Deals full damage to incorporeal creatures.",
    catalystName: "Ectoplasmic Residue", catalystPattern: /(ectoplasmic residue|ghost pearl|spirit dust|wraith mist)/i 
  },
  vicious: { 
    baseName: "Vicious", cost: 1, isDice: true, numDice: 2, type: "untyped", allowed: "melee", recoilNote: "Deals 1d60 recoil damage to wielder.",
    catalystName: "Vampiric Garnet", catalystPattern: /(vampiric garnet|barbed shard|bloodstone sliver)/i 
  },
  keen: { 
    baseName: "Keen", cost: 1, isDice: false, title: "Keen", allowed: "melee", actionMod: (action) => { let cCrit = action.critRange ?? 191; action.critRange = Math.max(100, 201 - ((201 - cCrit) * 2)); }, note: "Doubles critical threat window.",
    catalystName: "Adamantine Dust", catalystPattern: /(adamantine dust|razor obsidian|whetstone of sharpness)/i 
  },
  vorpal: { 
    baseName: "Vorpal", cost: 5, isDice: false, title: "Vorpal", allowed: "melee", note: "Natural 200 confirms instant decapitation.",
    catalystName: "Flawless Diamond", catalystPattern: /(flawless diamond|severing onyx|executioner's jewel)/i 
  },
  defending: { 
    baseName: "Defending", cost: 1, isDice: false, title: "of Defense", allowed: "melee", note: "Allows wielder to allocate enhancement bonus to Armor AC.",
    catalystName: "Aegis Pearl", catalystPattern: /(aegis pearl|bastion lodestone|warding quartz)/i 
  },
  distance: { 
    baseName: "Distance", cost: 1, isDice: false, title: "of Distance", allowed: "ranged", note: "Doubles weapon's range increment.",
    catalystName: "Zephyr Feather", catalystPattern: /(zephyr feather|far-sight crystal|falcon eye gem)/i 
  },
  returning: { 
    baseName: "Returning", cost: 1, isDice: false, title: "Returning", allowed: "ranged", note: "Returns to thrower right before their next turn.",
    catalystName: "Lodestone Ingot", catalystPattern: /(lodestone ingot|boomerang tendon|magnetic core)/i 
  },
  seeking: { 
    baseName: "Seeking", cost: 1, isDice: false, title: "Seeking", allowed: "ranged", note: "Negates miss chance from concealment.",
    catalystName: "True-Seeing Opal", catalystPattern: /(true-seeing opal|hawkeye geode|diviner's eye)/i 
  }
};

// ─── UNIQUE ARMOR PROPERTIES & DEDICATED DISCRETE CATALYSTS ──────────────────
export const ARMOR_ENCHANTMENTS = {
  shadow: { 
    baseName: "Shadow", cost: 1, type: "skill", target: "skill.ste", bonusMath: (mult) => Math.round(50 * mult),
    catalystName: "Shadowsilk Spool", catalystPattern: /(shadowsilk spool|umbral onyx|nightshade resin)/i 
  },
  slick: { 
    baseName: "Slick", cost: 1, type: "skill", target: "skill.esc", bonusMath: (mult) => Math.round(50 * mult),
    catalystName: "Eelskin Oil", catalystPattern: /(eelskin oil|liquid mica|grease vial|phase slime)/i 
  },
  fortification_light: { 
    baseName: "Fortification (Light)", cost: 1, title: "Light Fortified", note: "25% chance to negate critical hits and sneak attacks.",
    catalystName: "Ironwood Core", catalystPattern: /(ironwood core|guardian beryl|protective zircon)/i 
  },
  fortification_medium: { 
    baseName: "Fortification (Medium)", cost: 3, title: "Medium Fortified", note: "50% chance to negate critical hits and sneak attacks.",
    catalystName: "Adamantine Plate Fragment", catalystPattern: /(adamantine plate fragment|citadel tourmaline|bastion sapphire)/i 
  },
  fortification_heavy: { 
    baseName: "Fortification (Heavy)", cost: 5, title: "Heavy Fortified", note: "75% chance to negate critical hits and sneak attacks.",
    catalystName: "Gorgon Scale", catalystPattern: /(gorgon scale|bulwark diamond|indomitable core)/i 
  },
  spell_resistance: { 
    baseName: "Spell Resistance", cost: 2, type: "sr", bonusMath: (mult) => Math.round(130 * mult),
    catalystName: "Aether Pearl", catalystPattern: /(aether pearl|null-magic quartz|antimagic dust)/i 
  },
  invulnerability: { 
    baseName: "Invulnerability", cost: 3, title: "of Invulnerability", note: "Grants DR 50/magic (10x scaled).",
    catalystName: "Adamantine Slag", catalystPattern: /(adamantine slag|titan bloodstone|colossus marrow)/i 
  }
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

export const GEMSTONE_DATA = [
  { name: "Banded Agate", basePrice: 10, weight: 0.1, img: "icons/commodities/gems/gem-rough-grey.webp" },
  { name: "Tiger Eye", basePrice: 10, weight: 0.1, img: "icons/commodities/gems/gem-rough-cushion-yellow.webp" },
  { name: "Bloodstone", basePrice: 50, weight: 0.1, img: "icons/commodities/gems/gem-rough-oval-red.webp" },
  { name: "Moonstone", basePrice: 50, weight: 0.1, img: "icons/commodities/gems/gem-faceted-round-white.webp" },
  { name: "Onyx", basePrice: 50, weight: 0.1, img: "icons/commodities/gems/gem-faceted-cushion-black.webp" },
  { name: "Amber", basePrice: 100, weight: 0.1, img: "icons/commodities/gems/gem-rough-pear-orange.webp" },
  { name: "Jade", basePrice: 100, weight: 0.1, img: "icons/commodities/gems/gem-rough-emerald-green.webp" },
  { name: "Freshwater Pearl", basePrice: 100, weight: 0.1, img: "icons/commodities/gems/pearl-white.webp" },
  { name: "Alexandrite", basePrice: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-radiant-teal.webp" },
  { name: "Black Pearl", basePrice: 500, weight: 0.1, img: "icons/commodities/gems/pearl-black.webp" },
  { name: "Deep Blue Sapphire", basePrice: 1000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-cushion-blue.webp" },
  { name: "Fiery Ruby", basePrice: 1000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-heart-red.webp" },
  { name: "Flawless Emerald", basePrice: 1000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-emerald-green.webp" },
  { name: "Brilliant Diamond", basePrice: 5000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-round-white.webp" },
  { name: "Star Sapphire", basePrice: 5000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-radiant-blue.webp" },
  { name: "Jacinth of the Sun", basePrice: 10000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-cushion-orange.webp" }
];

export const ART_OBJECTS_DATA = [
  { name: "Silver-Plated Chalice", basePrice: 55, weight: 1.5, img: "icons/sundries/gaming/cup-goblet-silver.webp" },
  { name: "Carved Bone Statuette", basePrice: 100, weight: 1.0, img: "icons/commodities/treasure/token-bone-carved.webp" },
  { name: "Gold-Embroidered Velvet Cloak", basePrice: 150, weight: 2.0, img: "icons/equipment/back/cloak-heavy-fur-red.webp" },
  { name: "Jeweled Silver Mirror", basePrice: 350, weight: 1.5, img: "icons/commodities/treasure/mirror-silver-ornate.webp" },
  { name: "Gilded Idol of an Ancient Deity", basePrice: 500, weight: 3.0, img: "icons/commodities/treasure/figurine-gold-cat.webp" },
  { name: "Ceremonial Electrum Dagger with Rubies", basePrice: 750, weight: 1.0, img: "icons/weapons/daggers/dagger-jeweled-red.webp" },
  { name: "Solid Gold Holy Reliquary", basePrice: 1200, weight: 4.5, img: "icons/commodities/treasure/urn-gold-jeweled.webp" },
  { name: "Imperial Jeweled Crown", basePrice: 3000, weight: 2.5, img: "icons/equipment/head/crown-jeweled-gold.webp" },
  { name: "Platinum Scepter of Dominion", basePrice: 7500, weight: 3.5, img: "icons/weapons/staves/scepter-platinum-jeweled.webp" }
];

// ─── DISCRETE SINGLE-NAME MAGICAL CATALYSTS (ALL WEIGHTED) ──────────────────
export const ALL_MAGICAL_CATALYSTS = [
  { name: "Arcane Residue", price: 50, weight: 0.1, img: "icons/commodities/materials/dust-fine-blue.webp" },
  { name: "Ruby", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-heart-red.webp" },
  { name: "Flame Essence", price: 500, weight: 0.2, img: "icons/commodities/materials/liquid-amber.webp" },
  { name: "Sapphire", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-cushion-blue.webp" },
  { name: "Glacial Shard", price: 500, weight: 0.5, img: "icons/commodities/materials/shard-glass-blue.webp" },
  { name: "Topaz", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-rough-cushion-yellow.webp" },
  { name: "Storm Quartz", price: 500, weight: 0.2, img: "icons/commodities/gems/gem-rough-crystals-yellow.webp" },
  { name: "Emerald", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-emerald-green.webp" },
  { name: "Acid Drake Gland", price: 500, weight: 1.0, img: "icons/commodities/biological/organ-gland-green.webp" },
  { name: "Sunstone", price: 1000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-round-yellow.webp" },
  { name: "Celestial Feather", price: 1000, weight: 0.1, img: "icons/commodities/materials/feather-glowing-gold.webp" },
  { name: "Quicksilver Vial", price: 1500, weight: 0.5, img: "icons/consumables/potions/vial-cork-silver.webp" },
  { name: "Tempest Agate", price: 1500, weight: 0.1, img: "icons/commodities/gems/gem-rough-oval-grey.webp" },
  { name: "Thunderstone Core", price: 500, weight: 0.5, img: "icons/commodities/materials/stone-grey-rune.webp" },
  { name: "Sonic Crystal", price: 500, weight: 0.2, img: "icons/commodities/gems/gem-faceted-radiant-teal.webp" },
  { name: "Slayer's Heartstone", price: 500, weight: 0.2, img: "icons/commodities/gems/gem-rough-heart-red.webp" },
  { name: "Blood Agate", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-rough-oval-red.webp" },
  { name: "Ectoplasmic Residue", price: 500, weight: 0.2, img: "icons/commodities/materials/slime-thick-green.webp" },
  { name: "Ghost Pearl", price: 500, weight: 0.1, img: "icons/commodities/gems/pearl-white.webp" },
  { name: "Vampiric Garnet", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-radiant-red.webp" },
  { name: "Barbed Shard", price: 500, weight: 0.5, img: "icons/commodities/materials/shard-blood-red.webp" },
  { name: "Adamantine Dust", price: 500, weight: 0.1, img: "icons/commodities/materials/dust-dark-purple.webp" },
  { name: "Razor Obsidian", price: 500, weight: 0.5, img: "icons/commodities/gems/gem-rough-black.webp" },
  { name: "Flawless Diamond", price: 5000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-round-white.webp" },
  { name: "Severing Onyx", price: 5000, weight: 0.2, img: "icons/commodities/gems/gem-faceted-cushion-black.webp" },
  { name: "Aegis Pearl", price: 500, weight: 0.1, img: "icons/commodities/gems/pearl-black.webp" },
  { name: "Bastion Lodestone", price: 500, weight: 1.0, img: "icons/commodities/metal/ingot-iron.webp" },
  { name: "Zephyr Feather", price: 500, weight: 0.1, img: "icons/commodities/materials/feather-soft-white.webp" },
  { name: "Far-Sight Crystal", price: 500, weight: 0.2, img: "icons/commodities/gems/gem-faceted-radiant-white.webp" },
  { name: "Lodestone Ingot", price: 500, weight: 2.0, img: "icons/commodities/metal/ingot-iron.webp" },
  { name: "Boomerang Tendon", price: 500, weight: 0.5, img: "icons/commodities/biological/tendon-yellow.webp" },
  { name: "True-Seeing Opal", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-cushion-orange.webp" },
  { name: "Hawkeye Geode", price: 500, weight: 0.5, img: "icons/commodities/gems/gem-rough-crystals-blue.webp" },
  { name: "Shadowsilk Spool", price: 500, weight: 0.5, img: "icons/commodities/cloth/thread-spool-black.webp" },
  { name: "Umbral Onyx", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-cushion-black.webp" },
  { name: "Eelskin Oil", price: 500, weight: 0.5, img: "icons/consumables/potions/bottle-flask-shimmering-blue.webp" },
  { name: "Liquid Mica", price: 500, weight: 0.5, img: "icons/consumables/potions/vial-cork-silver.webp" },
  { name: "Ironwood Core", price: 500, weight: 2.0, img: "icons/commodities/materials/wood-log-green.webp" },
  { name: "Guardian Beryl", price: 500, weight: 0.1, img: "icons/commodities/gems/gem-faceted-emerald-green.webp" },
  { name: "Adamantine Plate Fragment", price: 1500, weight: 2.0, img: "icons/commodities/metal/scrap-iron.webp" },
  { name: "Citadel Tourmaline", price: 1500, weight: 0.2, img: "icons/commodities/gems/gem-faceted-radiant-teal.webp" },
  { name: "Gorgon Scale", price: 5000, weight: 2.0, img: "icons/commodities/biological/scale-reptile-grey.webp" },
  { name: "Bulwark Diamond", price: 5000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-round-white.webp" },
  { name: "Aether Pearl", price: 1000, weight: 0.1, img: "icons/commodities/gems/gem-faceted-radiant-blue.webp" },
  { name: "Null-Magic Quartz", price: 1000, weight: 0.5, img: "icons/commodities/gems/gem-rough-crystals-white.webp" },
  { name: "Adamantine Slag", price: 1500, weight: 2.0, img: "icons/commodities/metal/ingot-engraved-metal.webp" },
  { name: "Titan Bloodstone", price: 1500, weight: 0.5, img: "icons/commodities/gems/gem-rough-oval-red.webp" }
];

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