/**
 * @file player-workshop.mjs
 * Player-Facing Procedural Crafting Workbench with Expanded Inventory Grid, Detailed Roll Logs with Exact Tiers, and Showcase Completion Chat Cards
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS, CRAFT_TIER_PREFIXES } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

function getSafeSetting(key, fallback) {
  try {
    return game.settings.get(MODULE_ID, key) || fallback;
  } catch (err) {
    return fallback;
  }
}

async function setSafeSetting(key, value) {
  try {
    if (game.settings.settings.has(`${MODULE_ID}.${key}`)) {
      await game.settings.set(MODULE_ID, key, value);
    }
  } catch (err) {
    console.warn(`[${MODULE_ID}] Could not save setting ${key}:`, err);
  }
}

export const CRAFT_MATERIAL_RULES = {
  base: { name: "Base Material", rawUnit: "Standard Component", refinedUnit: "Refined Component", allowed: ["metal_weapon", "wood_weapon", "metal_armor", "leather_armor", "shield", "ammo", "alchemy", "poison", "siege"] },
  steel: { name: "Steel", rawUnit: "Steel Ingot", refinedUnit: "Refined Steel Ingot", allowed: ["metal_weapon", "metal_armor", "shield", "siege"] },
  adamantine: { name: "Adamantine", rawUnit: "Adamantine Ingot", refinedUnit: "Refined Adamantine Ingot", allowed: ["metal_weapon", "metal_armor", "shield"] },
  coldiron: { name: "Cold Iron", rawUnit: "Cold Iron Ingot", refinedUnit: "Refined Cold Iron Ingot", allowed: ["metal_weapon"] },
  silversheen: { name: "Alchemical Silver", rawUnit: "Alchemical Silver Ingot", refinedUnit: "Refined Alchemical Silver Ingot", allowed: ["metal_weapon"] },
  mithral: { name: "Mithral", rawUnit: "Mithral Ingot", refinedUnit: "Refined Mithral Ingot", allowed: ["metal_weapon", "metal_armor", "shield"] },
  darkwood: { name: "Darkwood", rawUnit: "Darkwood Timber", refinedUnit: "Refined Darkwood Timber", allowed: ["wood_weapon", "shield", "bow", "crossbow", "siege"] },
  dragonhide: { name: "Dragonhide", rawUnit: "Dragon Scales / Hide", refinedUnit: "Refined Dragon Scales", allowed: ["leather_armor", "metal_armor", "shield"] }
};

export const REFINING_RECIPES = [
  { id: "refine_steel", name: "Refined Steel Ingot", rawLabel: "2x Steel Ingot", rawPattern: /steel ingot|iron bar|steel bar/i, rawQty: 2, dc: 140, minRanks: 30, targetPrice: 25, weight: 2.0, img: "icons/commodities/metal/ingot-iron.webp" },
  { id: "refine_timber", name: "Refined Crafting Timber", rawLabel: "2x Crafting Timber", rawPattern: /crafting timber|wood log|hardwood/i, rawQty: 2, dc: 140, minRanks: 30, targetPrice: 15, weight: 3.0, img: "icons/commodities/materials/wood-log.webp" },
  { id: "refine_leather", name: "Refined Treated Leather", rawLabel: "2x Treated Leather", rawPattern: /treated leather|cured hide|leather roll/i, rawQty: 2, dc: 140, minRanks: 30, targetPrice: 20, weight: 1.5, img: "icons/commodities/leather/leather-brown.webp" },
  { id: "refine_mithral", name: "Refined Mithral Ingot", rawLabel: "2x Mithral Ingot", rawPattern: /mithral ingot|mithral bar/i, rawQty: 2, dc: 180, minRanks: 30, targetPrice: 1500, weight: 1.0, img: "icons/commodities/metal/ingot-silver.webp" },
  { id: "refine_adamantine", name: "Refined Adamantine Ingot", rawLabel: "2x Adamantine Ingot", rawPattern: /adamantine ingot|adamantine bar/i, rawQty: 2, dc: 220, minRanks: 30, targetPrice: 3000, weight: 2.0, img: "icons/commodities/metal/ingot-engraved-metal.webp" },
  { id: "refine_coldiron", name: "Refined Cold Iron Ingot", rawLabel: "2x Cold Iron Ingot", rawPattern: /cold iron ingot|cold iron bar/i, rawQty: 2, dc: 160, minRanks: 30, targetPrice: 200, weight: 2.0, img: "icons/commodities/metal/ingot-iron.webp" },
  { id: "refine_silversheen", name: "Refined Alchemical Silver Ingot", rawLabel: "2x Alchemical Silver Ingot", rawPattern: /alchemical silver|silver ingot/i, rawQty: 2, dc: 150, minRanks: 30, targetPrice: 100, weight: 2.0, img: "icons/commodities/metal/ingot-silver.webp" },
  { id: "refine_darkwood", name: "Refined Darkwood Timber", rawLabel: "2x Darkwood Timber", rawPattern: /darkwood timber|darkwood log/i, rawQty: 2, dc: 180, minRanks: 30, targetPrice: 200, weight: 1.5, img: "icons/commodities/materials/wood-log.webp" },
  { id: "refine_dragonhide", name: "Refined Dragon Scales", rawLabel: "2x Dragon Scales / Hide", rawPattern: /dragon scale|dragonhide/i, rawQty: 2, dc: 220, minRanks: 30, targetPrice: 1000, weight: 2.0, img: "icons/commodities/biological/scale-reptile-grey.webp" },
  { id: "craft_arcane_etcher", name: "Arcane Etcher", rawLabel: "1x Refined Steel Ingot + 1x Quartz/Glass", rawPattern: /(refined steel|quartz|glass|crystal)/i, rawQty: 2, dc: 150, minRanks: 20, targetPrice: 150, weight: 1.0, img: "icons/tools/hand/chisel.webp", isTool: true }
];

export class PlayerWorkshopApp extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.activeTab = "bench";
    this.selectedDiscipline = options.discipline || "";
    this.compendiumItems = [];
    this.selectedBaseItem = null;
    this.selectedMaterial = "base";
    this.isMasterwork = true;
    this.acceleratedDcBonus = 0;
    this.searchTerm = "";
    this.recipeSortBy = "name_asc";

    // Magic state
    this.selectedMagicItem = null;
    this.magicEnhLevel = 1;
    this.selectedMagicProperties = new Set();
    this.magicShortCompoundNames = true;
    this.isRushedMagic = false;
    this.applyLimitBreak = false;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-player-workshop",
      title: "⚒️ Artisan's Workbench & Crafting Forge",
      template: "",
      width: 1140,
      height: 920,
      resizable: true,
      classes: ["aeris-workshop-app"]
    });
  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    if (game.user.isGM) {
      buttons.unshift({
        label: "Settings & Packs",
        class: "workshop-gm-packs",
        icon: "fas fa-cog",
        onclick: () => this._openGmWorkshopSettingsDialog()
      });
    }
    return buttons;
  }

  _getActorBuffModifiers() {
    const flags = this.actor.flags?.[MODULE_ID] || {};
    const checkBonus = Number(flags.craftingCheckBonus || 0);
    const speedMultiplier = Number(flags.craftingSpeedMult || 1.0);
    const facilityBonus = Number(flags.facilityCheckBonus || 0);
    const facilitySpeed = Number(flags.facilitySpeedMult || 1.0);

    return {
      totalCheckMod: checkBonus + facilityBonus,
      totalSpeedMult: Math.max(0.1, speedMultiplier * facilitySpeed)
    };
  }

  _getAvailableCraftDisciplines() {
    const subSkills = this.actor.system?.skills?.crf?.subSkills || {};
    const disciplines = [];

    const disciplineMap = {
      cw: { label: "Craft (Weapons)", type: "weapon" },
      wea: { label: "Craft (Weapons)", type: "weapon" },
      arm: { label: "Craft (Armor)", type: "armor" },
      bow: { label: "Craft (Bows)", type: "bow" },
      gun: { label: "Craft (Firearms)", type: "firearm" },
      fir: { label: "Craft (Firearms)", type: "firearm" },
      alc: { label: "Craft (Alchemy)", type: "alchemy" },
      poi: { label: "Craft (Poison)", type: "poison" },
      siege: { label: "Craft (Siege Engines)", type: "siege" }
    };

    for (const [key, sub] of Object.entries(subSkills)) {
      const subName = (sub.name || "").toLowerCase();
      let matchedType = "general";

      if (disciplineMap[key]) matchedType = disciplineMap[key].type;
      else if (subName.includes("weap") || subName.includes("blacksmith")) matchedType = "weapon";
      else if (subName.includes("arm")) matchedType = "armor";
      else if (subName.includes("bow") || subName.includes("fletch")) matchedType = "bow";
      else if (subName.includes("gun") || subName.includes("firearm")) matchedType = "firearm";
      else if (subName.includes("alc")) matchedType = "alchemy";
      else if (subName.includes("poi") || subName.includes("tox")) matchedType = "poison";
      else if (subName.includes("siege")) matchedType = "siege";

      disciplines.push({
        key: `subSkills.${key}`,
        subKey: key,
        label: sub.name ? `Craft (${sub.name})` : (disciplineMap[key]?.label || `Craft (${key.toUpperCase()})`),
        type: matchedType,
        rank: sub.rank || 0,
        mod: sub.mod || 0,
        isGoldMode: (sub.rank || 0) >= 100,
        hasMagicAccess: (sub.rank || 0) >= 50,
        canReEnchant: (sub.rank || 0) >= 100
      });
    }

    if (disciplines.length === 0) {
      disciplines.push({
        key: "general",
        subKey: "general",
        label: "Craft (General)",
        type: "general",
        rank: this.actor.system?.skills?.crf?.rank || 0,
        mod: this.actor.system?.skills?.crf?.mod || 0,
        isGoldMode: (this.actor.system?.skills?.crf?.rank || 0) >= 100,
        hasMagicAccess: (this.actor.system?.skills?.crf?.rank || 0) >= 50,
        canReEnchant: (this.actor.system?.skills?.crf?.rank || 0) >= 100
      });
    }

    return disciplines;
  }

  _getMaxAllowedEnhancement(rank) {
    const gmConfig = getSafeSetting("workshopGmConfig", {});
    const caps = gmConfig.rankEnhancementCaps || { 50: 1, 80: 2, 110: 3, 140: 4, 170: 5, 200: 10 };
    
    let allowed = 0;
    const sortedThresholds = Object.keys(caps).map(Number).sort((a, b) => a - b);
    for (const thresh of sortedThresholds) {
      if (rank >= thresh) allowed = caps[thresh];
    }
    return allowed;
  }

  _checkMagicCraftPrerequisites() {
    const hasFeat = this.actor.items.some(i => /\b(craft magic arms|craft magic arms and armor)\b/i.test(i.name));
    const spellcraftRank = this.actor.system?.skills?.spl?.rank || 0;
    const disciplines = this._getAvailableCraftDisciplines();
    const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    
    const effectiveRank = Math.max(currentDisc.rank, spellcraftRank);
    const hasRank50 = effectiveRank >= 50;
    const hasArcaneEtcher = this.actor.items.some(i => /(arcane etcher|runecarver's chisel|enchanting stylus|arcane scribe)/i.test(i.name));
    const canReEnchant = effectiveRank >= 100;
    const maxAllowedTier = this._getMaxAllowedEnhancement(effectiveRank);

    return {
      canCraftMagic: (hasFeat || hasRank50) && hasArcaneEtcher,
      hasArcaneEtcher,
      canReEnchant,
      maxAllowedTier,
      effectiveRank,
      reason: !hasArcaneEtcher 
        ? "⚠️ Missing Required Tool: Arcane Etcher (Must be in inventory)" 
        : !(hasFeat || hasRank50) 
        ? "Requires 50+ Craft/Spellcraft Ranks or Craft Magic Arms & Armor Feat" 
        : "Unlocked"
    };
  }

  _getLimitBreakAvailability() {
    const gmConfig = getSafeSetting("workshopGmConfig", {});
    const minRank = gmConfig.limitBreakMinRank ?? 100;
    const maxDaily = gmConfig.limitBreakMaxDaily ?? 1;

    const disciplines = this._getAvailableCraftDisciplines();
    const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    if (currentDisc.rank < minRank) return { available: false, reason: `Requires ${minRank}+ Craft Ranks` };

    const todayStr = new Date().toISOString().split('T')[0];
    const flagData = this.actor.getFlag(MODULE_ID, "limitBreakTracker") || { date: todayStr, uses: 0 };
    const currentUses = flagData.date === todayStr ? flagData.uses : 0;

    return {
      available: currentUses < maxDaily,
      remaining: Math.max(0, maxDaily - currentUses),
      maxDaily,
      reason: currentUses >= maxDaily ? "Daily Limit-Break uses exhausted" : "Available"
    };
  }

  _getInventorySuppliesGrid() {
    const inventory = this.actor.items.contents;
    const pattern = /(ingot|bar|timber|wood|leather|hide|scale|scrap|mechanism|reagent|extract|dust|residue|gem|ruby|sapphire|topaz|emerald|diamond|opal|feather|oil|shard|core|etcher|stone|quartz)/i;
    
    return inventory.filter(i => pattern.test(i.name) && (i.system?.quantity ?? 1) > 0).map(i => ({
      name: i.name,
      img: i.img || "icons/svg/item-bag.svg",
      quantity: i.system?.quantity ?? 1,
      weight: i.system?.weight?.value ?? 0.1
    }));
  }

  _computeItemCraftMetrics(item) {
    if (item.isRefiningRecipe) {
      return { dc: item.dc, materialUnits: item.rawQty, costMult: 1.0, isExotic: false, isSimple: false };
    }

    const subType = (item.system?.subType || item.system?.weaponSubtype || "").toLowerCase();
    const name = item.name.toLowerCase();
    const baseTypes = item.system?.baseTypes || [];

    let baseDc = 150;
    let costMult = 1.0;
    let isExotic = subType === "exotic" || baseTypes.some(b => b.toLowerCase().includes("exotic")) || /\b(bastard|kama|kusarigama|falchion|spiked chain|shuriken)\b/i.test(name);
    let isSimple = subType === "simple" || baseTypes.some(b => b.toLowerCase().includes("simple")) || /\b(dagger|club|spear|shortbow|sling|staff|mace)\b/i.test(name);

    if (isSimple) { baseDc = 120; costMult = 0.8; }
    else if (isExotic) { baseDc = 180; costMult = 1.25; }

    return { dc: baseDc, costMult, isExotic, isSimple };
  }

  _calculateRequiredIngredients(baseItem, chosenMaterialKey, isMasterwork = true) {
    if (baseItem.isRefiningRecipe) {
      const inventory = this.actor.items.contents;
      const matchingItems = inventory.filter(invItem => baseItem.rawPattern.test(invItem.name) && (invItem.system?.quantity ?? 1) > 0);
      const totalAvailable = matchingItems.reduce((acc, it) => acc + (it.system?.quantity ?? 1), 0);
      return {
        list: [{ label: baseItem.rawLabel, qty: baseItem.rawQty, available: totalAvailable, satisfied: totalAvailable >= baseItem.rawQty, matchingItemIds: matchingItems.map(m => m.id) }],
        allSatisfied: totalAvailable >= baseItem.rawQty
      };
    }

    const type = baseItem.type;
    const subType = (baseItem.system?.subType || baseItem.system?.weaponSubtype || "").toLowerCase();
    const name = baseItem.name.toLowerCase();
    const ingredients = [];

    const matRule = CRAFT_MATERIAL_RULES[chosenMaterialKey] || CRAFT_MATERIAL_RULES.base;
    const isSpecialMat = chosenMaterialKey !== "base" && chosenMaterialKey !== "steel";
    const metrics = this._computeItemCraftMetrics(baseItem);

    const getMetalName = () => isMasterwork ? (isSpecialMat ? matRule.refinedUnit : "Refined Steel Ingot") : (isSpecialMat ? matRule.rawUnit : "Steel Ingot");
    const getWoodName = () => isMasterwork ? (isSpecialMat ? matRule.refinedUnit : "Refined Crafting Timber") : (isSpecialMat ? matRule.rawUnit : "Crafting Timber / Wood");
    const getLeatherName = () => isMasterwork ? (isSpecialMat ? matRule.refinedUnit : "Refined Treated Leather") : (isSpecialMat ? matRule.rawUnit : "Treated Leather");

    const getMetalPat = () => isMasterwork 
      ? (isSpecialMat ? new RegExp(`refined.*${matRule.name}`, "i") : /refined.*(steel|iron|metal|bar|ingot|plate)/i)
      : (isSpecialMat ? new RegExp(matRule.name, "i") : /(steel|iron|metal|bar|ingot|plate)/i);

    const getWoodPat = () => isMasterwork
      ? (isSpecialMat ? new RegExp(`refined.*${matRule.name}`, "i") : /refined.*(wood|timber|lumber|haft|stave)/i)
      : (isSpecialMat ? new RegExp(matRule.name, "i") : /(wood|timber|lumber|haft|stave)/i);

    const getLeatherPat = () => isMasterwork
      ? (isSpecialMat ? new RegExp(`refined.*${matRule.name}`, "i") : /refined.*(leather|hide|pelt|skin)/i)
      : (isSpecialMat ? new RegExp(matRule.name, "i") : /(leather|hide|pelt|skin)/i);

    const exoticExtra = metrics.isExotic ? 1 : 0;

    if (type === "weapon" && subType !== "ranged" && !/\b(bow|crossbow|pistol|musket)\b/i.test(name)) {
      const isWoodWeapon = /\b(club|greatclub|quarterstaff|staff|bo staff|nunchaku)\b/i.test(name);
      
      if (isWoodWeapon) {
        ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: (subType === "2h" ? 3 : 2) + exoticExtra });
      } else {
        if (subType === "light" || /\b(dagger|knife|kukri|kama)\b/i.test(name)) {
          ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 1 + exoticExtra });
          ingredients.push({ label: getLeatherName(), pattern: getLeatherPat(), qty: 1 });
        } else if (subType === "1h" || !subType.includes("2h")) {
          ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 2 + exoticExtra });
          ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 1 });
        } else {
          ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 4 + exoticExtra });
          ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 2 });
        }
      }
    } else if (type === "weapon" && /\b(bow|crossbow)\b/i.test(name)) {
      if (/\bcrossbow\b/i.test(name)) {
        ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 3 + exoticExtra });
        ingredients.push({ label: "Mechanical Components", pattern: /(mechanism|fittings|lock|gear|scrap|spring|metal)/i, qty: 1 });
      } else {
        ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 2 + exoticExtra });
        ingredients.push({ label: "Mechanical Components / String", pattern: /(string|cord|sinew|wire|mechanism)/i, qty: 1 });
      }
    } else if (type === "weapon" && /\b(pistol|musket|rifle|blunderbuss)\b/i.test(name)) {
      ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 3 + exoticExtra });
      ingredients.push({ label: "Mechanical Components", pattern: /(mechanism|fittings|lock|gear|scrap|spring)/i, qty: 1 });
      ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 1 });
    } else if (type === "armor" || type === "shield" || baseItem.system?.armor !== undefined) {
      if (subType === "light" || /\b(leather|padded|hide|quilted)\b/i.test(name)) {
        ingredients.push({ label: getLeatherName(), pattern: getLeatherPat(), qty: 3 });
      } else if (subType === "medium") {
        ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 4 });
        ingredients.push({ label: getLeatherName(), pattern: getLeatherPat(), qty: 2 });
      } else if (subType === "heavy") {
        ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 6 });
        ingredients.push({ label: getLeatherName(), pattern: getLeatherPat(), qty: 3 });
      } else {
        ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 2 });
        ingredients.push({ label: getLeatherName(), pattern: getLeatherPat(), qty: 1 });
      }
    } else if (type === "ammo") {
      ingredients.push({ label: "Crafting Timber / Metal", pattern: /(wood|timber|steel|iron|lead|metal)/i, qty: 1 });
      ingredients.push({ label: "Mechanical Components / Fletchings", pattern: /(feather|fletching|powder|casing|mechanism|scrap)/i, qty: 1 });
    } else {
      if (/\b(poison|toxin|venom)\b/i.test(name)) {
        ingredients.push({ label: "Toxic Extracts", pattern: /(venom|toxin|poison|gland|extract)/i, qty: 2 });
      } else {
        ingredients.push({ label: "Alchemical Reagents", pattern: /(reagent|extract|salt|sulfur|phosphorus|solvent|herb)/i, qty: 2 });
      }
    }

    const inventory = this.actor.items.contents;
    const resolvedIngredients = ingredients.map(req => {
      const matchingItems = inventory.filter(invItem => 
        req.pattern.test(invItem.name) && (invItem.system?.quantity ?? 1) > 0
      );
      const totalAvailable = matchingItems.reduce((acc, it) => acc + (it.system?.quantity ?? 1), 0);
      return {
        ...req,
        available: totalAvailable,
        satisfied: totalAvailable >= req.qty,
        matchingItemIds: matchingItems.map(m => m.id)
      };
    });

    const allSatisfied = resolvedIngredients.every(r => r.satisfied);
    return { list: resolvedIngredients, allSatisfied };
  }

  _calculateMagicReagents(totalEquivalentBonus, selectedPropsSet, existingItem = null) {
    const reagents = [];
    const inventory = this.actor.items.contents;

    const oldBonus = existingItem ? Math.max(0, Math.floor((existingItem.system?.enh || 0) / 10)) : 0;
    const netBonus = Math.max(1, totalEquivalentBonus - oldBonus);
    const residueNeeded = netBonus * 4;

    reagents.push({
      label: `${residueNeeded}x Arcane Residue (4 per net tier)`,
      pattern: /(arcane residue|enchanting dust|arcane dust)/i,
      qty: residueNeeded
    });

    const customProps = getSafeSetting("customProperties", {});
    const propRegistry = { ...WEAPON_ENCHANTMENTS, ...ARMOR_ENCHANTMENTS, ...customProps };

    for (const pKey of selectedPropsSet) {
      const prop = propRegistry[pKey];
      if (prop && prop.catalystName) {
        reagents.push({
          label: `1x ${prop.catalystName}`,
          pattern: prop.catalystPattern || new RegExp(prop.catalystName, "i"),
          qty: 1
        });
      }
    }

    const resolved = reagents.map(req => {
      const matchingItems = inventory.filter(invItem => 
        req.pattern.test(invItem.name) && (invItem.system?.quantity ?? 1) > 0
      );
      const totalAvailable = matchingItems.reduce((acc, it) => acc + (it.system?.quantity ?? 1), 0);
      return {
        ...req,
        available: totalAvailable,
        satisfied: totalAvailable >= req.qty,
        matchingItemIds: matchingItems.map(m => m.id)
      };
    });

    const allSatisfied = resolved.every(r => r.satisfied);
    return { list: resolved, allSatisfied, residueNeeded };
  }

  async _loadCompendiumItemsForDiscipline(disciplineType) {
    const savedPacksMap = getSafeSetting("craftCompendiums", {});
    let packKeys = savedPacksMap[disciplineType];

    const allItemPacks = game.packs.filter(p => p.documentName === "Item");

    let targetPacks = [];
    if (Array.isArray(packKeys) && packKeys.length > 0) {
      targetPacks = allItemPacks.filter(p => 
        packKeys.some(k => k.toLowerCase() === p.collection.toLowerCase() || k.toLowerCase() === p.metadata.id?.toLowerCase())
      );
    }

    if (targetPacks.length === 0) {
      if (["weapon", "bow", "firearm", "siege"].includes(disciplineType)) {
        targetPacks = allItemPacks.filter(p => p.collection.includes("weapon") || p.metadata.label.toLowerCase().includes("weapon"));
      } else if (disciplineType === "armor") {
        targetPacks = allItemPacks.filter(p => p.collection.includes("armor") || p.metadata.label.toLowerCase().includes("armor"));
      } else {
        targetPacks = allItemPacks;
      }
    }

    const items = [];
    for (const pack of targetPacks) {
      const index = await pack.getIndex({
        fields: ["system.subType", "system.weaponSubtype", "system.equipmentType", "system.armor", "system.slot", "system.price", "system.weaponGroups", "system.baseTypes"]
      });

      for (const entry of index) {
        if (this._filterItemByDiscipline(entry, disciplineType)) {
          entry._packCollection = pack.collection;
          entry.computedDc = this._computeItemCraftMetrics(entry).dc;
          items.push(entry);
        }
      }
    }
    return items;
  }

  _filterItemByDiscipline(item, disciplineType) {
    const type = item.type;
    const subType = (item.system?.subType || item.system?.weaponSubtype || "").toLowerCase();
    const eqType = (item.system?.equipmentType || "").toLowerCase();
    const wpnGroup = item.system?.weaponGroups || [];
    const name = item.name.toLowerCase();

    if (disciplineType === "weapon") {
      if (type !== "weapon" || subType === "ammo") return false;
      if (wpnGroup.includes("bows") || wpnGroup.includes("crossbows") || wpnGroup.includes("firearms")) return false;
      if (/\b(bow|crossbow|pistol|musket|rifle|blunderbuss)\b/i.test(name)) return false;
      return true;
    }

    if (disciplineType === "bow") {
      if (type === "weapon" && (wpnGroup.includes("bows") || wpnGroup.includes("crossbows") || /\b(bow|crossbow|arbalest)\b/i.test(name))) return true;
      if (type === "ammo" && /\b(arrow|arrows|bolt|bolts)\b/i.test(name)) return true;
      return false;
    }

    if (disciplineType === "armor") {
      if (type === "armor" || type === "shield" || ["armor", "shield"].includes(eqType) || ["armor", "shield"].includes(subType)) return true;
      return false;
    }

    if (disciplineType === "firearm") {
      if (type === "weapon" && (wpnGroup.includes("firearms") || /\b(pistol|musket|rifle|culverin|blunderbuss)\b/i.test(name))) return true;
      if (type === "ammo" && /\b(bullet|bullets|cartridge|cartridges|powder)\b/i.test(name)) return true;
      return false;
    }

    if (disciplineType === "alchemy") {
      if (subType === "potion" || eqType === "alchemical" || subType === "alchemical" || /\b(alchemist|acid|fire|tanglefoot|smokestick|sunrod|flask)\b/i.test(name)) return true;
      return false;
    }

    if (disciplineType === "poison") {
      if (subType === "poison" || /\b(poison|toxin|venom|bane|belladonna)\b/i.test(name)) return true;
      return false;
    }

    if (disciplineType === "siege") {
      if (wpnGroup.includes("siege") || /\b(ballista|catapult|trebuchet|ram|cannon)\b/i.test(name)) return true;
      return false;
    }

    return true;
  }

  async getData() {
    const rawProjects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
    const disciplines = this._getAvailableCraftDisciplines();
    const magicPrereqs = this._checkMagicCraftPrerequisites();
    const limitBreakInfo = this._getLimitBreakAvailability();
    const buffInfo = this._getActorBuffModifiers();
    const suppliesGrid = this._getInventorySuppliesGrid();

    if (!this.selectedDiscipline && disciplines.length > 0) {
      this.selectedDiscipline = disciplines[0].key;
    } else if (this.selectedDiscipline && !this.selectedDiscipline.startsWith("subSkills.")) {
      const match = disciplines.find(d => d.subKey === this.selectedDiscipline || d.type === this.selectedDiscipline);
      if (match) this.selectedDiscipline = match.key;
    }

    const currentDiscipline = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    this.compendiumItems = await this._loadCompendiumItemsForDiscipline(currentDiscipline.type);

    const availableRefining = REFINING_RECIPES.filter(r => currentDiscipline.rank >= r.minRanks).map(r => ({
      _id: r.id,
      name: `⚙️ ${r.name} (Refining)`,
      img: r.img,
      isRefiningRecipe: true,
      rawLabel: r.rawLabel,
      rawPattern: r.rawPattern,
      rawQty: r.rawQty,
      dc: r.dc,
      computedDc: r.dc,
      targetPrice: r.targetPrice,
      weight: r.weight,
      system: { price: r.targetPrice, weight: { value: r.weight } }
    }));

    let combinedItems = [...availableRefining, ...this.compendiumItems];

    if (this.recipeSortBy === "name_asc") combinedItems.sort((a, b) => a.name.localeCompare(b.name));
    else if (this.recipeSortBy === "dc_asc") combinedItems.sort((a, b) => (a.computedDc || 150) - (b.computedDc || 150));
    else if (this.recipeSortBy === "dc_desc") combinedItems.sort((a, b) => (b.computedDc || 150) - (a.computedDc || 150));
    else if (this.recipeSortBy === "price_asc") combinedItems.sort((a, b) => (a.system?.price || 0) - (b.system?.price || 0));
    else if (this.recipeSortBy === "price_desc") combinedItems.sort((a, b) => (b.system?.price || 0) - (a.system?.price || 0));

    const validMaterials = this._getValidMaterialsForItem(this.selectedBaseItem);
    if (!validMaterials[this.selectedMaterial]) {
      this.selectedMaterial = "base";
    }

    let ingredientsInfo = { list: [], allSatisfied: false };
    if (this.selectedBaseItem) {
      ingredientsInfo = this._calculateRequiredIngredients(this.selectedBaseItem, this.selectedMaterial, this.isMasterwork);
    }

    const playerInventory = this.actor.items.contents;
    const enchantableInventoryItems = playerInventory.filter(i => {
      const isMasterwork = i.system?.masterwork === true;
      const isEligibleType = ["weapon", "armor", "shield", "equipment"].includes(i.type);
      return isMasterwork && isEligibleType;
    });

    const customProps = getSafeSetting("customProperties", {});
    let availableMagicProperties = {};
    let totalEquivalentBonus = Number(this.magicEnhLevel);

    if (this.selectedMagicItem) {
      const isArmor = this.selectedMagicItem.type === "armor" || this.selectedMagicItem.system?.armor !== undefined;
      availableMagicProperties = isArmor ? { ...ARMOR_ENCHANTMENTS, ...customProps } : { ...WEAPON_ENCHANTMENTS, ...customProps };
      
      for (const p of this.selectedMagicProperties) {
        totalEquivalentBonus += (availableMagicProperties[p]?.cost || 0);
      }
    }

    let magicReagentsInfo = { list: [], allSatisfied: false };
    if (this.selectedMagicItem) {
      magicReagentsInfo = this._calculateMagicReagents(totalEquivalentBonus, this.selectedMagicProperties, this.selectedMagicItem);
    }

    const compoundingMagicDc = 220 + (15 * totalEquivalentBonus) + (5 * Math.pow(totalEquivalentBonus, 2)) + (this.isRushedMagic ? 50 : 0);
    const baseItemMetrics = this.selectedBaseItem ? this._computeItemCraftMetrics(this.selectedBaseItem) : { dc: 150, costMult: 1.0 };

    return {
      actor: this.actor,
      isGM: game.user.isGM,
      activeTab: this.activeTab,
      disciplines,
      selectedDiscipline: this.selectedDiscipline,
      currentDiscipline,
      items: combinedItems,
      selectedBaseItem: this.selectedBaseItem,
      selectedMaterial: this.selectedMaterial,
      isMasterwork: this.isMasterwork,
      validMaterials,
      acceleratedDcBonus: this.acceleratedDcBonus,
      ingredientsInfo,
      projects: rawProjects,
      searchTerm: this.searchTerm,
      recipeSortBy: this.recipeSortBy,
      buffInfo,
      limitBreakInfo,
      applyLimitBreak: this.applyLimitBreak,
      suppliesGrid,
      baseItemMetrics,
      
      magicPrereqs,
      enchantableInventoryItems,
      selectedMagicItem: this.selectedMagicItem,
      magicEnhLevel: this.magicEnhLevel,
      totalEquivalentBonus,
      compoundingMagicDc,
      isRushedMagic: this.isRushedMagic,
      availableMagicProperties,
      selectedMagicProperties: this.selectedMagicProperties,
      magicReagentsInfo,
      magicShortCompoundNames: this.magicShortCompoundNames
    };
  }

  async _renderInner(data) {
    const discOpts = data.disciplines.map(d => 
      `<option value="${d.key}" ${d.key === data.selectedDiscipline ? "selected" : ""}>${d.label} (+${d.mod + data.buffInfo.totalCheckMod} | ${d.rank} Ranks${d.isGoldMode ? ' ⚡ Gold' : ''}${d.hasMagicAccess ? ' ✨ Magic' : ''})</option>`
    ).join("");

    const matOpts = Object.entries(data.validMaterials).map(([k, v]) => 
      `<option value="${k}" ${k === data.selectedMaterial ? "selected" : ""}>${v.name}</option>`
    ).join("");

    const itemRows = data.items.map(i => `
      <div class="bench-item-row ${data.selectedBaseItem?._id === i._id ? "selected" : ""}" data-id="${i._id}" data-pack="${i._packCollection || ''}" data-refining="${i.isRefiningRecipe ? 'true' : 'false'}" style="display:flex; align-items:center; gap:6px; padding:5px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.06); background:${data.selectedBaseItem?._id === i._id ? "rgba(46,204,113,0.15)" : "transparent"};">
        <img src="${i.img || "icons/svg/item-bag.svg"}" width="26" height="26" style="border-radius:3px;" />
        <div style="flex:1; overflow:hidden;">
          <strong style="font-size:0.85em; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i.name}</strong>
          <span style="font-size:0.75em; color:#777;">DC ${i.computedDc || 150} | Val: ${i.system?.price || 0} GP</span>
        </div>
      </div>
    `).join("");

    const activeProjectsHtml = data.projects.length > 0 ? data.projects.map((proj, idx) => {
      const pct = Math.min(100, Math.round((proj.currentGp / proj.targetGp) * 100));
      const failLimit = proj.failMode === "zero" ? "Ruin at 0 GP" : (proj.maxAllowedStrikes || Math.max(2, Math.floor(proj.requiredRolls / 3)));
      
      const shiftsLogHtml = proj.shiftsLogged.map((s, sIdx) => {
        let tierLabel = s.shiftTier !== undefined ? `[Tier ${s.shiftTier >= 0 ? '+' : ''}${s.shiftTier} (${s.shiftPctMod >= 0 ? '+' : ''}${s.shiftPctMod}%)]` : "";
        return `
          <div style="font-size:0.75em; padding:3px 6px; border-bottom:1px solid #e9ecef; display:flex; justify-content:space-between; align-items:center; color:${s.isNatBoon ? '#8e44ad' : s.isNatFlaw ? '#c0392b' : s.success ? '#27ae60' : '#d35400'}; background:${sIdx % 2 === 0 ? '#fff' : '#fdfdfe'};">
            <div>
              <strong>Shift ${sIdx+1} [${s.phaseLabel}]:</strong> ${s.isNatBoon ? '🌟 NAT BOON! ' : s.isNatFlaw ? '💀 NAT FLAW! ' : ''}Check <strong>${s.roll}</strong> (vs DC ${proj.dc}, Margin: ${s.mos >= 0 ? '+' : ''}${s.mos})
            </div>
            <div style="text-align:right;">
              <span style="font-weight:bold; color:#2f3542;">${s.targetFacet}:</span> <code style="background:#edf2f7; padding:1px 4px; border-radius:3px;">${tierLabel} ${s.modifierText}</code>
            </div>
          </div>
        `;
      }).join("");

      return `
        <div style="background:#fff; border:1px solid #ced6e0; border-radius:6px; padding:10px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div>
              <strong style="font-size:1.05em; color:var(--color-text-dark-primary);">${proj.name}</strong>
              <span style="font-size:0.8em; color:#666; margin-left:6px;">(DC ${proj.dc} | ${proj.isMagic ? (proj.isUpgrade ? '✨ Magic Upgrade' : '✨ Magic Infusion') : `Material: ${proj.material}`} ${proj.limitBreakApplied ? ' | ⚡ Limit-Break' : ''})</span>
            </div>
            <div>
              <span style="font-size:0.8em; font-weight:bold; color:${proj.failedChecks >= (typeof failLimit === 'number' ? failLimit - 1 : 99) ? '#c0392b' : '#555'};">
                Strikes: ${proj.failedChecks} ${typeof failLimit === 'number' ? `/ ${failLimit}` : `(${failLimit})`}
              </span>
            </div>
          </div>

          <div style="background:#e0e0e0; border-radius:4px; height:18px; width:100%; overflow:hidden; position:relative; margin-bottom:6px;">
            <div style="background:linear-gradient(90deg, #2ecc71, #27ae60); height:100%; width:${pct}%; transition:width 0.3s ease;"></div>
            <span style="position:absolute; width:100%; text-align:center; top:0; left:0; font-size:0.75em; line-height:18px; font-weight:bold; color:#111;">
              ${proj.currentGp.toFixed(1)} / ${proj.targetGp} GP (${pct}%) — Shift ${proj.shiftsLogged.length}/${proj.requiredRolls}
            </span>
          </div>

          <!-- DETAILED ROLL LOG (EXPANDED BY DEFAULT) -->
          <details open style="background:#f8f9fa; border:1px solid #ced6e0; border-radius:4px; padding:6px; margin-bottom:6px;">
            <summary style="font-size:0.78em; font-weight:bold; cursor:pointer; color:#2f3542; outline:none; user-select:none;">
              📜 Detailed Shift Roll History & Facet Breakdown (${proj.shiftsLogged.length} shifts recorded)
            </summary>
            <div style="max-height:140px; overflow-y:auto; margin-top:6px; border:1px solid #ced6e0; border-radius:3px;">
              ${shiftsLogHtml || '<span style="font-size:0.75em; color:#777; padding:6px; display:block;">No shifts worked yet. Click Work 1-Hour or 4-Hours below to begin.</span>'}
            </div>
          </details>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75em; color:#777;">
              Active Phase: ${proj.isMagic 
                ? (proj.shiftsLogged.length < Math.floor(proj.requiredRolls/3) ? "Phase 1: Aetheric Attunement & Matrix Inscription" : proj.shiftsLogged.length < Math.floor(proj.requiredRolls*2/3) ? "Phase 2: Elemental & Weave Binding" : "Phase 3: Harmonic Resonance & Sealing")
                : (proj.shiftsLogged.length < Math.floor(proj.requiredRolls/3) ? "Phase 1: Smelting & Ingot Prep" : proj.shiftsLogged.length < Math.floor(proj.requiredRolls*2/3) ? "Phase 2: Forging & Geometry" : "Phase 3: Honing & Stabilization")}
            </span>
            <div style="display:flex; gap:6px;">
              ${pct >= 100 ? `
                <button type="button" class="claim-project-btn" data-idx="${idx}" style="background:#27ae60; color:#fff; font-size:0.8em; padding:4px 14px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  ✨ Claim Finished Item
                </button>
              ` : `
                <button type="button" class="work-shift-btn" data-idx="${idx}" style="background:#2f3542; color:#fff; font-size:0.8em; padding:4px 10px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  🔨 Work 1 Hour
                </button>
                <button type="button" class="work-4hour-btn" data-idx="${idx}" style="background:#34495e; color:#fff; font-size:0.8em; padding:4px 10px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  🔨 Work 4 Hours (4x)
                </button>
              `}
              <button type="button" class="abandon-project-btn" data-idx="${idx}" style="background:#c0392b; color:#fff; font-size:0.8em; padding:4px 8px; border:none; border-radius:3px; cursor:pointer;" title="Abandon project and recover 50% scrap">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("") : '<p style="text-align:center; color:#777; padding:24px;">No active crafting projects in progress. Choose a blueprint or enchanting project!</p>';

    const enchantableRows = data.enchantableInventoryItems.map(i => `
      <div class="magic-select-row ${data.selectedMagicItem?.id === i.id ? "selected" : ""}" data-id="${i.id}" style="display:flex; align-items:center; gap:6px; padding:5px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.06); background:${data.selectedMagicItem?.id === i.id ? "rgba(155,89,182,0.15)" : "transparent"};">
        <img src="${i.img}" width="26" height="26" style="border-radius:3px;" />
        <span style="font-size:0.85em; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i.name}</span>
        <span style="font-size:0.75em; color:#777;">${i.system?.enh ? `+${i.system.enh}` : 'Masterwork'} | ${i.system?.price || 0} GP</span>
      </div>
    `).join("");

    const magicPropRows = Object.entries(data.availableMagicProperties).map(([k, v]) => `
      <label style="display:flex; align-items:center; gap:6px; font-size:0.85em; margin-bottom:3px; cursor:pointer; padding:3px; border-bottom:1px solid rgba(0,0,0,0.04);">
        <input type="checkbox" class="magic-prop-cb" value="${k}" ${data.selectedMagicProperties.has(k) ? "checked" : ""}>
        <strong>${v.baseName}</strong> <span style="color:#666;">(+${v.cost})</span>
      </label>
    `).join("");

    const isArmorEnchant = data.selectedMagicItem?.type === "armor" || data.selectedMagicItem?.system?.armor !== undefined;
    const baseMultCost = isArmorEnchant ? 500 : 1000;
    const oldTier = data.selectedMagicItem ? Math.max(0, Math.floor((data.selectedMagicItem.system?.enh || 0) / 10)) : 0;
    const oldCost = Math.pow(oldTier, 2) * baseMultCost;
    const totalGoldCost = Math.max(baseMultCost, (Math.pow(data.totalEquivalentBonus, 2) * baseMultCost) - oldCost);

    const isEnhAllowed = data.totalEquivalentBonus <= data.magicPrereqs.maxAllowedTier;

    // EXPANDED INVENTORY SUPPLIES GRID
    const suppliesGridHtml = data.suppliesGrid.length > 0 ? data.suppliesGrid.map(s => `
      <div style="display:flex; align-items:center; gap:6px; background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:4px 6px; font-size:0.78em; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <img src="${s.img}" width="22" height="22" style="border-radius:3px;" />
        <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500;" title="${s.name}">${s.name}</span>
        <strong style="color:#2f3542; background:#e2e8f0; padding:1px 5px; border-radius:3px;">x${s.quantity}</strong>
      </div>
    `).join("") : '<span style="font-size:0.8em; color:#777; grid-column:span 3; padding:8px;">No crafting materials or reagents found in character inventory.</span>';

    const html = `
      <div style="display:flex; flex-direction:column; height:100%; gap:8px; padding:8px; font-family:var(--font-primary);">
        
        <!-- HEADER NAVIGATION TABS -->
        <nav style="display:flex; gap:8px; border-bottom:2px solid var(--color-border-light-2); padding-bottom:6px;">
          <button type="button" class="workshop-tab-btn ${data.activeTab === "bench" ? "active" : ""}" data-tab="bench" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "bench" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "bench" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            📐 Recipe & Refining Bench
          </button>
          <button type="button" class="workshop-tab-btn ${data.activeTab === "magic" ? "active" : ""}" data-tab="magic" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "magic" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "magic" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ✨ Magic Enchanting
          </button>
          <button type="button" class="workshop-tab-btn ${data.activeTab === "active" ? "active" : ""}" data-tab="active" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "active" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "active" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ⚒️ Active Projects (${data.projects.length})
          </button>
        </nav>

        ${data.activeTab === "bench" ? `
          <!-- MUNDANE & REFINING RECIPE BENCH -->
          <div style="display:flex; flex:1; gap:12px; overflow:hidden;">
            
            <!-- LEFT COLUMN: BLUEPRINTS & SORTING -->
            <div style="flex:1.1; display:flex; flex-direction:column; gap:6px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
              <div style="display:flex; gap:6px;">
                <div style="flex:1;">
                  <label style="font-size:0.75em; font-weight:bold;">Craft Discipline</label>
                  <select id="workshop-discipline-select" style="width:100%; padding:3px; font-size:0.8em;">${discOpts}</select>
                </div>
                <div style="flex:0.9;">
                  <label style="font-size:0.75em; font-weight:bold;">Sort By</label>
                  <select id="workshop-sort-select" style="width:100%; padding:3px; font-size:0.8em;">
                    <option value="name_asc" ${data.recipeSortBy==='name_asc'?'selected':''}>Name (A-Z)</option>
                    <option value="dc_asc" ${data.recipeSortBy==='dc_asc'?'selected':''}>DC (Lowest)</option>
                    <option value="dc_desc" ${data.recipeSortBy==='dc_desc'?'selected':''}>DC (Highest)</option>
                    <option value="price_asc" ${data.recipeSortBy==='price_asc'?'selected':''}>Price (Lowest)</option>
                    <option value="price_desc" ${data.recipeSortBy==='price_desc'?'selected':''}>Price (Highest)</option>
                  </select>
                </div>
              </div>

              <input type="text" id="workshop-search-input" value="${data.searchTerm}" placeholder="🔍 Search blueprints..." style="padding:4px; font-size:0.8em; border:1px solid #ced6e0; border-radius:3px;">
              
              <div style="flex-grow:1; max-height:480px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                ${itemRows || `<p style="padding:10px; font-size:0.85em; color:#777;">No blueprints found. Use ⚙️ Settings on the title bar to configure source compendiums.</p>`}
              </div>
            </div>

            <!-- RIGHT COLUMN: BLUEPRINT SPECS & MATERIAL CHECK -->
            <div style="flex:1.2; display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.02); padding:8px; border-radius:6px; border:1px solid #ced6e0; overflow-y:auto;">
              <strong style="font-size:0.9em; border-bottom:1px solid #ccc; padding-bottom:3px;">Blueprint & Material Requirements</strong>
              
              ${data.selectedBaseItem ? `
                <div style="font-size:0.82em; line-height:1.35;">
                  <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                    <img src="${data.selectedBaseItem.img}" width="30" height="30" style="border-radius:3px;" />
                    <div>
                      <strong style="font-size:1.05em;">${data.selectedBaseItem.name}</strong><br/>
                      <span style="color:#555;">Base Price: ${data.selectedBaseItem.targetPrice || data.selectedBaseItem.system?.price || 0} GP | Target Goal: ${data.selectedBaseItem.isRefiningRecipe ? (data.selectedBaseItem.targetPrice || 50) : (data.selectedBaseItem.system?.price || 10) + (data.isMasterwork ? 300 : 0)} GP</span>
                    </div>
                  </div>

                  ${!data.selectedBaseItem.isRefiningRecipe ? `
                    <div style="display:flex; gap:6px; margin-bottom:4px;">
                      <div style="flex:1;">
                        <label style="font-size:0.75em; font-weight:bold;">Special Material</label>
                        <select id="workshop-material-select" style="width:100%; padding:2px; font-size:0.8em;">${matOpts}</select>
                      </div>
                      <div style="flex:1;">
                        <label style="font-size:0.75em; font-weight:bold;">Pacing (Accelerated DC)</label>
                        <select id="workshop-acc-dc" style="width:100%; padding:2px; font-size:0.8em;">
                          <option value="0" ${data.acceleratedDcBonus===0?"selected":""}>Standard DC (+0)</option>
                          <option value="50" ${data.acceleratedDcBonus===50?"selected":""}>Accelerated (+50 DC)</option>
                          <option value="100" ${data.acceleratedDcBonus===100?"selected":""}>Rapid Rush (+100 DC)</option>
                        </select>
                      </div>
                    </div>

                    <div style="margin-bottom:4px;">
                      <label style="display:flex; align-items:center; gap:4px; font-size:0.8em; font-weight:bold; cursor:pointer;">
                        <input type="checkbox" id="workshop-is-masterwork" ${data.isMasterwork ? "checked" : ""}>
                        <span>Masterwork Quality (Requires Refined Materials, +300 GP)</span>
                      </label>
                    </div>
                  ` : `
                    <p style="font-size:0.75em; color:#2980b9; margin-bottom:4px;"><em>Refining recipe: Treats raw stock into refined components for masterwork forging.</em></p>
                  `}

                  ${data.limitBreakInfo.available ? `
                    <div style="background:rgba(155,89,182,0.1); border:1px solid #8e44ad; border-radius:3px; padding:3px 6px; margin-bottom:4px;">
                      <label style="display:flex; align-items:center; gap:4px; font-size:0.75em; font-weight:bold; cursor:pointer; color:#8e44ad;">
                        <input type="checkbox" id="workshop-limit-break" ${data.applyLimitBreak ? "checked" : ""}>
                        <span>⚡ Artisan Limit-Break (${data.limitBreakInfo.remaining}/${data.limitBreakInfo.maxDaily} Uses: Tier ±5 / ±35% Variance)</span>
                      </label>
                    </div>
                  ` : ""}

                  <strong style="font-size:0.8em;">Required Inventory Materials:</strong>
                  <div style="background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:4px; margin:2px 0 6px 0;">
                    ${data.ingredientsInfo.list.map(ing => `
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75em; padding:1px 0; color:${ing.satisfied ? '#27ae60' : '#c0392b'};">
                        <span>${ing.satisfied ? '✔️' : '❌'} ${ing.qty}x ${ing.label}</span>
                        <span>(You have: ${ing.available})</span>
                      </div>
                    `).join("")}
                  </div>

                  <!-- EXPANDED INVENTORY SUPPLIES SECTION -->
                  <div style="background:#f8f9fa; border:1px solid #ced6e0; border-radius:4px; padding:6px; margin-bottom:6px;">
                    <strong style="font-size:0.8em; color:#2f3542; display:block; margin-bottom:4px;">📦 Inventory Crafting Stock (${data.suppliesGrid.length} items)</strong>
                    <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap:4px; max-height:130px; overflow-y:auto; padding:2px;">
                      ${suppliesGridHtml}
                    </div>
                  </div>

                  <div style="font-size:0.75em; color:#666; line-height:1.25;">
                    <div>• <strong>Hourly Craft DC:</strong> ${data.selectedBaseItem.isRefiningRecipe ? data.selectedBaseItem.dc : data.baseItemMetrics.dc + data.acceleratedDcBonus} (Base ${data.baseItemMetrics.dc} + Speed)</div>
                    <div>• <strong>Buffs Active:</strong> +${data.buffInfo.totalCheckMod} Check | ${data.buffInfo.totalSpeedMult}x Speed Multiplier</div>
                  </div>
                </div>

                <button type="button" id="start-project-btn" ${!data.ingredientsInfo.allSatisfied ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="margin-top:auto; padding:8px; font-weight:bold; background:#2f3542; color:#fff; border:none; border-radius:4px; cursor:pointer;">
                  ${data.ingredientsInfo.allSatisfied ? '🔥 Consume Materials & Begin Project' : '⚠️ Missing Required Ingredients in Inventory'}
                </button>
              ` : '<p style="text-align:center; color:#777; margin-top:60px;">Select a blueprint on the left to verify required inventory materials.</p>'}
            </div>
          </div>
        ` : data.activeTab === "magic" ? `
          <!-- MAGIC ENCHANTING BENCH TAB -->
          <div style="display:flex; flex:1; gap:12px; overflow:hidden;">
            ${!data.magicPrereqs.canCraftMagic ? `
              <div style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; text-align:center; color:#777;">
                <i class="fas fa-lock" style="font-size:3em; color:#c0392b; margin-bottom:12px;"></i>
                <h3 style="color:#2f3542;">Magic Enchanting Locked</h3>
                <p style="font-size:0.9em; max-width:480px;">${data.magicPrereqs.reason}</p>
                <p style="font-size:0.8em; color:#555;">Craft an <strong>Arcane Etcher</strong> on the Recipe Bench to unlock rune-scribing capabilities.</p>
              </div>
            ` : `
              <div style="flex:1.1; display:flex; flex-direction:column; gap:6px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
                <strong style="font-size:0.85em;">Select Masterwork Base Item from Inventory:</strong>
                <div style="flex-grow:1; max-height:540px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                  ${enchantableRows || '<p style="padding:10px; font-size:0.85em; color:#777;">No masterwork or forged equipment in inventory available to enchant.</p>'}
                </div>
              </div>

              <div style="flex:1.2; display:flex; flex-direction:column; gap:6px; background:rgba(0,0,0,0.02); padding:8px; border-radius:6px; border:1px solid #ced6e0; overflow-y:auto;">
                <strong style="font-size:0.9em; border-bottom:1px solid #ccc; padding-bottom:3px;">✨ Arcane Enchantment Blueprint & Catalysts</strong>
                
                ${data.selectedMagicItem ? `
                  <div style="font-size:0.82em; line-height:1.35;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                      <img src="${data.selectedMagicItem.img}" width="30" height="30" style="border-radius:3px;" />
                      <div>
                        <strong style="font-size:1.05em;">${data.selectedMagicItem.name}</strong><br/>
                        <span style="color:#555;">Base Enhancement: +${data.selectedMagicItem.system?.enh || 0} | Total Equivalent Tier: +${data.totalEquivalentBonus * 10} (+${data.totalEquivalentBonus})</span>
                      </div>
                    </div>

                    <div style="margin-bottom:4px;">
                      <label style="font-size:0.75em; font-weight:bold;">Enhancement Bonus (Cap: Tier +${data.magicPrereqs.maxAllowedTier})</label>
                      <select id="magic-enh-select" style="width:100%; padding:2px; font-size:0.8em;">
                        <option value="0" ${data.magicEnhLevel===0?"selected":""}>+0 (Properties Only)</option>
                        <option value="1" ${data.magicEnhLevel===1?"selected":""} ${data.magicPrereqs.maxAllowedTier < 1 ? 'disabled' : ''}>+1 (+10 Scaled)</option>
                        <option value="2" ${data.magicEnhLevel===2?"selected":""} ${data.magicPrereqs.maxAllowedTier < 2 ? 'disabled' : ''}>+2 (+20 Scaled)</option>
                        <option value="3" ${data.magicEnhLevel===3?"selected":""} ${data.magicPrereqs.maxAllowedTier < 3 ? 'disabled' : ''}>+3 (+30 Scaled)</option>
                        <option value="4" ${data.magicEnhLevel===4?"selected":""} ${data.magicPrereqs.maxAllowedTier < 4 ? 'disabled' : ''}>+4 (+40 Scaled)</option>
                        <option value="5" ${data.magicEnhLevel===5?"selected":""} ${data.magicPrereqs.maxAllowedTier < 5 ? 'disabled' : ''}>+5 (+50 Scaled)</option>
                      </select>
                    </div>

                    <strong style="font-size:0.8em;">Special Enchantments:</strong>
                    <div style="max-height:110px; overflow-y:auto; background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:3px; margin:2px 0;">
                      ${magicPropRows || '<span style="font-size:0.75em; color:#777;">No special properties available for this item.</span>'}
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                      <label style="display:flex; align-items:center; gap:4px; font-size:0.75em; cursor:pointer;">
                        <input type="checkbox" id="magic-rushed-cb" ${data.isRushedMagic ? "checked" : ""}>
                        <span><strong>Rushed (+50 DC, 2.0x Speed)</strong></span>
                      </label>
                      <label style="display:flex; align-items:center; gap:4px; font-size:0.75em; cursor:pointer;">
                        <input type="checkbox" id="magic-short-names" ${data.magicShortCompoundNames ? "checked" : ""}>
                        <span>Compound Names</span>
                      </label>
                    </div>

                    <strong style="font-size:0.8em;">Required Magical Catalysts & Residue:</strong>
                    <div style="background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:4px; margin:2px 0 6px 0;">
                      ${data.magicReagentsInfo.list.map(ing => `
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.75em; padding:1px 0; color:${ing.satisfied ? '#27ae60' : '#c0392b'};">
                          <span>${ing.satisfied ? '✔️' : '❌'} ${ing.label}</span>
                          <span>(You have: ${ing.available})</span>
                        </div>
                      `).join("")}
                    </div>

                    <div style="font-size:0.75em; color:#666; line-height:1.25;">
                      <div>• <strong>Compounding Enchanting DC:</strong> ${data.compoundingMagicDc}</div>
                      <div>• <strong>Upgrade Craft Cost:</strong> ${totalGoldCost} GP (Based on +${data.totalEquivalentBonus} tier)</div>
                      ${!isEnhAllowed ? `<div style="color:#c0392b; font-weight:bold;">⚠️ Exceeds rank cap (+${data.magicPrereqs.maxAllowedTier} allowed at ${data.magicPrereqs.effectiveRank} ranks).</div>` : ''}
                    </div>
                  </div>

                  <button type="button" id="start-magic-project-btn" ${(!data.magicReagentsInfo.allSatisfied || !isEnhAllowed) ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="margin-top:auto; padding:8px; font-weight:bold; background:#8e44ad; color:#fff; border:none; border-radius:4px; cursor:pointer;">
                    ${!isEnhAllowed ? '⚠️ Rank Too Low for This Tier' : data.magicReagentsInfo.allSatisfied ? '🔮 Infuse & Begin Magic Project' : '⚠️ Missing Required Catalysts or Residue'}
                  </button>
                ` : '<p style="text-align:center; color:#777; margin-top:60px;">Select an item from your inventory on the left to configure enchantments.</p>'}
              </div>
            `}
          </div>
        ` : `
          <!-- ACTIVE PROJECTS TAB -->
          <div style="flex:1; overflow-y:auto; padding-right:4px;">
            ${activeProjectsHtml}
          </div>
        `}
      </div>
    `;
    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.workshop-tab-btn').click(e => {
      this.activeTab = $(e.currentTarget).data('tab');
      this.render();
    });

    html.find('#workshop-discipline-select').change(e => {
      this.selectedDiscipline = e.target.value;
      this.selectedBaseItem = null;
      this.render();
    });

    html.find('#workshop-sort-select').change(e => {
      this.recipeSortBy = e.target.value;
      this.render();
    });

    html.find('#workshop-search-input').on('input', e => {
      this.searchTerm = e.target.value.toLowerCase();
      html.find('.bench-item-row').each((i, el) => {
        $(el).toggle($(el).text().toLowerCase().includes(this.searchTerm));
      });
    });

    html.find('.bench-item-row').click(async e => {
      const id = $(e.currentTarget).data('id');
      const isRefining = $(e.currentTarget).attr('data-refining') === 'true';
      
      if (isRefining) {
        const found = REFINING_RECIPES.find(r => r.id === id);
        if (found) {
          this.selectedBaseItem = {
            ...found,
            _id: found.id,
            isRefiningRecipe: true,
            system: { price: found.targetPrice, weight: { value: found.weight } }
          };
        }
        this.render();
      } else {
        const packKey = $(e.currentTarget).attr('data-pack');
        const pack = game.packs.get(packKey);
        if (pack) {
          this.selectedBaseItem = await pack.getDocument(id);
          this.render();
        }
      }
    });

    html.find('#workshop-material-select').change(e => {
      this.selectedMaterial = e.target.value;
      this.render();
    });

    html.find('#workshop-is-masterwork').change(e => {
      this.isMasterwork = e.target.checked;
      this.render();
    });

    html.find('#workshop-limit-break').change(e => {
      this.applyLimitBreak = e.target.checked;
    });

    html.find('#workshop-acc-dc').change(e => {
      this.acceleratedDcBonus = parseInt(e.target.value, 10) || 0;
      this.render();
    });

    html.find('.magic-select-row').click(e => {
      const id = $(e.currentTarget).data('id');
      this.selectedMagicItem = this.actor.items.get(id);
      this.selectedMagicProperties.clear();
      this.render();
    });

    html.find('#magic-enh-select').change(e => {
      this.magicEnhLevel = parseInt(e.target.value, 10) || 0;
      this.render();
    });

    html.find('.magic-prop-cb').change(e => {
      if (e.target.checked) this.selectedMagicProperties.add(e.target.value);
      else this.selectedMagicProperties.delete(e.target.value);
      this.render();
    });

    html.find('#magic-rushed-cb').change(e => {
      this.isRushedMagic = e.target.checked;
      this.render();
    });

    html.find('#magic-short-names').change(e => {
      this.magicShortCompoundNames = e.target.checked;
    });

    /* -------------------------------------------- */
    /* Start Mundane / Refining Project             */
    /* -------------------------------------------- */
    html.find('#start-project-btn').click(async () => {
      if (!this.selectedBaseItem) return;

      const isRefining = this.selectedBaseItem.isRefiningRecipe === true;
      const ingredientsInfo = this._calculateRequiredIngredients(this.selectedBaseItem, this.selectedMaterial, this.isMasterwork);
      if (!ingredientsInfo.allSatisfied) {
        return ui.notifications.error("You do not have all required ingredients in inventory!");
      }

      for (const ing of ingredientsInfo.list) {
        let needed = ing.qty;
        for (const itemId of ing.matchingItemIds) {
          if (needed <= 0) break;
          const invItem = this.actor.items.get(itemId);
          if (!invItem) continue;

          const currentQty = invItem.system?.quantity ?? 1;
          if (currentQty <= needed) {
            needed -= currentQty;
            await invItem.delete();
          } else {
            await invItem.update({ "system.quantity": currentQty - needed });
            needed = 0;
          }
        }
      }

      const gmSettings = getSafeSetting("workshopGmConfig", { failMode: "strikes", fixedStrikes: 3 });
      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
      const baseMetrics = this._computeItemCraftMetrics(this.selectedBaseItem);

      const basePrice = isRefining ? (this.selectedBaseItem.targetPrice || 50) : (this.selectedBaseItem.system?.price || 10);
      const targetGp = isRefining ? (this.selectedBaseItem.targetPrice || 50) : basePrice + (this.isMasterwork ? 300 : 0);
      const divisor = currentDisc.isGoldMode ? 150 : 35;
      const requiredRolls = Math.max(2, Math.ceil(targetGp / divisor));
      const dc = isRefining ? this.selectedBaseItem.dc : baseMetrics.dc + this.acceleratedDcBonus;
      const prefixLabel = isRefining ? "" : this.isMasterwork ? "Masterwork " : "";

      const rawBaseData = isRefining ? { ...this.selectedBaseItem } : (typeof this.selectedBaseItem.toObject === "function" ? this.selectedBaseItem.toObject() : foundry.utils.deepClone(this.selectedBaseItem));

      let maxStrikes = gmSettings.strikeThresholdType === "dynamic" 
        ? Math.max(2, Math.floor(requiredRolls / 3)) 
        : (gmSettings.fixedStrikes || 3);

      if (this.applyLimitBreak) {
        const todayStr = new Date().toISOString().split('T')[0];
        const flagData = this.actor.getFlag(MODULE_ID, "limitBreakTracker") || { date: todayStr, uses: 0 };
        const uses = flagData.date === todayStr ? flagData.uses + 1 : 1;
        await this.actor.setFlag(MODULE_ID, "limitBreakTracker", { date: todayStr, uses });
      }

      const newProject = {
        id: foundry.utils.randomID(),
        name: `${prefixLabel}${this.selectedBaseItem.name}`,
        baseItemId: this.selectedBaseItem.id || this.selectedBaseItem._id,
        baseItemData: rawBaseData,
        material: this.selectedMaterial,
        isMasterwork: this.isMasterwork,
        isRefining,
        isMagic: false,
        failMode: gmSettings.failMode || "strikes",
        maxAllowedStrikes: maxStrikes,
        limitBreakApplied: this.applyLimitBreak,
        targetGp,
        currentGp: 0,
        dc,
        requiredRolls,
        failedChecks: 0,
        shiftsLogged: [],
        consumedIngredients: ingredientsInfo.list.map(i => ({ label: i.label, qty: i.qty }))
      };

      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      projects.push(newProject);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      ui.notifications.info(`Deducted materials and initialized project for ${newProject.name}!`);
      this.activeTab = "active";
      this.applyLimitBreak = false;
      this.render();
    });

    /* -------------------------------------------- */
    /* Start Magic Enchanting Project               */
    /* -------------------------------------------- */
    html.find('#start-magic-project-btn').click(async () => {
      if (!this.selectedMagicItem) return;

      const isArmorEnchant = this.selectedMagicItem.type === "armor" || this.selectedMagicItem.system?.armor !== undefined;
      const customProps = getSafeSetting("customProperties", {});
      const availableProps = isArmorEnchant ? { ...ARMOR_ENCHANTMENTS, ...customProps } : { ...WEAPON_ENCHANTMENTS, ...customProps };
      
      let totalEqBonus = Number(this.magicEnhLevel);
      for (const p of this.selectedMagicProperties) totalEqBonus += (availableProps[p]?.cost || 0);

      const magicPrereqs = this._checkMagicCraftPrerequisites();
      if (totalEqBonus > magicPrereqs.maxAllowedTier) {
        return ui.notifications.error(`Cannot enchant Tier +${totalEqBonus}! Your ranks cap you at Tier +${magicPrereqs.maxAllowedTier}.`);
      }

      const reagentsInfo = this._calculateMagicReagents(totalEqBonus, this.selectedMagicProperties, this.selectedMagicItem);
      if (!reagentsInfo.allSatisfied) {
        return ui.notifications.error("You do not have all required catalysts/residue in inventory!");
      }

      for (const ing of reagentsInfo.list) {
        let needed = ing.qty;
        for (const itemId of ing.matchingItemIds) {
          if (needed <= 0) break;
          const invItem = this.actor.items.get(itemId);
          if (!invItem) continue;

          const currentQty = invItem.system?.quantity ?? 1;
          if (currentQty <= needed) {
            needed -= currentQty;
            await invItem.delete();
          } else {
            await invItem.update({ "system.quantity": currentQty - needed });
            needed = 0;
          }
        }
      }

      const gmSettings = getSafeSetting("workshopGmConfig", { failMode: "strikes", fixedStrikes: 3 });
      const baseMultCost = isArmorEnchant ? 500 : 1000;
      const oldTier = Math.max(0, Math.floor((this.selectedMagicItem.system?.enh || 0) / 10));
      const oldCost = Math.pow(oldTier, 2) * baseMultCost;
      const targetGp = Math.max(baseMultCost, (Math.pow(totalEqBonus, 2) * baseMultCost) - oldCost);
      const requiredRolls = Math.max(3, Math.ceil(targetGp / 250));
      const compoundingDc = 220 + (15 * totalEqBonus) + (5 * Math.pow(totalEqBonus, 2)) + (this.isRushedMagic ? 50 : 0);

      let maxStrikes = gmSettings.strikeThresholdType === "dynamic" 
        ? Math.max(2, Math.floor(requiredRolls / 3)) 
        : (gmSettings.fixedStrikes || 3);

      const newProject = {
        id: foundry.utils.randomID(),
        name: `+${this.magicEnhLevel * 10} Enchantment: ${this.selectedMagicItem.name}`,
        baseItemId: this.selectedMagicItem.id,
        baseItemData: this.selectedMagicItem.toObject(),
        isUpgrade: (this.selectedMagicItem.system?.enh || 0) > 0,
        material: "base",
        isMasterwork: true,
        isMagic: true,
        isRushed: this.isRushedMagic,
        failMode: gmSettings.failMode || "strikes",
        maxAllowedStrikes: maxStrikes,
        magicEnhLevel: this.magicEnhLevel,
        selectedMagicProperties: Array.from(this.selectedMagicProperties),
        magicShortCompoundNames: this.magicShortCompoundNames,
        targetGp,
        currentGp: 0,
        dc: compoundingDc,
        requiredRolls,
        failedChecks: 0,
        shiftsLogged: [],
        consumedIngredients: reagentsInfo.list.map(i => ({ label: i.label, qty: i.qty }))
      };

      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      projects.push(newProject);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      ui.notifications.info(`Catalysts & Residue consumed. Initialized project for ${newProject.name}!`);
      this.activeTab = "active";
      this.render();
    });

    /* -------------------------------------------- */
    /* Shift Roll Core Executor                     */
    /* -------------------------------------------- */
    const executeShiftRoll = async (proj) => {
      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
      const buffInfo = this._getActorBuffModifiers();
      const gmConfig = getSafeSetting("workshopGmConfig", { flawBoonEnabled: true, flawBoonMagnitude: 1 });

      const totalMod = currentDisc.mod + buffInfo.totalCheckMod;
      const roll = await new Roll("1d200 + @mod", { mod: totalMod }).evaluate({ async: true });
      
      const flavorText = proj.isMagic 
        ? `✨ <strong>${this.actor.name}</strong> channels arcane weave for 1 hour on <em>${proj.name}</em> (DC ${proj.dc})`
        : `⚒️ <strong>${this.actor.name}</strong> works 1 hour on <em>${proj.name}</em> (DC ${proj.dc})`;

      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: flavorText
      });

      const dieResult = roll.terms[0]?.results?.[0]?.result ?? (roll.total - totalMod);
      const totalRoll = roll.total;
      const mos = totalRoll - proj.dc;
      const failLimit = proj.failMode === "zero" ? 999 : (proj.maxAllowedStrikes || Math.max(2, Math.floor(proj.requiredRolls / 3)));

      const isNatFlaw = gmConfig.flawBoonEnabled && (dieResult <= 10);
      const isNatBoon = gmConfig.flawBoonEnabled && (dieResult >= 191);

      let shiftProgress = 0;
      if (proj.isMagic) {
        const spellcraftRank = this.actor.system?.skills?.spl?.rank || 0;
        const baseRate = 125 + (spellcraftRank * 2);
        const rushMult = proj.isRushed ? 2.0 : 1.0;
        shiftProgress = baseRate * Math.max(0.2, totalRoll / proj.dc) * rushMult * buffInfo.totalSpeedMult;
      } else {
        const rank = currentDisc.rank || 0;
        const velocity = rank >= 100 ? 5.0 : rank >= 60 ? 3.0 : rank >= 30 ? 2.0 : 1.0;
        shiftProgress = ((totalRoll * proj.dc) / 3000) * velocity * buffInfo.totalSpeedMult;
      }

      // Compute exact modifier tier for this roll
      let baseRatio = mos / 200;
      let shiftTier = Math.ceil(baseRatio * 4) + (isNatBoon ? 1 : isNatFlaw ? -1 : 0);
      if (shiftTier === 0) shiftTier = (baseRatio >= 0 ? 1 : -1) + (isNatBoon ? 1 : isNatFlaw ? -1 : 0);
      shiftTier = Math.max(proj.limitBreakApplied ? -5 : -4, Math.min(proj.limitBreakApplied ? 5 : 4, shiftTier));
      let shiftPctMod = Number((shiftTier * (proj.limitBreakApplied ? 7.0 : 6.25)).toFixed(1));

      const totalShiftsSoFar = proj.shiftsLogged.length;
      let phaseLabel = proj.isMagic ? "Attunement & Scribing" : "Smelting & Ingot Prep";
      let targetFacet = proj.isMagic ? "Aetheric Matrix" : "Hardness & HP";
      if (totalShiftsSoFar >= Math.floor(proj.requiredRolls * 2 / 3)) {
        phaseLabel = proj.isMagic ? "Resonance & Sealing" : "Honing & Edge Finishing";
        targetFacet = proj.isMagic ? "Harmonic Focus" : "Precision & Threat";
      } else if (totalShiftsSoFar >= Math.floor(proj.requiredRolls / 3)) {
        phaseLabel = proj.isMagic ? "Weave Binding" : "Forging & Geometry";
        targetFacet = proj.isMagic ? "Runic Matrix" : "Physical AC & Weight";
      }

      if (mos >= 0 || isNatBoon) {
        proj.currentGp += shiftProgress;
        proj.shiftsLogged.push({ 
          roll: totalRoll, dieResult, mos, success: true, phaseLabel, targetFacet,
          isNatBoon, isNatFlaw, shiftTier, shiftPctMod,
          modifierText: isNatBoon ? `+${shiftProgress.toFixed(1)} GP (🌟 Eureka Boon +1 Tier!)` : `+${shiftProgress.toFixed(1)} GP`
        });
      } else {
        proj.failedChecks += 1;
        proj.currentGp = Math.max(0, proj.currentGp - (shiftProgress * 0.15));
        proj.shiftsLogged.push({ 
          roll: totalRoll, dieResult, mos, success: false, phaseLabel, targetFacet,
          isNatBoon, isNatFlaw, shiftTier, shiftPctMod,
          modifierText: isNatFlaw ? `Failed Strike (-${(shiftProgress * 0.15).toFixed(1)} GP, 💀 Flaw Imparted)` : `Failed Strike (-${(shiftProgress * 0.15).toFixed(1)} GP)`
        });
      }

      const isRuined = proj.failMode === "zero" 
        ? (proj.shiftsLogged.length > 1 && proj.currentGp <= 0) 
        : (proj.failedChecks >= failLimit || (proj.shiftsLogged.length > 1 && proj.currentGp <= 0));

      return { isRuined, totalMod, currentDisc, gmConfig, shiftProgress };
    };

    html.find('.work-shift-btn').click(async (e) => {
      const idx = $(e.currentTarget).data('idx');
      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      const proj = projects[idx];
      if (!proj) return;

      const res = await executeShiftRoll(proj);

      if (res.isRuined) {
        ui.notifications.error(`Project Ruined! Work on ${proj.name} collapsed.`);
        projects.splice(idx, 1);
        await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
        this.render();
        return;
      }

      if (proj.currentGp >= proj.targetGp && proj.shiftsLogged.length < proj.requiredRolls) {
        const needed = proj.requiredRolls - proj.shiftsLogged.length;
        ui.notifications.info(`GP Goal achieved early! Rolling remaining ${needed} modifier checks.`);
        for (let i = 0; i < needed; i++) {
          const modRoll = await new Roll("1d200 + @mod", { mod: res.totalMod }).evaluate({ async: true });
          const dRes = modRoll.terms[0]?.results?.[0]?.result ?? (modRoll.total - res.totalMod);
          proj.shiftsLogged.push({ 
            roll: modRoll.total, dieResult: dRes, mos: modRoll.total - proj.dc, success: true, 
            phaseLabel: "Rapid Tuning", targetFacet: "Precision & Balance",
            isNatBoon: res.gmConfig.flawBoonEnabled && (dRes >= 191),
            isNatFlaw: res.gmConfig.flawBoonEnabled && (dRes <= 10),
            shiftTier: 1, shiftPctMod: 6.25,
            modifierText: `Rolled: ${modRoll.total}` 
          });
        }
      }

      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
      this.render();
    });

    html.find('.work-4hour-btn').click(async (e) => {
      const idx = $(e.currentTarget).data('idx');
      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      const proj = projects[idx];
      if (!proj) return;

      for (let i = 0; i < 4; i++) {
        if (proj.currentGp >= proj.targetGp) break;
        const res = await executeShiftRoll(proj);
        if (res.isRuined) {
          ui.notifications.error(`Project Ruined! Work on ${proj.name} collapsed.`);
          projects.splice(idx, 1);
          await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
          this.render();
          return;
        }
      }

      if (proj.currentGp >= proj.targetGp && proj.shiftsLogged.length < proj.requiredRolls) {
        const disciplines = this._getAvailableCraftDisciplines();
        const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
        const buffInfo = this._getActorBuffModifiers();
        const totalMod = currentDisc.mod + buffInfo.totalCheckMod;
        const needed = proj.requiredRolls - proj.shiftsLogged.length;
        for (let i = 0; i < needed; i++) {
          const modRoll = await new Roll("1d200 + @mod", { mod: totalMod }).evaluate({ async: true });
          proj.shiftsLogged.push({ 
            roll: modRoll.total, mos: modRoll.total - proj.dc, success: true, 
            phaseLabel: "Rapid Tuning", targetFacet: "Precision & Balance", 
            shiftTier: 1, shiftPctMod: 6.25,
            modifierText: `Rolled: ${modRoll.total}` 
          });
        }
      }

      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
      this.render();
    });

    /* -------------------------------------------- */
    /* Claim Finished Item & Post Summary Card      */
    /* -------------------------------------------- */
    html.find('.claim-project-btn').click(async (e) => {
      const idx = $(e.currentTarget).data('idx');
      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      const proj = projects[idx];
      if (!proj) return;

      if (proj.isRefining) {
        const refinedItem = {
          name: proj.baseItemData.name.replace("⚙️ ", "").replace(" (Refining)", ""),
          type: "loot",
          img: proj.baseItemData.img,
          system: { quantity: 1, price: proj.baseItemData.targetPrice || 50, weight: { value: proj.baseItemData.weight || 2.0 } }
        };
        await this.actor.createEmbeddedDocuments("Item", [refinedItem]);
        projects.splice(idx, 1);
        await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

        // Completion Chat Card for Refined Component
        const refineCardHtml = `
          <div style="border:1px solid #747d8c; border-radius:6px; overflow:hidden; background:#fff; font-family:var(--font-primary); box-shadow:0 2px 5px rgba(0,0,0,0.15);">
            <div style="background:linear-gradient(135deg, #2f3542, #1e272e); color:#fff; padding:6px 10px; display:flex; align-items:center; gap:8px;">
              <img src="${refinedItem.img}" width="28" height="28" style="border-radius:3px;" />
              <div>
                <strong style="font-size:1.05em; display:block;">${refinedItem.name}</strong>
                <span style="font-size:0.75em; color:#bdc3c7;">Artisan Material Refining Complete</span>
              </div>
            </div>
            <div style="padding:8px; font-size:0.85em; color:#333;">
              <p style="margin:0 0 4px 0;"><strong>${this.actor.name}</strong> has successfully treated and refined raw stock into high-grade material.</p>
              <div style="background:#f1f2f6; padding:4px 8px; border-radius:4px; font-size:0.8em; display:flex; justify-content:space-between;">
                <span><strong>Appraised Value:</strong> ${refinedItem.system.price} GP</span>
                <span><strong>Weight:</strong> ${refinedItem.system.weight.value} lbs</span>
              </div>
            </div>
          </div>
        `;
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: refineCardHtml
        });

        ui.notifications.info(`Successfully refined ${refinedItem.name}!`);
        this.render();
        return;
      }

      const itemData = foundry.utils.deepClone(proj.baseItemData);
      const isWeapon = itemData.type === "weapon";
      const isArmor = itemData.type === "armor" || itemData.system?.armor !== undefined;
      const mat = SPECIAL_MATERIALS[proj.material] || SPECIAL_MATERIALS.base;

      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
      const buffInfo = this._getActorBuffModifiers();

      while (proj.shiftsLogged.length < 3) {
        const autoRoll = await new Roll("1d200 + @mod", { mod: currentDisc.mod + buffInfo.totalCheckMod }).evaluate({ async: true });
        proj.shiftsLogged.push({ roll: autoRoll.total, mos: autoRoll.total - proj.dc, success: true, phaseLabel: "Instant Tuning", targetFacet: "Facet Allocation", shiftTier: 1, shiftPctMod: 6.25, modifierText: `Auto: ${autoRoll.total}` });
      }

      const tagsList = [proj.isMagic ? "Magic Infused" : "Crafted"];
      const identifiedTraits = [];

      const totalShifts = proj.shiftsLogged.length;
      const phase1 = proj.shiftsLogged.slice(0, Math.floor(totalShifts / 3));
      const phase2 = proj.shiftsLogged.slice(Math.floor(totalShifts / 3), Math.floor(totalShifts * 2 / 3));
      const phase3 = proj.shiftsLogged.slice(Math.floor(totalShifts * 2 / 3));

      const evaluatePhase = (phaseArr) => {
        if (!phaseArr || phaseArr.length === 0) return { mult: 1.0, tier: 1 };
        const avgMos = phaseArr.reduce((acc, s) => acc + s.mos, 0) / phaseArr.length;
        
        let boonCount = phaseArr.filter(s => s.isNatBoon).length;
        let flawCount = phaseArr.filter(s => s.isNatFlaw).length;
        let deltaTier = boonCount - flawCount;

        const maxTierCap = proj.limitBreakApplied ? 5 : 4;
        const minTierCap = proj.limitBreakApplied ? -5 : -4;

        let baseRatio = avgMos / 200;
        let tier = Math.ceil(baseRatio * 4) + deltaTier;
        if (tier === 0) tier = (baseRatio >= 0 ? 1 : -1) + deltaTier;
        tier = Math.max(minTierCap, Math.min(maxTierCap, tier));

        let mult = 1.0 + (tier * (proj.limitBreakApplied ? 0.07 : 0.0625));
        return { mult, tier, boonCount, flawCount };
      };

      const hardEval = evaluatePhase(phase1);
      const physEval = evaluatePhase(phase2);
      const precEval = evaluatePhase(phase3);

      const prefix = CRAFT_TIER_PREFIXES[`${precEval.tier}`] || "Serviceable";
      const tierSign = precEval.tier > 0 ? `+${precEval.tier}` : `${precEval.tier}`;
      tagsList.push(`Craft Quality: Tier ${tierSign}`);
      identifiedTraits.push(`<strong>Craftsmanship (${prefix}):</strong> Handcrafted to ${prefix.toLowerCase()} specifications.`);

      if (precEval.boonCount > 0) tagsList.push("Boon: Flawless Edge");
      if (precEval.flawCount > 0) tagsList.push("Flaw: Imbalanced Polish");

      itemData.flags = itemData.flags || {};
      itemData.flags[MODULE_ID] = { is10xScaled: true, disable10xSheet: true, disable10xCard: true };
      
      if (proj.isMasterwork || precEval.tier >= 4 || mat.name === "Adamantine" || mat.name === "Mithral" || proj.isMagic) {
        itemData.system.masterwork = true;
      } else {
        itemData.system.masterwork = false;
      }
      itemData.system.identified = true;

      // Phase 1: Durability & HP Floor
      let rawHardness = (typeof itemData.system.hardness === "object" ? itemData.system.hardness.value : itemData.system.hardness) || 10;
      let rawBaseHp = (itemData.system.hp?.base ?? itemData.system.hp?.max ?? 0);

      if (isWeapon && rawBaseHp < 5) {
        const subType = (itemData.system.weaponSubtype || "").toLowerCase();
        rawBaseHp = subType === "light" ? 5 : subType === "1h" ? 10 : 15;
      } else if (rawBaseHp === 0) {
        rawBaseHp = 10;
      }

      itemData.system.hardness = Math.max(0, Math.round((rawHardness * 10 + mat.hardnessMod) * hardEval.mult));
      const fHp = Math.max(1, Math.round((rawBaseHp * 10 * mat.hpMult) * hardEval.mult));
      itemData.system.hp = { base: fHp, max: fHp, value: fHp };

      tagsList.push(`Hardness: Tier ${hardEval.tier >= 0 ? `+${hardEval.tier || 1}` : hardEval.tier}`);
      tagsList.push(`Hit Points: Tier ${hardEval.tier >= 0 ? `+${hardEval.tier || 1}` : hardEval.tier}`);

      // Phase 2: Physical AC & Weight
      const weightFactor = Math.max(0.1, 2.0 - physEval.mult);
      const rawWeight = itemData.system?.weight?.value ?? 0;
      if (itemData.system?.weight) {
        itemData.system.weight.value = rawWeight === 0 ? 0 : Math.max(0.1, Math.round((rawWeight * (mat.weightMult || 1.0) * weightFactor) * 100) / 100);
      }
      tagsList.push(`Weight: Tier ${physEval.tier >= 0 ? `+${physEval.tier || 1}` : physEval.tier}`);

      if (isArmor && itemData.system?.armor) {
        itemData.system.armor.value = Math.round((itemData.system.armor.value || 0) * 10 * physEval.mult);
        let adjAcp = Math.round((itemData.system.armor.acp || 0) * 10 * (2.0 - physEval.mult));
        if (mat.acpBonus) adjAcp = Math.min(0, adjAcp + mat.acpBonus);
        itemData.system.armor.acp = adjAcp;

        tagsList.push(`Armor AC: Tier ${tierSign}`);
        tagsList.push(`ACP: Tier ${tierSign}`);
        identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${itemData.system.armor.value}, ACP ${itemData.system.armor.acp}.`);
      }

      // Phase 3: Precision & Crit
      if (isWeapon && itemData.system?.actions) {
        itemData.system.actions.forEach(act => {
          act.ability = act.ability || {};
          act.extraAttacks = [{ type: "custom", name: "10x Iteratives", countFormula: "max(0, floor((@attributes.bab.total - 10) / 50))", modifierFormula: "-50 * (@idx + 1)" }];
          
          let cBase = act.ability.critRange ?? act.critRange ?? 191;
          if (cBase <= 20) cBase = (cBase * 10) - 9;
          act.critRange = Math.min(199, Math.max(100, Math.round(cBase - ((precEval.mult - 1.0) * 40))));
          act.ability.critRange = act.critRange;

          let fMult = Number(act.ability.critMult ?? act.critMult ?? 2);
          if (precEval.mult >= 1.20) fMult += 1;
          else if (precEval.mult <= 0.80) fMult = Math.max(1, fMult - 1);
          act.critMult = fMult;
          act.ability.critMult = fMult;
        });

        tagsList.push(`Crit Threat: Tier ${tierSign}`);
        tagsList.push(`Crit Mult: Tier ${tierSign}`);
        identifiedTraits.push(`<strong>Precision:</strong> Crit range ${itemData.system.actions[0]?.critRange}–200, multiplier ×${itemData.system.actions[0]?.critMult}.`);
      }

      // Magic Infusion
      let propPrefixes = [];
      let enhSuffix = "";

      if (proj.isMagic) {
        const enhLevel = Number(proj.magicEnhLevel || 0);
        if (enhLevel > 0) {
          itemData.system.enh = enhLevel * 10;
          if (itemData.system.armor) itemData.system.armor.enh = itemData.system.enh;

          const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
          enhSuffix = ` ${titles[enhLevel] || ""}`;
          identifiedTraits.push(`<strong>Enhancement Bonus (+${itemData.system.enh}):</strong> Provides +${itemData.system.enh} to attack/damage/AC.`);
        }

        const customProps = getSafeSetting("customProperties", {});
        const propPool = isArmor ? { ...ARMOR_ENCHANTMENTS, ...customProps } : { ...WEAPON_ENCHANTMENTS, ...customProps };

        for (const pKey of (proj.selectedMagicProperties || [])) {
          const prop = propPool[pKey];
          if (!prop) continue;

          if (prop.isDice && isWeapon && itemData.system?.actions) {
            const numDice = prop.numDice || 1;
            const faces = 60;
            propPrefixes.push(prop.baseName);
            itemData.system.actions[0].damage.parts.push({ formula: `${numDice}d${faces}`, type: { values: [prop.type], custom: "" } });
            identifiedTraits.push(`<strong>${prop.baseName} Infusion:</strong> Deals +${numDice}d${faces} ${prop.type} damage.`);
          } else {
            tagsList.push(`Property: ${prop.title || prop.baseName}`);
            propPrefixes.push(prop.title || prop.baseName);
            if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
          }
        }
      }

      const matTitle = mat.name !== "Base" && mat.name !== "Steel" ? `${mat.name} ` : "";
      const pPre = propPrefixes.length ? `${propPrefixes.join(" ")} ` : "";
      itemData.name = `${prefix} ${matTitle}${pPre}${proj.baseItemData.name}${enhSuffix}`.trim();
      
      itemData.system.tags = Array.isArray(itemData.system.tags) ? itemData.system.tags : [];
      itemData.system.tags.push(...tagsList);

      const tagHtml = tagsList.map(t => `<span style="background:#2f3542;color:#fff;padding:2px 6px;border-radius:3px;font-size:0.75em;margin:2px;display:inline-block;">${t}</span>`).join(" ");
      const traitListHtml = identifiedTraits.map(tr => `<li>${tr}</li>`).join("");
      const originalDesc = itemData.system.description?.value || "";

      itemData.system.description = itemData.system.description || {};
      itemData.system.description.value = `
        ${originalDesc}
        <hr/>
        <h3>Artisan Handcrafted Characteristics</h3>
        <ul style="padding-left:18px;margin:6px 0;font-size:0.9em;line-height:1.4;">
          ${traitListHtml}
        </ul>
        <p><strong>Crafting Tags:</strong><br/>${tagHtml}</p>
      `.trim();

      if (proj.isMagic && proj.isUpgrade && this.actor.items.has(proj.baseItemId)) {
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: proj.baseItemId, ...itemData }]);
      } else {
        await this.actor.createEmbeddedDocuments("Item", [itemData]);
      }

      projects.splice(idx, 1);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      // ─── POST BEAUTIFUL SUMMARY CHAT CARD ───
      const completionCardHtml = `
        <div class="aeris-craft-completion-card" style="border: 1px solid #747d8c; border-radius: 6px; overflow: hidden; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,0.15); font-family: var(--font-primary);">
          <div style="background: linear-gradient(135deg, #2f3542, #1e272e); color: #fff; padding: 8px 10px; display: flex; align-items: center; gap: 8px;">
            <img src="${itemData.img}" width="32" height="32" style="border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);" />
            <div>
              <strong style="font-size: 1.05em; display: block; line-height: 1.2;">${itemData.name}</strong>
              <span style="font-size: 0.75em; color: #dfe4ea;">${proj.isMagic ? '✨ Arcane Enchantment Finalized' : '⚒️ Artisan Crafting Complete'} by ${this.actor.name}</span>
            </div>
          </div>
          
          <div style="padding: 8px 10px; font-size: 0.82em; line-height: 1.4; color: #2f3542;">
            <div style="background: #f1f2f6; border-radius: 4px; padding: 6px; margin-bottom: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
              <div><strong>Quality:</strong> <span style="color:#27ae60; font-weight:bold;">${prefix} (${tierSign})</span></div>
              <div><strong>Material:</strong> ${mat.name}</div>
              <div><strong>Hardness / HP:</strong> ${itemData.system.hardness} / ${itemData.system.hp.max}</div>
              <div><strong>Weight:</strong> ${itemData.system.weight.value} lbs</div>
              ${isArmor ? `
                <div><strong>Armor AC:</strong> +${itemData.system.armor.value}</div>
                <div><strong>ACP:</strong> ${itemData.system.armor.acp}</div>
              ` : isWeapon && itemData.system.actions?.[0] ? `
                <div><strong>Damage:</strong> ${itemData.system.actions[0].damage?.parts?.map(p => p.formula).join(" + ") || "N/A"}</div>
                <div><strong>Crit:</strong> ${itemData.system.actions[0].critRange}–200 / ×${itemData.system.actions[0].critMult}</div>
              ` : ""}
            </div>

            <div style="margin-bottom: 6px;">
              <strong style="font-size: 0.85em; display: block; margin-bottom: 2px;">Handcrafted Traits & Enchantments:</strong>
              <ul style="padding-left: 16px; margin: 2px 0; font-size: 0.8em; color: #495057;">
                ${traitListHtml}
              </ul>
            </div>

            <div>
              <strong style="font-size: 0.8em; display: block; margin-bottom: 2px;">Applied Tags:</strong>
              <div>${tagHtml}</div>
            </div>
          </div>
        </div>
      `;

      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: completionCardHtml
      });

      ui.notifications.info(`Successfully completed and claimed ${itemData.name}!`);
      this.render();
    });

    html.find('.abandon-project-btn').click(async (e) => {
      const idx = $(e.currentTarget).data('idx');
      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      const proj = projects[idx];
      if (!proj) return;

      Dialog.confirm({
        title: "Abandon Crafting Project",
        content: `<p>Are you sure you want to abandon <strong>${proj.name}</strong>? You will salvage 50% of the raw physical materials as scrap.</p>`,
        yes: async () => {
          if (proj.consumedIngredients) {
            for (const ing of proj.consumedIngredients) {
              const salvageQty = Math.max(1, Math.floor(ing.qty * 0.5));
              await this.actor.createEmbeddedDocuments("Item", [{
                name: `Scrap ${ing.label}`,
                type: "loot",
                img: "icons/commodities/metal/scrap-iron.webp",
                system: { quantity: salvageQty, price: 5, weight: { value: 1 } }
              }]);
            }
          }

          projects.splice(idx, 1);
          await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
          ui.notifications.warn(`Abandoned ${proj.name}. 50% scrap returned.`);
          this.render();
        }
      });
    });
  }

  _openGmWorkshopSettingsDialog() {
    const gmSettings = getSafeSetting("workshopGmConfig", { 
      failMode: "strikes", strikeThresholdType: "fixed", fixedStrikes: 3, 
      flawBoonEnabled: true, limitBreakMinRank: 100, limitBreakMaxDaily: 1,
      rankEnhancementCaps: { 50: 1, 80: 2, 110: 3, 140: 4, 170: 5, 200: 10 }
    });
    const savedPacksMap = getSafeSetting("craftCompendiums", {});
    const disciplines = this._getAvailableCraftDisciplines();
    const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    const activePacks = new Set(savedPacksMap[currentDisc.type] || []);
    const allItemPacks = game.packs.filter(p => p.documentName === "Item");

    const checkboxes = allItemPacks.map(p => `
      <label style="display:flex; align-items:center; gap:6px; font-size:0.85em; margin-bottom:4px; cursor:pointer;">
        <input type="checkbox" class="gm-pack-cb" value="${p.collection}" ${activePacks.has(p.collection) ? "checked" : ""}>
        <span>${p.metadata.label} <code style="color:#777; font-size:0.85em;">(${p.collection})</code></span>
      </label>
    `).join("");

    new Dialog({
      title: `⚙️ Workshop Settings & Packs (${currentDisc.label})`,
      content: `
        <form style="max-height:460px; overflow-y:auto; padding:6px; font-size:0.85em;">
          <div style="font-weight:bold; border-bottom:1px solid #ccc; margin-bottom:6px;">GM Failure & Strike Tolerances</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:6px;">
            <div>
              <label>Failure Mode:</label>
              <select id="gm-fail-mode">
                <option value="strikes" ${gmSettings.failMode === "strikes" ? "selected" : ""}>Strikes Tolerance</option>
                <option value="zero" ${gmSettings.failMode === "zero" ? "selected" : ""}>Zero-Progress Ruin (0 GP)</option>
              </select>
            </div>
            <div>
              <label>Strike Limit:</label>
              <input type="number" id="gm-fixed-strikes" value="${gmSettings.fixedStrikes || 3}" min="1" max="10">
            </div>
          </div>

          <div style="font-weight:bold; border-bottom:1px solid #ccc; margin:8px 0 6px 0;">Flaws, Boons & Limit-Breaks</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-bottom:6px;">
            <label style="display:flex; align-items:center; gap:4px;">
              <input type="checkbox" id="gm-flaw-boon-cb" ${gmSettings.flawBoonEnabled ? "checked" : ""}> Enable Nat 1-10 Flaws & 191-200 Boons
            </label>
            <div>
              <label>Limit-Break Min Rank / Daily Uses:</label>
              <div style="display:flex; gap:4px;">
                <input type="number" id="gm-lb-rank" value="${gmSettings.limitBreakMinRank || 100}" min="10" placeholder="Rank">
                <input type="number" id="gm-lb-daily" value="${gmSettings.limitBreakMaxDaily || 1}" min="1" max="10" placeholder="Uses">
              </div>
            </div>
          </div>

          <div style="font-weight:bold; border-bottom:1px solid #ccc; margin:8px 0 6px 0;">Source Compendiums for ${currentDisc.label}</div>
          <p style="font-size:0.8em; color:#555;">Check all compendiums to search for blueprints under this discipline:</p>
          ${checkboxes}
        </form>
      `,
      buttons: {
        save: {
          label: "Save Workshop Settings",
          callback: async (dHtml) => {
            const failMode = dHtml.find('#gm-fail-mode').val();
            const fixedStrikes = parseInt(dHtml.find('#gm-fixed-strikes').val(), 10) || 3;
            const flawBoonEnabled = dHtml.find('#gm-flaw-boon-cb').is(':checked');
            const limitBreakMinRank = parseInt(dHtml.find('#gm-lb-rank').val(), 10) || 100;
            const limitBreakMaxDaily = parseInt(dHtml.find('#gm-lb-daily').val(), 10) || 1;

            await setSafeSetting("workshopGmConfig", {
              ...gmSettings,
              failMode,
              fixedStrikes,
              flawBoonEnabled,
              limitBreakMinRank,
              limitBreakMaxDaily
            });

            const selected = [];
            dHtml.find('.gm-pack-cb:checked').each((i, el) => selected.push(el.value));
            savedPacksMap[currentDisc.type] = selected;
            await setSafeSetting("craftCompendiums", savedPacksMap);

            ui.notifications.info(`Updated Workshop settings and source packs!`);
            this.render();
          }
        }
      },
      default: "save"
    }).render(true);
  }
}