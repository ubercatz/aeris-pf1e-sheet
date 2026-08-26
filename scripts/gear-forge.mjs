/**
 * @file gear-forge.mjs
 * Procedural 10x Gear & Enchantment Forge with Independent Variance and Native Tagging
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
    this.variance = 25;
    this.magicLevel = 0;
    this.selectedMaterial = "steel";
    this.propertyMode = "random";
    this.useShortCompoundNames = true;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-granular-forge",
      title: "10x Procedural Gear & Enchantment Forge",
      template: "",
      width: 940,
      height: 680,
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
    const availableProperties = isWeapon ? WEAPON_ENCHANTMENTS : ARMOR_ENCHANTMENTS;

    return {
      packs: packChoices,
      selectedCompendium: this.selectedCompendium,
      items: this.compendiumItems,
      selectedItem: this.selectedBaseItem,
      generated: this.generatedItemData,
      variance: this.variance,
      magicLevel: this.magicLevel,
      material: this.selectedMaterial,
      materials: SPECIAL_MATERIALS,
      propertyMode: this.propertyMode,
      properties: availableProperties,
      isWeapon,
      useShortNames: this.useShortCompoundNames
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

    const propOpts = `
      <option value="none" ${data.propertyMode === "none" ? "selected" : ""}>None (Mundane / Standard)</option>
      <option value="random" ${data.propertyMode === "random" ? "selected" : ""}>🎲 Random Compatible Property</option>
      ${Object.entries(data.properties).map(([k, v]) => `<option value="${k}" ${data.propertyMode === k ? "selected" : ""}>${v.baseName} (+${v.cost})</option>`).join("")}
    `;

    const html = `
      <div style="display:flex;height:100%;gap:10px;padding:6px;font-family:var(--font-primary);">
        
        <!-- COLUMN 1: COMPENDIUM SELECTION -->
        <div style="flex:1;display:flex;flex-direction:column;border-right:1px solid var(--color-border-light-2);padding-right:6px;">
          <label style="font-weight:bold;font-size:0.8em;margin-bottom:2px;">Compendium Pack</label>
          <select id="forge-pack-select" style="margin-bottom:6px;font-size:0.85em;padding:3px;">${packOpts}</select>
          <div style="flex-grow:1;overflow-y:auto;border:1px solid var(--color-border-light-1);border-radius:4px;max-height:500px;">${itemRows || '<p style="padding:8px;color:#777;">No items found.</p>'}</div>
        </div>

        <!-- COLUMN 2: INDEPENDENT VARIANCE MATRIX -->
        <div style="flex:1.2;display:flex;flex-direction:column;gap:8px;border-right:1px solid var(--color-border-light-2);padding-right:6px;overflow-y:auto;">
          <strong style="font-size:0.9em;border-bottom:1px solid var(--color-border-light-2);padding-bottom:2px;">Independent Rolls Matrix</strong>
          
          <div style="display:flex;gap:6px;">
            <div style="flex:1;">
              <label style="font-size:0.8em;font-weight:bold;">Roll Variance (±%)</label>
              <input type="number" id="forge-variance" value="${data.variance}" min="0" max="100" style="width:100%;padding:3px;font-size:0.85em;"/>
            </div>
            <div style="flex:1;">
              <label style="font-size:0.8em;font-weight:bold;">Enhancement</label>
              <select id="forge-enh-level" style="width:100%;padding:3px;font-size:0.85em;">
                <option value="0" ${data.magicLevel===0?"selected":""}>Mundane (+0)</option>
                <option value="1" ${data.magicLevel===1?"selected":""}>+1 (+10 Scaled)</option>
                <option value="2" ${data.magicLevel===2?"selected":""}>+2 (+20 Scaled)</option>
                <option value="3" ${data.magicLevel===3?"selected":""}>+3 (+30 Scaled)</option>
                <option value="4" ${data.magicLevel===4?"selected":""}>+4 (+40 Scaled)</option>
                <option value="5" ${data.magicLevel===5?"selected":""}>+5 (+50 Scaled)</option>
              </select>
            </div>
          </div>

          <label style="font-size:0.8em;font-weight:bold;">Special Material</label>
          <select id="forge-material" style="font-size:0.85em;padding:3px;">${matOpts}</select>

          <label style="font-size:0.8em;font-weight:bold;">Magic Property</label>
          <select id="forge-property-mode" style="font-size:0.85em;padding:3px;">${propOpts}</select>

          <label style="display:flex;align-items:center;gap:6px;font-size:0.85em;margin-top:4px;cursor:pointer;">
            <input type="checkbox" id="forge-short-names" ${data.useShortNames ? "checked" : ""}>
            <span>Use Compound Short Names (e.g. <em>Mastercraft Sunstrike</em>)</span>
          </label>

          <button id="forge-gen-btn" style="margin-top:auto;padding:8px;font-weight:bold;background:#2f3542;color:#fff;border-radius:4px;cursor:pointer;border:1px solid #1e272e;">⚡ Forge Granular Item</button>
        </div>

        <!-- COLUMN 3: OUTPUT CARD & DRAGGABLE TARGET -->
        <div style="flex:1.1;display:flex;flex-direction:column;gap:6px;">
          <strong style="font-size:0.9em;border-bottom:1px solid var(--color-border-light-2);padding-bottom:2px;">Inspection Window</strong>
          <div style="flex-grow:1;border:2px dashed var(--color-border-dark);border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;text-align:center;">
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
              <div class="forge-drag-card" draggable="true" data-item-json='${JSON.stringify(data.generated)}' style="margin-top:8px;padding:4px 10px;background:#dfe4ea;border:1px solid #747d8c;border-radius:4px;cursor:grab;font-weight:bold;font-size:0.8em;">📦 Drag to Sheet</div>
            ` : '<span style="color:#777;font-size:0.8em;">Select base item and configure parameters to forge.</span>'}
          </div>
        </div>

      </div>
    `;
    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('#forge-pack-select').change(e => { this.selectedCompendium = e.target.value; this.selectedBaseItem = null; this.render(); });
    html.find('.gear-row').click(async e => {
      const id = $(e.currentTarget).data('id');
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) { this.selectedBaseItem = await pack.getDocument(id); this.render(); }
    });

    html.find('#forge-gen-btn').click(async () => {
      if (!this.selectedBaseItem) return ui.notifications.warn("Please select a base item first!");

      this.variance = parseFloat(html.find('#forge-variance').val()) || 25;
      this.magicLevel = parseInt(html.find('#forge-enh-level').val(), 10) || 0;
      this.selectedMaterial = html.find('#forge-material').val();
      this.propertyMode = html.find('#forge-property-mode').val();
      this.useShortCompoundNames = html.find('#forge-short-names').is(':checked');

      const newItemData = this.selectedBaseItem.toObject();
      const isWeapon = newItemData.type === "weapon";
      const propRegistry = isWeapon ? WEAPON_ENCHANTMENTS : ARMOR_ENCHANTMENTS;
      const mat = SPECIAL_MATERIALS[this.selectedMaterial];

      const tagsList = [];
      const identifiedTraits = [];

      // 1. Auto-inject Card Protection Flag[cite: 2]
      newItemData.flags = newItemData.flags || {};
      newItemData.flags[MODULE_ID] = newItemData.flags[MODULE_ID] || {};
      newItemData.flags[MODULE_ID].disable10xCard = true; // Protects rolled chat card math[cite: 2]

      // Independent 8-tier rolling resolver
      const rollStat = (label) => {
        const pct = this.variance / 100;
        const roll = (1 - pct) + Math.random() * (pct * 2);
        const bracket = (roll - 1.0) / (pct || 0.001);
        let tier = Math.ceil(bracket * 4);
        if (tier === 0) tier = bracket >= 0 ? 1 : -1;
        tier = Math.max(-4, Math.min(4, tier));
        const tierSign = tier > 0 ? `+${tier}` : `${tier}`;
        if (label) tagsList.push(`${label}: Tier ${tierSign}`);
        return { mult: roll, tier };
      };

      const tierPrefixes = {
        "-4": "Ruined", "-3": "Flawed", "-2": "Worn", "-1": "Serviceable",
        "1": "Tempered", "2": "Honed", "3": "Superior", "4": "Mastercraft"
      };

      // 2. Roll Base Craft Quality
      const craftRoll = rollStat("Craft Quality");
      const prefix = tierPrefixes[craftRoll.tier];
      identifiedTraits.push(`<strong>Craftsmanship (${prefix}):</strong> Forged to ${prefix.toLowerCase()} standards.`);

      // 3. Roll Durability & Hardness
      const hardRoll = rollStat("Hardness");
      const hpRoll = rollStat("Hit Points");
      const baseHardness = (newItemData.system.hardness || 10) * 10;
      const baseHp = (newItemData.system.hp?.max || 10) * 10;

      newItemData.system.hardness = Math.max(0, Math.round((baseHardness + mat.hardnessMod) * hardRoll.mult));
      newItemData.system.hp = newItemData.system.hp || {};
      newItemData.system.hp.max = Math.max(10, Math.round((baseHp * mat.hpMult) * hpRoll.mult));
      newItemData.system.hp.value = newItemData.system.hp.max;

      if (mat.name !== "Steel") {
        identifiedTraits.push(`<strong>Material (${mat.name}):</strong> Hardness ${newItemData.system.hardness}, HP ${newItemData.system.hp.max}. ${mat.desc}`);
      }

      // 4. Roll Armor Stats
      if (newItemData.system?.armor) {
        const acRoll = rollStat("Armor AC");
        const acpRoll = rollStat("ACP");
        let baseAc = (newItemData.system.armor.value || 0) * 10;
        let baseAcp = (newItemData.system.armor.acp || 0) * 10;

        newItemData.system.armor.value = Math.round(baseAc * acRoll.mult);
        let adjustedAcp = Math.round(baseAcp * (2.0 - acpRoll.mult));
        if (mat.acpBonus) adjustedAcp = Math.min(0, adjustedAcp + mat.acpBonus);
        newItemData.system.armor.acp = adjustedAcp;

        if (newItemData.system.armor.dex != null) {
          const dexRoll = rollStat("Max Dex");
          let adjustedDex = Math.round(newItemData.system.armor.dex * 10 * dexRoll.mult);
          if (mat.dexBonus) adjustedDex += mat.dexBonus;
          newItemData.system.armor.dex = adjustedDex;
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}, Max Dex +${newItemData.system.armor.dex}.`);
        } else {
          identifiedTraits.push(`<strong>Armor Profile:</strong> AC +${newItemData.system.armor.value}, ACP ${newItemData.system.armor.acp}.`);
        }
      }

      // Determine Property
      let activePropKey = this.propertyMode;
      if (this.propertyMode === "random") {
        const propKeys = Object.keys(propRegistry);
        activePropKey = propKeys[Math.floor(Math.random() * propKeys.length)];
      }

      let propPrefix = "";
      let propSuffix = "";

      // 5. Weapon Actions: Crit Threat, Crit Multiplier, & Property Injections
      if (newItemData.system?.actions) {
        const critRangeRoll = rollStat("Crit Threat");
        const critMultRoll = rollStat("Crit Mult");

        newItemData.system.actions.forEach(action => {
          let critBase = action.critRange && action.critRange <= 20 ? (action.critRange * 10) - 9 : (action.critRange || 191);
          action.critRange = Math.min(199, Math.max(100, Math.round(critBase - (critRangeRoll.tier * 1.5))));

          let baseMult = action.critMult || 2.0;
          let multDelta = (critMultRoll.tier / 4) * 0.5;
          action.critMult = Math.max(1.0, Math.round((baseMult + multDelta) * 100) / 100);

          identifiedTraits.push(`<strong>Precision:</strong> Crit range ${action.critRange}–200, multiplier ×${action.critMult}.`);

          if (activePropKey !== "none" && propRegistry[activePropKey]) {
            const prop = propRegistry[activePropKey];
            if (prop.isDice) {
              const pRoll = rollStat(`${prop.baseName} Tier`);
              const tierConfig = prop.tiers[pRoll.tier];
              propPrefix = tierConfig.title;

              action.damage.parts.push({
                formula: tierConfig.dice,
                type: { values: [prop.type], custom: "" }
              });
              identifiedTraits.push(`<strong>${tierConfig.title} Property:</strong> Infuses attacks with +${tierConfig.dice} ${prop.type} damage.`);
            } else {
              tagsList.push(`Property: ${prop.title || prop.baseName}`);
              if (prop.title?.startsWith("of ")) propSuffix = prop.title;
              else propPrefix = prop.title || prop.baseName;
              if (prop.actionMod) prop.actionMod(action);
              if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
            }
          }
        });
      }

      // 6. Armor Changes / Mechanics
      if (!isWeapon && activePropKey !== "none" && propRegistry[activePropKey]) {
        const prop = propRegistry[activePropKey];
        if (prop.tiers) {
          const pRoll = rollStat(`${prop.baseName} Tier`);
          const tierConfig = prop.tiers[pRoll.tier];
          if (tierConfig.title.startsWith("of ")) propSuffix = tierConfig.title;
          else propPrefix = tierConfig.title;

          if (prop.type === "skill") {
            newItemData.system.changes = newItemData.system.changes || [];
            newItemData.system.changes.push({
              formula: `${tierConfig.bonus}`,
              target: prop.target,
              operator: "add",
              type: "competence",
              priority: 0
            });
            identifiedTraits.push(`<strong>${tierConfig.title}:</strong> Grants +${tierConfig.bonus} competence bonus to skill checks.`);
          } else if (prop.type === "sr") {
            newItemData.system.changes = newItemData.system.changes || [];
            newItemData.system.changes.push({
              formula: `${tierConfig.sr}`,
              target: "spellResist",
              operator: "add",
              type: "untyped",
              priority: 0
            });
            identifiedTraits.push(`<strong>${tierConfig.title}:</strong> Grants Spell Resistance ${tierConfig.sr}.`);
          }
        } else {
          tagsList.push(`Property: ${prop.title || prop.baseName}`);
          if (prop.title?.startsWith("of ")) propSuffix = prop.title;
          else propPrefix = prop.title || prop.baseName;
          if (prop.note) identifiedTraits.push(`<strong>${prop.baseName}:</strong> ${prop.note}`);
        }
      }

      // 7. Magical Enhancement
      let enhSuffix = "";
      if (this.magicLevel > 0) {
        const enhRoll = rollStat("Magic Enhancement");
        newItemData.system.enh = Math.max(1, Math.round((this.magicLevel * 10) * enhRoll.mult));
        const titles = { 1: "of Flickering Might", 2: "of Resolute Force", 3: "of Striking Power", 4: "of Exalted Dominion", 5: "of Transcendent Power" };
        enhSuffix = titles[this.magicLevel] || "";
        identifiedTraits.push(`<strong>Enhancement Bonus (+${newItemData.system.enh}):</strong> Provides +${newItemData.system.enh} to hit/damage or Armor AC.`);
      }

      // 8. Name Synthesis & Compound Portmanteau
      const matTitle = mat.name !== "Steel" ? `${mat.name} ` : "";
      const fusionKey = `${this.magicLevel}_${activePropKey}`;
      let finalName = "";

      if (this.useShortCompoundNames && COMPOUND_FUSIONS[fusionKey]) {
        finalName = `${prefix} ${matTitle}${COMPOUND_FUSIONS[fusionKey]} ${this.selectedBaseItem.name}`.trim();
      } else {
        const pPre = propPrefix ? `${propPrefix} ` : "";
        const pSuf = propSuffix ? ` ${propSuffix}` : "";
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
      this.render();
    });

    html.find('.forge-drag-card').on('dragstart', e => {
      const itemJson = $(e.currentTarget).attr('data-item-json');
      if (itemJson) e.originalEvent.dataTransfer.setData('text/plain', JSON.stringify({ type: "Item", data: JSON.parse(itemJson) }));
    });
  }
}