/**
 * @file enchantment-registry.mjs
 * Comprehensive PF1e Material, Enchantment, and 8-Tier Stepping Registry (10x Granular Engine)
 */

export const SPECIAL_MATERIALS = {
  steel: { name: "Steel", hardnessMod: 0, hpMult: 1.0, costMod: 0 },
  adamantine: { name: "Adamantine", hardnessMod: 100, hpMult: 1.33, costMod: 3000, desc: "Bypasses hardness under 200. DR / adamantine." },
  mithral: { name: "Mithral", hardnessMod: 0, hpMult: 1.5, costMod: 1000, acpBonus: 30, dexBonus: 20, desc: "Lightened frame; counts as one category lighter." },
  coldiron: { name: "Cold Iron", hardnessMod: 0, hpMult: 1.0, costMod: 200, desc: "Overcomes DR of fey and demons." },
  silversheen: { name: "Alchemical Silver", hardnessMod: -20, hpMult: 1.0, costMod: 100, desc: "Overcomes DR of lycanthropes and undead (-10 base damage)." },
  darkwood: { name: "Darkwood", hardnessMod: -20, hpMult: 1.0, costMod: 300, acpBonus: 20, desc: "Halves weapon/armor weight." },
  dragonhide: { name: "Dragonhide", hardnessMod: 50, hpMult: 1.25, costMod: 1500, desc: "Immune to specific dragon energy type." }
};

export const WEAPON_ENCHANTMENTS = {
  flaming: {
    baseName: "Flaming",
    cost: 1,
    isDice: true,
    type: "fire",
    tiers: {
      "-4": { title: "Embering", dice: "1d40" },
      "-3": { title: "Smoldering", dice: "1d40" },
      "-2": { title: "Searing", dice: "1d50" },
      "-1": { title: "Ignited", dice: "1d50" },
      "1":  { title: "Flaming", dice: "1d60" },
      "2":  { title: "Blazing", dice: "1d60" },
      "3":  { title: "Pyretic", dice: "1d70" },
      "4":  { title: "Infernal", dice: "1d80" }
    }
  },
  frost: {
    baseName: "Frost",
    cost: 1,
    isDice: true,
    type: "cold",
    tiers: {
      "-4": { title: "Numbing", dice: "1d40" },
      "-3": { title: "Chilled", dice: "1d40" },
      "-2": { title: "Rime-Coated", dice: "1d50" },
      "-1": { title: "Glacial", dice: "1d50" },
      "1":  { title: "Frost", dice: "1d60" },
      "2":  { title: "Freezing", dice: "1d60" },
      "3":  { title: "Boreal", dice: "1d70" },
      "4":  { title: "Absolute Zero", dice: "1d80" }
    }
  },
  shock: {
    baseName: "Shock",
    cost: 1,
    isDice: true,
    type: "electric",
    tiers: {
      "-4": { title: "Static", dice: "1d40" },
      "-3": { title: "Sparking", dice: "1d40" },
      "-2": { title: "Crackling", dice: "1d50" },
      "-1": { title: "Jolting", dice: "1d50" },
      "1":  { title: "Shocking", dice: "1d60" },
      "2":  { title: "Thundering", dice: "1d60" },
      "3":  { title: "Galvanic", dice: "1d70" },
      "4":  { title: "Voltaic", dice: "1d80" }
    }
  },
  corrosive: {
    baseName: "Corrosive",
    cost: 1,
    isDice: true,
    type: "acid",
    tiers: {
      "-4": { title: "Oozing", dice: "1d40" },
      "-3": { title: "Pungent", dice: "1d40" },
      "-2": { title: "Acidic", dice: "1d50" },
      "-1": { title: "Caustic", dice: "1d50" },
      "1":  { title: "Corrosive", dice: "1d60" },
      "2":  { title: "Dissolving", dice: "1d60" },
      "3":  { title: "Vitriolic", dice: "1d70" },
      "4":  { title: "Corrosive Maw", dice: "1d80" }
    }
  },
  holy: {
    baseName: "Holy",
    cost: 2,
    isDice: true,
    type: "holy",
    tiers: {
      "-4": { title: "Blessed", dice: "2d40" },
      "-3": { title: "Sanctified", dice: "2d40" },
      "-2": { title: "Hallowed", dice: "2d50" },
      "-1": { title: "Consecrated", dice: "2d50" },
      "1":  { title: "Holy", dice: "2d60" },
      "2":  { title: "Radiant", dice: "2d60" },
      "3":  { title: "Divine", dice: "2d70" },
      "4":  { title: "Empyreal", dice: "2d80" }
    }
  },
  vicious: {
    baseName: "Vicious",
    cost: 1,
    isDice: true,
    type: "untyped",
    tiers: {
      "-4": { title: "Malicious", dice: "2d40" },
      "-3": { title: "Cruel", dice: "2d40" },
      "-2": { title: "Spiteful", dice: "2d50" },
      "-1": { title: "Ruthless", dice: "2d50" },
      "1":  { title: "Vicious", dice: "2d60" },
      "2":  { title: "Savage", dice: "2d60" },
      "3":  { title: "Bloodthirsty", dice: "2d70" },
      "4":  { title: "Frenzied", dice: "2d80" }
    },
    recoilNote: "Deals 1d60 disruptive recoil damage back to the wielder upon striking."
  },
  keen: {
    baseName: "Keen",
    cost: 1,
    isDice: false,
    title: "Keen",
    actionMod: (action) => {
      let currentCrit = action.critRange ?? 191;
      let threatWidth = 201 - currentCrit;
      let doubledWidth = threatWidth * 2;
      action.critRange = Math.max(100, 201 - doubledWidth);
    },
    note: "Doubles the weapon's base critical threat window."
  },
  speed: {
    baseName: "Speed",
    cost: 3,
    isDice: false,
    title: "of Speed",
    note: "Grants one additional attack at the wielder's highest BAB during a full-attack."
  },
  vorpal: {
    baseName: "Vorpal",
    cost: 5,
    isDice: false,
    title: "Vorpal",
    note: "On a natural 200 attack roll, confirming the critical hit instantly severs the opponent's head."
  },
  defending: {
    baseName: "Defending",
    cost: 1,
    isDice: false,
    title: "of Defense",
    note: "Allows the wielder to allocate some or all of the weapon's enhancement bonus to their Armor AC."
  }
};

export const ARMOR_ENCHANTMENTS = {
  shadow: {
    baseName: "Shadow",
    cost: 1,
    type: "skill",
    target: "skill.ste",
    tiers: {
      "-4": { title: "Dusk-Veiled", bonus: 30 },
      "-3": { title: "Dimmed", bonus: 35 },
      "-2": { title: "Shadowy", bonus: 40 },
      "-1": { title: "Shrouded", bonus: 45 },
      "1":  { title: "of Shadow", bonus: 50 },
      "2":  { title: "of Deep Shadow", bonus: 55 },
      "3":  { title: "of Night", bonus: 60 },
      "4":  { title: "of the Umbral Void", bonus: 70 }
    }
  },
  slick: {
    baseName: "Slick",
    cost: 1,
    type: "skill",
    target: "skill.esc",
    tiers: {
      "-4": { title: "Oiled", bonus: 30 },
      "-3": { title: "Greased", bonus: 35 },
      "-2": { title: "Gliding", bonus: 40 },
      "-1": { title: "Slippery", bonus: 45 },
      "1":  { title: "of Slipping", bonus: 50 },
      "2":  { title: "of the Eel", bonus: 55 },
      "3":  { title: "of Liquefaction", bonus: 60 },
      "4":  { title: "of Absolute Frictionless", bonus: 70 }
    }
  },
  fortification_light: {
    baseName: "Fortification (Light)",
    cost: 1,
    title: "Light Fortified",
    note: "Grants a 25% chance to negate critical hits and precision sneak attacks."
  },
  fortification_medium: {
    baseName: "Fortification (Medium)",
    cost: 3,
    title: "Medium Fortified",
    note: "Grants a 50% chance to negate critical hits and precision sneak attacks."
  },
  fortification_heavy: {
    baseName: "Fortification (Heavy)",
    cost: 5,
    title: "Heavy Fortified",
    note: "Grants a 75% chance to negate critical hits and precision sneak attacks."
  },
  spell_resistance: {
    baseName: "Spell Resistance",
    cost: 2,
    type: "sr",
    tiers: {
      "-4": { title: "of Dull Wards", sr: 110 },
      "-3": { title: "of Minor Wards", sr: 120 },
      "-2": { title: "of Damping", sr: 130 },
      "-1": { title: "of Spell Resistance", sr: 140 },
      "1":  { title: "of Spell Resistance (150)", sr: 150 },
      "2":  { title: "of Spell Shielding", sr: 160 },
      "3":  { title: "of Grand Abjuration", sr: 170 },
      "4":  { title: "of Null Magic", sr: 190 }
    }
  },
  invulnerability: {
    baseName: "Invulnerability",
    cost: 3,
    title: "of Invulnerability",
    note: "Grants Damage Reduction 50/magic (scaled to 10x)."
  }
};

export const COMPOUND_FUSIONS = {
  // Weapon Syntheses
  "1_flaming": "Cinder",
  "2_flaming": "Sunstrike",
  "3_flaming": "Pyreforged",
  "4_flaming": "Hellfire Sovereign",
  "5_flaming": "Solaris Prime",

  "1_frost": "Hoarfrost",
  "2_frost": "Winterguard",
  "3_frost": "Rimevein",
  "4_frost": "Glacial Monarch",
  "5_frost": "Absolute Aegis",

  "1_shock": "Spark",
  "2_shock": "Stormstrike",
  "3_shock": "Tempestborn",
  "4_shock": "Thunderlord",
  "5_shock": "Aether-Voltage",

  "1_corrosive": "Caustic Bite",
  "2_corrosive": "Venomvein",
  "3_corrosive": "Blightforged",
  "4_corrosive": "Abyssal Maw",
  "5_corrosive": "Oblivion Core",

  "1_holy": "Blessed Light",
  "2_holy": "Sanctified Dawn",
  "3_holy": "Empyreal Wrath",
  "4_holy": "Seraphic Decree",
  "5_holy": "Hand of Heaven",

  // Armor Syntheses
  "1_shadow": "Duskveil",
  "2_shadow": "Nightward",
  "3_shadow": "Umbral Cloak",
  "4_shadow": "Voidwalker",
  "5_shadow": "Eclipse Prime",

  "1_slick": "Glider",
  "2_slick": "Eelskin",
  "3_slick": "Liquidform",
  "4_slick": "Phase-Weft",
  "5_slick": "Flowmaster"
};