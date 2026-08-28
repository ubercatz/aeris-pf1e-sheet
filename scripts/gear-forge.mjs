/**
 * @file gear-forge.mjs
 * Procedural 10x Gear Forge with Tabbed Architecture, Category Filtering, and Ammunition Stacks
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

export class GranularForgeApp extends Application {
  constructor(options = {}) {
    super(options);
    this.activeTab = "weapons"; // "weapons" | "armor" | "ammo"
    this.selectedCompendium = "";
    this.compendiumItems = [];
    this.selectedBaseItem = null;
    this.generatedItemData = null;
    
    this.variances = {
        physical: { min: -25, max: 25 },
        durability: { min: -25, max: 25 },
        precision: { min: -25, max: 25 },
        magic: { min: -25, max: 25 }
    };
    
    this.magicLevel = 0;
    this.selectedMaterial = "steel";
    this.selectedProperties = new Set();
    this.useShortCompoundNames = true;
    this.searchTerm = "";
    this.ammoQuantity = 20;
    this.rollLogHtml = ""; 
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-granular-forge",
      title: "10x Procedural Gear & Enchantment Forge",
      template: "",
      width: 1000,
      height: 800,
      resizable: true,
      classes: ["aeris-gear-gen-app"]
    });
  }

  /**
   * Evaluates if a raw compendium index entry matches the active tab's category
   */
  _filterItemForTab(item, tab) {
    const type = item.type;
    const subType = item.system?.subType || item.system?.weaponSubtype || "";
    const eqType = item.system?.equipmentType || "";
    const name = item.name.toLowerCase();

    // 1. Ammunition Tab
    if (tab === "ammo") {
      if (type === "ammo") return true;
      if (subType === "ammo") return true;
      if (type === "loot" && item.system?.subType === "ammo") return true;
      if (/\b(arrow|arrows|bolt|bolts|bullet|bullets|cartridge|cartridges|dart|darts|shuriken|pellets)\b/i.test(name)) return true;
      return false;
    }

    // 2. Armor & Shields Tab
    if (tab === "armor") {
      if (type === "armor" || type === "shield") return true;
      if (type === "equipment") {
        if (["armor", "shield"].includes(eqType) || ["armor", "shield"].includes(subType)) return true;
        if (item.system?.armor !== undefined || ["armor", "shield"].includes(item.system?.slot)) return true;
      }
      return false;
    }

    // 3. Weapons Tab (Excludes ammo)
    if (tab === "weapons") {
      if (type === "weapon") {
        if (subType === "ammo") return false;
        if (/\b(arrow|arrows|bolt|bolts|cartridge|cartridges)\b/i.test(name)) return false;
        return true;
      }
      return false;
    }

    return false;
  }

  async getData() {
    const packs = game.packs.filter(p => p.documentName === "Item");
    const packChoices = packs.reduce((acc, p) => { acc[p.collection] = p.metadata.label; return acc; }, {});
    if (!this.selectedCompendium && packs.length > 0) this.selectedCompendium = packs[0].collection;
    
    if (this.selectedCompendium) {
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) {
        const rawIndex = await pack.getIndex({
          fields: ["system.subType", "system.weaponSubtype", "system.equipmentType", "system.armor", "system.slot"]
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

    return {
      activeTab: this.activeTab,
      packs: packChoices,
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
      rollLogHtml: this.rollLogHtml
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

    // Property Filtering
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
              <strong>Max Dex:</strong> ${data.selectedItem.system.armor.dex ?? "∞"}<br/>
          ` : ""}
          <strong>Hardness:</strong> ${safeHardness || 0} | 
          <strong>Base HP:</strong> ${safeHp}
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

    const html = `
      <div style="display:flex; flex-direction:column; height:100%; gap:8px; padding:6px; font-family:var(--font-primary);">
        
        <!-- HEADER TAB NAVIGATION -->
        <nav class="forge-category-tabs" style="display:flex; gap:8px; border-bottom:2px solid var(--color-border-light-2); padding-bottom:6px;">
          <button type="button" class="forge-tab-nav ${data.activeTab === "weapons" ? "active" : ""}" data-tab="weapons" style="flex:1; padding:6px 12px; font-weight:bold; cursor:pointer; background:${data.activeTab === "weapons" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "weapons" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ⚔️ Weapons
          </button>
          <button type="button" class="forge-tab-nav ${data.activeTab === "armor" ? "active" : ""}" data-tab="armor" style="flex:1; padding:6px 12px; font-weight:bold; cursor:pointer; background:${data.activeTab === "armor" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "armor" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            🛡️ Armor & Shields
          </button>
          <button type="button" class="forge-tab-nav ${data.activeTab === "ammo" ? "active" : ""}" data-tab="ammo" style="flex:1; padding:6px 12px; font-weight:bold; cursor:pointer; background:${data.activeTab === "ammo" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "ammo" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            🏹 Ammunition
          </button>
        </nav>

        <!-- MAIN 3-COLUMN LAYOUT -->
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
            
            <!-- COLLAPSIBLE VARIANCES -->
            <details style="background:rgba(0,0,0,0.02); padding:6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
              <summary style="font-weight:bold; font-size:0.9em; cursor:pointer; outline:none; user-select:none;">🎯 Targeted Variances (Min to Max)</summary>
              <div style="display:flex; flex-direction:column; gap:4px; margin-top:8px;">
                ${createSlider("Physical (Craft, AC, Damage)", "physical")}
                ${createSlider("Durability (HP, Hardness)", "durability")}
                ${createSlider("Precision (Crit Range, Mult)", "precision")}
                ${createSlider("Magic (Enhancement, Properties)", "magic")}
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

            <!-- EXPANDED MAGIC PROPERTIES -->
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
                    <div><strong>Max Dex:</strong> +${data.generated.system.armor.dex ?? "∞"}</div>
                  ` : `
                    <div><strong>Damage:</strong> ${data.generated.system?.actions?.[0]?.damage?.parts?.map(p => p.formula).join(" + ") || "N/A"}</div>
                    <div><strong>Crit Threat:</strong> ${data.generated.system?.actions?.[0]?.critRange}+ (×${data.generated.system?.actions?.[0]?.critMult})</div>
                  `}
                  <div><strong>Hardness:</strong> ${data.generated.system.hardness} | <strong>HP:</strong> ${data.generated.system.hp?.max}</div>
                  <div><strong>Quantity:</strong> ${data.generated.system.quantity ?? 1} | <strong>Enhancement:</strong> +${data.generated.system.enh || 0}</div>
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
      </div>
    `;
    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    // Tab Navigation Listener
    html.find('.forge-tab-nav').click(e => {
      const targetTab = $(e.currentTarget).data('tab');
      if (this.activeTab !== targetTab) {
        this.activeTab = targetTab;
        this.selectedBaseItem = null;
        this.selectedProperties.clear();
        this.render();
      }
    });

    // Multi-Slider Collision Protection
    html.find('.forge-var-slider').on('input', e => {
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
    });

    html.find('#forge-item-search').on('input', e => {
      this.searchTerm = e.target.value.toLowerCase();
      html.find('.gear-row').each((i, el) => {
        $(el).toggle($(el).text().toLowerCase().includes(this.searchTerm));
      });
    });
    
    if (this.searchTerm) html.find('.gear-row').each((i, el) => $(el).toggle($(el).text().toLowerCase().includes(this.searchTerm)));

    html.find('#forge-pack-select').change(e => { this.selectedCompendium = e.target.value; this.selectedBaseItem = null; this.selectedProperties.clear(); this.render(); });
    
    html.find('.gear-row').click(async e => {
      const id = $(e.currentTarget).data('id');
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) { this.selectedBaseItem = await pack.getDocument(id); this.selectedProperties.clear(); this.render(); }
    });

    html.find('.forge-prop-checkbox').change(e => {
        if (e.target.checked) this.selectedProperties.add(e.target.value);
        else this.selectedProperties.delete(e.target.value);
    });

    html.find('#forge-random-prop').click(async () => {
        const baseProps = this.activeTab === "armor" ? ARMOR_ENCHANTMENTS : WEAPON_ENCHANTMENTS;
        const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
        
        let validProps = Object.entries({ ...baseProps, ...customProps });
        if (this.activeTab === "weapons" && this.selectedBaseItem) {
            const wpn = this.selectedBaseItem.system;
            const isRanged = wpn?.weaponSubtype === "ranged" || wpn?.properties?.thr;
            const isMelee = wpn?.weaponSubtype !== "ranged" || wpn?.properties?.thr; 
            validProps = validProps.filter(([k, v]) => {
                if (v.allowed === "melee" && !isMelee) return false;
                if (v.allowed === "ranged" && !isRanged) return false;
                return true;
            });
        } else if (this.activeTab === "ammo") {
            validProps = validProps.filter(([k, v]) => v.allowed !== "melee");
        }
        
        if (validProps.length === 0) return;
        const randomProp = validProps[Math.floor(Math.random() * validProps.length)];
        this.selectedProperties.clear();
        this.selectedProperties.add(randomProp[0]);
        this.render();
    });

    html.find('#forge-new-custom-prop').click(async () => {
        new Dialog({
            title: "Create Custom Magic Property",
            content: `
              <form>
                <div class="form-group"><label>Property Name</label><input type="text" id="cp-name" placeholder="e.g. Sonic, Thundering" required></div>
                <div class="form-group"><label>Enhancement Cost (+)</label><input type="number" id="cp-cost" value="1" min="0"></div>
                <div class="form-group"><label>Allowed Category</label><select id="cp-allowed"><option value="both">All Weapons / Ammo</option><option value="melee">Melee Only</option><option value="ranged">Ranged Only</option></select></div>
                <div class="form-group"><label>Adds Continuous Dice?</label><input type="checkbox" id="cp-isDice" checked></div>
                <div class="form-group"><label>Number of Dice</label><input type="number" id="cp-numDice" value="1" min="1"></div>
                <div class="form-group"><label>Damage Type</label><input type="text" id="cp-type" placeholder="e.g. sonic, untyped"></div>
                <div class="form-group"><label>Special Effect Note</label><textarea id="cp-note" rows="3" placeholder="Effect Description..."></textarea></div>
              </form>
            `,
            buttons: {
                save: {
                    label: "Save to World",
                    callback: async (dHtml) => {
                        const name = dHtml.find('#cp-name').val().trim();
                        if (!name) return ui.notifications.error("Name is required!");
                        const cost = parseInt(dHtml.find('#cp-cost').val()) || 0;
                        const allowed = dHtml.find('#cp-allowed').val();
                        const isDice = dHtml.find('#cp-isDice').is(':checked');
                        const numDice = parseInt(dHtml.find('#cp-numDice').val()) || 1;
                        const type = dHtml.find('#cp-type').val().trim() || "untyped";
                        const note = dHtml.find('#cp-note').val().trim();

                        const newProp = { baseName: name, cost, allowed, note, title: name };
                        if (isDice) {
                            newProp.isDice = true;
                            newProp.type = type;
                            newProp.numDice = numDice;
                        }

                        const safeId = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        let currentSettings = game.settings.get(MODULE_ID, "customProperties") || {};
                        currentSettings[safeId] = newProp;
                        await game.settings.set(MODULE_ID, "customProperties", currentSettings);
                        ui.notifications.info(`Custom Property '${name}' saved successfully!`);
                        this.selectedProperties.add(safeId);
                        this.render();
                    }
                }
            },
            default: "save"
        }).render(true);
    });

    html.find('#forge-gen-btn').click(async () => {
      if (!this.selectedBaseItem) return ui.notifications.warn("Please select a base item first!");

      this.magicLevel = parseInt(html.find('#forge-enh-level').val(), 10) || 0;
      this.selectedMaterial = html.find('#forge-material').val();
      this.useShortCompoundNames = html.find('#forge-short-names').is(':checked');
      if (this.activeTab === "ammo") {
        this.ammoQuantity = parseInt(html.find('#forge-ammo-qty').val(), 10) || 20;
      }

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
      newItemData.flags[MODULE_ID].disable10xCard = true; 
      newItemData.flags[MODULE_ID].is10xScaled = true; 

      if (this.activeTab === "ammo") {
        newItemData.system.quantity = this.ammoQuantity;
      }

      if (this.magicLevel > 0 || this.selectedProperties.size > 0 || mat.name === "Adamantine" || mat.name === "Mithral") {
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
        
        if (label) tagsList.push(`${label}: Tier ${tierSign}`);
        return { mult: rollMult, tier }; 
      };

      const tierPrefixes = {
        "-4": "Ruined", "-3": "Flawed", "-2": "Worn", "-1": "Serviceable",
        "1": "Tempered", "2": "Honed", "3": "Superior", "4": "Mastercraft"
      };

      const craftRoll = rollStat("Craft Quality", "physical");
      const prefix = tierPrefixes[craftRoll.tier];
      identifiedTraits.push(`<strong>Craftsmanship (${prefix}):</strong> Forged to ${prefix.toLowerCase()} standards.`);
      logOutput += `<div style="padding-bottom: 2px;"><strong>Physical M-plier:</strong> <span style="float:right;">${((craftRoll.mult - 1)*100).toFixed(2)}%</span></div>`;

      const hardRoll = rollStat("Hardness", "durability");
      const hpRoll = rollStat("Hit Points", "durability");
      logOutput += `<div style="padding-bottom: 2px;"><strong>Hardness / HP:</strong> <span style="float:right;">${((hardRoll.mult - 1)*100).toFixed(2)}% / ${((hpRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
      
      let baseHardness = 0;
      if (newItemData.system.hardness) {
          baseHardness = typeof newItemData.system.hardness === "object" ? newItemData.system.hardness.value : newItemData.system.hardness;
      }
      const baseHp = (newItemData.system.hp?.base ?? newItemData.system.hp?.max ?? 0); 

      let initialHardness10x = baseHardness * 10;
      let initialHp10x = baseHp * 10;

      newItemData.system.hardness = Math.max(0, Math.round((initialHardness10x + mat.hardnessMod) * hardRoll.mult));
      
      const finalHp = Math.max(1, Math.round((initialHp10x * mat.hpMult) * hpRoll.mult));
      newItemData.system.hp = newItemData.system.hp || {};
      newItemData.system.hp.base = finalHp; 
      newItemData.system.hp.max = finalHp;
      newItemData.system.hp.value = finalHp;

      if (mat.name !== "Steel") {
        identifiedTraits.push(`<strong>Material (${mat.name}):</strong> Hardness ${newItemData.system.hardness}, HP ${newItemData.system.hp.max}. ${mat.desc || ""}`);
      }

      // Armor Adjustments
      if (isArmor && newItemData.system?.armor) {
        const acRoll = rollStat("Armor AC", "physical");
        const acpRoll = rollStat("ACP", "physical");
        let baseAc = (newItemData.system.armor.value || 0) * 10;
        let baseAcp = (newItemData.system.armor.acp || 0) * 10;

        newItemData.system.armor.value = Math.round(baseAc * acRoll.mult);
        let adjustedAcp = Math.round(baseAcp * (2.0 - acpRoll.mult));
        if (mat.acpBonus) adjustedAcp = Math.min(0, adjustedAcp + mat.acpBonus);
        newItemData.system.armor.acp = adjustedAcp;

        if (newItemData.system.armor.dex != null) {
          const dexRoll = rollStat("Max Dex", "physical");
          let adjustedDex = Math.round(newItemData.system.armor.dex * 10 * dexRoll.mult);
          if (mat.dexBonus) adjustedDex += mat.dexBonus;
          newItemData.system.armor.dex = adjustedDex;
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}, Max Dex +${newItemData.system.armor.dex}.`);
        } else {
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}.`);
        }
      }

      let propPrefixes = [];
      let propSuffixes = [];

      // Weapon and Ammunition Action Injections
      if (!isArmor && newItemData.system?.actions) {
        const critRangeRoll = rollStat("Crit Threat", "precision");
        const critMultRoll = rollStat("Crit Mult", "precision");
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
          
          let critBase = action.ability.critRange ?? action.critRange;
          if (critBase === undefined || critBase === null || critBase === "") {
              critBase = 191; 
          } else {
              critBase = Number(critBase);
              if (!isNaN(critBase) && critBase <= 20) critBase = (critBase * 10) - 9;
          }

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
                const pRoll = rollStat(`${prop.baseName} Tier`, "magic");
                if (isFirstAction) logOutput += `<div style="padding-bottom: 2px;"><strong>Magic (${prop.baseName}):</strong> <span style="float:right;">${((pRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
                
                const numDice = prop.numDice || 1;
                const varianceRatio = (pRoll.mult - 1.0) / 0.25; 
                let faces = Math.round(60 + (varianceRatio * 20)); 
                faces = Math.max(1, faces); 

                let titlePrefix = prop.baseName;
                if (pRoll.mult > 1.15) titlePrefix = `Supreme ${prop.baseName}`;
                else if (pRoll.mult < 0.85) titlePrefix = `Weak ${prop.baseName}`;
                if (isFirstAction) propPrefixes.push(titlePrefix);
  
                action.damage.parts.push({
                  formula: `${numDice}d${faces}`,
                  type: { values: [prop.type], custom: "" }
                });
                if (isFirstAction) identifiedTraits.push(`<strong>${titlePrefix} Property:</strong> Infuses attacks with +${numDice}d${faces} ${prop.type} damage.`);
             } else {
                if (isFirstAction) {
                    tagsList.push(`Property: ${prop.title || prop.baseName}`);
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

      // Armor Enchantment Handling
      if (isArmor) {
          for (const propKey of this.selectedProperties) {
             const prop = propRegistry[propKey];
             if (!prop) continue;

             if (prop.bonusMath) {
                const pRoll = rollStat(`${prop.baseName} Tier`, "magic");
                logOutput += `<div style="padding-bottom: 2px;"><strong>Magic (${prop.baseName}):</strong> <span style="float:right;">${((pRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
                let bonus = prop.bonusMath(pRoll.mult);
                
                let titlePrefix = prop.baseName;
                if (pRoll.mult > 1.15) titlePrefix = `Greater ${prop.baseName}`;
                else if (pRoll.mult < 0.85) titlePrefix = `Lesser ${prop.baseName}`;
                propPrefixes.push(titlePrefix);
      
                if (prop.type === "skill") {
                  newItemData.system.changes = newItemData.system.changes || [];
                  newItemData.system.changes.push({
                    formula: `${bonus}`, target: prop.target, operator: "add", type: "competence", priority: 0
                  });
                  identifiedTraits.push(`<strong>${titlePrefix}:</strong> +${bonus} competence bonus to skill checks.`);
                } else if (prop.type === "sr") {
                  newItemData.system.changes = newItemData.system.changes || [];
                  newItemData.system.changes.push({
                    formula: `${bonus}`, target: "spellResist", operator: "add", type: "untyped", priority: 0
                  });
                  identifiedTraits.push(`<strong>${titlePrefix}:</strong> Grants Spell Resistance ${bonus}.`);
                }
             } else {
                tagsList.push(`Property: ${prop.title || prop.baseName}`);
                if (prop.title?.startsWith("of ")) propSuffixes.push(prop.title);
                else propPrefixes.push(prop.title || prop.baseName);
                if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
             }
          }
      }

      let enhSuffix = "";
      if (this.magicLevel > 0) {
        const enhRoll = rollStat("Magic Enhancement", "magic");
        logOutput += `<div style="padding-bottom: 2px;"><strong>Enhancement Bonus:</strong> <span style="float:right;">${((enhRoll.mult - 1)*100).toFixed(2)}%</span></div>`;
        newItemData.system.enh = Math.max(1, Math.round((this.magicLevel * 10) * enhRoll.mult));
        const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
        enhSuffix = titles[this.magicLevel] || "";
        identifiedTraits.push(`<strong>Enhancement Bonus (+${newItemData.system.enh}):</strong> Provides +${newItemData.system.enh} to hit/damage or Armor AC.`);
      }

      const matTitle = mat.name !== "Steel" ? `${mat.name} ` : "";
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
      newItemData.system.tags.push(...tagsList);

      const tagHtml = tagsList.map(t => `<span style="background:#2f3542;color:#fff;padding:2px 6px;border-radius:3px;font-size:0.75em;margin:2px;display:inline-block;">${t}</span>`).join(" ");
      const traitListHtml = identifiedTraits.map(tr => `<li>${tr}</li>`).join("");
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
      `.trim();

      newItemData.system.identified = true;

      const created = await Item.create(newItemData, { temporary: false });
      this.generatedItemData = created.toObject();
      this.generatedItemData._id = created.id;
      this.rollLogHtml = logOutput;
      this.render();
    });

    html.find('.forge-drag-card').on('dragstart', e => {
      if (this.generatedItemData) {
        e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({ 
          type: "Item", 
          data: this.generatedItemData 
        }));
      }
    });
  }
}