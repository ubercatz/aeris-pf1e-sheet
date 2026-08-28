/**
 * @file gear-forge.mjs
 * Procedural 10x Gear Forge with Nested Container Export, Party Size Scaling, Full Tagging, and Persistent Settings
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS, LEVEL_LOOT_TIERS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

export class GranularForgeApp extends Application {
  constructor(options = {}) {
    super(options);
    
    // Load saved settings from World if available
    const saved = game.settings.get(MODULE_ID, "forgeSettings") || {};

    this.activeTab = saved.activeTab || "weapons"; 
    this.selectedCompendium = saved.selectedCompendium || "";
    this.compendiumItems = [];
    this.selectedBaseItem = null;
    this.generatedItemData = null;
    
    this.variances = saved.variances || {
      physical: { min: -25, max: 25 },
      durability: { min: -25, max: 25 },
      precision: { min: -25, max: 25 },
      magic: { min: -25, max: 25 }
    };
    
    this.magicLevel = saved.magicLevel || 0;
    this.selectedMaterial = saved.selectedMaterial || "base";
    this.selectedProperties = new Set(saved.selectedProperties || []);
    this.useShortCompoundNames = saved.useShortCompoundNames ?? true;
    this.searchTerm = "";
    this.ammoQuantity = saved.ammoQuantity || 20;
    this.rollLogHtml = "";

    // ─── BATCH CONFIGURATION ───
    this.batchConfig = foundry.utils.mergeObject({
      level: 5,
      partySize: 4,
      allocationMode: "quota", // "quota" | "random"
      randomTotalCount: 5,
      budgetMode: "curve",     // "curve" | "custom"
      customTotalBudget: 1550,
      customMaxItemPrice: 3000,
      magicMode: "curve",      // "curve" | "mundane" | "custom"
      customEnhLevel: 1,
      allowCursed: false,
      includeGold: true,
      selectedPacks: new Set(),
      
      quotas: {
        weapons: 2,
        armor: 1,
        ammo: 0,
        wondrous: 1,
        rings: 0,
        potions: 1,
        scrolls: 0,
        wands: 0,
        staves: 1,
        rods: 0,
        uniques: 0
      },

      categoryMaxGp: {
        weapons: 0, armor: 0, ammo: 0, wondrous: 0, rings: 0,
        potions: 0, scrolls: 0, wands: 0, staves: 0, rods: 0, uniques: 0
      },

      wondrousSlots: {
        belt: true, body: true, chest: true, eyes: true, feet: true,
        hands: true, head: true, headband: true, neck: true, shoulders: true,
        wrists: true, slotless: true
      },

      weaponGroups: {
        bladesHeavy: true, bladesLight: true, axes: true, bows: true,
        crossbows: true, spears: true, polearms: true, hammers: true,
        thrown: true, firearms: false
      },

      armorClasses: {
        light: true, medium: true, heavy: true, shields: true
      }
    }, saved.batchConfig || {});

    if (Array.isArray(this.batchConfig.selectedPacks)) {
      this.batchConfig.selectedPacks = new Set(this.batchConfig.selectedPacks);
    }

    this.batchResults = [];
    this.batchCoins = { pp: 0, gp: 0, sp: 0, cp: 0 };
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-granular-forge",
      title: "10x Procedural Gear & Enchantment Forge",
      template: "",
      width: 1080,
      height: 880,
      resizable: true,
      classes: ["aeris-gear-gen-app"]
    });
  }

  async _savePersistentSettings() {
    const toSave = {
      activeTab: this.activeTab,
      selectedCompendium: this.selectedCompendium,
      variances: this.variances,
      magicLevel: this.magicLevel,
      selectedMaterial: this.selectedMaterial,
      selectedProperties: Array.from(this.selectedProperties),
      useShortCompoundNames: this.useShortCompoundNames,
      ammoQuantity: this.ammoQuantity,
      batchConfig: {
        ...this.batchConfig,
        selectedPacks: Array.from(this.batchConfig.selectedPacks)
      }
    };
    await game.settings.set(MODULE_ID, "forgeSettings", toSave);
  }

  _filterItemForTab(item, tab) {
    const type = item.type;
    const subType = item.system?.subType || item.system?.weaponSubtype || "";
    const eqType = item.system?.equipmentType || "";
    const name = item.name.toLowerCase();

    if (tab === "ammo") {
      if (type === "ammo") return true;
      if (subType === "ammo") return true;
      if (type === "loot" && item.system?.subType === "ammo") return true;
      if (/\b(arrow|arrows|bolt|bolts|bullet|bullets|cartridge|cartridges|dart|darts|shuriken|pellets)\b/i.test(name)) return true;
      return false;
    }

    if (tab === "armor") {
      if (type === "armor" || type === "shield") return true;
      if (type === "equipment") {
        if (["armor", "shield"].includes(eqType) || ["armor", "shield"].includes(subType)) return true;
        if (item.system?.armor !== undefined || ["armor", "shield"].includes(item.system?.slot)) return true;
      }
      return false;
    }

    if (tab === "weapons") {
      if (type === "weapon") {
        if (subType === "ammo") return false;
        if (/\b(arrow|arrows|bolt|bolts|cartridge|cartridges)\b/i.test(name)) return false;
        return true;
      }
      return false;
    }

    return true;
  }

  async getData() {
    const packs = game.packs.filter(p => p.documentName === "Item");
    const packChoices = packs.reduce((acc, p) => { acc[p.collection] = p.metadata.label; return acc; }, {});
    if (!this.selectedCompendium && packs.length > 0) this.selectedCompendium = packs[0].collection;
    
    if (this.batchConfig.selectedPacks.size === 0) {
      packs.forEach(p => this.batchConfig.selectedPacks.add(p.collection));
    }

    if (this.selectedCompendium) {
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) {
        const rawIndex = await pack.getIndex({
          fields: ["system.subType", "system.weaponSubtype", "system.equipmentType", "system.armor", "system.slot", "system.spellFailure", "system.price", "system.weaponGroups", "system.baseTypes", "system.cursed"]
        });
        this.compendiumItems = rawIndex.filter(i => this._filterItemForTab(i, this.activeTab));
      }
    }

    let availableProperties = {};
    const customProps = game.settings.get(MODULE_ID, "customProperties") || {};

    if (this.activeTab === "armor") {
      availableProperties = { ...ARMOR_ENCHANTMENTS, ...customProps };
    } else {
      availableProperties = { ...WEAPON_ENCHANTMENTS, ...customProps };
    }

    const currentLevelTier = LEVEL_LOOT_TIERS[this.batchConfig.level] || LEVEL_LOOT_TIERS[1];
    const partyMultiplier = Math.max(0.25, (this.batchConfig.partySize || 4) / 4);
    const scaledGoldBudget = Math.round(currentLevelTier.goldBase * partyMultiplier);
    
    const totalSelectedQuota = this.batchConfig.allocationMode === "quota"
      ? Object.values(this.batchConfig.quotas).reduce((a, b) => a + Number(b), 0)
      : this.batchConfig.randomTotalCount;

    return {
      activeTab: this.activeTab,
      packs: packChoices,
      rawPacksList: packs,
      selectedCompendium: this.selectedCompendium,
      items: this.compendiumItems,
      selectedItem: this.selectedBaseItem,
      generated: this.generatedItemData,
      variances: this.variances,
      magicLevel: this.magicLevel,
      material: this.selectedMaterial,
      materials: SPECIAL_MATERIALS,
      properties: availableProperties,
      selectedProperties: this.selectedProperties,
      useShortNames: this.useShortCompoundNames,
      searchTerm: this.searchTerm,
      ammoQuantity: this.ammoQuantity,
      rollLogHtml: this.rollLogHtml,
      batchConfig: this.batchConfig,
      batchResults: this.batchResults,
      batchCoins: this.batchCoins,
      currentLevelTier,
      scaledGoldBudget,
      totalSelectedQuota
    };
  }

  async _renderInner(data) {
    const packOpts = Object.entries(data.packs).map(([k, v]) => `<option value="${k}" ${k === data.selectedCompendium ? "selected" : ""}>${v}</option>`).join("");
    const matOpts = Object.entries(data.materials).map(([k, v]) => `<option value="${k}" ${k === data.material ? "selected" : ""}>${v.name}</option>`).join("");
    
    const itemRows = data.items.map(i => `
      <div class="gear-row ${data.selectedItem?._id === i._id ? "selected" : ""}" data-id="${i._id}" style="display:flex;align-items:center;padding:5px;cursor:pointer;border-bottom:1px solid rgba(0,0,0,0.08);background:${data.selectedItem?._id === i._id ? "rgba(0,150,255,0.15)": "transparent"}">
        <img src="${i.img || "icons/svg/item-bag.svg"}" width="28" height="28" style="margin-right:6px;border-radius:4px;" />
        <span style="font-size:0.85em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i.name}</span>
      </div>
    `).join("");

    let filteredProps = Object.entries(data.properties);
    if (data.activeTab === "weapons" && data.selectedItem) {
      const wpn = data.selectedItem.system;
      const isRanged = wpn?.weaponSubtype === "ranged" || wpn?.properties?.thr;
      const isMelee = wpn?.weaponSubtype !== "ranged" || wpn?.properties?.thr; 
      
      filteredProps = filteredProps.filter(([k, v]) => {
        if (v.allowed === "melee" && !isMelee) return false;
        if (v.allowed === "ranged" && !isRanged) return false;
        return true;
      });
    } else if (data.activeTab === "ammo") {
      filteredProps = filteredProps.filter(([k, v]) => v.allowed !== "melee");
    }

    const propRows = filteredProps.map(([k, v]) => `
      <label style="display:flex; align-items:center; gap: 6px; font-size: 0.9em; margin-bottom: 4px; padding: 4px; cursor:pointer; border-bottom: 1px solid rgba(0,0,0,0.05); transition: background 0.1s;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='transparent'">
        <input type="checkbox" class="forge-prop-checkbox" value="${k}" ${data.selectedProperties.has(k) ? "checked" : ""}>
        <strong>${v.baseName}</strong> <span style="color:#666;">(+${v.cost})</span>
      </label>
    `).join("");

    let safeHardness = 0;
    if (data.selectedItem?.system?.hardness) {
      safeHardness = typeof data.selectedItem.system.hardness === "object" ? data.selectedItem.system.hardness.value : data.selectedItem.system.hardness;
    }
    const safeHp = data.selectedItem?.system?.hp?.base ?? data.selectedItem?.system?.hp?.max ?? data.selectedItem?.system?.hp?.value ?? 0;
    const baseWeight = data.selectedItem?.system?.weight?.value ?? 0;

    const previewHtml = data.selectedItem ? `
      <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--color-border-light-1); border-radius: 4px; padding: 6px; margin-bottom: 8px; font-size: 0.8em; line-height: 1.4;">
          <strong style="font-size: 1.1em; color: var(--color-text-dark-primary);"><i class="fas fa-cube"></i> Base Item: ${data.selectedItem.name}</strong><br/>
          ${data.selectedItem.system?.actions?.[0]?.damage ? `
              <strong>Damage:</strong> ${data.selectedItem.system.actions[0].damage.parts?.[0]?.formula || "N/A"} | 
              <strong>Crit:</strong> ${data.selectedItem.system.actions[0].ability?.critRange ?? data.selectedItem.system.actions[0].critRange ?? 20}-20/x${data.selectedItem.system.actions[0].ability?.critMult ?? data.selectedItem.system.actions[0].critMult ?? 2}<br/>
          ` : ""}
          ${data.selectedItem.system?.armor ? `
              <strong>AC:</strong> +${data.selectedItem.system.armor.value || 0} | 
              <strong>ACP:</strong> ${data.selectedItem.system.armor.acp || 0} | 
              <strong>Max Dex:</strong> ${data.selectedItem.system.armor.dex ?? "∞"} | 
              <strong>Spell Failure:</strong> ${data.selectedItem.system.armor.spellFailure ?? 0}%<br/>
          ` : ""}
          <strong>Hardness:</strong> ${safeHardness || 0} | 
          <strong>Base HP:</strong> ${safeHp} | 
          <strong>Weight:</strong> ${baseWeight} lbs
      </div>
    ` : `<div style="background: rgba(0,0,0,0.03); border: 1px dashed var(--color-border-light-2); border-radius: 4px; padding: 8px; margin-bottom: 8px; font-size: 0.8em; color: #777; text-align: center;">Select a base item to view stats.</div>`;

    const createSlider = (label, cat) => `
      <div style="margin-bottom: 6px; font-size:0.85em; background:rgba(0,0,0,0.02); padding:6px; border-radius:4px; border:1px solid var(--color-border-light-1);">
        <div style="font-weight:bold; margin-bottom:4px; border-bottom: 1px solid var(--color-border-light-2); padding-bottom: 2px;">${label}</div>
        <div style="display:flex; align-items:center; gap:6px;">
           <span style="width:25px; text-align:right; color:#555;">Min</span>
           <input type="range" class="forge-var-slider forge-var-min" data-cat="${cat}" min="-100" max="100" value="${data.variances[cat].min}" style="flex:1; height: 12px; cursor:pointer;">
           <span style="width:40px; text-align:left; font-family:monospace;" id="${cat}-min-disp">${data.variances[cat].min > 0 ? '+' : ''}${data.variances[cat].min}%</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px; margin-top:4px;">
           <span style="width:25px; text-align:right; color:#555;">Max</span>
           <input type="range" class="forge-var-slider forge-var-max" data-cat="${cat}" min="-100" max="100" value="${data.variances[cat].max}" style="flex:1; height: 12px; cursor:pointer;">
           <span style="width:40px; text-align:left; font-family:monospace;" id="${cat}-max-disp">${data.variances[cat].max > 0 ? '+' : ''}${data.variances[cat].max}%</span>
        </div>
      </div>
    `;

    const packCheckboxes = data.rawPacksList.map(p => `
      <label style="display:flex; align-items:center; gap:6px; font-size:0.8em; cursor:pointer; margin-bottom:2px;">
        <input type="checkbox" class="batch-pack-checkbox" value="${p.collection}" ${data.batchConfig.selectedPacks.has(p.collection) ? "checked" : ""}>
        <span>${p.metadata.label}</span>
      </label>
    `).join("");

    const createQuotaRow = (key, label, icon) => `
      <div style="display:flex; align-items:center; justify-content:space-between; padding:3px 0; border-bottom:1px solid rgba(0,0,0,0.04); font-size:0.85em;">
        <span style="display:flex; align-items:center; gap:4px;">${icon} ${label}</span>
        <div style="display:flex; align-items:center; gap:4px;">
          ${data.batchConfig.allocationMode === "quota" ? `
            <span style="font-size:0.75em; color:#777;">Qty:</span>
            <input type="number" class="batch-quota-val" data-cat="${key}" value="${data.batchConfig.quotas[key]}" min="0" max="50" style="width:45px; padding:2px; text-align:center;">
          ` : `
            <label style="font-size:0.75em; display:flex; align-items:center; gap:2px; cursor:pointer;">
              <input type="checkbox" class="batch-quota-enable" data-cat="${key}" ${data.batchConfig.quotas[key] > 0 ? "checked" : ""}> Include
            </label>
          `}
          <span style="font-size:0.75em; color:#777; margin-left:4px;">Max GP:</span>
          <input type="number" class="batch-cat-gp-val" data-cat="${key}" value="${data.batchConfig.categoryMaxGp[key]}" min="0" placeholder="Auto" style="width:55px; padding:2px; text-align:center;">
        </div>
      </div>
    `;

    const batchTabHtml = `
      <div style="display:flex; height:100%; gap:12px; overflow:hidden;">
        
        <!-- LEFT COLUMN: BUDGET, PARTY SIZE & QUOTAS -->
        <div style="flex:1.35; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
          
          <div style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            <div style="display:flex; gap:6px; align-items:center; margin-bottom:6px;">
              <div style="flex:1;">
                <label style="font-size:0.8em; font-weight:bold;">Level (CR)</label>
                <select id="batch-level" style="width:100%; padding:3px;">
                  ${Array.from({length: 20}, (_, i) => `<option value="${i+1}" ${data.batchConfig.level === (i+1) ? "selected" : ""}>Level ${i+1}</option>`).join("")}
                </select>
              </div>
              <div style="flex:0.8;">
                <label style="font-size:0.8em; font-weight:bold;">Party Size</label>
                <input type="number" id="batch-party-size" value="${data.batchConfig.partySize}" min="1" max="12" style="width:100%; padding:3px; text-align:center;">
              </div>
              <div style="flex:1.2;">
                <label style="font-size:0.8em; font-weight:bold;">Allocation</label>
                <select id="batch-alloc-mode" style="width:100%; padding:3px;">
                  <option value="quota" ${data.batchConfig.allocationMode === "quota" ? "selected" : ""}>Custom Quotas</option>
                  <option value="random" ${data.batchConfig.allocationMode === "random" ? "selected" : ""}>Random Pools</option>
                </select>
              </div>
            </div>

            <!-- LEVEL WEALTH PREVIEW -->
            <div style="background:#fff; border:1px solid #ced6e0; border-radius:3px; padding:6px; font-size:0.8em; line-height:1.4;">
              ${data.batchConfig.budgetMode === "curve" ? `
                <div style="display:flex; justify-content:space-between;">
                  <span><strong>Hoard Budget (${data.batchConfig.partySize} Players):</strong> ~${data.scaledGoldBudget} gp</span>
                  <span><strong>Item Cap:</strong> ${data.currentLevelTier.maxItemPrice} gp</span>
                </div>
                <div style="color:#666; font-size:0.85em; margin-top:2px;">
                  Curve Enh: +${data.currentLevelTier.maxEnh * 10} | Magic Chance: ${(data.currentLevelTier.propChance * 100).toFixed(0)}%
                </div>
              ` : `
                <div style="display:flex; gap:8px;">
                  <div style="flex:1;">
                    <label style="font-weight:bold;">Hoard GP Budget:</label>
                    <input type="number" id="batch-custom-total-gp" value="${data.batchConfig.customTotalBudget}" style="width:100%; padding:2px;">
                  </div>
                  <div style="flex:1;">
                    <label style="font-weight:bold;">Single Item GP Cap:</label>
                    <input type="number" id="batch-custom-max-item-gp" value="${data.batchConfig.customMaxItemPrice}" style="width:100%; padding:2px;">
                  </div>
                </div>
              `}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
              <label style="font-size:0.8em; font-weight:bold;">Budget Mode:</label>
              <select id="batch-budget-mode" style="padding:2px 4px; font-size:0.8em;">
                <option value="curve" ${data.batchConfig.budgetMode === "curve" ? "selected" : ""}>Match Level Curve</option>
                <option value="custom" ${data.batchConfig.budgetMode === "custom" ? "selected" : ""}>Custom Budget Override</option>
              </select>
            </div>
          </div>

          <!-- MAGIC GEAR TUNING -->
          <div style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            <div style="display:flex; gap:8px; align-items:center;">
              <div style="flex:1.2;">
                <label style="font-size:0.8em; font-weight:bold;">Magic Gear Rules</label>
                <select id="batch-magic-mode" style="width:100%; padding:3px; font-size:0.85em;">
                  <option value="curve" ${data.batchConfig.magicMode === "curve" ? "selected" : ""}>Match Level Curve</option>
                  <option value="mundane" ${data.batchConfig.magicMode === "mundane" ? "selected" : ""}>Force Mundane (No Magic)</option>
                  <option value="custom" ${data.batchConfig.magicMode === "custom" ? "selected" : ""}>Custom Enhancement Level</option>
                </select>
              </div>
              ${data.batchConfig.magicMode === "custom" ? `
                <div style="flex:0.8;">
                  <label style="font-size:0.8em; font-weight:bold;">Enh Level</label>
                  <select id="batch-custom-enh" style="width:100%; padding:3px; font-size:0.85em;">
                    <option value="1" ${data.batchConfig.customEnhLevel===1?"selected":""}>+1 (+10)</option>
                    <option value="2" ${data.batchConfig.customEnhLevel===2?"selected":""}>+2 (+20)</option>
                    <option value="3" ${data.batchConfig.customEnhLevel===3?"selected":""}>+3 (+30)</option>
                    <option value="4" ${data.batchConfig.customEnhLevel===4?"selected":""}>+4 (+40)</option>
                    <option value="5" ${data.batchConfig.customEnhLevel===5?"selected":""}>+5 (+50)</option>
                  </select>
                </div>
              ` : ""}
            </div>

            <div style="display:flex; gap:12px; margin-top:6px; font-size:0.85em;">
              <label style="display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:bold;">
                <input type="checkbox" id="batch-inc-gold" ${data.batchConfig.includeGold ? "checked" : ""}> 💰 Generate Coin Container
              </label>
              <label style="display:flex; align-items:center; gap:4px; cursor:pointer; font-weight:bold; color:#c0392b;">
                <input type="checkbox" id="batch-allow-cursed" ${data.batchConfig.allowCursed ? "checked" : ""}> 💀 Allow Cursed
              </label>
            </div>
          </div>

          <!-- COMPENDIUM SOURCE SELECTION -->
          <details style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            <summary style="font-weight:bold; font-size:0.85em; cursor:pointer;">📚 Source Compendiums (${data.batchConfig.selectedPacks.size} Active)</summary>
            <div style="max-height:100px; overflow-y:auto; margin-top:6px; padding:4px; background:#fff; border:1px solid #ced6e0; border-radius:3px;">
              ${packCheckboxes}
            </div>
          </details>

          <!-- CATEGORY ALLOCATION OR QUOTA -->
          ${data.batchConfig.allocationMode === "random" ? `
            <div style="display:flex; align-items:center; gap:8px; background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
              <label style="font-size:0.85em; font-weight:bold; flex:1;">Total Random Items to Generate:</label>
              <input type="number" id="batch-random-count" value="${data.batchConfig.randomTotalCount}" min="1" max="50" style="width:60px; text-align:center; padding:3px;">
            </div>
          ` : ""}

          <strong style="font-size:0.9em; margin-top:2px;">Item Pool Selection & Caps</strong>
          <div style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            ${createQuotaRow("weapons", "Weapons", "⚔️")}
            ${createQuotaRow("armor", "Armor & Shields", "🛡️")}
            ${createQuotaRow("ammo", "Ammunition Bundles", "🏹")}
            ${createQuotaRow("wondrous", "Wondrous Items", "✨")}
            ${createQuotaRow("rings", "Magic Rings", "💍")}
            ${createQuotaRow("potions", "Potions & Oils", "🧪")}
            ${createQuotaRow("scrolls", "Scrolls", "📜")}
            ${createQuotaRow("wands", "Wands", "🪄")}
            ${createQuotaRow("staves", "Staves", "🦯")}
            ${createQuotaRow("rods", "Rods", "🔮")}
            ${createQuotaRow("uniques", "Specific Magic Uniques", "🌟")}
          </div>

          <!-- WONDROUS SLOTS SUB-FILTER -->
          <details style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            <summary style="font-weight:bold; font-size:0.8em; cursor:pointer;">✨ Wondrous Item Slot Sub-Filters</summary>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:4px; margin-top:4px; font-size:0.75em;">
              ${Object.keys(data.batchConfig.wondrousSlots).map(slot => `
                <label><input type="checkbox" class="batch-wondrous-slot-cb" data-slot="${slot}" ${data.batchConfig.wondrousSlots[slot] ? "checked" : ""}> ${slot.toUpperCase()}</label>
              `).join("")}
            </div>
          </details>

          <!-- WEAPON FIGHTER GROUPS SUB-FILTER -->
          <details style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            <summary style="font-weight:bold; font-size:0.8em; cursor:pointer;">⚔️ Weapon Fighter Group Sub-Filters</summary>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:4px; margin-top:4px; font-size:0.75em;">
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="bladesHeavy" ${data.batchConfig.weaponGroups.bladesHeavy ? "checked" : ""}> Heavy Blades</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="bladesLight" ${data.batchConfig.weaponGroups.bladesLight ? "checked" : ""}> Light Blades</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="axes" ${data.batchConfig.weaponGroups.axes ? "checked" : ""}> Axes</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="bows" ${data.batchConfig.weaponGroups.bows ? "checked" : ""}> Bows</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="crossbows" ${data.batchConfig.weaponGroups.crossbows ? "checked" : ""}> Crossbows</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="spears" ${data.batchConfig.weaponGroups.spears ? "checked" : ""}> Spears</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="polearms" ${data.batchConfig.weaponGroups.polearms ? "checked" : ""}> Polearms</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="hammers" ${data.batchConfig.weaponGroups.hammers ? "checked" : ""}> Hammers & Flails</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="thrown" ${data.batchConfig.weaponGroups.thrown ? "checked" : ""}> Thrown</label>
              <label><input type="checkbox" class="batch-wpn-group-cb" data-group="firearms" ${data.batchConfig.weaponGroups.firearms ? "checked" : ""}> Firearms</label>
            </div>
          </details>

          <button type="button" id="forge-batch-btn" style="margin-top:auto; padding:10px; font-weight:bold; background:#2f3542; color:#fff; border-radius:4px; cursor:pointer; border:1px solid #1e272e;">
            🎲 Generate Calibrated Loot Hoard (${data.totalSelectedQuota} Items)
          </button>
        </div>

        <!-- RIGHT COLUMN: GENERATED HOARD OUTPUT -->
        <div style="flex:1.25; display:flex; flex-direction:column; gap:6px; overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--color-border-light-2); padding-bottom:3px;">
            <strong style="font-size:1.0em;">Generated Hoard Output (${data.batchResults.length} Items)</strong>
            ${data.batchResults.length > 0 ? `
              <button type="button" id="batch-export-actor-btn" style="padding:4px 10px; font-size:0.8em; font-weight:bold; background:#27ae60; color:#fff; border:1px solid #219653; border-radius:3px; cursor:pointer;">
                📥 Export to Actor (Nested)
              </button>
            ` : ""}
          </div>

          <div style="flex-grow:1; border:2px dashed var(--color-border-dark); border-radius:6px; padding:6px; overflow-y:auto; background:rgba(0,0,0,0.01);">
            ${data.batchResults.length > 0 ? data.batchResults.map((item, idx) => `
              <div style="display:flex; align-items:center; gap:8px; padding:5px 8px; margin-bottom:4px; background:#fff; border:1px solid #ced6e0; border-radius:4px;">
                <img src="${item.img}" width="30" height="30" style="border-radius:3px;" />
                <div style="flex:1; overflow:hidden;">
                  <strong style="font-size:0.85em; display:block; text-overflow:ellipsis; white-space:nowrap; overflow:hidden;">${item.name}</strong>
                  <span style="font-size:0.75em; color:#555;">${item.type === "container" ? "Coin Container" : item.system?.armor ? `AC +${item.system.armor.value}` : item.system?.actions?.[0]?.damage?.parts?.[0]?.formula || (item.system?.slot ? `Slot: ${item.system.slot}` : "Equipment")} | Qty: ${item.system?.quantity ?? 1} | ${item.system?.price || 0} gp</span>
                </div>
                <div class="forge-drag-card" draggable="true" data-batch-idx="${idx}" style="padding:3px 8px; background:#dfe4ea; border:1px solid #747d8c; border-radius:3px; cursor:grab; font-size:0.75em; font-weight:bold;">📦 Drag</div>
              </div>
            `).join("") : '<p style="text-align:center; color:#777; padding:20px; font-size:0.85em;">Set category allocations above and click Generate to produce an authentic encounter treasure hoard.</p>'}
          </div>
        </div>
      </div>
    `;

    const standardTabHtml = `
      <div style="display:flex; flex:1; gap:10px; overflow:hidden;">
        
        <!-- COLUMN 1: DIRECTORY -->
        <div style="flex:1; display:flex; flex-direction:column; border-right:1px solid var(--color-border-light-2); padding-right:6px;">
          <label style="font-weight:bold; font-size:0.8em; margin-bottom:2px;">Compendium Pack</label>
          <select id="forge-pack-select" style="margin-bottom:6px; font-size:0.85em; padding:3px;">${packOpts}</select>
          <input type="text" id="forge-item-search" value="${data.searchTerm}" placeholder="🔍 Search ${data.activeTab}..." style="margin-bottom:6px; font-size:0.85em; padding:4px; border:1px solid var(--color-border-light-1); border-radius:3px;">
          <div style="flex-grow:1; overflow-y:auto; border:1px solid var(--color-border-light-1); border-radius:4px; max-height:560px;">${itemRows || `<p style="padding:8px; color:#777;">No ${data.activeTab} found in pack.</p>`}</div>
        </div>

        <!-- COLUMN 2: FORGE CONTROLS -->
        <div style="flex:1.2; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:6px; height:100%; overflow-y:auto;">
          
          ${previewHtml}
          
          <details style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            <summary style="font-weight:bold; font-size:0.9em; cursor:pointer; outline:none; user-select:none;">🎯 Targeted Variances (Min to Max)</summary>
            <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px;">
              ${createSlider("Physical (Craft, AC, Weight, Damage)", "physical")}
              ${createSlider("Durability (HP, Hardness)", "durability")}
              ${createSlider("Precision (Crit Range, Mult)", "precision")}
              ${createSlider("Magic (Enhancement, Properties, ASF)", "magic")}
            </div>
          </details>

          <div style="display:flex; gap:6px;">
            <div style="flex:1;">
              <label style="font-size:0.8em; font-weight:bold;">Enhancement</label>
              <select id="forge-enh-level" style="width:100%; padding:3px; font-size:0.85em;">
                <option value="0" ${data.magicLevel===0?"selected":""}>Mundane (+0)</option>
                <option value="1" ${data.magicLevel===1?"selected":""}>+1 (+10 Scaled)</option>
                <option value="2" ${data.magicLevel===2?"selected":""}>+2 (+20 Scaled)</option>
                <option value="3" ${data.magicLevel===3?"selected":""}>+3 (+30 Scaled)</option>
                <option value="4" ${data.magicLevel===4?"selected":""}>+4 (+40 Scaled)</option>
                <option value="5" ${data.magicLevel===5?"selected":""}>+5 (+50 Scaled)</option>
              </select>
            </div>
            <div style="flex:1;">
              <label style="font-size:0.8em; font-weight:bold;">Special Material</label>
              <select id="forge-material" style="width:100%; padding:3px; font-size:0.85em;">${matOpts}</select>
            </div>
          </div>

          ${data.activeTab === "ammo" ? `
            <div style="display:flex; align-items:center; gap:8px;">
              <label style="font-size:0.8em; font-weight:bold;">Bundle Quantity:</label>
              <input type="number" id="forge-ammo-qty" value="${data.ammoQuantity}" min="1" max="1000" style="width:70px; padding:3px; font-size:0.85em; text-align:center;">
            </div>
          ` : ""}

          <div style="display:flex; justify-content:space-between; align-items:flex-end;">
             <strong style="font-size:0.9em; border-bottom:1px solid var(--color-border-light-2); padding-bottom:2px; flex-grow:1;">✨ Magic Properties</strong>
             <div style="display:flex; gap:4px; margin-left:8px;">
               <button type="button" id="forge-random-prop" style="font-size:0.75em; padding:2px 6px; line-height:1;">🎲 Random</button>
               <button type="button" id="forge-new-custom-prop" style="font-size:0.75em; padding:2px 6px; line-height:1;">➕ New</button>
             </div>
          </div>
          
          <div style="flex-grow:1; min-height:140px; overflow-y:auto; border:1px solid var(--color-border-light-1); padding:4px; border-radius:4px; background:rgba(0,0,0,0.02); box-shadow:inset 0 1px 3px rgba(0,0,0,0.05);">
             ${propRows || `<span style="color:#777; font-size:0.8em; padding:8px; display:block;">No properties available for this category.</span>`}
          </div>

          <label style="display:flex; align-items:center; gap:6px; font-size:0.85em; margin-top:2px; cursor:pointer;">
            <input type="checkbox" id="forge-short-names" ${data.useShortNames ? "checked" : ""}>
            <span>Use Compound Short Names (e.g. <em>Mastercraft Sunstrike</em>)</span>
          </label>

          <button id="forge-gen-btn" style="padding:10px; font-weight:bold; background:#2f3542; color:#fff; border-radius:4px; cursor:pointer; border:1px solid #1e272e; margin-bottom:4px;">
            ⚡ Forge Procedural ${data.activeTab === "weapons" ? "Weapon" : data.activeTab === "armor" ? "Armor / Shield" : "Ammunition Stack"}
          </button>
        </div>

        <!-- COLUMN 3: INSPECTION WINDOW -->
        <div style="flex:1.1; display:flex; flex-direction:column; gap:6px;">
          <strong style="font-size:0.9em; border-bottom:1px solid var(--color-border-light-2); padding-bottom:2px;">Inspection Window</strong>
          <div style="flex-grow:1; border:2px dashed var(--color-border-dark); border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:8px; text-align:center; overflow-y:auto;">
            ${data.generated ? `
              <img src="${data.generated.img}" width="42" height="42" style="border-radius:4px; margin-bottom:4px;" />
              <strong style="font-size:0.9em;">${data.generated.name}</strong>
              <div style="font-size:0.75em; text-align:left; width:100%; margin-top:4px; background:rgba(0,0,0,0.03); padding:6px; border-radius:4px; line-height:1.3;">
                ${data.generated.system?.armor ? `
                  <div><strong>Armor AC:</strong> +${data.generated.system.armor.value} | <strong>ACP:</strong> ${data.generated.system.armor.acp}</div>
                  <div><strong>Max Dex:</strong> +${data.generated.system.armor.dex ?? "∞"} | <strong>Spell Failure:</strong> ${data.generated.system.armor.spellFailure ?? 0}%</div>
                ` : `
                  <div><strong>Damage:</strong> ${data.generated.system?.actions?.[0]?.damage?.parts?.map(p => p.formula).join(" + ") || "N/A"}</div>
                  <div><strong>Crit Threat:</strong> ${data.generated.system?.actions?.[0]?.critRange}+ (×${data.generated.system?.actions?.[0]?.critMult})</div>
                `}
                <div><strong>Hardness:</strong> ${data.generated.system.hardness} | <strong>HP:</strong> ${data.generated.system.hp?.max}</div>
                <div><strong>Weight:</strong> ${data.generated.system.weight?.value ?? 0} lbs | <strong>Quantity:</strong> ${data.generated.system.quantity ?? 1}</div>
                <div><strong>Enhancement:</strong> +${data.generated.system.enh || 0}</div>
              </div>
              
              <div style="font-size:0.7em; text-align:left; width:100%; margin-top:6px; background:#f1f2f6; padding:6px; border-radius:4px; border:1px solid #ced6e0;">
                <strong style="border-bottom:1px solid #ced6e0; display:block; padding-bottom:2px; margin-bottom:4px;">Roll Variance Log</strong>
                ${data.rollLogHtml}
              </div>

              <div class="forge-drag-card" draggable="true" style="margin-top:8px; padding:4px 10px; background:#dfe4ea; border:1px solid #747d8c; border-radius:4px; cursor:grab; font-weight:bold; font-size:0.8em;">📦 Drag to Sheet</div>
            ` : '<span style="color:#777; font-size:0.8em;">Select base item and configure parameters to forge.</span>'}
          </div>
        </div>

      </div>
    `;

    const html = `
      <div style="display:flex; flex-direction:column; height:100%; gap:8px; padding:6px; font-family:var(--font-primary);">
        <nav class="forge-category-tabs" style="display:flex; gap:8px; border-bottom:2px solid var(--color-border-light-2); padding-bottom:6px;">
          <button type="button" class="forge-tab-nav ${data.activeTab === "weapons" ? "active" : ""}" data-tab="weapons" style="flex:1; padding:6px 10px; font-weight:bold; cursor:pointer; background:${data.activeTab === "weapons" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "weapons" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ⚔️ Weapons
          </button>
          <button type="button" class="forge-tab-nav ${data.activeTab === "armor" ? "active" : ""}" data-tab="armor" style="flex:1; padding:6px 10px; font-weight:bold; cursor:pointer; background:${data.activeTab === "armor" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "armor" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            🛡️ Armor & Shields
          </button>
          <button type="button" class="forge-tab-nav ${data.activeTab === "ammo" ? "active" : ""}" data-tab="ammo" style="flex:1; padding:6px 10px; font-weight:bold; cursor:pointer; background:${data.activeTab === "ammo" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "ammo" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            🏹 Ammunition
          </button>
          <button type="button" class="forge-tab-nav ${data.activeTab === "batch" ? "active" : ""}" data-tab="batch" style="flex:1; padding:6px 10px; font-weight:bold; cursor:pointer; background:${data.activeTab === "batch" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "batch" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            📦 Batch Loot Hoard
          </button>
        </nav>

        ${data.activeTab === "batch" ? batchTabHtml : standardTabHtml}
      </div>
    `;
    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    html.find('.forge-tab-nav').click(async e => {
      const targetTab = $(e.currentTarget).data('tab');
      if (this.activeTab !== targetTab) {
        this.activeTab = targetTab;
        this.selectedBaseItem = null;
        this.selectedProperties.clear();
        await this._savePersistentSettings();
        this.render();
      }
    });

    html.find('.forge-var-slider').on('input', async e => {
      const cat = e.target.dataset.cat;
      const isMin = e.target.classList.contains("forge-var-min");
      let val = parseInt(e.target.value);
      
      if (isMin) {
        if (val > this.variances[cat].max) { val = this.variances[cat].max; e.target.value = val; }
        this.variances[cat].min = val;
        html.find(`#${cat}-min-disp`).text(`${val > 0 ? '+' : ''}${val}%`);
      } else {
        if (val < this.variances[cat].min) { val = this.variances[cat].min; e.target.value = val; }
        this.variances[cat].max = val;
        html.find(`#${cat}-max-disp`).text(`${val > 0 ? '+' : ''}${val}%`);
      }
      await this._savePersistentSettings();
    });

    html.find('#forge-item-search').on('input', e => {
      this.searchTerm = e.target.value.toLowerCase();
      html.find('.gear-row').each((i, el) => {
        $(el).toggle($(el).text().toLowerCase().includes(this.searchTerm));
      });
    });
    
    if (this.searchTerm) html.find('.gear-row').each((i, el) => $(el).toggle($(el).text().toLowerCase().includes(this.searchTerm)));

    html.find('#forge-pack-select').change(async e => {
      this.selectedCompendium = e.target.value;
      this.selectedBaseItem = null;
      this.selectedProperties.clear();
      await this._savePersistentSettings();
      this.render();
    });
    
    html.find('.gear-row').click(async e => {
      const id = $(e.currentTarget).data('id');
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) { this.selectedBaseItem = await pack.getDocument(id); this.selectedProperties.clear(); this.render(); }
    });

    html.find('.forge-prop-checkbox').change(async e => {
      if (e.target.checked) this.selectedProperties.add(e.target.value);
      else this.selectedProperties.delete(e.target.value);
      await this._savePersistentSettings();
    });

    // ─── BATCH CONFIG LISTENERS (WITH AUTO-SAVE) ───
    html.find('.batch-pack-checkbox').change(async e => {
      const packId = e.target.value;
      if (e.target.checked) this.batchConfig.selectedPacks.add(packId);
      else this.batchConfig.selectedPacks.delete(packId);
      await this._savePersistentSettings();
    });

    html.find('#batch-budget-mode').change(async e => {
      this.batchConfig.budgetMode = e.target.value;
      await this._savePersistentSettings();
      this.render();
    });

    html.find('#batch-alloc-mode').change(async e => {
      this.batchConfig.allocationMode = e.target.value;
      await this._savePersistentSettings();
      this.render();
    });

    html.find('#batch-party-size').change(async e => {
      this.batchConfig.partySize = Math.max(1, parseInt(e.target.value, 10) || 4);
      await this._savePersistentSettings();
      this.render();
    });

    html.find('#batch-random-count').change(async e => {
      this.batchConfig.randomTotalCount = Math.max(1, parseInt(e.target.value, 10) || 5);
      await this._savePersistentSettings();
      this.render();
    });

    html.find('#batch-magic-mode').change(async e => {
      this.batchConfig.magicMode = e.target.value;
      await this._savePersistentSettings();
      this.render();
    });

    html.find('#batch-level').change(async e => {
      this.batchConfig.level = parseInt(e.target.value, 10);
      await this._savePersistentSettings();
      this.render();
    });

    html.find('.batch-quota-val').change(async e => {
      const cat = e.target.dataset.cat;
      this.batchConfig.quotas[cat] = Math.max(0, parseInt(e.target.value, 10) || 0);
      await this._savePersistentSettings();
      this.render();
    });

    html.find('.batch-quota-enable').change(async e => {
      const cat = e.target.dataset.cat;
      this.batchConfig.quotas[cat] = e.target.checked ? 1 : 0;
      await this._savePersistentSettings();
    });

    html.find('.batch-cat-gp-val').change(async e => {
      const cat = e.target.dataset.cat;
      this.batchConfig.categoryMaxGp[cat] = Math.max(0, parseInt(e.target.value, 10) || 0);
      await this._savePersistentSettings();
    });

    html.find('.batch-wondrous-slot-cb').change(async e => {
      const slot = e.target.dataset.slot;
      this.batchConfig.wondrousSlots[slot] = e.target.checked;
      await this._savePersistentSettings();
    });

    html.find('.batch-wpn-group-cb').change(async e => {
      const group = e.target.dataset.group;
      this.batchConfig.weaponGroups[group] = e.target.checked;
      await this._savePersistentSettings();
    });

    // ─── BATCH EXPORT DIRECTLY TO ACTOR (NESTED INSIDE CHEST) ───
    html.find('#batch-export-actor-btn').click(async () => {
      if (this.batchResults.length === 0) return ui.notifications.warn("No hoard generated yet!");
      
      const actors = game.actors.contents.filter(a => a.isOwner);
      if (actors.length === 0) return ui.notifications.error("No valid destination actor found.");

      const options = actors.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
      
      new Dialog({
        title: "Deposit Hoard into Actor",
        content: `
          <form>
            <div class="form-group">
              <label>Target Actor / Sheet</label>
              <select id="export-actor-id">${options}</select>
            </div>
          </form>
        `,
        buttons: {
          export: {
            label: "Deposit All (Packed in Chest)",
            callback: async (dHtml) => {
              const actorId = dHtml.find('#export-actor-id').val();
              const targetActor = game.actors.get(actorId);
              if (!targetActor) return;

              const containerData = this.batchResults.find(i => i.type === "container");
              const nonContainerItems = this.batchResults.filter(i => i.type !== "container");

              if (containerData) {
                // 1. Create Chest on Actor[cite: 5]
                const [createdChest] = await targetActor.createEmbeddedDocuments("Item", [containerData]);
                
                // 2. Nest all generated loot inside the Chest container[cite: 5]
                if (createdChest && nonContainerItems.length > 0) {
                  if (typeof createdChest.createContainerContent === "function") {
                    await createdChest.createContainerContent(nonContainerItems); //[cite: 5]
                  } else {
                    const packed = nonContainerItems.map(it => {
                      it.system = it.system || {};
                      it.system.containerId = createdChest.id;
                      return it;
                    });
                    await targetActor.createEmbeddedDocuments("Item", packed);
                  }
                }
              } else {
                await targetActor.createEmbeddedDocuments("Item", this.batchResults);
              }

              ui.notifications.info(`Successfully deposited treasure chest with ${nonContainerItems.length} items into ${targetActor.name}!`);
            }
          }
        },
        default: "export"
      }).render(true);
    });

    // ─── BATCH LOOT GENERATOR EXECUTION ───
    html.find('#forge-batch-btn').click(async () => {
      this.batchConfig.level = parseInt(html.find('#batch-level').val(), 10) || 1;
      this.batchConfig.partySize = Math.max(1, parseInt(html.find('#batch-party-size').val(), 10) || 4);
      this.batchConfig.budgetMode = html.find('#batch-budget-mode').val();
      this.batchConfig.magicMode = html.find('#batch-magic-mode').val();
      this.batchConfig.includeGold = html.find('#batch-inc-gold').is(':checked');
      this.batchConfig.allowCursed = html.find('#batch-allow-cursed').is(':checked');

      if (this.batchConfig.budgetMode === "custom") {
        this.batchConfig.customTotalBudget = parseInt(html.find('#batch-custom-total-gp').val(), 10) || 1500;
        this.batchConfig.customMaxItemPrice = parseInt(html.find('#batch-custom-max-item-gp').val(), 10) || 3000;
      }
      if (this.batchConfig.magicMode === "custom") {
        this.batchConfig.customEnhLevel = parseInt(html.find('#batch-custom-enh').val(), 10) || 1;
      }

      await this._savePersistentSettings();

      const tierConfig = LEVEL_LOOT_TIERS[this.batchConfig.level] || LEVEL_LOOT_TIERS[1];
      const partyFactor = this.batchConfig.partySize / 4;
      const globalMaxPrice = this.batchConfig.budgetMode === "custom" ? this.batchConfig.customMaxItemPrice : tierConfig.maxItemPrice;
      const totalHoardBudget = this.batchConfig.budgetMode === "custom" ? this.batchConfig.customTotalBudget : Math.round(tierConfig.goldBase * partyFactor);

      this.batchResults = [];
      this.batchCoins = { pp: 0, gp: 0, sp: 0, cp: 0 };
      ui.notifications.info(`Generating Calibrated Hoard (CR ${this.batchConfig.level}, ${this.batchConfig.partySize} Players)...`);

      // 1. Generate Currency Container (Authentic Chest Asset)
      if (this.batchConfig.includeGold) {
        const goldVariance = 0.85 + Math.random() * 0.3; 
        const totalGold = Math.round((totalHoardBudget * 0.5) * goldVariance);
        
        const pp = Math.floor((totalGold * 0.1) / 10);
        const gp = Math.floor(totalGold * 0.7);
        const sp = Math.floor((totalGold * 0.15) * 10);
        const cp = Math.floor((totalGold * 0.05) * 100);

        this.batchCoins = { pp, gp, sp, cp };

        const coinContainer = {
          name: `Hoard Treasure Chest (CR ${this.batchConfig.level})`,
          type: "container",
          img: "icons/containers/chest/chest-worn-oak-tan.webp",
          system: {
            description: { value: `<p><strong>Encounter Treasure Chest (CR ${this.batchConfig.level}):</strong> Calibrated for a party of ${this.batchConfig.partySize}.</p>` },
            quantity: 1,
            currency: { pp, gp, sp, cp }, //[cite: 5]
            weight: { value: Math.max(1, Math.round((pp + gp + sp + cp) / 50)) }
          },
          flags: { [MODULE_ID]: { is10xScaled: true, disable10xSheet: true, disable10xCard: true } } //[cite: 2]
        };
        this.batchResults.push(coinContainer);
      }

      // 2. Query Selected Active Compendiums
      const activePacks = game.packs.filter(p => this.batchConfig.selectedPacks.has(p.collection));
      if (activePacks.length === 0) return ui.notifications.warn("Please select at least one source compendium pack!");

      let fullIndexedPool = [];
      for (const pack of activePacks) {
        const index = await pack.getIndex({
          fields: ["system.subType", "system.weaponSubtype", "system.equipmentType", "system.armor", "system.slot", "system.price", "system.weaponGroups", "system.baseTypes", "system.cursed"]
        });
        index.forEach(item => {
          item._packCollection = pack.collection;
          fullIndexedPool.push(item);
        });
      }

      if (!this.batchConfig.allowCursed) {
        fullIndexedPool = fullIndexedPool.filter(i => {
          if (i.system?.cursed === true) return false;
          if (i.name.toLowerCase().includes("cursed")) return false;
          return true;
        });
      }

      // 3. Category Matcher Function
      const matchItemCategory = (item, catKey) => {
        const type = item.type;
        const subType = (item.system?.subType || item.system?.weaponSubtype || "").toLowerCase();
        const eqType = (item.system?.equipmentType || "").toLowerCase();
        const slot = (item.system?.slot || "").toLowerCase();
        const wpnGroup = item.system?.weaponGroups || [];
        const baseTypes = item.system?.baseTypes || [];

        const isUnique = baseTypes.length > 0 && !baseTypes.includes(item.name);
        if (catKey === "uniques") return isUnique && (type === "weapon" || type === "armor" || type === "equipment");
        if (isUnique) return false; 

        if (catKey === "weapons") {
          if (type !== "weapon" || subType === "ammo") return false;
          const g = this.batchConfig.weaponGroups;
          if (g.bladesHeavy && (wpnGroup.includes("bladesHeavy") || /\b(greatsword|bastard sword|longsword|scimitar|falchion)\b/i.test(item.name))) return true;
          if (g.bladesLight && (wpnGroup.includes("bladesLight") || /\b(dagger|shortsword|kukri|rapier)\b/i.test(item.name))) return true;
          if (g.axes && (wpnGroup.includes("axes") || /\b(axe|greataxe|handaxe|battleaxe|hatchet)\b/i.test(item.name))) return true;
          if (g.bows && (wpnGroup.includes("bows") || /\b(shortbow|longbow|composite)\b/i.test(item.name))) return true;
          if (g.crossbows && (wpnGroup.includes("crossbows") || /\b(crossbow|arbalest)\b/i.test(item.name))) return true;
          if (g.spears && (wpnGroup.includes("spears") || /\b(spear|lance|trident|javelin)\b/i.test(item.name))) return true;
          if (g.polearms && (wpnGroup.includes("polearms") || /\b(halberd|glaive|guisarme|ranseur)\b/i.test(item.name))) return true;
          if (g.hammers && (wpnGroup.includes("hammers") || wpnGroup.includes("flails") || /\b(hammer|warhammer|mace|flail|club)\b/i.test(item.name))) return true;
          if (g.thrown && (wpnGroup.includes("thrown") || item.system?.properties?.thr)) return true;
          if (g.firearms && (wpnGroup.includes("firearms") || /\b(pistol|musket|rifle|culverin)\b/i.test(item.name))) return true;
          return true;
        }

        if (catKey === "armor") {
          if (type !== "armor" && type !== "shield" && !["armor", "shield"].includes(eqType) && !["armor", "shield"].includes(subType)) return false;
          const a = this.batchConfig.armorClasses;
          if (a.light && subType === "light") return true;
          if (a.medium && subType === "medium") return true;
          if (a.heavy && subType === "heavy") return true;
          if (a.shields && (type === "shield" || subType === "shield" || slot === "shield")) return true;
          return true;
        }

        if (catKey === "ammo") return type === "ammo" || subType === "ammo";
        if (catKey === "rings") return subType === "ring" || slot === "ring" || /\bring\b/i.test(item.name);
        if (catKey === "potions") return subType === "potion" || /\b(potion|elixir|oil)\b/i.test(item.name);
        if (catKey === "scrolls") return subType === "scroll" || /\bscroll\b/i.test(item.name);
        if (catKey === "wands") return subType === "wand" || /\bwand\b/i.test(item.name);
        if (catKey === "staves") return subType === "staff" || /\bstaff\b/i.test(item.name);
        if (catKey === "rods") return subType === "rod" || /\brod\b/i.test(item.name);

        if (catKey === "wondrous") {
          const isExplicitWondrous = subType === "wondrous" || eqType === "wondrous" || ["head", "headband", "eyes", "shoulders", "neck", "chest", "body", "belt", "wrists", "hands", "feet", "slotless"].includes(slot);
          if (!isExplicitWondrous) return false;
          
          const s = this.batchConfig.wondrousSlots;
          const activeSlot = slot || "slotless";
          return s[activeSlot] === true;
        }

        return false;
      };

      // 4. Build List of Items to Roll based on Mode
      let itemsToRoll = [];
      if (this.batchConfig.allocationMode === "quota") {
        for (const [catKey, count] of Object.entries(this.batchConfig.quotas)) {
          for (let c = 0; c < count; c++) itemsToRoll.push(catKey);
        }
      } else {
        const eligibleCats = Object.keys(this.batchConfig.quotas).filter(k => this.batchConfig.quotas[k] > 0);
        const poolCats = eligibleCats.length > 0 ? eligibleCats : ["weapons", "armor", "wondrous", "potions"];
        for (let c = 0; c < this.batchConfig.randomTotalCount; c++) {
          itemsToRoll.push(poolCats[Math.floor(Math.random() * poolCats.length)]);
        }
      }

      // 5. Process and Roll Each Item
      for (const catKey of itemsToRoll) {
        const catPriceCap = this.batchConfig.categoryMaxGp[catKey] > 0 ? this.batchConfig.categoryMaxGp[catKey] : globalMaxPrice;

        const categoryPool = fullIndexedPool.filter(item => {
          if (!matchItemCategory(item, catKey)) return false;
          const price = item.system?.price || 0;
          return price <= catPriceCap;
        });

        if (categoryPool.length === 0) continue;

        const pickedIndexItem = categoryPool[Math.floor(Math.random() * categoryPool.length)];
        const pack = game.packs.get(pickedIndexItem._packCollection);
        if (!pack) continue;

        const baseDoc = await pack.getDocument(pickedIndexItem._id);
        if (!baseDoc) continue;

        const newItemData = baseDoc.toObject();
        const isProceduralWeapon = catKey === "weapons";
        const isProceduralArmor = catKey === "armor";
        const isAmmo = catKey === "ammo";
        const isPristineItem = !isProceduralWeapon && !isProceduralArmor && !isAmmo;

        // ─── STRICT WONDROUS & CONSUMABLE ISOLATION ───
        if (isPristineItem) {
          newItemData.flags = newItemData.flags || {};
          newItemData.flags[MODULE_ID] = { is10xScaled: true, disable10xSheet: true, disable10xCard: true }; //[cite: 2]
          this.batchResults.push(newItemData);
          continue;
        }

        // ─── PROCEDURAL WEAPON & ARMOR ENGINE (WITH FULL TAGGING) ───
        const tagsList = [];
        const identifiedTraits = [];

        let enhLevel = 0;
        if (this.batchConfig.magicMode === "mundane") enhLevel = 0;
        else if (this.batchConfig.magicMode === "custom") enhLevel = this.batchConfig.customEnhLevel;
        else {
          if (Math.random() < tierConfig.propChance) enhLevel = Math.max(1, Math.floor(Math.random() * (tierConfig.maxEnh + 1)));
        }

        let chosenMat = "base";
        if (Math.random() < tierConfig.matChance) {
          const mats = isProceduralArmor ? ["mithral", "adamantine", "darkwood", "dragonhide"] : ["adamantine", "coldiron", "silversheen", "mithral"];
          chosenMat = mats[Math.floor(Math.random() * mats.length)];
        }
        const mat = SPECIAL_MATERIALS[chosenMat];

        const propPool = isProceduralArmor ? ARMOR_ENCHANTMENTS : WEAPON_ENCHANTMENTS;
        const pickedProps = new Set();
        if (enhLevel > 0 && Math.random() < tierConfig.propChance) {
          const keys = Object.keys(propPool);
          pickedProps.add(keys[Math.floor(Math.random() * keys.length)]);
        }

        newItemData.flags = newItemData.flags || {};
        newItemData.flags[MODULE_ID] = newItemData.flags[MODULE_ID] || {};
        newItemData.flags[MODULE_ID].disable10xCard = true; //[cite: 2]
        newItemData.flags[MODULE_ID].disable10xSheet = true; 
        newItemData.flags[MODULE_ID].is10xScaled = true; 
        if (enhLevel > 0 || pickedProps.size > 0 || mat.name !== "Base") newItemData.system.masterwork = true;
        if (isAmmo) newItemData.system.quantity = 20 + (Math.floor(Math.random() * 4) * 10);

        // Continuous Roller with Tag Injection[cite: 3]
        const rollStat = (label, category) => {
          const min = this.variances[category].min / 100;
          const max = this.variances[category].max / 100;
          const rollMult = 1.0 + (min + Math.random() * (max - min));
          const varianceRatio = (rollMult - 1.0) / 0.25; 
          let tier = Math.ceil(varianceRatio * 4);
          if (tier === 0) tier = varianceRatio >= 0 ? 1 : -1;
          tier = Math.max(-4, Math.min(4, tier));
          const tierSign = tier > 0 ? `+${tier}` : `${tier}`;
          if (label) tagsList.push(`${label}: Tier ${tierSign}`); //[cite: 3]
          return { mult: rollMult, tier };
        };

        const tierPrefixes = { "-4": "Ruined", "-3": "Flawed", "-2": "Worn", "-1": "Serviceable", "1": "Tempered", "2": "Honed", "3": "Superior", "4": "Mastercraft" };
        const craftRoll = rollStat("Craft Quality", "physical"); //[cite: 3]
        const prefix = tierPrefixes[craftRoll.tier];
        identifiedTraits.push(`<strong>Craftsmanship (${prefix}):</strong> Forged to ${prefix.toLowerCase()} standards.`);

        // Weight
        const weightRoll = rollStat("Weight", "physical");
        const rawWeight = newItemData.system?.weight?.value ?? 0;
        const weightFactor = Math.max(0.1, 2.0 - weightRoll.mult);
        let calculatedWeight = Math.round((rawWeight * (mat.weightMult || 1.0) * weightFactor) * 100) / 100;
        if (newItemData.system?.weight) newItemData.system.weight.value = rawWeight === 0 ? 0 : calculatedWeight;

        // Hardness & HP
        const hardRoll = rollStat("Hardness", "durability"); //[cite: 3]
        const hpRoll = rollStat("Hit Points", "durability"); //[cite: 3]
        let bHard = (typeof newItemData.system.hardness === "object" ? newItemData.system.hardness.value : newItemData.system.hardness) || 0;
        let bHp = (newItemData.system.hp?.base ?? newItemData.system.hp?.max ?? 0);
        newItemData.system.hardness = Math.max(0, Math.round((bHard * 10 + mat.hardnessMod) * hardRoll.mult));
        const fHp = Math.max(1, Math.round((bHp * 10 * mat.hpMult) * hpRoll.mult));
        newItemData.system.hp = { base: fHp, max: fHp, value: fHp };

        if (mat.name !== "Base" && mat.name !== "Steel") {
          identifiedTraits.push(`<strong>Material (${mat.name}):</strong> Hardness ${newItemData.system.hardness}, HP ${newItemData.system.hp.max}. ${mat.desc || ""}`);
        }

        // Armor Profile
        if (isProceduralArmor && newItemData.system?.armor) {
          const acRoll = rollStat("Armor AC", "physical"); //[cite: 3]
          const acpRoll = rollStat("ACP", "physical"); //[cite: 3]
          const asfRoll = rollStat("Spell Failure", "magic"); //[cite: 3]

          newItemData.system.armor.value = Math.round((newItemData.system.armor.value || 0) * 10 * acRoll.mult);
          let adjAcp = Math.round((newItemData.system.armor.acp || 0) * 10 * (2.0 - acpRoll.mult));
          if (mat.acpBonus) adjAcp = Math.min(0, adjAcp + mat.acpBonus);
          newItemData.system.armor.acp = adjAcp;

          let adjAsf = Math.round((newItemData.system.armor.spellFailure ?? 0) * (2.0 - asfRoll.mult));
          if (mat.asfBonus) adjAsf = Math.max(0, adjAsf - mat.asfBonus);
          newItemData.system.armor.spellFailure = adjAsf;
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}, Spell Failure ${adjAsf}%.`);
        }

        let propPrefixes = [];
        let propSuffixes = [];

        // Weapon Actions & Precision
        if (isProceduralWeapon && newItemData.system?.actions) {
          const critRangeRoll = rollStat("Crit Threat", "precision"); //[cite: 3]
          const critMultRoll = rollStat("Crit Mult", "precision"); //[cite: 3]
          let isFirstAction = true;

          newItemData.system.actions.forEach(action => {
            action.ability = action.ability || {};
            action.extraAttacks = [{ type: "custom", name: "10x Iteratives", countFormula: "max(0, floor((@attributes.bab.total - 10) / 50))", modifierFormula: "-50 * (@idx + 1)" }];
            
            let cBase = action.ability.critRange ?? action.critRange ?? 191;
            if (cBase <= 20) cBase = (cBase * 10) - 9;
            action.critRange = Math.min(199, Math.max(100, Math.round(cBase - ((critRangeRoll.mult - 1.0) * 40))));
            action.ability.critRange = action.critRange;

            let fMult = Number(action.ability.critMult ?? action.critMult ?? 2);
            if (critMultRoll.mult >= 1.20) fMult += 1;
            else if (critMultRoll.mult <= 0.80) fMult = Math.max(1, fMult - 1);
            action.critMult = fMult;
            action.ability.critMult = fMult;

            if (isFirstAction) identifiedTraits.push(`<strong>Precision:</strong> Crit range ${action.critRange}–200, multiplier ×${action.critMult}.`);

            for (const pKey of pickedProps) {
              const prop = propPool[pKey];
              if (!prop) continue;

              if (prop.isDice) {
                const pRoll = rollStat(`${prop.baseName} Tier`, "magic"); //[cite: 3]
                const numDice = prop.numDice || 1;
                const varianceRatio = (pRoll.mult - 1.0) / 0.25; 
                let faces = Math.max(1, Math.round(60 + (varianceRatio * 20))); 
                let titlePrefix = pRoll.mult > 1.15 ? `Supreme ${prop.baseName}` : pRoll.mult < 0.85 ? `Weak ${prop.baseName}` : prop.baseName;
                if (isFirstAction) propPrefixes.push(titlePrefix);

                action.damage.parts.push({ formula: `${numDice}d${faces}`, type: { values: [prop.type], custom: "" } });
                if (isFirstAction) identifiedTraits.push(`<strong>${titlePrefix} Property:</strong> Infuses attacks with +${numDice}d${faces} ${prop.type} damage.`);
              } else {
                if (isFirstAction) {
                  tagsList.push(`Property: ${prop.title || prop.baseName}`); //[cite: 3]
                  if (prop.title?.startsWith("of ")) propSuffixes.push(prop.title);
                  else propPrefixes.push(prop.title || prop.baseName);
                  if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
                }
                if (prop.actionMod) prop.actionMod(action);
              }
            }
            isFirstAction = false;
          });
        }

        // Enhancement Bonus
        let enhSuffix = "";
        if (enhLevel > 0) {
          const enhRoll = rollStat("Magic Enhancement", "magic"); //[cite: 3]
          newItemData.system.enh = Math.max(1, Math.round((enhLevel * 10) * enhRoll.mult));
          if (newItemData.system.armor) newItemData.system.armor.enh = newItemData.system.enh;
          const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
          enhSuffix = ` ${titles[enhLevel] || ""}`;
          identifiedTraits.push(`<strong>Enhancement Bonus (+${newItemData.system.enh}):</strong> Provides +${newItemData.system.enh} to hit/damage/AC.`);
        }

        // Name Synthesis & Tagging Integration[cite: 3]
        const matTitle = mat.name !== "Base" ? `${mat.name} ` : "";
        const pPre = propPrefixes.length ? `${propPrefixes.join(" ")} ` : "";
        const pSuf = propSuffixes.length ? ` ${propSuffixes.join(" ")}` : "";
        newItemData.name = `${prefix} ${matTitle}${pPre}${baseDoc.name}${pSuf}${enhSuffix}`.trim();

        newItemData.system.tags = Array.isArray(newItemData.system.tags) ? newItemData.system.tags : [];
        newItemData.system.tags.push(...tagsList); //[cite: 3]

        const tagHtml = tagsList.map(t => `<span style="background:#2f3542;color:#fff;padding:2px 6px;border-radius:3px;font-size:0.75em;margin:2px;display:inline-block;">${t}</span>`).join(" "); //[cite: 3]
        const traitListHtml = identifiedTraits.map(tr => `<li>${tr}</li>`).join(""); //[cite: 3]
        const originalDesc = newItemData.system.description?.value || "";

        newItemData.system.description = newItemData.system.description || {};
        newItemData.system.description.value = `
          ${originalDesc}
          <hr/>
          <h3>Identified Properties & Enchantments</h3>
          <ul style="padding-left:18px;margin:6px 0;font-size:0.9em;line-height:1.4;">
            ${traitListHtml}
          </ul>
          <p><strong>Generation Tags:</strong><br/>${tagHtml}</p>
        `.trim(); //[cite: 3]

        newItemData.system.identified = true; //[cite: 3]
        this.batchResults.push(newItemData);
      }

      this.render();
    });

    // ─── STANDARD SINGLE FORGE GENERATION ───
    html.find('#forge-gen-btn').click(async () => {
      if (!this.selectedBaseItem) return ui.notifications.warn("Please select a base item first!");

      this.magicLevel = parseInt(html.find('#forge-enh-level').val(), 10) || 0;
      this.selectedMaterial = html.find('#forge-material').val();
      this.useShortCompoundNames = html.find('#forge-short-names').is(':checked');
      if (this.activeTab === "ammo") {
        this.ammoQuantity = parseInt(html.find('#forge-ammo-qty').val(), 10) || 20;
      }

      await this._savePersistentSettings();

      if (this.selectedProperties.size > 0 && this.magicLevel < 1) {
        ui.notifications.info("Magic properties require at least a +1 Enhancement Bonus. Automatically adjusting to +1.");
        this.magicLevel = 1;
        html.find('#forge-enh-level').val("1");
      }

      const newItemData = this.selectedBaseItem.toObject();
      const isArmor = this.activeTab === "armor";
      const baseProps = isArmor ? ARMOR_ENCHANTMENTS : WEAPON_ENCHANTMENTS;
      const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
      const propRegistry = { ...baseProps, ...customProps };
      const mat = SPECIAL_MATERIALS[this.selectedMaterial];

      const tagsList = [];
      const identifiedTraits = [];
      let logOutput = ""; 

      newItemData.flags = newItemData.flags || {};
      newItemData.flags[MODULE_ID] = newItemData.flags[MODULE_ID] || {};
      newItemData.flags[MODULE_ID].disable10xCard = true; //[cite: 2]
      newItemData.flags[MODULE_ID].disable10xSheet = true; 
      newItemData.flags[MODULE_ID].is10xScaled = true; 

      if (this.activeTab === "ammo") {
        newItemData.system.quantity = this.ammoQuantity;
      }

      if (this.magicLevel > 0 || this.selectedProperties.size > 0 || (mat.name !== "Base" && mat.name !== "Steel")) {
        newItemData.system.masterwork = true;
      }

      const rollStat = (label, category) => {
        const min = this.variances[category].min / 100;
        const max = this.variances[category].max / 100;
        const rollMult = 1.0 + (min + Math.random() * (max - min));
        const varianceRatio = (rollMult - 1.0) / 0.25; 
        let tier = Math.ceil(varianceRatio * 4);
        if (tier === 0) tier = varianceRatio >= 0 ? 1 : -1;
        tier = Math.max(-4, Math.min(4, tier));
        const tierSign = tier > 0 ? `+${tier}` : `${tier}`;
        if (label) tagsList.push(`${label}: Tier ${tierSign}`); //[cite: 3]
        return { mult: rollMult, tier }; 
      };

      const tierPrefixes = {
        "-4": "Ruined", "-3": "Flawed", "-2": "Worn", "-1": "Serviceable",
        "1": "Tempered", "2": "Honed", "3": "Superior", "4": "Mastercraft"
      };

      const craftRoll = rollStat("Craft Quality", "physical"); //[cite: 3]
      const prefix = tierPrefixes[craftRoll.tier];
      identifiedTraits.push(`<strong>Craftsmanship (${prefix}):</strong> Forged to ${prefix.toLowerCase()} standards.`);
      logOutput += `<div style="padding-bottom: 2px;"><strong>Physical M-plier:</strong> <span style="float:right;">${((craftRoll.mult - 1)*100).toFixed(2)}%</span></div>`;

      const weightRoll = rollStat("Weight", "physical");
      const rawWeight = newItemData.system?.weight?.value ?? 0;
      const matWeightMult = mat.weightMult || 1.0;
      const weightFactor = Math.max(0.1, 2.0 - weightRoll.mult);
      let calculatedWeight = Math.round((rawWeight * matWeightMult * weightFactor) * 100) / 100;
      if (rawWeight > 0 && calculatedWeight === 0) calculatedWeight = 0.1;
      if (newItemData.system?.weight) newItemData.system.weight.value = rawWeight === 0 ? 0 : calculatedWeight;
      logOutput += `<div style="padding-bottom: 2px;"><strong>Weight:</strong> <span style="float:right;">${((weightRoll.mult - 1)*100).toFixed(2)}% (${newItemData.system?.weight?.value ?? 0} lbs)</span></div>`;

      const hardRoll = rollStat("Hardness", "durability"); //[cite: 3]
      const hpRoll = rollStat("Hit Points", "durability"); //[cite: 3]
      logOutput += `<div style="padding-bottom: 2px;"><strong>Hardness / HP:</strong> <span style="float:right;">${((hardRoll.mult - 1)*100).toFixed(2)}% / ${((hpRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
      
      let baseHardness = 0;
      if (newItemData.system.hardness) {
        baseHardness = typeof newItemData.system.hardness === "object" ? newItemData.system.hardness.value : newItemData.system.hardness;
      }
      const baseHp = (newItemData.system.hp?.base ?? newItemData.system.hp?.max ?? 0); 
      newItemData.system.hardness = Math.max(0, Math.round((baseHardness * 10 + mat.hardnessMod) * hardRoll.mult));
      
      const finalHp = Math.max(1, Math.round((baseHp * 10 * mat.hpMult) * hpRoll.mult));
      newItemData.system.hp = { base: finalHp, max: finalHp, value: finalHp };

      if (mat.name !== "Base" && mat.name !== "Steel") {
        identifiedTraits.push(`<strong>Material (${mat.name}):</strong> Hardness ${newItemData.system.hardness}, HP ${newItemData.system.hp.max}. ${mat.desc || ""}`);
      }

      if (isArmor && newItemData.system?.armor) {
        const acRoll = rollStat("Armor AC", "physical"); //[cite: 3]
        const acpRoll = rollStat("ACP", "physical"); //[cite: 3]
        const asfRoll = rollStat("Spell Failure", "magic"); //[cite: 3]

        let baseAc = (newItemData.system.armor.value || 0) * 10;
        let baseAcp = (newItemData.system.armor.acp || 0) * 10;
        let baseAsf = newItemData.system.armor.spellFailure ?? 0;

        newItemData.system.armor.value = Math.round(baseAc * acRoll.mult);
        let adjustedAcp = Math.round(baseAcp * (2.0 - acpRoll.mult));
        if (mat.acpBonus) adjustedAcp = Math.min(0, adjustedAcp + mat.acpBonus);
        newItemData.system.armor.acp = adjustedAcp;

        let adjustedAsf = Math.round(baseAsf * (2.0 - asfRoll.mult));
        if (mat.asfBonus) adjustedAsf = Math.max(0, adjustedAsf - mat.asfBonus);
        newItemData.system.armor.spellFailure = adjustedAsf;

        if (newItemData.system.armor.dex != null) {
          const dexRoll = rollStat("Max Dex", "physical"); //[cite: 3]
          let adjustedDex = Math.round(newItemData.system.armor.dex * 10 * dexRoll.mult);
          if (mat.dexBonus) adjustedDex += mat.dexBonus;
          newItemData.system.armor.dex = adjustedDex;
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}, Max Dex +${newItemData.system.armor.dex}, Spell Failure ${adjustedAsf}%.`);
        } else {
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}, Spell Failure ${adjustedAsf}%.`);
        }
        logOutput += `<div style="padding-bottom: 2px;"><strong>AC / ACP / ASF:</strong> <span style="float:right;">${((acRoll.mult - 1)*100).toFixed(2)}% / ${((acpRoll.mult - 1)*100).toFixed(2)}% / ${((asfRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
      }

      let propPrefixes = [];
      let propSuffixes = [];

      if (!isArmor && newItemData.system?.actions) {
        const critRangeRoll = rollStat("Crit Threat", "precision"); //[cite: 3]
        const critMultRoll = rollStat("Crit Mult", "precision"); //[cite: 3]
        logOutput += `<div style="padding-bottom: 2px;"><strong>Crit Rng / Mult:</strong> <span style="float:right;">${((critRangeRoll.mult - 1)*100).toFixed(2)}% / ${((critMultRoll.mult - 1)*100).toFixed(2)}%</span></div>`;

        let isFirstAction = true;

        newItemData.system.actions.forEach(action => {
          action.ability = action.ability || {}; 
          if (this.activeTab === "weapons") {
            action.extraAttacks = [{
              type: "custom",
              name: "10x Iteratives",
              countFormula: "max(0, floor((@attributes.bab.total - 10) / 50))",
              modifierFormula: "-50 * (@idx + 1)"
            }];
            if (isFirstAction) identifiedTraits.push(`<strong>Iterative Form:</strong> Custom 10x progression injected.`);
          }
          
          let critBase = action.ability.critRange ?? action.critRange ?? 191;
          if (critBase <= 20) critBase = (critBase * 10) - 9;

          const rangeShift = (critRangeRoll.mult - 1.0) * 40; 
          let finalCrit = Math.min(199, Math.max(100, Math.round(critBase - rangeShift)));
          action.critRange = finalCrit;
          action.ability.critRange = finalCrit;

          let baseMult = action.ability.critMult ?? action.critMult ?? 2.0;
          let finalMult = Number(baseMult);
          if (critMultRoll.mult >= 1.20) finalMult += 1;
          else if (critMultRoll.mult <= 0.80) finalMult = Math.max(1, finalMult - 1);
          finalMult = Math.round(finalMult);

          action.critMult = finalMult;
          action.ability.critMult = finalMult;
          action.flags = action.flags || {};
          action.flags[MODULE_ID] = action.flags[MODULE_ID] || {};
          action.flags[MODULE_ID].critMult = finalMult;

          if (isFirstAction) identifiedTraits.push(`<strong>Precision:</strong> Crit range ${action.critRange}–200, multiplier ×${action.critMult}.`);

          for (const propKey of this.selectedProperties) {
            const prop = propRegistry[propKey];
            if (!prop) continue;

            if (prop.isDice) {
              const pRoll = rollStat(`${prop.baseName} Tier`, "magic"); //[cite: 3]
              if (isFirstAction) logOutput += `<div style="padding-bottom: 2px;"><strong>Magic (${prop.baseName}):</strong> <span style="float:right;">${((pRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
              
              const numDice = prop.numDice || 1;
              const varianceRatio = (pRoll.mult - 1.0) / 0.25; 
              let faces = Math.max(1, Math.round(60 + (varianceRatio * 20))); 

              let titlePrefix = prop.baseName;
              if (pRoll.mult > 1.15) titlePrefix = `Supreme ${prop.baseName}`;
              else if (pRoll.mult < 0.85) titlePrefix = `Weak ${prop.baseName}`;
              if (isFirstAction) propPrefixes.push(titlePrefix);

              action.damage.parts.push({ formula: `${numDice}d${faces}`, type: { values: [prop.type], custom: "" } });
              if (isFirstAction) identifiedTraits.push(`<strong>${titlePrefix} Property:</strong> Infuses attacks with +${numDice}d${faces} ${prop.type} damage.`);
            } else {
              if (isFirstAction) {
                tagsList.push(`Property: ${prop.title || prop.baseName}`); //[cite: 3]
                if (prop.title?.startsWith("of ")) propSuffixes.push(prop.title);
                else propPrefixes.push(prop.title || prop.baseName);
                if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
              }
              if (prop.actionMod) prop.actionMod(action);
            }
          }
          isFirstAction = false;
        });
      }

      if (isArmor) {
        for (const propKey of this.selectedProperties) {
          const prop = propRegistry[propKey];
          if (!prop) continue;

          if (prop.bonusMath) {
            const pRoll = rollStat(`${prop.baseName} Tier`, "magic"); //[cite: 3]
            logOutput += `<div style="padding-bottom: 2px;"><strong>Magic (${prop.baseName}):</strong> <span style="float:right;">${((pRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
            let bonus = prop.bonusMath(pRoll.mult);
            
            let titlePrefix = pRoll.mult > 1.15 ? `Greater ${prop.baseName}` : pRoll.mult < 0.85 ? `Lesser ${prop.baseName}` : prop.baseName;
            propPrefixes.push(titlePrefix);

            if (prop.type === "skill") {
              newItemData.system.changes = newItemData.system.changes || [];
              newItemData.system.changes.push({ formula: `${bonus}`, target: prop.target, operator: "add", type: "competence", priority: 0 });
              identifiedTraits.push(`<strong>${titlePrefix}:</strong> +${bonus} competence bonus to skill checks.`);
            } else if (prop.type === "sr") {
              newItemData.system.changes = newItemData.system.changes || [];
              newItemData.system.changes.push({ formula: `${bonus}`, target: "spellResist", operator: "add", type: "untyped", priority: 0 });
              identifiedTraits.push(`<strong>${titlePrefix}:</strong> Grants Spell Resistance ${bonus}.`);
            }
          } else {
            tagsList.push(`Property: ${prop.title || prop.baseName}`); //[cite: 3]
            if (prop.title?.startsWith("of ")) propSuffixes.push(prop.title);
            else propPrefixes.push(prop.title || prop.baseName);
            if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
          }
        }
      }

      let enhSuffix = "";
      if (this.magicLevel > 0) {
        const enhRoll = rollStat("Magic Enhancement", "magic"); //[cite: 3]
        logOutput += `<div style="padding-bottom: 2px;"><strong>Enhancement Bonus:</strong> <span style="float:right;">${((enhRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
        newItemData.system.enh = Math.max(1, Math.round((this.magicLevel * 10) * enhRoll.mult));
        if (newItemData.system.armor) newItemData.system.armor.enh = newItemData.system.enh;
        
        const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
        enhSuffix = titles[this.magicLevel] || "";
        identifiedTraits.push(`<strong>Enhancement Bonus (+${newItemData.system.enh}):</strong> Provides +${newItemData.system.enh} to hit/damage or Armor AC.`);
      }

      const matTitle = mat.name !== "Base" ? `${mat.name} ` : "";
      let finalName = "";

      if (this.useShortCompoundNames && this.selectedProperties.size > 0) {
        let sortedProps = Array.from(this.selectedProperties).sort();
        let multiKey = sortedProps.join("_");
        let levelKey = `${this.magicLevel}_${multiKey}`;

        if (COMPOUND_FUSIONS[levelKey]) {
          finalName = `${prefix} ${matTitle}${COMPOUND_FUSIONS[levelKey]} ${this.selectedBaseItem.name}`.trim();
        } else if (COMPOUND_FUSIONS[multiKey]) {
          let eSuf = enhSuffix ? ` ${enhSuffix}` : "";
          finalName = `${prefix} ${matTitle}${COMPOUND_FUSIONS[multiKey]} ${this.selectedBaseItem.name}${eSuf}`.trim();
        }
      } 
      
      if (!finalName) {
        const pPre = propPrefixes.length ? `${propPrefixes.join(" ")} ` : "";
        const pSuf = propSuffixes.length ? ` ${propSuffixes.join(" ")}` : "";
        const eSuf = enhSuffix ? ` ${enhSuffix}` : "";
        finalName = `${prefix} ${matTitle}${pPre}${this.selectedBaseItem.name}${pSuf}${eSuf}`.trim();
      }

      newItemData.name = finalName;
      newItemData.system.tags = Array.isArray(newItemData.system.tags) ? newItemData.system.tags : [];
      newItemData.system.tags.push(...tagsList); //[cite: 3]

      const tagHtml = tagsList.map(t => `<span style="background:#2f3542;color:#fff;padding:2px 6px;border-radius:3px;font-size:0.75em;margin:2px;display:inline-block;">${t}</span>`).join(" "); //[cite: 3]
      const traitListHtml = identifiedTraits.map(tr => `<li>${tr}</li>`).join(""); //[cite: 3]
      const originalDesc = newItemData.system.description?.value || "";

      newItemData.system.description = newItemData.system.description || {};
      newItemData.system.description.value = `
        ${originalDesc}
        <hr/>
        <h3>Identified Properties & Enchantments</h3>
        <ul style="padding-left:18px;margin:6px 0;font-size:0.9em;line-height:1.4;">
          ${traitListHtml}
        </ul>
        <p><strong>Generation Tags:</strong><br/>${tagHtml}</p>
      `.trim(); //[cite: 3]

      newItemData.system.identified = true; //[cite: 3]

      const created = await Item.create(newItemData, { temporary: false }); //[cite: 3]
      this.generatedItemData = created.toObject(); //[cite: 3]
      this.generatedItemData._id = created.id; //[cite: 3]
      this.rollLogHtml = logOutput;
      this.render();
    });

    // ─── DRAG HANDLERS ───
    html.find('.forge-drag-card').on('dragstart', e => {
      const batchIdx = $(e.currentTarget).data('batch-idx');
      if (batchIdx !== undefined && this.batchResults[batchIdx]) {
        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: "Item", 
          data: this.batchResults[batchIdx] 
        }));
      } else if (this.generatedItemData) {
        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: "Item", 
          data: this.generatedItemData 
        }));
      }
    });
  }
}