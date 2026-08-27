/**
 * @file gear-forge.mjs
 * Procedural 10x Gear Forge with Detailed Inspection, Dual Sliders, and Continuous Precision Math
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

export class GranularForgeApp extends Application {
  constructor(options = {}) {
    super(options);
    this.selectedCompendium = "";
    this.compendiumItems = [];
    this.selectedBaseItem = null;
    this.generatedItemData = null;
    
    // NEW: Dual Slider State Management
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
    this.rollLogHtml = ""; // Stores exact variance math for display
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-granular-forge",
      title: "10x Procedural Gear & Enchantment Forge",
      template: "",
      width: 980,
      height: 780,
      resizable: true,
      classes: ["aeris-gear-gen-app"]
    });
  }

  async getData() {
    const packs = game.packs.filter(p => p.documentName === "Item");
    const packChoices = packs.reduce((acc, p) => { acc[p.collection] = p.metadata.label; return acc; }, {});
    if (!this.selectedCompendium && packs.length > 0) this.selectedCompendium = packs[0].collection;
    if (this.selectedCompendium) {
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) this.compendiumItems = await pack.getIndex();
    }

    const isWeapon = this.selectedBaseItem?.type === "weapon";
    let baseProperties = isWeapon ? WEAPON_ENCHANTMENTS : ARMOR_ENCHANTMENTS;
    const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
    const availableProperties = { ...baseProperties, ...customProps };

    return {
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
      isWeapon,
      useShortNames: this.useShortCompoundNames,
      searchTerm: this.searchTerm,
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

    const propRows = Object.entries(data.properties).map(([k, v]) => `
      <label style="display:flex; align-items:center; gap: 4px; font-size: 0.85em; margin-bottom: 3px; cursor:pointer;">
        <input type="checkbox" class="forge-prop-checkbox" value="${k}" ${data.selectedProperties.has(k) ? "checked" : ""}>
        ${v.baseName} (+${v.cost})
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
          ${data.isWeapon ? `
              <strong>Damage:</strong> ${data.selectedItem.system.actions?.[0]?.damage?.parts?.[0]?.formula || "N/A"} | 
              <strong>Crit:</strong> ${data.selectedItem.system.actions?.[0]?.ability?.critRange ?? data.selectedItem.system.actions?.[0]?.critRange ?? 20}-20/x${data.selectedItem.system.actions?.[0]?.ability?.critMult ?? data.selectedItem.system.actions?.[0]?.critMult ?? 2}<br/>
          ` : ""}
          ${data.selectedItem.system.armor ? `
              <strong>AC:</strong> +${data.selectedItem.system.armor.value || 0} | 
              <strong>ACP:</strong> ${data.selectedItem.system.armor.acp || 0} | 
              <strong>Max Dex:</strong> ${data.selectedItem.system.armor.dex ?? "∞"}<br/>
          ` : ""}
          <strong>Hardness:</strong> ${safeHardness || 0} | 
          <strong>Base HP:</strong> ${safeHp}
      </div>
    ` : `<div style="background: rgba(0,0,0,0.03); border: 1px dashed var(--color-border-light-2); border-radius: 4px; padding: 8px; margin-bottom: 8px; font-size: 0.8em; color: #777; text-align: center;">Select a base item to view stats.</div>`;

    const createSlider = (label, cat) => `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px; font-size:0.85em;">
        <strong>${label}</strong>
        <div style="display:flex; align-items:center; gap:4px;">
           <input type="number" class="forge-var-min" data-cat="${cat}" value="${data.variances[cat].min}" style="width:50px; padding:2px; text-align:center;">
           to 
           <input type="number" class="forge-var-max" data-cat="${cat}" value="${data.variances[cat].max}" style="width:50px; padding:2px; text-align:center;"> %
        </div>
      </div>
    `;

    const html = `
      <div style="display:flex;height:100%;gap:10px;padding:6px;font-family:var(--font-primary);">
        
        <!-- COLUMN 1: DIRECTORY -->
        <div style="flex:1;display:flex;flex-direction:column;border-right:1px solid var(--color-border-light-2);padding-right:6px;">
          <label style="font-weight:bold;font-size:0.8em;margin-bottom:2px;">Compendium Pack</label>
          <select id="forge-pack-select" style="margin-bottom:6px;font-size:0.85em;padding:3px;">${packOpts}</select>
          <input type="text" id="forge-item-search" value="${data.searchTerm}" placeholder="🔍 Search items..." style="margin-bottom:6px;font-size:0.85em;padding:4px;border:1px solid var(--color-border-light-1);border-radius:3px;">
          <div style="flex-grow:1;overflow-y:auto;border:1px solid var(--color-border-light-1);border-radius:4px;max-height:560px;">${itemRows || '<p style="padding:8px;color:#777;">No items found.</p>'}</div>
        </div>

        <!-- COLUMN 2: FORGE CONTROLS -->
        <div style="flex:1.2;display:flex;flex-direction:column;gap:8px;border-right:1px solid var(--color-border-light-2);padding-right:6px;overflow-y:auto;">
          
          ${previewHtml}
          
          <strong style="font-size:0.9em;border-bottom:1px solid var(--color-border-light-2);padding-bottom:2px;">Targeted Variances (Min to Max)</strong>
          <div style="background:rgba(0,0,0,0.02); padding: 6px; border:1px solid var(--color-border-light-1); border-radius:4px;">
            ${createSlider("Physical (Craft, AC, Damage)", "physical")}
            ${createSlider("Durability (HP, Hardness)", "durability")}
            ${createSlider("Precision (Crit Range, Mult)", "precision")}
            ${createSlider("Magic (Enhancement, Dice)", "magic")}
          </div>

          <label style="font-size:0.8em;font-weight:bold;">Enhancement Bonus</label>
          <select id="forge-enh-level" style="width:100%;padding:3px;font-size:0.85em;">
            <option value="0" ${data.magicLevel===0?"selected":""}>Mundane (+0)</option>
            <option value="1" ${data.magicLevel===1?"selected":""}>+1 (+10 Scaled)</option>
            <option value="2" ${data.magicLevel===2?"selected":""}>+2 (+20 Scaled)</option>
            <option value="3" ${data.magicLevel===3?"selected":""}>+3 (+30 Scaled)</option>
            <option value="4" ${data.magicLevel===4?"selected":""}>+4 (+40 Scaled)</option>
            <option value="5" ${data.magicLevel===5?"selected":""}>+5 (+50 Scaled)</option>
          </select>

          <label style="font-size:0.8em;font-weight:bold;">Special Material</label>
          <select id="forge-material" style="font-size:0.85em;padding:3px;">${matOpts}</select>

          <strong style="font-size:0.8em;margin-top:4px;">Magic Properties</strong>
          <div style="max-height: 120px; overflow-y: auto; border: 1px solid var(--color-border-light-1); padding: 4px; border-radius: 3px; background: rgba(0,0,0,0.02);">
             ${propRows || '<span style="color:#777; font-size:0.8em;">No properties available.</span>'}
          </div>
          <div style="display: flex; gap: 4px;">
             <button type="button" id="forge-random-prop" style="flex:1; font-size: 0.8em; padding: 2px;">🎲 Random</button>
             <button type="button" id="forge-new-custom-prop" style="flex:1; font-size: 0.8em; padding: 2px;">➕ New Custom</button>
          </div>

          <label style="display:flex;align-items:center;gap:6px;font-size:0.85em;margin-top:4px;cursor:pointer;">
            <input type="checkbox" id="forge-short-names" ${data.useShortNames ? "checked" : ""}>
            <span>Use Compound Short Names (e.g. <em>Mastercraft Sunstrike</em>)</span>
          </label>

          <button id="forge-gen-btn" style="margin-top:auto;padding:8px;font-weight:bold;background:#2f3542;color:#fff;border-radius:4px;cursor:pointer;border:1px solid #1e272e;">⚡ Forge Granular Item</button>
        </div>

        <!-- COLUMN 3: INSPECTION WINDOW -->
        <div style="flex:1.1;display:flex;flex-direction:column;gap:6px;">
          <strong style="font-size:0.9em;border-bottom:1px solid var(--color-border-light-2);padding-bottom:2px;">Inspection Window</strong>
          <div style="flex-grow:1;border:2px dashed var(--color-border-dark);border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center; overflow-y:auto;">
            ${data.generated ? `
              <img src="${data.generated.img}" width="42" height="42" style="border-radius:4px;margin-bottom:4px;" />
              <strong style="font-size:0.9em;">${data.generated.name}</strong>
              <div style="font-size:0.75em;text-align:left;width:100%;margin-top:4px;background:rgba(0,0,0,0.03);padding:6px;border-radius:4px;line-height:1.3;">
                ${data.generated.system?.armor ? `
                  <div><strong>Armor AC:</strong> +${data.generated.system.armor.value} | <strong>ACP:</strong> ${data.generated.system.armor.acp}</div>
                  <div><strong>Max Dex:</strong> +${data.generated.system.armor.dex ?? "∞"}</div>
                ` : `
                  <div><strong>Damage:</strong> ${data.generated.system?.actions?.[0]?.damage?.parts?.map(p => p.formula).join(" + ") || "N/A"}</div>
                  <div><strong>Crit Threat:</strong> ${data.generated.system?.actions?.[0]?.critRange}+ (×${data.generated.system?.actions?.[0]?.critMult})</div>
                `}
                <div><strong>Hardness:</strong> ${data.generated.system.hardness} | <strong>HP:</strong> ${data.generated.system.hp?.max}</div>
                <div><strong>Enhancement:</strong> +${data.generated.system.enh || 0}</div>
              </div>
              
              <div style="font-size:0.7em; text-align:left; width:100%; margin-top:6px; background:#f1f2f6; padding:6px; border-radius:4px; border:1px solid #ced6e0;">
                <strong style="border-bottom:1px solid #ced6e0; display:block; padding-bottom:2px; margin-bottom:4px;">Roll Variance Log</strong>
                ${data.rollLogHtml}
              </div>

              <div class="forge-drag-card" draggable="true" style="margin-top:8px;padding:4px 10px;background:#dfe4ea;border:1px solid #747d8c;border-radius:4px;cursor:grab;font-weight:bold;font-size:0.8em;">📦 Drag to Sheet</div>
            ` : '<span style="color:#777;font-size:0.8em;">Select base item and configure parameters to forge.</span>'}
          </div>
        </div>

      </div>
    `;
    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    // Updates variances on change
    html.find('.forge-var-min, .forge-var-max').change(e => {
        const cat = e.target.dataset.cat;
        const isMin = e.target.classList.contains("forge-var-min");
        this.variances[cat][isMin ? "min" : "max"] = parseFloat(e.target.value) || 0;
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
        const isWeapon = this.selectedBaseItem?.type === "weapon";
        const baseProps = isWeapon ? WEAPON_ENCHANTMENTS : ARMOR_ENCHANTMENTS;
        const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
        const allKeys = Object.keys({ ...baseProps, ...customProps });
        if (allKeys.length === 0) return;
        const randomKey = allKeys[Math.floor(Math.random() * allKeys.length)];
        this.selectedProperties.clear();
        this.selectedProperties.add(randomKey);
        this.render();
    });

    // Custom Property Dialog
    html.find('#forge-new-custom-prop').click(async () => {
        new Dialog({
            title: "Create Custom Magic Property",
            content: `
              <form>
                <div class="form-group"><label>Property Name</label><input type="text" id="cp-name" placeholder="e.g. Sonic, Thundering" required></div>
                <div class="form-group"><label>Enhancement Cost (+)</label><input type="number" id="cp-cost" value="1" min="0"></div>
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
                        const isDice = dHtml.find('#cp-isDice').is(':checked');
                        const numDice = parseInt(dHtml.find('#cp-numDice').val()) || 1;
                        const type = dHtml.find('#cp-type').val().trim() || "untyped";
                        const note = dHtml.find('#cp-note').val().trim();

                        const newProp = { baseName: name, cost, note, title: name };
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

      const newItemData = this.selectedBaseItem.toObject();
      const isWeapon = newItemData.type === "weapon";
      const baseProps = isWeapon ? WEAPON_ENCHANTMENTS : ARMOR_ENCHANTMENTS;
      const customProps = game.settings.get(MODULE_ID, "customProperties") || {};
      const propRegistry = { ...baseProps, ...customProps };
      const mat = SPECIAL_MATERIALS[this.selectedMaterial];

      const tagsList = [];
      const identifiedTraits = [];
      let logOutput = ""; // Tracks decimal results

      newItemData.flags = newItemData.flags || {};
      newItemData.flags[MODULE_ID] = newItemData.flags[MODULE_ID] || {};
      newItemData.flags[MODULE_ID].disable10xCard = true; 
      newItemData.flags[MODULE_ID].is10xScaled = true; 

      // Native Masterwork Injection
      if (this.magicLevel > 0 || this.selectedProperties.size > 0 || mat.name === "Adamantine" || mat.name === "Mithral") {
          newItemData.system.masterwork = true;
      }

      // Exact Decimal Roller per Category
      const rollStat = (label, category) => {
        const min = this.variances[category].min / 100;
        const max = this.variances[category].max / 100;
        const rollMult = 1.0 + (min + Math.random() * (max - min));
        
        // Purely cosmetic tier assigning for the Name Prefix
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
      logOutput += `<div><strong>Physical Multiplier:</strong> ${((craftRoll.mult - 1)*100).toFixed(2)}%</div>`;

      // Durability & Hardness
      const hardRoll = rollStat("Hardness", "durability");
      const hpRoll = rollStat("Hit Points", "durability");
      logOutput += `<div><strong>Hardness/HP Multipliers:</strong> ${((hardRoll.mult - 1)*100).toFixed(2)}% / ${((hpRoll.mult - 1)*100).toFixed(2)}%</div>`;
      
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

      // Armor Stats
      if (newItemData.system?.armor) {
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

      // Weapon Actions: Continuous Crit & Iteratives
      if (newItemData.system?.actions) {
        const critRangeRoll = rollStat("Crit Threat", "precision");
        const critMultRoll = rollStat("Crit Mult", "precision");
        logOutput += `<div><strong>Crit Range/Mult Multipliers:</strong> ${((critRangeRoll.mult - 1)*100).toFixed(2)}% / ${((critMultRoll.mult - 1)*100).toFixed(2)}%</div>`;

        newItemData.system.actions.forEach(action => {
          action.ability = action.ability || {}; 
          
          // ─── THE NEW 10x ITERATIVE ATTACK INJECTION ───
          // Bypasses the 40 attacks at high BAB problem!
          action.extraAttacks = [{
              type: "custom",
              name: "10x Iteratives",
              countFormula: "max(0, floor((@attributes.bab.total - 10) / 50))",
              modifierFormula: "-50 * (@idx + 1)"
          }];
          identifiedTraits.push(`<strong>Iterative Form:</strong> Custom 10x progression injected.`);
          
          // ─── CONTINUOUS CRIT THREAT RANGE (+/- 10 VARIANCE) ───
          let critBase = action.ability.critRange ?? action.critRange;
          if (critBase === undefined || critBase === null || critBase === "") {
              critBase = 191; 
          } else {
              critBase = Number(critBase);
              if (!isNaN(critBase) && critBase <= 20) critBase = (critBase * 10) - 9;
          }

          // Exact continuous shift: If delta is +0.25 (25%), shift drops by 10 (e.g. 191 -> 181)
          const rangeShift = (critRangeRoll.mult - 1.0) * 40; 
          let finalCrit = Math.min(199, Math.max(100, Math.round(critBase - rangeShift)));
          action.critRange = finalCrit;
          action.ability.critRange = finalCrit;

          // ─── CONTINUOUS DECIMAL CRIT MULTIPLIER ───
          let baseMult = action.ability.critMult ?? action.critMult ?? 2.0;
          // Exact continuous shift: If delta is +0.25 (25%), adds +0.5 to multiplier
          let multShift = (critMultRoll.mult - 1.0) * 2; 
          let finalMult = Math.max(1.0, Math.round((Number(baseMult) + multShift) * 100) / 100);

          action.critMult = finalMult;
          action.ability.critMult = finalMult;

          identifiedTraits.push(`<strong>Precision:</strong> Crit range ${action.critRange}–200, multiplier ×${action.critMult}.`);

          for (const propKey of this.selectedProperties) {
             const prop = propRegistry[propKey];
             if (!prop) continue;

             if (prop.isDice) {
                const pRoll = rollStat(`${prop.baseName} Tier`, "magic");
                
                // ─── CONTINUOUS EXACT DICE STEPPING (e.g., 1d62, 1d76) ───
                const numDice = prop.numDice || 1;
                // Ratio compares the multiplier directly to a 0.25 block.
                const varianceRatio = (pRoll.mult - 1.0) / 0.25; 
                // Exactly scales continuous faces (1.0 = 60 faces, 1.25 = 80 faces, 0.75 = 40 faces)
                let faces = Math.round(60 + (varianceRatio * 20));
                faces = Math.max(1, faces); // Prevent impossible dice

                let titlePrefix = prop.baseName;
                if (pRoll.mult > 1.15) titlePrefix = `Supreme ${prop.baseName}`;
                else if (pRoll.mult < 0.85) titlePrefix = `Weak ${prop.baseName}`;
                propPrefixes.push(titlePrefix);
  
                action.damage.parts.push({
                  formula: `${numDice}d${faces}`,
                  type: { values: [prop.type], custom: "" }
                });
                identifiedTraits.push(`<strong>${titlePrefix} Property:</strong> Infuses attacks with +${numDice}d${faces} ${prop.type} damage.`);
             } else {
                tagsList.push(`Property: ${prop.title || prop.baseName}`);
                if (prop.title?.startsWith("of ")) propSuffixes.push(prop.title);
                else propPrefixes.push(prop.title || prop.baseName);
                if (prop.actionMod) prop.actionMod(action);
                if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
             }
          }
        });
      }

      // Armor Properties
      if (!isWeapon) {
          for (const propKey of this.selectedProperties) {
             const prop = propRegistry[propKey];
             if (!prop) continue;

             if (prop.bonusMath) {
                const pRoll = rollStat(`${prop.baseName} Tier`, "magic");
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

      // Magical Enhancement
      let enhSuffix = "";
      if (this.magicLevel > 0) {
        const enhRoll = rollStat("Magic Enhancement", "magic");
        newItemData.system.enh = Math.max(1, Math.round((this.magicLevel * 10) * enhRoll.mult));
        const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
        enhSuffix = titles[this.magicLevel] || "";
        identifiedTraits.push(`<strong>Enhancement Bonus (+${newItemData.system.enh}):</strong> Provides +${newItemData.system.enh} to hit/damage or Armor AC.`);
      }

      // Name Synthesis & Compound Portmanteau Logic
      const matTitle = mat.name !== "Steel" ? `${mat.name} ` : "";
      let finalName = "";

      if (this.useShortCompoundNames && this.selectedProperties.size === 1) {
          const singlePropKey = Array.from(this.selectedProperties)[0];
          const fusionKey = `${this.magicLevel}_${singlePropKey}`;
          if (COMPOUND_FUSIONS[fusionKey]) {
             finalName = `${prefix} ${matTitle}${COMPOUND_FUSIONS[fusionKey]} ${this.selectedBaseItem.name}`.trim();
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