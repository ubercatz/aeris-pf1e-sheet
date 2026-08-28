/**
 * @file player-workshop.mjs
 * Player-Facing Procedural Crafting & Enchanting Workbench with Tangible Materials & Sub-Skill Routing
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

export class PlayerWorkshopApp extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.activeTab = "bench"; // "bench" | "active"
    this.selectedDiscipline = "";
    this.selectedCompendium = "";
    this.compendiumItems = [];
    this.selectedBaseItem = null;
    this.selectedMaterial = "base";
    this.acceleratedDcBonus = 0; // +0, +50, +100
    this.searchTerm = "";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-player-workshop",
      title: "⚒️ Artisan's Workbench & Crafting Forge",
      template: "",
      width: 1040,
      height: 840,
      resizable: true,
      classes: ["aeris-workshop-app"]
    });
  }

  /* -------------------------------------------- */
  /* Sub-Skill Detection & Discipline Parsing     */
  /* -------------------------------------------- */

  _getAvailableCraftDisciplines() {
    const subSkills = this.actor.system?.skills?.crf?.subSkills || {};
    const disciplines = [];

    // Mapping known standard abbreviations to disciplines
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
        isGoldMode: (sub.rank || 0) >= 100
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
        isGoldMode: (this.actor.system?.skills?.crf?.rank || 0) >= 100
      });
    }

    return disciplines;
  }

  /* -------------------------------------------- */
  /* Item Filtering by Selected Discipline        */
  /* -------------------------------------------- */

  _filterCompendiumItem(item, disciplineType) {
    const type = item.type;
    const subType = (item.system?.subType || item.system?.weaponSubtype || "").toLowerCase();
    const eqType = (item.system?.equipmentType || "").toLowerCase();
    const wpnGroup = item.system?.weaponGroups || [];
    const name = item.name.toLowerCase();

    if (disciplineType === "weapon") {
      if (type !== "weapon" || subType === "ammo") return false;
      if (wpnGroup.includes("bows") || wpnGroup.includes("crossbows") || wpnGroup.includes("firearms")) return false;
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

  /* -------------------------------------------- */
  /* Tangible Ingredient Parser & Validator       */
  /* -------------------------------------------- */

  _calculateRequiredIngredients(baseItem, chosenMaterialKey) {
    const type = baseItem.type;
    const subType = (baseItem.system?.subType || baseItem.system?.weaponSubtype || "").toLowerCase();
    const name = baseItem.name.toLowerCase();
    const ingredients = [];

    const mat = SPECIAL_MATERIALS[chosenMaterialKey] || SPECIAL_MATERIALS.base;
    const metalName = mat.name !== "Base" && mat.name !== "Steel" ? `${mat.name} Ingot` : "Steel Ingot";

    // 1. Melee & Thrown Weapons
    if (type === "weapon" && subType !== "ranged" && !/\b(bow|crossbow|pistol|musket)\b/i.test(name)) {
      if (subType === "light") {
        ingredients.push({ label: metalName, pattern: new RegExp(`(${mat.name}|steel|iron|metal|bar|ingot)`, "i"), qty: 1 });
        ingredients.push({ label: "Leather Strip / Grip", pattern: /(leather|hide|strip|cord|cloth)/i, qty: 1 });
      } else if (subType === "1h") {
        ingredients.push({ label: metalName, pattern: new RegExp(`(${mat.name}|steel|iron|metal|bar|ingot)`, "i"), qty: 2 });
        ingredients.push({ label: "Wood / Leather Haft", pattern: /(wood|timber|haft|leather|grip)/i, qty: 1 });
      } else { // 2H
        ingredients.push({ label: metalName, pattern: new RegExp(`(${mat.name}|steel|iron|metal|bar|ingot)`, "i"), qty: 4 });
        ingredients.push({ label: "Reinforced Timber / Haft", pattern: /(wood|timber|haft|hardwood)/i, qty: 2 });
      }
    }

    // 2. Bows & Crossbows
    else if (type === "weapon" && /\b(bow|crossbow)\b/i.test(name)) {
      if (/\bcrossbow\b/i.test(name)) {
        ingredients.push({ label: "Hardwood Stock", pattern: /(wood|timber|stock|lumber)/i, qty: 3 });
        ingredients.push({ label: "Steel / Metal Mechanism", pattern: /(steel|iron|metal|mechanism|fittings|latch)/i, qty: 1 });
        ingredients.push({ label: "Torsion Bowstring", pattern: /(string|cord|sinew|wire)/i, qty: 1 });
      } else {
        ingredients.push({ label: "Flexible Stave (Yew/Wood)", pattern: /(wood|timber|yew|stave|darkwood)/i, qty: 2 });
        ingredients.push({ label: "Braided Bowstring", pattern: /(string|cord|sinew|hemp)/i, qty: 1 });
      }
    }

    // 3. Firearms
    else if (type === "weapon" && /\b(pistol|musket|rifle|blunderbuss)\b/i.test(name)) {
      ingredients.push({ label: "Forged Steel Barrel", pattern: /(steel|iron|barrel|ingot|metal)/i, qty: 3 });
      ingredients.push({ label: "Lock & Trigger Mechanism", pattern: /(mechanism|lock|fittings|trigger|clockwork)/i, qty: 1 });
      ingredients.push({ label: "Hardwood Stock", pattern: /(wood|timber|stock|hardwood)/i, qty: 1 });
    }

    // 4. Armor & Shields
    else if (type === "armor" || type === "shield" || baseItem.system?.armor !== undefined) {
      if (subType === "light") {
        ingredients.push({ label: "Treated Leather Hides", pattern: /(leather|hide|pelt|skin)/i, qty: 2 });
        ingredients.push({ label: "Cloth Padding", pattern: /(cloth|padding|linen|wool)/i, qty: 1 });
      } else if (subType === "medium") {
        ingredients.push({ label: metalName, pattern: new RegExp(`(${mat.name}|steel|iron|scale|ring|ingot)`, "i"), qty: 4 });
        ingredients.push({ label: "Padded Undergarment", pattern: /(leather|padding|cloth|hide)/i, qty: 2 });
      } else if (subType === "heavy") {
        ingredients.push({ label: metalName, pattern: new RegExp(`(${mat.name}|steel|iron|plate|ingot)`, "i"), qty: 6 });
        ingredients.push({ label: "Heavy Armor Padding", pattern: /(leather|padding|cloth|quilted)/i, qty: 3 });
      } else { // Shields
        ingredients.push({ label: metalName, pattern: new RegExp(`(${mat.name}|steel|iron|wood|timber|shield)`, "i"), qty: 3 });
        ingredients.push({ label: "Leather Shield Straps", pattern: /(leather|strap|grip|buckle)/i, qty: 1 });
      }
    }

    // 5. Ammunition Bundles
    else if (type === "ammo") {
      ingredients.push({ label: "Wood / Iron Rods", pattern: /(wood|timber|lead|iron|metal|bullet)/i, qty: 1 });
      ingredients.push({ label: "Fletchings / Powder Doses", pattern: /(feather|fletching|powder|casing)/i, qty: 1 });
    }

    // 6. Alchemy & Poison
    else {
      ingredients.push({ label: "Alchemical Reagents / Toxic Extract", pattern: /(reagent|extract|salt|sulfur|venom|toxin|herb)/i, qty: 2 });
      ingredients.push({ label: "Glass Vial / Ceramic Flask", pattern: /(flask|vial|bottle|glass|jar)/i, qty: 1 });
    }

    // Inspect player inventory for matching items
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

  /* -------------------------------------------- */
  /* Data Preparation                             */
  /* -------------------------------------------- */

  async getData() {
    const rawProjects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
    const disciplines = this._getAvailableCraftDisciplines();

    if (!this.selectedDiscipline && disciplines.length > 0) {
      this.selectedDiscipline = disciplines[0].key;
    }

    const currentDiscipline = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];

    const packs = game.packs.filter(p => p.documentName === "Item");
    const packChoices = packs.reduce((acc, p) => { acc[p.collection] = p.metadata.label; return acc; }, {});
    
    if (!this.selectedCompendium && packs.length > 0) {
      const defPack = packs.find(p => p.collection.includes("weapon") || p.collection.includes("equipment")) || packs[0];
      this.selectedCompendium = defPack.collection;
    }

    if (this.selectedCompendium) {
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) {
        const rawIndex = await pack.getIndex({
          fields: ["system.subType", "system.weaponSubtype", "system.equipmentType", "system.armor", "system.slot", "system.price", "system.weaponGroups", "system.baseTypes"]
        });
        this.compendiumItems = rawIndex.filter(i => this._filterCompendiumItem(i, currentDiscipline.type));
      }
    }

    let ingredientsInfo = { list: [], allSatisfied: false };
    if (this.selectedBaseItem) {
      ingredientsInfo = this._calculateRequiredIngredients(this.selectedBaseItem, this.selectedMaterial);
    }

    return {
      actor: this.actor,
      activeTab: this.activeTab,
      disciplines,
      selectedDiscipline: this.selectedDiscipline,
      currentDiscipline,
      packs: packChoices,
      selectedCompendium: this.selectedCompendium,
      items: this.compendiumItems,
      selectedBaseItem: this.selectedBaseItem,
      selectedMaterial: this.selectedMaterial,
      materials: SPECIAL_MATERIALS,
      acceleratedDcBonus: this.acceleratedDcBonus,
      ingredientsInfo,
      projects: rawProjects,
      searchTerm: this.searchTerm
    };
  }

  /* -------------------------------------------- */
  /* HTML Template Rendering                      */
  /* -------------------------------------------- */

  async _renderInner(data) {
    const discOpts = data.disciplines.map(d => 
      `<option value="${d.key}" ${d.key === data.selectedDiscipline ? "selected" : ""}>${d.label} (+${d.mod} | ${d.rank} Ranks${d.isGoldMode ? ' ⚡ Gold Mode' : ''})</option>`
    ).join("");

    const packOpts = Object.entries(data.packs).map(([k, v]) => 
      `<option value="${k}" ${k === data.selectedCompendium ? "selected" : ""}>${v}</option>`
    ).join("");

    const matOpts = Object.entries(data.materials).map(([k, v]) => 
      `<option value="${k}" ${k === data.selectedMaterial ? "selected" : ""}>${v.name}</option>`
    ).join("");

    const itemRows = data.items.map(i => `
      <div class="bench-item-row ${data.selectedBaseItem?._id === i._id ? "selected" : ""}" data-id="${i._id}" style="display:flex; align-items:center; gap:6px; padding:5px; cursor:pointer; border-bottom:1px solid rgba(0,0,0,0.06); background:${data.selectedBaseItem?._id === i._id ? "rgba(46,204,113,0.15)" : "transparent"};">
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
              <span style="font-size:0.8em; color:#666; margin-left:6px;">(DC ${proj.dc} | Material: ${proj.material})</span>
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
              Active Phase: ${proj.shiftsLogged.length < Math.floor(proj.requiredRolls/3) ? "Smelting & Durability (Phase 1)" : proj.shiftsLogged.length < Math.floor(proj.requiredRolls*2/3) ? "Forging & Physical Geometry (Phase 2)" : "Honing & Precision Edge (Phase 3)"}
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
    }).join("") : '<p style="text-align:center; color:#777; padding:24px;">No active crafting projects in progress. Choose a blueprint on the Recipe Bench!</p>';

    const html = `
      <div style="display:flex; flex-direction:column; height:100%; gap:8px; padding:8px; font-family:var(--font-primary);">
        
        <!-- HEADER NAVIGATION TABS -->
        <nav style="display:flex; gap:8px; border-bottom:2px solid var(--color-border-light-2); padding-bottom:6px;">
          <button type="button" class="workshop-tab-btn ${data.activeTab === "bench" ? "active" : ""}" data-tab="bench" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "bench" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "bench" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            📐 Recipe Bench (New Project)
          </button>
          <button type="button" class="workshop-tab-btn ${data.activeTab === "active" ? "active" : ""}" data-tab="active" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "active" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "active" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ⚒️ Active Crafting Projects (${data.projects.length})
          </button>
        </nav>

        ${data.activeTab === "bench" ? `
          <!-- BENCH TAB -->
          <div style="display:flex; flex:1; gap:12px; overflow:hidden;">
            
            <!-- COLUMN 1: DISCIPLINE & COMPENDIUM SELECTION -->
            <div style="flex:1.2; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
              <div style="display:flex; gap:6px;">
                <div style="flex:1;">
                  <label style="font-size:0.8em; font-weight:bold;">Active Craft Discipline</label>
                  <select id="workshop-discipline-select" style="width:100%; padding:3px; font-size:0.85em;">${discOpts}</select>
                </div>
                <div style="flex:1;">
                  <label style="font-size:0.8em; font-weight:bold;">Source Compendium</label>
                  <select id="workshop-pack-select" style="width:100%; padding:3px; font-size:0.85em;">${packOpts}</select>
                </div>
              </div>

              <input type="text" id="workshop-search-input" value="${data.searchTerm}" placeholder="🔍 Search ${data.currentDiscipline.label} blueprints..." style="padding:4px; font-size:0.85em; border:1px solid #ced6e0; border-radius:3px;">
              
              <div style="flex-grow:1; max-height:480px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                ${itemRows || `<p style="padding:10px; font-size:0.85em; color:#777;">No blueprints matching ${data.currentDiscipline.label} found in this compendium.</p>`}
              </div>
            </div>

            <!-- COLUMN 2: RECIPE & INGREDIENT REQUIREMENTS -->
            <div style="flex:1.1; display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.02); padding:10px; border-radius:6px; border:1px solid #ced6e0; overflow-y:auto;">
              <strong style="font-size:0.95em; border-bottom:1px solid #ccc; padding-bottom:3px;">Forging Blueprint & Material Requirements</strong>
              
              ${data.selectedBaseItem ? `
                <div style="font-size:0.85em; line-height:1.4;">
                  <div style="display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                    <img src="${data.selectedBaseItem.img}" width="32" height="32" style="border-radius:3px;" />
                    <div>
                      <strong style="font-size:1.05em;">${data.selectedBaseItem.name}</strong><br/>
                      <span style="color:#555;">Mundane Cost: ${data.selectedBaseItem.system?.price || 0} GP | Target Goal: ${(data.selectedBaseItem.system?.price || 10) + 300} GP</span>
                    </div>
                  </div>

                  <div style="display:flex; gap:6px; margin-bottom:8px;">
                    <div style="flex:1;">
                      <label style="font-size:0.8em; font-weight:bold;">Material</label>
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

                  <!-- TANGIBLE INGREDIENTS LIST -->
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
                    <div>• <strong>Minimum Shifts Required:</strong> ${Math.max(3, Math.ceil(((data.selectedBaseItem.system?.price || 10) + 300) / (data.currentDiscipline.isGoldMode ? 150 : 35)))} Shifts</div>
                  </div>
                </div>

                <button type="button" id="start-project-btn" ${!data.ingredientsInfo.allSatisfied ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''} style="margin-top:auto; padding:10px; font-weight:bold; background:#2f3542; color:#fff; border:none; border-radius:4px; cursor:pointer;">
                  ${data.ingredientsInfo.allSatisfied ? '🔥 Consume Materials & Begin Project' : '⚠️ Missing Required Ingredients in Inventory'}
                </button>
              ` : '<p style="text-align:center; color:#777; margin-top:60px;">Select an equipment blueprint on the left to verify required inventory materials.</p>'}
            </div>
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
  /* Event Listeners & Craft Execution Logic      */
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

    html.find('#workshop-pack-select').change(e => {
      this.selectedCompendium = e.target.value;
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
      const pack = game.packs.get(this.selectedCompendium);
      if (pack) {
        this.selectedBaseItem = await pack.getDocument(id);
        this.render();
      }
    });

    html.find('#workshop-material-select').change(e => {
      this.selectedMaterial = e.target.value;
      this.render();
    });

    html.find('#workshop-acc-dc').change(e => {
      this.acceleratedDcBonus = parseInt(e.target.value, 10) || 0;
      this.render();
    });

    /* -------------------------------------------- */
    /* Consume Materials & Begin Project            */
    /* -------------------------------------------- */
    html.find('#start-project-btn').click(async () => {
      if (!this.selectedBaseItem) return;

      const ingredientsInfo = this._calculateRequiredIngredients(this.selectedBaseItem, this.selectedMaterial);
      if (!ingredientsInfo.allSatisfied) {
        return ui.notifications.error("You do not have all required tangible materials in your inventory!");
      }

      // Deduct items from inventory
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
      const targetGp = basePrice + 300;
      const disciplines = this._getAvailableCraftDisciplines();
      const currentDisc = disciplines.find(d => d.key === this.selectedDiscipline) || disciplines[0];
      const divisor = currentDisc.isGoldMode ? 150 : 35;
      const requiredRolls = Math.max(3, Math.ceil(targetGp / divisor));
      const dc = 150 + this.acceleratedDcBonus;

      const newProject = {
        id: foundry.utils.randomID(),
        name: `Masterwork ${this.selectedBaseItem.name}`,
        baseItemId: this.selectedBaseItem.id,
        baseItemData: this.selectedBaseItem.toObject(),
        material: this.selectedMaterial,
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

      ui.notifications.info(`Deducted materials and initialized forging project for ${newProject.name}!`);
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

      // Failure Condition: Project Ruin
      if (proj.failedChecks >= failLimit || (proj.shiftsLogged.length > 1 && proj.currentGp <= 0)) {
        ui.notifications.error(`Project Ruined! The forging of ${proj.name} collapsed. 50% scrap materials returned.`);
        
        // Salvage 50% materials back to inventory
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

      // Early Gold Completion: Roll remaining modifier checks immediately without time loss
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
    /* Claim Finished Item                          */
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

      // Chronological 3-Phase Variance Mapping
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

      itemData.flags = itemData.flags || {};
      itemData.flags[MODULE_ID] = { is10xScaled: true, disable10xSheet: true, disable10xCard: true };
      itemData.system.masterwork = true;
      itemData.system.identified = true;

      // Apply Phase 1: Durability, Hardness, and HP
      let bHard = (typeof itemData.system.hardness === "object" ? itemData.system.hardness.value : itemData.system.hardness) || 0;
      let bHp = (itemData.system.hp?.base ?? itemData.system.hp?.max ?? 0);
      itemData.system.hardness = Math.max(0, Math.round((bHard * 10 + mat.hardnessMod) * hardMult));
      const fHp = Math.max(1, Math.round((bHp * 10 * mat.hpMult) * hardMult));
      itemData.system.hp = { base: fHp, max: fHp, value: fHp };

      // Apply Phase 2: Physical AC, ACP & Weight
      if (isArmor && itemData.system?.armor) {
        itemData.system.armor.value = Math.round((itemData.system.armor.value || 0) * 10 * physMult);
        let adjAcp = Math.round((itemData.system.armor.acp || 0) * 10 * (2.0 - physMult));
        if (mat.acpBonus) adjAcp = Math.min(0, adjAcp + mat.acpBonus);
        itemData.system.armor.acp = adjAcp;
      }

      // Apply Phase 3: Precision, Crit Threat & Multipliers
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
      }

      const matTitle = mat.name !== "Base" && mat.name !== "Steel" ? `${mat.name} ` : "";
      itemData.name = `${prefix} ${matTitle}${itemData.name}`.trim();
      itemData.system.tags = [
        `Craft Quality: Tier ${tier > 0 ? `+${tier}` : tier}`,
        `Hardness: Tier ${hardMult >= 1 ? '+1' : '-1'}`,
        `Physical: Tier ${physMult >= 1 ? '+1' : '-1'}`
      ];

      await this.actor.createEmbeddedDocuments("Item", [itemData]);
      projects.splice(idx, 1);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      ui.notifications.info(`Successfully finished and added ${itemData.name} to inventory!`);
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
}