/**
 * @file player-workshop.mjs
 * Player-Facing Procedural Crafting & Magic Enchanting Workbench
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

export const CRAFT_MATERIAL_RULES = {
  base: {
    name: "Base Material",
    unitName: "Standard Component",
    allowed: ["metal_weapon", "wood_weapon", "metal_armor", "leather_armor", "shield", "ammo", "alchemy", "poison", "siege"]
  },
  steel: {
    name: "Steel",
    unitName: "Steel Ingot",
    allowed: ["metal_weapon", "metal_armor", "shield", "siege"]
  },
  adamantine: {
    name: "Adamantine",
    unitName: "Adamantine Ingot",
    allowed: ["metal_weapon", "metal_armor", "shield"]
  },
  coldiron: {
    name: "Cold Iron",
    unitName: "Cold Iron Ingot",
    allowed: ["metal_weapon"]
  },
  silversheen: {
    name: "Alchemical Silver",
    unitName: "Alchemical Silver Ingot",
    allowed: ["metal_weapon"]
  },
  mithral: {
    name: "Mithral",
    unitName: "Mithral Ingot",
    allowed: ["metal_weapon", "metal_armor", "shield"]
  },
  darkwood: {
    name: "Darkwood",
    unitName: "Darkwood Timber",
    allowed: ["wood_weapon", "shield", "bow", "crossbow", "siege"]
  },
  dragonhide: {
    name: "Dragonhide",
    unitName: "Dragon Scales / Hide",
    allowed: ["leather_armor", "metal_armor", "shield"]
  }
};

export class PlayerWorkshopApp extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.activeTab = "bench"; // "bench" | "active" | "magic"
    this.selectedDiscipline = options.discipline || "";
    this.compendiumItems = [];
    this.selectedBaseItem = null;
    this.selectedMaterial = "base";
    this.isMasterwork = true;
    this.acceleratedDcBonus = 0;
    this.searchTerm = "";

    // ─── MAGIC ENCHANTING BENCH STATE ───
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
      width: 1060,
      height: 860,
      resizable: true,
      classes: ["aeris-workshop-app"]
    });
  }

  _getHeaderButtons() {
    const buttons = super._getHeaderButtons();
    if (game.user.isGM) {
      buttons.unshift({
        label: "Source Packs",
        class: "workshop-gm-packs",
        icon: "fas fa-cog",
        onclick: () => this._openGmPackConfigDialog()
      });
    }
    return buttons;
  }

  /* -------------------------------------------- */
  /* Sub-Skill Detection & Discipline Parsing     */
  /* -------------------------------------------- */

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
        hasMagicAccess: (sub.rank || 0) >= 50
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
        hasMagicAccess: (this.actor.system?.skills?.crf?.rank || 0) >= 50
      });
    }

    return disciplines;
  }

  /* -------------------------------------------- */
  /* Magic Crafting Prerequisite Check            */
  /* -------------------------------------------- */

  _checkMagicCraftPrerequisites() {
    const hasFeat = this.actor.items.some(i => 
      /\b(craft magic arms|craft magic arms and armor)\b/i.test(i.name)
    );
    const spellcraftRank = this.actor.system?.skills?.spl?.rank || 0;
    const disciplines = this._getAvailableCraftDisciplines();
    const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    
    const hasRank50 = (currentDisc.rank >= 50) || (spellcraftRank >= 50);
    return {
      canCraftMagic: hasFeat || hasRank50,
      reason: hasFeat ? "Feat: Craft Magic Arms & Armor" : hasRank50 ? "Artisan Mastery (50+ Skill Ranks)" : "Requires 50+ Craft/Spellcraft Ranks or Craft Magic Arms & Armor Feat"
    };
  }

  /* -------------------------------------------- */
  /* Compendium Query & Multi-Pack Integration    */
  /* -------------------------------------------- */

  async _loadCompendiumItemsForDiscipline(disciplineType) {
    const savedPacksMap = game.settings.get(MODULE_ID, "craftCompendiums") || {};
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

  /* -------------------------------------------- */
  /* Tangible Ingredients & Catalyst Matchers     */
  /* -------------------------------------------- */

  _calculateRequiredIngredients(baseItem, chosenMaterialKey) {
    const type = baseItem.type;
    const subType = (baseItem.system?.subType || baseItem.system?.weaponSubtype || "").toLowerCase();
    const name = baseItem.name.toLowerCase();
    const ingredients = [];

    const matRule = CRAFT_MATERIAL_RULES[chosenMaterialKey] || CRAFT_MATERIAL_RULES.base;
    const isSpecialMat = chosenMaterialKey !== "base" && chosenMaterialKey !== "steel";

    if (type === "weapon" && subType !== "ranged" && !/\b(bow|crossbow|pistol|musket)\b/i.test(name)) {
      const isWoodWeapon = /\b(club|greatclub|quarterstaff|staff|bo staff|nunchaku)\b/i.test(name);
      
      if (isWoodWeapon) {
        const matName = isSpecialMat ? matRule.unitName : "Crafting Timber / Wood";
        const pat = isSpecialMat ? new RegExp(matRule.name, "i") : /(wood|timber|lumber|haft|stave)/i;
        ingredients.push({ label: matName, pattern: pat, qty: subType === "2h" ? 3 : 2 });
      } else {
        const matName = isSpecialMat ? matRule.unitName : "Refined Metal / Steel";
        const pat = isSpecialMat ? new RegExp(matRule.name, "i") : /(steel|iron|metal|bar|ingot|plate)/i;
        
        if (subType === "light") {
          ingredients.push({ label: matName, pattern: pat, qty: 1 });
          ingredients.push({ label: "Treated Leather / Grip", pattern: /(leather|hide|pelt|strap)/i, qty: 1 });
        } else if (subType === "1h") {
          ingredients.push({ label: matName, pattern: pat, qty: 2 });
          ingredients.push({ label: "Crafting Timber / Wood", pattern: /(wood|timber|lumber|haft)/i, qty: 1 });
        } else {
          ingredients.push({ label: matName, pattern: pat, qty: 4 });
          ingredients.push({ label: "Crafting Timber / Wood", pattern: /(wood|timber|lumber|haft)/i, qty: 2 });
        }
      }
    } else if (type === "weapon" && /\b(bow|crossbow)\b/i.test(name)) {
      const woodName = isSpecialMat ? matRule.unitName : "Crafting Timber / Wood";
      const woodPat = isSpecialMat ? new RegExp(matRule.name, "i") : /(wood|timber|lumber|stave|yew)/i;

      if (/\bcrossbow\b/i.test(name)) {
        ingredients.push({ label: woodName, pattern: woodPat, qty: 3 });
        ingredients.push({ label: "Mechanical Components", pattern: /(mechanism|fittings|lock|gear|scrap|spring|metal)/i, qty: 1 });
      } else {
        ingredients.push({ label: woodName, pattern: woodPat, qty: 2 });
        ingredients.push({ label: "Mechanical Components / String", pattern: /(string|cord|sinew|wire|mechanism)/i, qty: 1 });
      }
    } else if (type === "weapon" && /\b(pistol|musket|rifle|blunderbuss)\b/i.test(name)) {
      ingredients.push({ label: "Refined Metal / Steel", pattern: /(steel|iron|metal|bar|ingot|plate)/i, qty: 3 });
      ingredients.push({ label: "Mechanical Components", pattern: /(mechanism|fittings|lock|gear|scrap|spring)/i, qty: 1 });
      ingredients.push({ label: "Crafting Timber / Wood", pattern: /(wood|timber|lumber|stock)/i, qty: 1 });
    } else if (type === "armor" || type === "shield" || baseItem.system?.armor !== undefined) {
      if (subType === "light" || /\b(leather|padded|hide|quilted)\b/i.test(name)) {
        const leatherName = isSpecialMat ? matRule.unitName : "Treated Leather";
        const leatherPat = isSpecialMat ? new RegExp(matRule.name, "i") : /(leather|hide|pelt|skin)/i;
        ingredients.push({ label: leatherName, pattern: leatherPat, qty: 3 });
      } else if (subType === "medium") {
        const metalName = isSpecialMat ? matRule.unitName : "Refined Metal / Steel";
        const metalPat = isSpecialMat ? new RegExp(matRule.name, "i") : /(steel|iron|metal|bar|ingot|plate|scale)/i;
        ingredients.push({ label: metalName, pattern: metalPat, qty: 4 });
        ingredients.push({ label: "Treated Leather", pattern: /(leather|hide|pelt|skin)/i, qty: 2 });
      } else if (subType === "heavy") {
        const metalName = isSpecialMat ? matRule.unitName : "Refined Metal / Steel";
        const metalPat = isSpecialMat ? new RegExp(matRule.name, "i") : /(steel|iron|metal|bar|ingot|plate)/i;
        ingredients.push({ label: metalName, pattern: metalPat, qty: 6 });
        ingredients.push({ label: "Treated Leather", pattern: /(leather|hide|pelt|skin)/i, qty: 3 });
      } else {
        const shieldMatName = isSpecialMat ? matRule.unitName : "Refined Metal / Timber";
        const shieldPat = isSpecialMat ? new RegExp(matRule.name, "i") : /(steel|iron|metal|wood|timber|plate)/i;
        ingredients.push({ label: shieldMatName, pattern: shieldPat, qty: 2 });
        ingredients.push({ label: "Treated Leather", pattern: /(leather|hide|strap|grip)/i, qty: 1 });
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

  _calculateMagicReagents(enhLevel, selectedPropsSet) {
    const reagents = [];
    const inventory = this.actor.items.contents;

    // 1. Arcane Dust / Residue requirement
    if (enhLevel > 0) {
      reagents.push({
        label: `${enhLevel}x Arcane Dust / Residue`,
        pattern: /(arcane|dust|residue|essence|powder)/i,
        qty: enhLevel
      });
    }

    // 2. Specific Gemstone / Catalyst Requirements for Elemental & Special Properties
    for (const pKey of selectedPropsSet) {
      if (pKey.includes("flaming")) {
        reagents.push({ label: "Ruby / Fire Essence", pattern: /(ruby|rubies|fire gem|flame essence)/i, qty: 1 });
      } else if (pKey.includes("frost")) {
        reagents.push({ label: "Sapphire / Glacial Core", pattern: /(sapphire|frost gem|ice essence|glacial)/i, qty: 1 });
      } else if (pKey.includes("shock")) {
        reagents.push({ label: "Topaz / Lightning Quartz", pattern: /(topaz|lightning gem|electric essence|quartz)/i, qty: 1 });
      } else if (pKey.includes("corrosive")) {
        reagents.push({ label: "Emerald / Acid Drake Gland", pattern: /(emerald|acid gland|caustic|venom)/i, qty: 1 });
      } else if (pKey.includes("holy") || pKey.includes("vorpal")) {
        reagents.push({ label: "Brilliant Diamond", pattern: /(diamond|brilliant|celestial)/i, qty: 1 });
      } else if (pKey.includes("shadow") || pKey.includes("slick")) {
        reagents.push({ label: "Onyx / Eelskin Oil", pattern: /(onyx|shadow gem|oil|slick)/i, qty: 1 });
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
    return { list: resolved, allSatisfied };
  }

  /* -------------------------------------------- */
  /* Data Preparation                             */
  /* -------------------------------------------- */

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

    const validMaterials = this._getValidMaterialsForItem(this.selectedBaseItem);
    if (!validMaterials[this.selectedMaterial]) {
      this.selectedMaterial = "base";
    }

    let ingredientsInfo = { list: [], allSatisfied: false };
    if (this.selectedBaseItem) {
      ingredientsInfo = this._calculateRequiredIngredients(this.selectedBaseItem, this.selectedMaterial);
    }

    // Magic Item Inventory Filter (Must be Masterwork or Forged)
    const playerInventory = this.actor.items.contents;
    const enchantableInventoryItems = playerInventory.filter(i => {
      const isMasterwork = i.system?.masterwork === true;
      const isEligibleType = ["weapon", "armor", "shield", "equipment"].includes(i.type);
      return isMasterwork && isEligibleType;
    });

    // Magic Property Registers
    const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
    let availableMagicProperties = {};
    if (this.selectedMagicItem) {
      const isArmor = this.selectedMagicItem.type === "armor" || this.selectedMagicItem.system?.armor !== undefined;
      availableMagicProperties = isArmor ? { ...ARMOR_ENCHANTMENTS, ...customProps } : { ...WEAPON_ENCHANTMENTS, ...customProps };
    }

    let magicReagentsInfo = { list: [], allSatisfied: false };
    if (this.selectedMagicItem) {
      magicReagentsInfo = this._calculateMagicReagents(this.magicEnhLevel, this.selectedMagicProperties);
    }

    return {
      actor: this.actor,
      isGM: game.user.isGM,
      activeTab: this.activeTab,
      disciplines,
      selectedDiscipline: this.selectedDiscipline,
      currentDiscipline,
      items: this.compendiumItems,
      selectedBaseItem: this.selectedBaseItem,
      selectedMaterial: this.selectedMaterial,
      isMasterwork: this.isMasterwork,
      validMaterials,
      acceleratedDcBonus: this.acceleratedDcBonus,
      ingredientsInfo,
      projects: rawProjects,
      searchTerm: this.searchTerm,
      
      // Magic Bench Data
      magicPrereqs,
      enchantableInventoryItems,
      selectedMagicItem: this.selectedMagicItem,
      magicEnhLevel: this.magicEnhLevel,
      availableMagicProperties,
      selectedMagicProperties: this.selectedMagicProperties,
      magicReagentsInfo,
      magicShortCompoundNames: this.magicShortCompoundNames
    };
  }

  /* -------------------------------------------- */
  /* HTML Rendering                               */
  /* -------------------------------------------- */

  async _renderInner(data) {
    const discOpts = data.disciplines.map(d => 
      `<option value="${d.key}" ${d.key === data.selectedDiscipline ? "selected" : ""}>${d.label} (+${d.mod} | ${d.rank} Ranks${d.isGoldMode ? ' ⚡ Gold' : ''}${d.hasMagicAccess ? ' ✨ Magic' : ''})</option>`
    ).join("");

    const matOpts = Object.entries(data.validMaterials).map(([k, v]) => 
      `<option value="${k}" ${k === data.selectedMaterial ? "selected" : ""}>${v.name}</option>`
    ).join("");

    const itemRows = data.items.map(i => `
      <div class="bench-item-row ${data.selectedBaseItem?._id === i._id ? "selected" : ""}" data-id="${i._id}" data-pack="${i._packCollection}" style="display:flex; align-items:center; gap:6px; padding:5px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.06); background:${data.selectedBaseItem?._id === i._id ? "rgba(46,204,113,0.15)" : "transparent"};">
        <img src="${i.img || "icons/svg/item-bag.svg"}" width="26" height="26" style="border-radius:3px;" />
        <span style="font-size:0.85em; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i.name}</span>
        <span style="font-size:0.75em; color:#777;">${i.system?.price || 0} GP</span>
      </div>
    `).join("");

    const activeProjectsHtml = data.projects.length > 0 ? data.projects.map((proj, idx) => {
      const pct = Math.min(100, Math.round((proj.currentGp / proj.targetGp) * 100));
      const failLimit = Math.max(2, Math.floor(proj.requiredRolls / 3));
      return `
        <div style="background:#fff; border:1px solid #ced6e0; border-radius:6px; padding:10px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div>
              <strong style="font-size:1.05em; color:var(--color-text-dark-primary);">${proj.name}</strong>
              <span style="font-size:0.8em; color:#666; margin-left:6px;">(DC ${proj.dc} | ${proj.isMagic ? '✨ Magic Infusion' : `Material: ${proj.material}`})</span>
            </div>
            <div>
              <span style="font-size:0.8em; font-weight:bold; color:${proj.failedChecks >= failLimit - 1 ? '#c0392b' : '#555'};">
                Failed Strikes: ${proj.failedChecks} / ${failLimit}
              </span>
            </div>
          </div>

          <div style="background:#e0e0e0; border-radius:4px; height:18px; width:100%; overflow:hidden; position:relative; margin-bottom:6px;">
            <div style="background:linear-gradient(90deg, #2ecc71, #27ae60); height:100%; width:${pct}%; transition:width 0.3s ease;"></div>
            <span style="position:absolute; width:100%; text-align:center; top:0; left:0; font-size:0.75em; line-height:18px; font-weight:bold; color:#111;">
              ${proj.currentGp.toFixed(1)} / ${proj.targetGp} GP (${pct}%) — Shift ${proj.shiftsLogged.length}/${proj.requiredRolls}
            </span>
          </div>

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

    // Magic Tab Inventory List
    const enchantableRows = data.enchantableInventoryItems.map(i => `
      <div class="magic-select-row ${data.selectedMagicItem?.id === i.id ? "selected" : ""}" data-id="${i.id}" style="display:flex; align-items:center; gap:6px; padding:5px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.06); background:${data.selectedMagicItem?.id === i.id ? "rgba(155,89,182,0.15)" : "transparent"};">
        <img src="${i.img}" width="26" height="26" style="border-radius:3px;" />
        <span style="font-size:0.85em; flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${i.name}</span>
        <span style="font-size:0.75em; color:#777;">Base: ${i.system?.price || 0} GP</span>
      </div>
    `).join("");

    const magicPropRows = Object.entries(data.availableMagicProperties).map(([k, v]) => `
      <label style="display:flex; align-items:center; gap:6px; font-size:0.85em; margin-bottom:3px; cursor:pointer; padding:3px; border-bottom:1px solid rgba(0,0,0,0.04);">
        <input type="checkbox" class="magic-prop-cb" value="${k}" ${data.selectedMagicProperties.has(k) ? "checked" : ""}>
        <strong>${v.baseName}</strong> <span style="color:#666;">(+${v.cost})</span>
      </label>
    `).join("");

    const html = `
      <div style="display:flex; flex-direction:column; height:100%; gap:8px; padding:8px; font-family:var(--font-primary);">
        
        <!-- HEADER NAVIGATION TABS -->
        <nav style="display:flex; gap:8px; border-bottom:2px solid var(--color-border-light-2); padding-bottom:6px;">
          <button type="button" class="workshop-tab-btn ${data.activeTab === "bench" ? "active" : ""}" data-tab="bench" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "bench" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "bench" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            📐 Recipe Bench (Mundane)
          </button>
          <button type="button" class="workshop-tab-btn ${data.activeTab === "magic" ? "active" : ""}" data-tab="magic" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "magic" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "magic" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ✨ Magic Enchanting
          </button>
          <button type="button" class="workshop-tab-btn ${data.activeTab === "active" ? "active" : ""}" data-tab="active" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "active" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "active" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ⚒️ Active Projects (${data.projects.length})
          </button>
        </nav>

        ${data.activeTab === "bench" ? `
          <!-- MUNDANE RECIPE BENCH -->
          <div style="display:flex; flex:1; gap:12px; overflow:hidden;">
            <div style="flex:1.15; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
              <div>
                <label style="font-size:0.8em; font-weight:bold;">Active Craft Discipline</label>
                <select id="workshop-discipline-select" style="width:100%; padding:4px; font-size:0.85em;">${discOpts}</select>
              </div>

              <input type="text" id="workshop-search-input" value="${data.searchTerm}" placeholder="🔍 Search ${data.currentDiscipline.label} blueprints..." style="padding:4px; font-size:0.85em; border:1px solid #ced6e0; border-radius:3px;">
              
              <div style="flex-grow:1; max-height:540px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                ${itemRows || `<p style="padding:10px; font-size:0.85em; color:#777;">No blueprints matching ${data.currentDiscipline.label} found in active compendiums.</p>`}
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
                      <span style="color:#555;">Base Price: ${data.selectedBaseItem.system?.price || 0} GP | Target Goal: ${(data.selectedBaseItem.system?.price || 10) + (data.isMasterwork ? 300 : 0)} GP</span>
                    </div>
                  </div>

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
                      <span>Masterwork Quality (+300 GP to goal)</span>
                    </label>
                  </div>

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
                    <div>• <strong>Hourly Craft DC:</strong> ${150 + data.acceleratedDcBonus} (Base 150 + Speed)</div>
                    <div>• <strong>Progress Rate:</strong> ${data.currentDiscipline.isGoldMode ? 'Gold Mode (100x Speed)' : 'Silver Mode (10x Speed)'}</div>
                    <div>• <strong>Estimated Shifts:</strong> ${Math.max(2, Math.ceil(((data.selectedBaseItem.system?.price || 10) + (data.isMasterwork ? 300 : 0)) / (data.currentDiscipline.isGoldMode ? 150 : 35)))} Shifts</div>
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
                <p style="font-size:0.9em; max-width:480px;">${data.magicPrereqs.reason}. Reach rank 50 in Craft/Spellcraft or obtain the Craft Magic Arms and Armor feat to enchant equipment.</p>
              </div>
            ` : `
              <div style="flex:1.15; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
                <strong style="font-size:0.9em;">Select Masterwork Base Item from Inventory:</strong>
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
                        <span style="color:#555;">Base Value: ${data.selectedMagicItem.system?.price || 0} GP</span>
                      </div>
                    </div>

                    <div style="margin-bottom:6px;">
                      <label style="font-size:0.8em; font-weight:bold;">Enhancement Bonus</label>
                      <select id="magic-enh-select" style="width:100%; padding:3px; font-size:0.85em;">
                        <option value="1" ${data.magicEnhLevel===1?"selected":""}>+1 (+10 Scaled) [2,000 GP]</option>
                        <option value="2" ${data.magicEnhLevel===2?"selected":""}>+2 (+20 Scaled) [8,000 GP]</option>
                        <option value="3" ${data.magicEnhLevel===3?"selected":""}>+3 (+30 Scaled) [18,000 GP]</option>
                        <option value="4" ${data.magicEnhLevel===4?"selected":""}>+4 (+40 Scaled) [32,000 GP]</option>
                        <option value="5" ${data.magicEnhLevel===5?"selected":""}>+5 (+50 Scaled) [50,000 GP]</option>
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

                    <strong style="font-size:0.85em;">Required Magical Catalysts:</strong>
                    <div style="background:#fff; border:1px solid #ced6e0; border-radius:4px; padding:6px; margin:4px 0 8px 0;">
                      ${data.magicReagentsInfo.list.map(ing => `
                        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8em; padding:2px 0; color:${ing.satisfied ? '#27ae60' : '#c0392b'};">
                          <span>${ing.satisfied ? '✔️' : '❌'} ${ing.qty}x ${ing.label}</span>
                          <span>(You have: ${ing.available})</span>
                        </div>
                      `).join("")}
                    </div>

                    <div style="font-size:0.8em; color:#666; line-height:1.3;">
                      <div>• <strong>Enchanting DC:</strong> ${150 + (data.magicEnhLevel * 20)} | <strong>CL:</strong> ${data.magicEnhLevel * 3}</div>
                      <div>• <strong>Enchantment Cost:</strong> ${(Math.pow(data.magicEnhLevel, 2) * 2000) / 2} GP (Half Market)</div>
                    </div>
                  </div>

                  <button type="button" id="start-magic-project-btn" ${!data.magicReagentsInfo.allSatisfied ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="margin-top:auto; padding:10px; font-weight:bold; background:#8e44ad; color:#fff; border:none; border-radius:4px; cursor:pointer;">
                    ${data.magicReagentsInfo.allSatisfied ? '🔮 Infuse & Begin Magic Project' : '⚠️ Missing Required Gemstones or Catalysts'}
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

  /* -------------------------------------------- */
  /* Event Listeners & Execution Logic            */
  /* -------------------------------------------- */

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
      const packKey = $(e.currentTarget).data('pack');
      const pack = game.packs.get(packKey);
      if (pack) {
        this.selectedBaseItem = await pack.getDocument(id);
        this.render();
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

    // Magic Bench Listeners
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
    /* Start Mundane Crafting Project               */
    /* -------------------------------------------- */
    html.find('#start-project-btn').click(async () => {
      if (!this.selectedBaseItem) return;

      const ingredientsInfo = this._calculateRequiredIngredients(this.selectedBaseItem, this.selectedMaterial);
      if (!ingredientsInfo.allSatisfied) {
        return ui.notifications.error("You do not have all required tangible materials in your inventory!");
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

      const basePrice = this.selectedBaseItem.system?.price || 10;
      const targetGp = basePrice + (this.isMasterwork ? 300 : 0);
      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
      const divisor = currentDisc.isGoldMode ? 150 : 35;
      const requiredRolls = Math.max(3, Math.ceil(targetGp / divisor));
      const dc = 150 + this.acceleratedDcBonus;

      const prefixLabel = this.isMasterwork ? "Masterwork " : "";

      const newProject = {
        id: foundry.utils.randomID(),
        name: `${prefixLabel}${this.selectedBaseItem.name}`,
        baseItemId: this.selectedBaseItem.id,
        baseItemData: this.selectedBaseItem.toObject(),
        material: this.selectedMaterial,
        isMasterwork: this.isMasterwork,
        isMagic: false,
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

      const reagentsInfo = this._calculateMagicReagents(this.magicEnhLevel, this.selectedMagicProperties);
      if (!reagentsInfo.allSatisfied) {
        return ui.notifications.error("You do not have all required catalysts/gemstones in inventory!");
      }

      // Deduct catalysts
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

      const totalEffectiveBonus = this.magicEnhLevel + Array.from(this.selectedMagicProperties).reduce((acc, p) => {
        const prop = WEAPON_ENCHANTMENTS[p] || ARMOR_ENCHANTMENTS[p] || {};
        return acc + (prop.cost || 0);
      }, 0);

      const targetGp = (Math.pow(totalEffectiveBonus, 2) * 2000) / 2; // Half market price
      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
      const requiredRolls = Math.max(3, Math.ceil(targetGp / 250));
      const dc = 150 + (this.magicEnhLevel * 20);

      const newProject = {
        id: foundry.utils.randomID(),
        name: `+${this.magicEnhLevel * 10} Enchantment: ${this.selectedMagicItem.name}`,
        baseItemId: this.selectedMagicItem.id,
        baseItemData: this.selectedMagicItem.toObject(),
        material: "base",
        isMasterwork: true,
        isMagic: true,
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

      ui.notifications.info(`Catalysts consumed. Started enchanting project for ${newProject.name}!`);
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

      if (mos >= 0) {
        proj.currentGp += shiftProgress;
        proj.shiftsLogged.push({ roll: totalRoll, mos, success: true });
        ui.notifications.info(`Shift Successful! Added +${shiftProgress.toFixed(1)} GP progress.`);
      } else {
        proj.failedChecks += 1;
        proj.currentGp = Math.max(0, proj.currentGp - (shiftProgress * 0.5));
        proj.shiftsLogged.push({ roll: totalRoll, mos, success: false });
        ui.notifications.warn(`Shift Failed (Strike ${proj.failedChecks}/${failLimit}). Progress lost.`);
      }

      if (proj.failedChecks >= failLimit || (proj.shiftsLogged.length > 1 && proj.currentGp <= 0)) {
        ui.notifications.error(`Project Ruined! Work on ${proj.name} collapsed. 50% scrap materials returned.`);
        
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
        this.render();
        return;
      }

      // ─── GUARANTEE ROLLS ON EARLY COMPLETION ───
      if (proj.currentGp >= proj.targetGp && proj.shiftsLogged.length < proj.requiredRolls) {
        const needed = proj.requiredRolls - proj.shiftsLogged.length;
        ui.notifications.info(`GP Goal achieved early! Rolling remaining ${needed} modifier checks.`);
        for (let i = 0; i < needed; i++) {
          const modRoll = await new Roll("1d200 + @mod", { mod: currentDisc.mod }).evaluate({ async: true });
          proj.shiftsLogged.push({ roll: modRoll.total, mos: modRoll.total - proj.dc, success: true });
        }
      }

      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
      this.render();
    });

    /* -------------------------------------------- */
    /* Claim Finished Item (Full Independent Rolls) */
    /* -------------------------------------------- */
    html.find('.claim-project-btn').click(async (e) => {
      const idx = $(e.currentTarget).data('idx');
      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      const proj = projects[idx];
      if (!proj) return;

      const itemData = foundry.utils.deepClone(proj.baseItemData);
      const isWeapon = itemData.type === "weapon";
      const isArmor = itemData.type === "armor" || itemData.system?.armor !== undefined;
      const mat = SPECIAL_MATERIALS[proj.material] || SPECIAL_MATERIALS.base;

      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];

      // Ensure at least 3 distinct shifts exist so every phase receives an independent roll
      while (proj.shiftsLogged.length < 3) {
        const autoRoll = await new Roll("1d200 + @mod", { mod: currentDisc.mod }).evaluate({ async: true });
        proj.shiftsLogged.push({ roll: autoRoll.total, mos: autoRoll.total - proj.dc, success: true });
      }

      const tagsList = [proj.isMagic ? "Magic Infused" : "Crafted"];
      const identifiedTraits = [];

      // 3-Phase Chronological Variance Mapping
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

      // Phase 1: Durability, Hardness, and Robust HP Floor
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

      if (mat.name !== "Base" && mat.name !== "Steel") {
        identifiedTraits.push(`<strong>Material (${mat.name}):</strong> Hardness ${itemData.system.hardness}, HP ${itemData.system.hp.max}. ${mat.desc || ""}`);
      }

      // Phase 2: Physical AC, ACP, Weight
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

      // Phase 3: Precision, Crit Threat & Multipliers
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

      // ─── MAGIC ENCHANTMENT RESOLUTION ───
      let propPrefixes = [];
      let propSuffixes = [];
      let enhSuffix = "";

      if (proj.isMagic) {
        const enhLevel = proj.magicEnhLevel || 1;
        itemData.system.enh = enhLevel * 10;
        if (itemData.system.armor) itemData.system.armor.enh = itemData.system.enh;

        const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
        enhSuffix = ` ${titles[enhLevel] || ""}`;
        identifiedTraits.push(`<strong>Enhancement Bonus (+${itemData.system.enh}):</strong> Imbues item with +${itemData.system.enh} to attack/damage/AC.`);

        const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
        const propPool = isArmor ? { ...ARMOR_ENCHANTMENTS, ...customProps } : { ...WEAPON_ENCHANTMENTS, ...customProps };

        for (const pKey of (proj.selectedMagicProperties || [])) {
          const prop = propPool[pKey];
          if (!prop) continue;

          if (prop.isDice && isWeapon && itemData.system?.actions) {
            const numDice = prop.numDice || 1;
            const faces = 60;
            propPrefixes.push(prop.baseName);
            itemData.system.actions[0].damage.parts.push({
              formula: `${numDice}d${faces}`,
              type: { values: [prop.type], custom: "" }
            });
            identifiedTraits.push(`<strong>${prop.baseName} Infusion:</strong> Deals +${numDice}d${faces} ${prop.type} damage.`);
          } else {
            tagsList.push(`Property: ${prop.title || prop.baseName}`);
            if (prop.title?.startsWith("of ")) propSuffixes.push(prop.title);
            else propPrefixes.push(prop.title || prop.baseName);
            if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
          }
        }
      }

      const matTitle = mat.name !== "Base" && mat.name !== "Steel" ? `${mat.name} ` : "";
      const pPre = propPrefixes.length ? `${propPrefixes.join(" ")} ` : "";
      const pSuf = propSuffixes.length ? ` ${propSuffixes.join(" ")}` : "";

      itemData.name = `${prefix} ${matTitle}${pPre}${proj.baseItemData.name}${pSuf}${enhSuffix}`.trim();
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

      // If magic enchanting an existing inventory item, update it directly; otherwise create new
      if (proj.isMagic && this.actor.items.has(proj.baseItemId)) {
        await this.actor.updateEmbeddedDocuments("Item", [{ _id: proj.baseItemId, ...itemData }]);
      } else {
        await this.actor.createEmbeddedDocuments("Item", [itemData]);
      }

      projects.splice(idx, 1);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      ui.notifications.info(`Successfully completed and added ${itemData.name} to inventory!`);
      this.render();
    });

    /* -------------------------------------------- */
    /* Abandon Project                              */
    /* -------------------------------------------- */
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

  _openGmPackConfigDialog() {
    const disciplines = this._getAvailableCraftDisciplines();
    const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
    const savedMap = game.settings.get(MODULE_ID, "craftCompendiums") || {};
    const activePacks = new Set(savedMap[currentDisc.type] || []);
    const allItemPacks = game.packs.filter(p => p.documentName === "Item");

    const checkboxes = allItemPacks.map(p => `
      <label style="display:flex; align-items:center; gap:6px; font-size:0.85em; margin-bottom:4px; cursor:pointer;">
        <input type="checkbox" class="gm-pack-cb" value="${p.collection}" ${activePacks.has(p.collection) ? "checked" : ""}>
        <span>${p.metadata.label} <code style="color:#777; font-size:0.85em;">(${p.collection})</code></span>
      </label>
    `).join("");

    new Dialog({
      title: `⚙️ Source Packs for ${currentDisc.label}`,
      content: `
        <form style="max-height:360px; overflow-y:auto; padding:6px;">
          <p style="font-size:0.8em; color:#555;">Check all compendiums to search for blueprints under this discipline:</p>
          ${checkboxes}
        </form>
      `,
      buttons: {
        save: {
          label: "Save Packs",
          callback: async (dHtml) => {
            const selected = [];
            dHtml.find('.gm-pack-cb:checked').each((i, el) => selected.push(el.value));
            savedMap[currentDisc.type] = selected;
            await game.settings.set(MODULE_ID, "craftCompendiums", savedMap);
            ui.notifications.info(`Updated compendium sources for ${currentDisc.label}!`);
            this.render();
          }
        }
      },
      default: "save"
    }).render(true);
  }
}