/**
 * @file player-workshop.mjs
 * Player-Facing Procedural Crafting Workbench with Crash-Proof Setting Getters, Verified Core Icons, and Stable Execution
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

// Safe Game Setting Helpers (Prevents Unregistered Setting Crashes)
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

// Verified Core Foundry Icon Paths (Zero 404 Errors)
export const REFINING_RECIPES = [
  { id: "refine_steel", name: "Refined Steel Ingot", rawLabel: "2x Steel Ingot", rawPattern: /steel ingot|iron bar|steel bar/i, rawQty: 2, dc: 150, minRanks: 30, targetPrice: 25, weight: 2.0, img: "icons/commodities/metal/ingot-iron.webp" },
  { id: "refine_timber", name: "Refined Crafting Timber", rawLabel: "2x Crafting Timber", rawPattern: /crafting timber|wood log|hardwood/i, rawQty: 2, dc: 150, minRanks: 30, targetPrice: 15, weight: 3.0, img: "icons/commodities/materials/wood-log.webp" },
  { id: "refine_leather", name: "Refined Treated Leather", rawLabel: "2x Treated Leather", rawPattern: /treated leather|cured hide|leather roll/i, rawQty: 2, dc: 150, minRanks: 30, targetPrice: 20, weight: 1.5, img: "icons/commodities/leather/leather-brown.webp" },
  { id: "refine_mithral", name: "Refined Mithral Ingot", rawLabel: "2x Mithral Ingot", rawPattern: /mithral ingot|mithral bar/i, rawQty: 2, dc: 180, minRanks: 30, targetPrice: 1500, weight: 1.0, img: "icons/commodities/metal/ingot-silver.webp" },
  { id: "refine_adamantine", name: "Refined Adamantine Ingot", rawLabel: "2x Adamantine Ingot", rawPattern: /adamantine ingot|adamantine bar/i, rawQty: 2, dc: 220, minRanks: 30, targetPrice: 3000, weight: 2.0, img: "icons/commodities/metal/ingot-engraved-metal.webp" },
  { id: "refine_coldiron", name: "Refined Cold Iron Ingot", rawLabel: "2x Cold Iron Ingot", rawPattern: /cold iron ingot|cold iron bar/i, rawQty: 2, dc: 170, minRanks: 30, targetPrice: 200, weight: 2.0, img: "icons/commodities/metal/ingot-iron.webp" },
  { id: "refine_silversheen", name: "Refined Alchemical Silver Ingot", rawLabel: "2x Alchemical Silver Ingot", rawPattern: /alchemical silver|silver ingot/i, rawQty: 2, dc: 160, minRanks: 30, targetPrice: 100, weight: 2.0, img: "icons/commodities/metal/ingot-silver.webp" },
  { id: "refine_darkwood", name: "Refined Darkwood Timber", rawLabel: "2x Darkwood Timber", rawPattern: /darkwood timber|darkwood log/i, rawQty: 2, dc: 180, minRanks: 30, targetPrice: 200, weight: 1.5, img: "icons/commodities/materials/wood-log.webp" },
  { id: "refine_dragonhide", name: "Refined Dragon Scales", rawLabel: "2x Dragon Scales / Hide", rawPattern: /dragon scale|dragonhide/i, rawQty: 2, dc: 220, minRanks: 30, targetPrice: 1000, weight: 2.0, img: "icons/commodities/biological/scale-reptile-grey.webp" },
  { id: "craft_arcane_etcher", name: "Arcane Etcher", rawLabel: "1x Refined Steel Ingot + 1x Quartz/Glass", rawPattern: /(refined steel|quartz|glass|crystal)/i, rawQty: 2, dc: 160, minRanks: 20, targetPrice: 150, weight: 1.0, img: "icons/tools/hand/chisel.webp", isTool: true }
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

    this.selectedMagicItem = null;
    this.magicEnhLevel = 1;
    this.selectedMagicProperties = new Set();
    this.magicShortCompoundNames = true;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-player-workshop",
      title: "⚒️ Artisan's Workbench & Crafting Forge",
      template: "",
      width: 1080,
      height: 880,
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

      if (disciplineMap[key]) {
        matchedType = disciplineMap[key].type;
      } else if (subName.includes("weap") || subName.includes("blacksmith")) {
        matchedType = "weapon";
      } else if (subName.includes("arm")) {
        matchedType = "armor";
      } else if (subName.includes("bow") || subName.includes("fletch")) {
        matchedType = "bow";
      } else if (subName.includes("gun") || subName.includes("firearm")) {
        matchedType = "firearm";
      } else if (subName.includes("alc")) {
        matchedType = "alchemy";
      } else if (subName.includes("poi") || subName.includes("tox")) {
        matchedType = "poison";
      } else if (subName.includes("siege")) {
        matchedType = "siege";
      }

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

  _checkMagicCraftPrerequisites() {
    const hasFeat = this.actor.items.some(i => /\b(craft magic arms|craft magic arms and armor)\b/i.test(i.name));
    const spellcraftRank = this.actor.system?.skills?.spl?.rank || 0;
    const disciplines = this._getAvailableCraftDisciplines();
    const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    
    const hasRank50 = (currentDisc.rank >= 50) || (spellcraftRank >= 50);
    const hasArcaneEtcher = this.actor.items.some(i => /(arcane etcher|runecarver's chisel|enchanting stylus|arcane scribe)/i.test(i.name));
    const canReEnchant = (currentDisc.rank >= 100) || (spellcraftRank >= 100);

    return {
      canCraftMagic: (hasFeat || hasRank50) && hasArcaneEtcher,
      hasArcaneEtcher,
      canReEnchant,
      reason: !hasArcaneEtcher 
        ? "⚠️ Missing Required Tool: Arcane Etcher (Must be in inventory)" 
        : !(hasFeat || hasRank50) 
        ? "Requires 50+ Craft/Spellcraft Ranks or Craft Magic Arms & Armor Feat" 
        : "Unlocked"
    };
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

  _getItemMaterialCategory(item) {
    const type = item.type;
    const subType = (item.system?.subType || item.system?.weaponSubtype || "").toLowerCase();
    const name = item.name.toLowerCase();

    if (/\b(club|greatclub|quarterstaff|staff|bo staff|nunchaku|bow|crossbow)\b/i.test(name)) {
      if (/\b(bow|crossbow)\b/i.test(name)) return "bow";
      return "wood_weapon";
    }

    if (type === "weapon" && subType !== "ranged") return "metal_weapon";

    if (type === "armor" || item.system?.armor !== undefined) {
      if (subType === "light" || /\b(leather|padded|hide|quilted)\b/i.test(name)) return "leather_armor";
      if (type === "shield" || subType === "shield") return "shield";
      return "metal_armor";
    }

    if (type === "ammo") return "ammo";
    return "general";
  }

  _getValidMaterialsForItem(item) {
    if (!item) return { base: CRAFT_MATERIAL_RULES.base };
    const itemCat = this._getItemMaterialCategory(item);
    const valid = {};

    for (const [key, rule] of Object.entries(CRAFT_MATERIAL_RULES)) {
      if (rule.allowed.includes(itemCat) || rule.allowed.includes("general") || key === "base") {
        valid[key] = rule;
      }
    }
    return valid;
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

    if (type === "weapon" && subType !== "ranged" && !/\b(bow|crossbow|pistol|musket)\b/i.test(name)) {
      const isWoodWeapon = /\b(club|greatclub|quarterstaff|staff|bo staff|nunchaku)\b/i.test(name);
      
      if (isWoodWeapon) {
        ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: subType === "2h" ? 3 : 2 });
      } else {
        if (subType === "light") {
          ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 1 });
          ingredients.push({ label: getLeatherName(), pattern: getLeatherPat(), qty: 1 });
        } else if (subType === "1h") {
          ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 2 });
          ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 1 });
        } else {
          ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 4 });
          ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 2 });
        }
      }
    } else if (type === "weapon" && /\b(bow|crossbow)\b/i.test(name)) {
      if (/\bcrossbow\b/i.test(name)) {
        ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 3 });
        ingredients.push({ label: "Mechanical Components", pattern: /(mechanism|fittings|lock|gear|scrap|spring|metal)/i, qty: 1 });
      } else {
        ingredients.push({ label: getWoodName(), pattern: getWoodPat(), qty: 2 });
        ingredients.push({ label: "Mechanical Components / String", pattern: /(string|cord|sinew|wire|mechanism)/i, qty: 1 });
      }
    } else if (type === "weapon" && /\b(pistol|musket|rifle|blunderbuss)\b/i.test(name)) {
      ingredients.push({ label: getMetalName(), pattern: getMetalPat(), qty: 3 });
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
      label: `${residueNeeded}x Arcane Residue (4 per equivalent +1)`,
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

  async getData() {
    const rawProjects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
    const disciplines = this._getAvailableCraftDisciplines();
    const magicPrereqs = this._checkMagicCraftPrerequisites();

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
      targetPrice: r.targetPrice,
      weight: r.weight,
      system: { price: r.targetPrice, weight: { value: r.weight } }
    }));

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
    let totalEquivalentBonus = this.magicEnhLevel;

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

    return {
      actor: this.actor,
      isGM: game.user.isGM,
      activeTab: this.activeTab,
      disciplines,
      selectedDiscipline: this.selectedDiscipline,
      currentDiscipline,
      items: [...availableRefining, ...this.compendiumItems],
      selectedBaseItem: this.selectedBaseItem,
      selectedMaterial: this.selectedMaterial,
      isMasterwork: this.isMasterwork,
      validMaterials,
      acceleratedDcBonus: this.acceleratedDcBonus,
      ingredientsInfo,
      projects: rawProjects,
      searchTerm: this.searchTerm,
      
      magicPrereqs,
      enchantableInventoryItems,
      selectedMagicItem: this.selectedMagicItem,
      magicEnhLevel: this.magicEnhLevel,
      totalEquivalentBonus,
      availableMagicProperties,
      selectedMagicProperties: this.selectedMagicProperties,
      magicReagentsInfo,
      magicShortCompoundNames: this.magicShortCompoundNames
    };
  }

  async _renderInner(data) {
    const discOpts = data.disciplines.map(d => 
      `<option value="${d.key}" ${d.key === data.selectedDiscipline ? "selected" : ""}>${d.label} (+${d.mod} | ${d.rank} Ranks${d.isGoldMode ? ' ⚡ Gold' : ''}${d.hasMagicAccess ? ' ✨ Magic' : ''})</option>`
    ).join("");

    const matOpts = Object.entries(data.validMaterials).map(([k, v]) => 
      `<option value="${k}" ${k === data.selectedMaterial ? "selected" : ""}>${v.name}</option>`
    ).join("");

    const itemRows = data.items.map(i => `
      <div class="bench-item-row ${data.selectedBaseItem?._id === i._id ? "selected" : ""}" data-id="${i._id}" data-pack="${i._packCollection || ''}" data-refining="${i.isRefiningRecipe ? 'true' : 'false'}" style="display:flex; align-items:center; gap:6px; padding:5px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.06); background:${data.selectedBaseItem?._id === i._id ? "rgba(46,204,113,0.15)" : "transparent"};">
        <img src="${i.img || "icons/svg/item-bag.svg"}" width="26" height="26" style="border-radius:3px;" />
        <span style="font-size:0.85em; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i.name}</span>
        <span style="font-size:0.75em; color:#777;">${i.system?.price || 0} GP</span>
      </div>
    `).join("");

    const activeProjectsHtml = data.projects.length > 0 ? data.projects.map((proj, idx) => {
      const pct = Math.min(100, Math.round((proj.currentGp / proj.targetGp) * 100));
      const failLimit = proj.failMode === "zero" ? "Ruin at 0 GP" : Math.max(2, Math.floor(proj.requiredRolls / 3));
      
      const shiftsLogHtml = proj.shiftsLogged.map((s, sIdx) => `
        <div style="font-size:0.72em; padding:2px 4px; border-bottom:1px solid #f1f2f6; display:flex; justify-content:space-between; color:${s.success ? '#27ae60' : '#c0392b'};">
          <span><strong>Shift ${sIdx+1} [${s.phaseLabel}]:</strong> Check ${s.roll} (vs DC ${proj.dc}, ${s.mos >= 0 ? '+' : ''}${s.mos})</span>
          <span><strong>${s.targetFacet}:</strong> ${s.modifierText}</span>
        </div>
      `).join("");

      return `
        <div style="background:#fff; border:1px solid #ced6e0; border-radius:6px; padding:10px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div>
              <strong style="font-size:1.05em; color:var(--color-text-dark-primary);">${proj.name}</strong>
              <span style="font-size:0.8em; color:#666; margin-left:6px;">(DC ${proj.dc} | ${proj.isMagic ? (proj.isUpgrade ? '✨ Magic Upgrade' : '✨ Magic Infusion') : `Material: ${proj.material}`})</span>
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

          <details style="background:#f8f9fa; border:1px solid #e9ecef; border-radius:4px; padding:4px; margin-bottom:6px;">
            <summary style="font-size:0.75em; font-weight:bold; cursor:pointer; color:#495057;">📜 Shift Roll History & Facet Allocation (${proj.shiftsLogged.length} shifts)</summary>
            <div style="max-height:90px; overflow-y:auto; margin-top:4px;">
              ${shiftsLogHtml || '<span style="font-size:0.7em; color:#777; padding:2px;">No shifts rolled yet.</span>'}
            </div>
          </details>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75em; color:#777;">
              Phase: ${proj.shiftsLogged.length < Math.floor(proj.requiredRolls/3) ? "Phase 1: Smelting / Aether Influx" : proj.shiftsLogged.length < Math.floor(proj.requiredRolls*2/3) ? "Phase 2: Geometry / Runeweave" : "Phase 3: Honing & Stabilization"}
            </span>
            <div style="display:flex; gap:6px;">
              ${pct >= 100 ? `
                <button type="button" class="claim-project-btn" data-idx="${idx}" style="background:#27ae60; color:#fff; font-size:0.8em; padding:4px 12px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  ✨ Claim Finished Item
                </button>
              ` : `
                <button type="button" class="work-shift-btn" data-idx="${idx}" style="background:#2f3542; color:#fff; font-size:0.8em; padding:4px 12px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  🔨 Work 1-Hour Shift
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
            <div style="flex:1.15; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
              <div>
                <label style="font-size:0.8em; font-weight:bold;">Active Craft Discipline</label>
                <select id="workshop-discipline-select" style="width:100%; padding:4px; font-size:0.85em;">${discOpts}</select>
              </div>

              <input type="text" id="workshop-search-input" value="${data.searchTerm}" placeholder="🔍 Search blueprints & refining recipes..." style="padding:4px; font-size:0.85em; border:1px solid #ced6e0; border-radius:3px;">
              
              <div style="flex-grow:1; max-height:540px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                ${itemRows || `<p style="padding:10px; font-size:0.85em; color:#777;">No blueprints found. Use ⚙️ Settings on the title bar to configure source compendiums.</p>`}
              </div>
            </div>

            <div style="flex:1.15; display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.02); padding:10px; border-radius:6px; border:1px solid #ced6e0; overflow-y:auto;">
              <strong style="font-size:0.95em; border-bottom:1px solid #ccc; padding-bottom:3px;">Blueprint & Material Requirements</strong>
              
              ${data.selectedBaseItem ? `
                <div style="font-size:0.85em; line-height:1.4;">
                  <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                    <img src="${data.selectedBaseItem.img}" width="32" height="32" style="border-radius:3px;" />
                    <div>
                      <strong style="font-size:1.05em;">${data.selectedBaseItem.name}</strong><br/>
                      <span style="color:#555;">Base Price: ${data.selectedBaseItem.targetPrice || data.selectedBaseItem.system?.price || 0} GP | Target Goal: ${data.selectedBaseItem.isRefiningRecipe ? (data.selectedBaseItem.targetPrice || 50) : (data.selectedBaseItem.system?.price || 10) + (data.isMasterwork ? 300 : 0)} GP</span>
                    </div>
                  </div>

                  ${!data.selectedBaseItem.isRefiningRecipe ? `
                    <div style="display:flex; gap:6px; margin-bottom:6px;">
                      <div style="flex:1;">
                        <label style="font-size:0.8em; font-weight:bold;">Special Material</label>
                        <select id="workshop-material-select" style="width:100%; padding:3px; font-size:0.85em;">${matOpts}</select>
                      </div>
                      <div style="flex:1;">
                        <label style="font-size:0.8em; font-weight:bold;">Pacing (Accelerated DC)</label>
                        <select id="workshop-acc-dc" style="width:100%; padding:3px; font-size:0.85em;">
                          <option value="0" ${data.acceleratedDcBonus===0?"selected":""}>Standard DC (+0)</option>
                          <option value="50" ${data.acceleratedDcBonus===50?"selected":""}>Accelerated (+50 DC)</option>
                          <option value="100" ${data.acceleratedDcBonus===100?"selected":""}>Rapid Rush (+100 DC)</option>
                        </select>
                      </div>
                    </div>

                    <div style="margin-bottom:8px;">
                      <label style="display:flex; align-items:center; gap:6px; font-size:0.85em; font-weight:bold; cursor:pointer;">
                        <input type="checkbox" id="workshop-is-masterwork" ${data.isMasterwork ? "checked" : ""}>
                        <span>Masterwork Quality (Requires Refined Materials, +300 GP)</span>
                      </label>
                    </div>
                  ` : `
                    <p style="font-size:0.8em; color:#2980b9; margin-bottom:6px;"><em>Refining recipe: Treats raw ingots and hides into refined components needed for masterwork forging.</em></p>
                  `}

                  <strong style="font-size:0.85em;">Required Inventory Materials:</strong>
                  <div style="background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:6px; margin:4px 0 8px 0;">
                    ${data.ingredientsInfo.list.map(ing => `
                      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8em; padding:2px 0; color:${ing.satisfied ? '#27ae60' : '#c0392b'};">
                        <span>${ing.satisfied ? '✔️' : '❌'} ${ing.qty}x ${ing.label}</span>
                        <span>(You have: ${ing.available})</span>
                      </div>
                    `).join("")}
                  </div>

                  <div style="font-size:0.8em; color:#666; line-height:1.3;">
                    <div>• <strong>Hourly Craft DC:</strong> ${data.selectedBaseItem.isRefiningRecipe ? data.selectedBaseItem.dc : 150 + data.acceleratedDcBonus}</div>
                    <div>• <strong>Progress Rate:</strong> ${data.currentDiscipline.isGoldMode ? 'Gold Mode (100x Speed)' : 'Silver Mode (10x Speed)'}</div>
                    <div>• <strong>Estimated Shifts:</strong> ${Math.max(2, Math.ceil((data.selectedBaseItem.isRefiningRecipe ? (data.selectedBaseItem.targetPrice || 50) : (data.selectedBaseItem.system?.price || 10) + (data.isMasterwork ? 300 : 0)) / (data.currentDiscipline.isGoldMode ? 150 : 35)))} Shifts</div>
                  </div>
                </div>

                <button type="button" id="start-project-btn" ${!data.ingredientsInfo.allSatisfied ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="margin-top:auto; padding:10px; font-weight:bold; background:#2f3542; color:#fff; border:none; border-radius:4px; cursor:pointer;">
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
              <div style="flex:1.15; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
                <strong style="font-size:0.9em;">Select Masterwork or Magic Base Item from Inventory:</strong>
                <div style="flex-grow:1; max-height:540px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                  ${enchantableRows || '<p style="padding:10px; font-size:0.85em; color:#777;">No masterwork or forged equipment in inventory available to enchant.</p>'}
                </div>
              </div>

              <div style="flex:1.15; display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.02); padding:10px; border-radius:6px; border:1px solid #ced6e0; overflow-y:auto;">
                <strong style="font-size:0.95em; border-bottom:1px solid #ccc; padding-bottom:3px;">✨ Enchantment Blueprint & Catalysts</strong>
                
                ${data.selectedMagicItem ? `
                  <div style="font-size:0.85em; line-height:1.4;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                      <img src="${data.selectedMagicItem.img}" width="32" height="32" style="border-radius:3px;" />
                      <div>
                        <strong style="font-size:1.05em;">${data.selectedMagicItem.name}</strong><br/>
                        <span style="color:#555;">Current Enhancement: +${data.selectedMagicItem.system?.enh || 0} | Total Equivalent: +${data.totalEquivalentBonus * 10} (+${data.totalEquivalentBonus})</span>
                      </div>
                    </div>

                    <div style="margin-bottom:6px;">
                      <label style="font-size:0.8em; font-weight:bold;">Enhancement Bonus</label>
                      <select id="magic-enh-select" style="width:100%; padding:3px; font-size:0.85em;">
                        <option value="1" ${data.magicEnhLevel===1?"selected":""}>+1 (+10 Scaled)</option>
                        <option value="2" ${data.magicEnhLevel===2?"selected":""}>+2 (+20 Scaled)</option>
                        <option value="3" ${data.magicEnhLevel===3?"selected":""}>+3 (+30 Scaled)</option>
                        <option value="4" ${data.magicEnhLevel===4?"selected":""}>+4 (+40 Scaled)</option>
                        <option value="5" ${data.magicEnhLevel===5?"selected":""}>+5 (+50 Scaled)</option>
                      </select>
                    </div>

                    <strong style="font-size:0.85em;">Special Enchantments:</strong>
                    <div style="max-height:140px; overflow-y:auto; background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:4px; margin:4px 0;">
                      ${magicPropRows || '<span style="font-size:0.8em; color:#777;">No special properties available for this item.</span>'}
                    </div>

                    <label style="display:flex; align-items:center; gap:6px; font-size:0.8em; margin-bottom:6px; cursor:pointer;">
                      <input type="checkbox" id="magic-short-names" ${data.magicShortCompoundNames ? "checked" : ""}>
                      <span>Use Compound Names (e.g. <em>Sunstrike</em>)</span>
                    </label>

                    <strong style="font-size:0.85em;">Required Magical Catalysts & Residue:</strong>
                    <div style="background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:6px; margin:4px 0 8px 0;">
                      ${data.magicReagentsInfo.list.map(ing => `
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8em; padding:2px 0; color:${ing.satisfied ? '#27ae60' : '#c0392b'};">
                          <span>${ing.satisfied ? '✔️' : '❌'} ${ing.label}</span>
                          <span>(You have: ${ing.available})</span>
                        </div>
                      `).join("")}
                    </div>

                    <div style="font-size:0.8em; color:#666; line-height:1.3;">
                      <div>• <strong>Enchanting DC:</strong> ${150 + (data.totalEquivalentBonus * 10)} | <strong>CL:</strong> ${data.totalEquivalentBonus * 3}</div>
                      <div>• <strong>Upgrade Craft Cost:</strong> ${totalGoldCost} GP (Based on +${data.totalEquivalentBonus} equivalent)</div>
                    </div>
                  </div>

                  <button type="button" id="start-magic-project-btn" ${!data.magicReagentsInfo.allSatisfied ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="margin-top:auto; padding:10px; font-weight:bold; background:#8e44ad; color:#fff; border:none; border-radius:4px; cursor:pointer;">
                    ${data.magicReagentsInfo.allSatisfied ? '🔮 Infuse & Begin Magic Project' : '⚠️ Missing Required Catalysts or Residue'}
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
      this.magicEnhLevel = parseInt(e.target.value, 10) || 1;
      this.render();
    });

    html.find('.magic-prop-cb').change(e => {
      if (e.target.checked) this.selectedMagicProperties.add(e.target.value);
      else this.selectedMagicProperties.delete(e.target.value);
      this.render();
    });

    html.find('#magic-short-names').change(e => {
      this.magicShortCompoundNames = e.target.checked;
    });

    /* -------------------------------------------- */
    /* Start Project Execution                      */
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

      const gmSettings = getSafeSetting("workshopGmConfig", { failMode: "strikes", maxStrikes: 3 });
      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];

      const basePrice = isRefining ? (this.selectedBaseItem.targetPrice || 50) : (this.selectedBaseItem.system?.price || 10);
      const targetGp = isRefining ? (this.selectedBaseItem.targetPrice || 50) : basePrice + (this.isMasterwork ? 300 : 0);
      const divisor = currentDisc.isGoldMode ? 150 : 35;
      const requiredRolls = Math.max(2, Math.ceil(targetGp / divisor));
      const dc = isRefining ? this.selectedBaseItem.dc : 150 + this.acceleratedDcBonus;
      const prefixLabel = isRefining ? "" : this.isMasterwork ? "Masterwork " : "";

      const rawBaseData = isRefining ? { ...this.selectedBaseItem } : (typeof this.selectedBaseItem.toObject === "function" ? this.selectedBaseItem.toObject() : foundry.utils.deepClone(this.selectedBaseItem));

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
      
      let totalEqBonus = this.magicEnhLevel;
      for (const p of this.selectedMagicProperties) totalEqBonus += (availableProps[p]?.cost || 0);

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

      const gmSettings = getSafeSetting("workshopGmConfig", { failMode: "strikes", maxStrikes: 3 });
      const baseMultCost = isArmorEnchant ? 500 : 1000;
      const oldTier = Math.max(0, Math.floor((this.selectedMagicItem.system?.enh || 0) / 10));
      const oldCost = Math.pow(oldTier, 2) * baseMultCost;
      const targetGp = Math.max(baseMultCost, (Math.pow(totalEqBonus, 2) * baseMultCost) - oldCost);
      const requiredRolls = Math.max(3, Math.ceil(targetGp / 250));
      const dc = 150 + (totalEqBonus * 10);

      const newProject = {
        id: foundry.utils.randomID(),
        name: `+${this.magicEnhLevel * 10} Enchantment: ${this.selectedMagicItem.name}`,
        baseItemId: this.selectedMagicItem.id,
        baseItemData: this.selectedMagicItem.toObject(),
        isUpgrade: (this.selectedMagicItem.system?.enh || 0) > 0,
        material: "base",
        isMasterwork: true,
        isMagic: true,
        failMode: gmSettings.failMode || "strikes",
        magicEnhLevel: this.magicEnhLevel,
        selectedMagicProperties: Array.from(this.selectedMagicProperties),
        magicShortCompoundNames: this.magicShortCompoundNames,
        targetGp,
        currentGp: 0,
        dc,
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
    /* Work 1-Hour Shift                            */
    /* -------------------------------------------- */
    html.find('.work-shift-btn').click(async (e) => {
      const idx = $(e.currentTarget).data('idx');
      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      const proj = projects[idx];
      if (!proj) return;

      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];

      const roll = await new Roll("1d200 + @mod", { mod: currentDisc.mod }).evaluate({ async: true });
      
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `⚒️ <strong>${this.actor.name}</strong> works 1 hour on <em>${proj.name}</em> (DC ${proj.dc})`
      });

      const totalRoll = roll.total;
      const mos = totalRoll - proj.dc;
      const failLimit = Math.max(2, Math.floor(proj.requiredRolls / 3));

      const divisor = currentDisc.isGoldMode ? 100 : 1000;
      const shiftProgress = (totalRoll * proj.dc) / divisor;

      const totalShiftsSoFar = proj.shiftsLogged.length;
      let phaseLabel = "Smelting & Ingot Prep";
      let targetFacet = "Hardness & HP";
      if (totalShiftsSoFar >= Math.floor(proj.requiredRolls * 2 / 3)) {
        phaseLabel = "Honing & Edge Finishing";
        targetFacet = "Precision & Threat";
      } else if (totalShiftsSoFar >= Math.floor(proj.requiredRolls / 3)) {
        phaseLabel = "Forging & Geometry";
        targetFacet = "Physical AC & Weight";
      }

      if (mos >= 0) {
        proj.currentGp += shiftProgress;
        proj.shiftsLogged.push({ 
          roll: totalRoll, mos, success: true, phaseLabel, targetFacet,
          modifierText: `+${shiftProgress.toFixed(1)} GP (Tier +${Math.min(4, Math.max(1, Math.ceil(mos / 25)))})`
        });
        ui.notifications.info(`Shift Successful! Added +${shiftProgress.toFixed(1)} GP progress.`);
      } else {
        proj.failedChecks += 1;
        proj.currentGp = Math.max(0, proj.currentGp - (shiftProgress * 0.5));
        proj.shiftsLogged.push({ 
          roll: totalRoll, mos, success: false, phaseLabel, targetFacet,
          modifierText: `Failed Strike (-${(shiftProgress * 0.5).toFixed(1)} GP)`
        });
        ui.notifications.warn(`Shift Failed (Strike ${proj.failedChecks}). Progress lost.`);
      }

      const isRuined = proj.failMode === "zero" ? (proj.shiftsLogged.length > 1 && proj.currentGp <= 0) : (proj.failedChecks >= failLimit || (proj.shiftsLogged.length > 1 && proj.currentGp <= 0));

      if (isRuined) {
        ui.notifications.error(`Project Ruined! Work on ${proj.name} collapsed.`);
        
        if (proj.isMagic && proj.isUpgrade && this.actor.items.has(proj.baseItemId)) {
          const existingDoc = this.actor.items.get(proj.baseItemId);
          const currentEnh = existingDoc.system?.enh || 10;
          const newEnh = Math.max(0, currentEnh - 10);
          await existingDoc.update({ "system.enh": newEnh, "system.armor.enh": newEnh });
          ui.notifications.error(`Catastrophic Disruption: ${existingDoc.name}'s magic was damaged! Enhancement reduced to +${newEnh}.`);
        } else if (proj.consumedIngredients) {
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
        this.render();
        return;
      }

      if (proj.currentGp >= proj.targetGp && proj.shiftsLogged.length < proj.requiredRolls) {
        const needed = proj.requiredRolls - proj.shiftsLogged.length;
        ui.notifications.info(`GP Goal achieved early! Rolling remaining ${needed} modifier checks.`);
        for (let i = 0; i < needed; i++) {
          const modRoll = await new Roll("1d200 + @mod", { mod: currentDisc.mod }).evaluate({ async: true });
          proj.shiftsLogged.push({ 
            roll: modRoll.total, mos: modRoll.total - proj.dc, success: true, 
            phaseLabel: "Rapid Tuning", targetFacet: "Precision & Balance", modifierText: `Rolled: ${modRoll.total}` 
          });
        }
      }

      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
      this.render();
    });

    /* -------------------------------------------- */
    /* Claim Finished Item                          */
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
        ui.notifications.info(`Successfully refined ${refinedItem.name} and added to inventory!`);
        this.render();
        return;
      }

      const itemData = foundry.utils.deepClone(proj.baseItemData);
      const isWeapon = itemData.type === "weapon";
      const isArmor = itemData.type === "armor" || itemData.system?.armor !== undefined;
      const mat = SPECIAL_MATERIALS[proj.material] || SPECIAL_MATERIALS.base;

      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];

      while (proj.shiftsLogged.length < 3) {
        const autoRoll = await new Roll("1d200 + @mod", { mod: currentDisc.mod }).evaluate({ async: true });
        proj.shiftsLogged.push({ roll: autoRoll.total, mos: autoRoll.total - proj.dc, success: true, phaseLabel: "Instant Tuning", targetFacet: "Facet Allocation", modifierText: `Auto: ${autoRoll.total}` });
      }

      const tagsList = [proj.isMagic ? "Magic Infused" : "Crafted"];
      const identifiedTraits = [];

      const totalShifts = proj.shiftsLogged.length;
      const phase1 = proj.shiftsLogged.slice(0, Math.floor(totalShifts / 3));
      const phase2 = proj.shiftsLogged.slice(Math.floor(totalShifts / 3), Math.floor(totalShifts * 2 / 3));
      const phase3 = proj.shiftsLogged.slice(Math.floor(totalShifts * 2 / 3));

      const getPhaseMult = (phaseArr) => {
        if (!phaseArr || phaseArr.length === 0) return 1.0;
        const avgMos = phaseArr.reduce((acc, s) => acc + s.mos, 0) / phaseArr.length;
        return 1.0 + Math.max(-0.25, Math.min(0.25, avgMos / 200));
      };

      const hardMult = getPhaseMult(phase1);
      const physMult = getPhaseMult(phase2);
      const precMult = getPhaseMult(phase3);

      const tierPrefixes = { "-4": "Ruined", "-3": "Flawed", "-2": "Worn", "-1": "Serviceable", "1": "Tempered", "2": "Honed", "3": "Superior", "4": "Mastercraft" };
      let tier = Math.ceil(((precMult - 1.0) / 0.25) * 4);
      if (tier === 0) tier = precMult >= 1.0 ? 1 : -1;
      const prefix = tierPrefixes[Math.max(-4, Math.min(4, tier))];

      const tierSign = tier > 0 ? `+${tier}` : `${tier}`;
      tagsList.push(`Craft Quality: Tier ${tierSign}`);
      identifiedTraits.push(`<strong>Craftsmanship (${prefix}):</strong> Handcrafted to ${prefix.toLowerCase()} specifications.`);

      itemData.flags = itemData.flags || {};
      itemData.flags[MODULE_ID] = { is10xScaled: true, disable10xSheet: true, disable10xCard: true };
      
      if (proj.isMasterwork || tier >= 4 || mat.name === "Adamantine" || mat.name === "Mithral" || proj.isMagic) {
        itemData.system.masterwork = true;
      } else {
        itemData.system.masterwork = false;
      }
      itemData.system.identified = true;

      let rawHardness = (typeof itemData.system.hardness === "object" ? itemData.system.hardness.value : itemData.system.hardness) || 10;
      let rawBaseHp = (itemData.system.hp?.base ?? itemData.system.hp?.max ?? 0);

      if (isWeapon && rawBaseHp < 5) {
        const subType = (itemData.system.weaponSubtype || "").toLowerCase();
        rawBaseHp = subType === "light" ? 5 : subType === "1h" ? 10 : 15;
      } else if (rawBaseHp === 0) {
        rawBaseHp = 10;
      }

      itemData.system.hardness = Math.max(0, Math.round((rawHardness * 10 + mat.hardnessMod) * hardMult));
      const fHp = Math.max(1, Math.round((rawBaseHp * 10 * mat.hpMult) * hardMult));
      itemData.system.hp = { base: fHp, max: fHp, value: fHp };

      const hardTier = Math.ceil(((hardMult - 1.0) / 0.25) * 4);
      tagsList.push(`Hardness: Tier ${hardTier >= 0 ? `+${hardTier || 1}` : hardTier}`);
      tagsList.push(`Hit Points: Tier ${hardTier >= 0 ? `+${hardTier || 1}` : hardTier}`);

      const weightFactor = Math.max(0.1, 2.0 - physMult);
      const rawWeight = itemData.system?.weight?.value ?? 0;
      if (itemData.system?.weight) {
        itemData.system.weight.value = rawWeight === 0 ? 0 : Math.max(0.1, Math.round((rawWeight * (mat.weightMult || 1.0) * weightFactor) * 100) / 100);
      }
      const weightTier = Math.ceil(((weightFactor - 1.0) / 0.25) * 4);
      tagsList.push(`Weight: Tier ${weightTier >= 0 ? `+${weightTier || 1}` : weightTier}`);

      if (isArmor && itemData.system?.armor) {
        itemData.system.armor.value = Math.round((itemData.system.armor.value || 0) * 10 * physMult);
        let adjAcp = Math.round((itemData.system.armor.acp || 0) * 10 * (2.0 - physMult));
        if (mat.acpBonus) adjAcp = Math.min(0, adjAcp + mat.acpBonus);
        itemData.system.armor.acp = adjAcp;

        tagsList.push(`Armor AC: Tier ${tierSign}`);
        tagsList.push(`ACP: Tier ${tierSign}`);
        identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${itemData.system.armor.value}, ACP ${itemData.system.armor.acp}.`);
      }

      if (isWeapon && itemData.system?.actions) {
        itemData.system.actions.forEach(act => {
          act.ability = act.ability || {};
          act.extraAttacks = [{ type: "custom", name: "10x Iteratives", countFormula: "max(0, floor((@attributes.bab.total - 10) / 50))", modifierFormula: "-50 * (@idx + 1)" }];
          
          let cBase = act.ability.critRange ?? act.critRange ?? 191;
          if (cBase <= 20) cBase = (cBase * 10) - 9;
          act.critRange = Math.min(199, Math.max(100, Math.round(cBase - ((precMult - 1.0) * 40))));
          act.ability.critRange = act.critRange;

          let fMult = Number(act.ability.critMult ?? act.critMult ?? 2);
          if (precMult >= 1.20) fMult += 1;
          else if (precMult <= 0.80) fMult = Math.max(1, fMult - 1);
          act.critMult = fMult;
          act.ability.critMult = fMult;
        });

        tagsList.push(`Crit Threat: Tier ${tierSign}`);
        tagsList.push(`Crit Mult: Tier ${tierSign}`);
        identifiedTraits.push(`<strong>Precision:</strong> Crit range ${itemData.system.actions[0]?.critRange}–200, multiplier ×${itemData.system.actions[0]?.critMult}.`);
      }

      let propPrefixes = [];
      let enhSuffix = "";

      if (proj.isMagic) {
        const enhLevel = proj.magicEnhLevel || 1;
        itemData.system.enh = enhLevel * 10;
        if (itemData.system.armor) itemData.system.armor.enh = itemData.system.enh;

        const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
        enhSuffix = ` ${titles[enhLevel] || ""}`;
        identifiedTraits.push(`<strong>Enhancement Bonus (+${itemData.system.enh}):</strong> Provides +${itemData.system.enh} to attack/damage/AC.`);

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

      ui.notifications.info(`Successfully completed and added ${itemData.name} to inventory!`);
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
    const gmSettings = getSafeSetting("workshopGmConfig", { failMode: "strikes", maxStrikes: 3 });
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
        <form style="max-height:420px; overflow-y:auto; padding:6px; font-size:0.85em;">
          <div style="font-weight:bold; border-bottom:1px solid #ccc; margin-bottom:6px;">GM Failure Strike Rules</div>
          <div class="form-group" style="margin-bottom:6px;">
            <label>Failure Mode</label>
            <select id="gm-fail-mode">
              <option value="strikes" ${gmSettings.failMode === "strikes" ? "selected" : ""}>Strikes Tolerance (Default: 1/3 required shifts)</option>
              <option value="zero" ${gmSettings.failMode === "zero" ? "selected" : ""}>Zero-Progress Ruin (No strike limit, fails only at 0 GP)</option>
            </select>
          </div>

          <div style="font-weight:bold; border-bottom:1px solid #ccc; margin:10px 0 6px 0;">Source Compendiums for ${currentDisc.label}</div>
          <p style="font-size:0.8em; color:#555;">Check all compendiums to search for blueprints under this discipline:</p>
          ${checkboxes}
        </form>
      `,
      buttons: {
        save: {
          label: "Save Workshop Settings",
          callback: async (dHtml) => {
            const failMode = dHtml.find('#gm-fail-mode').val();
            await setSafeSetting("workshopGmConfig", { failMode });

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