/**
 * @file player-workshop.mjs
 * Player-Facing Procedural Crafting & Enchanting Workbench
 */

import { SPECIAL_MATERIALS, WEAPON_ENCHANTMENTS, ARMOR_ENCHANTMENTS, COMPOUND_FUSIONS } from "./enchantment-registry.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

export class PlayerWorkshopApp extends Application {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.activeTab = "bench"; // "bench" | "active" | "magic"
    this.selectedBaseItem = null;
    this.selectedMaterial = "base";
    this.acceleratedDcBonus = 0; // +0, +50, +100
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "aeris-player-workshop",
      title: "⚒️ Artisan's Workbench & Crafting Forge",
      template: "",
      width: 960,
      height: 760,
      resizable: true,
      classes: ["aeris-workshop-app"]
    });
  }

  /* -------------------------------------------- */
  /* Material Requirements & Skill Helpers        */
  /* -------------------------------------------- */

  _getMaterialRequirements(item) {
    const type = item.type;
    const subType = item.system?.subType || item.system?.weaponSubtype || "";
    const eqType = item.system?.equipmentType || "";

    if (type === "weapon") {
      if (subType === "light") return item.system?.subType === "exotic" ? 3 : item.system?.subType === "martial" ? 2 : 1;
      if (subType === "1h") return item.system?.subType === "exotic" ? 4 : item.system?.subType === "martial" ? 3 : 2;
      if (subType === "2h") return item.system?.subType === "exotic" ? 6 : item.system?.subType === "martial" ? 5 : 3;
      if (subType === "ranged") return 4;
      return 2;
    }

    if (type === "armor" || type === "shield" || eqType === "armor" || eqType === "shield") {
      if (subType === "light") return 2;
      if (subType === "medium") return 4;
      if (subType === "heavy") return 6;
      if (type === "shield" || subType === "shield") return 3;
      return 3;
    }

    if (type === "ammo" || subType === "ammo") return 1;
    return 2;
  }

  _getActorSkillInfo(itemType) {
    const skills = this.actor.system?.skills || {};
    let relevantSkill = skills.crf || { rank: 0, mod: 0 };
    let skillName = "Craft (General)";

    if (itemType === "weapon") {
      relevantSkill = skills["crf.arm"] || skills["crf.wea"] || skills.crf || { rank: 0, mod: 0 };
      skillName = "Craft (Weapons)";
    } else if (itemType === "armor" || itemType === "shield") {
      relevantSkill = skills["crf.arm"] || skills.crf || { rank: 0, mod: 0 };
      skillName = "Craft (Armor)";
    }

    const rank = relevantSkill.rank || 0;
    const isGoldMode = rank >= 100;
    return { rank, mod: relevantSkill.mod || 0, isGoldMode, skillName };
  }

  /* -------------------------------------------- */
  /* Data Preparation                             */
  /* -------------------------------------------- */

  async getData() {
    const rawProjects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
    const inventoryItems = this.actor.items.contents;

    // Filter candidate items for the crafting bench
    const craftableItems = inventoryItems.filter(i => 
      ["weapon", "armor", "equipment", "ammo"].includes(i.type) && !i.getFlag(MODULE_ID, "is10xScaled")
    );

    const masterworkBases = inventoryItems.filter(i => 
      i.system.masterwork === true && ["weapon", "armor", "equipment"].includes(i.type)
    );

    return {
      actor: this.actor,
      activeTab: this.activeTab,
      projects: rawProjects,
      craftableItems,
      masterworkBases,
      selectedBaseItem: this.selectedBaseItem,
      selectedMaterial: this.selectedMaterial,
      materials: SPECIAL_MATERIALS,
      acceleratedDcBonus: this.acceleratedDcBonus
    };
  }

  /* -------------------------------------------- */
  /* HTML Rendering                               */
  /* -------------------------------------------- */

  async _renderInner(data) {
    const matOpts = Object.entries(data.materials).map(([k, v]) => 
      `<option value="${k}" ${k === data.selectedMaterial ? "selected" : ""}>${v.name}</option>`
    ).join("");

    const activeProjectsHtml = data.projects.length > 0 ? data.projects.map((proj, idx) => {
      const pct = Math.min(100, Math.round((proj.currentGp / proj.targetGp) * 100));
      const failLimit = Math.max(2, Math.floor(proj.requiredRolls / 3));
      return `
        <div style="background:#fff; border:1px solid #ced6e0; border-radius:6px; padding:10px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div>
              <strong style="font-size:1.05em; color:var(--color-text-dark-primary);">${proj.name}</strong>
              <span style="font-size:0.8em; color:#666; margin-left:6px;">(DC ${proj.dc} | Mat: ${proj.material})</span>
            </div>
            <div>
              <span style="font-size:0.8em; font-weight:bold; color:${proj.failedChecks >= failLimit - 1 ? '#c0392b' : '#555'};">
                Strikes: ${proj.failedChecks} / ${failLimit}
              </span>
            </div>
          </div>

          <!-- ANIMATED PROGRESS BAR -->
          <div style="background:#e0e0e0; border-radius:4px; height:16px; width:100%; overflow:hidden; position:relative; margin-bottom:6px;">
            <div style="background:linear-gradient(90deg, #2ecc71, #27ae60); height:100%; width:${pct}%; transition:width 0.3s ease;"></div>
            <span style="position:absolute; width:100%; text-align:center; top:0; left:0; font-size:0.75em; line-height:16px; font-weight:bold; color:#111;">
              ${proj.currentGp.toFixed(1)} / ${proj.targetGp} GP (${pct}%) - Shift ${proj.shiftsLogged.length}/${proj.requiredRolls}
            </span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.75em; color:#777;">Phase: ${proj.shiftsLogged.length < Math.floor(proj.requiredRolls/3) ? "Smelting & Ingot Prep" : proj.shiftsLogged.length < Math.floor(proj.requiredRolls*2/3) ? "Forging & Geometry" : "Honing & Edge Finishing"}</span>
            <div style="display:flex; gap:6px;">
              ${pct >= 100 ? `
                <button type="button" class="claim-project-btn" data-idx="${idx}" style="background:#27ae60; color:#fff; font-size:0.8em; padding:3px 10px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  ✨ Claim Finished Item
                </button>
              ` : `
                <button type="button" class="work-shift-btn" data-idx="${idx}" style="background:#2f3542; color:#fff; font-size:0.8em; padding:3px 10px; font-weight:bold; border:none; border-radius:3px; cursor:pointer;">
                  🔨 Work 1-Hour Shift
                </button>
              `}
              <button type="button" class="abandon-project-btn" data-idx="${idx}" style="background:#c0392b; color:#fff; font-size:0.8em; padding:3px 8px; border:none; border-radius:3px; cursor:pointer;" title="Abandon project and recover scrap">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("") : '<p style="text-align:center; color:#777; padding:24px;">No active crafting projects in progress. Start one on the Recipe Bench!</p>';

    const html = `
      <div style="display:flex; flex-direction:column; height:100%; gap:8px; padding:8px; font-family:var(--font-primary);">
        
        <!-- TOP NAVIGATION TABS -->
        <nav style="display:flex; gap:8px; border-bottom:2px solid var(--color-border-light-2); padding-bottom:6px;">
          <button type="button" class="workshop-tab-btn ${data.activeTab === "bench" ? "active" : ""}" data-tab="bench" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "bench" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "bench" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            📐 Recipe Bench (New Project)
          </button>
          <button type="button" class="workshop-tab-btn ${data.activeTab === "active" ? "active" : ""}" data-tab="active" style="flex:1; padding:6px; font-weight:bold; cursor:pointer; background:${data.activeTab === "active" ? "#2f3542" : "#dfe4ea"}; color:${data.activeTab === "active" ? "#fff" : "#2f3542"}; border:1px solid #747d8c; border-radius:4px;">
            ⚒️ Active Projects (${data.projects.length})
          </button>
        </nav>

        ${data.activeTab === "bench" ? `
          <!-- BENCH TAB -->
          <div style="display:flex; flex:1; gap:12px; overflow:hidden;">
            <div style="flex:1.2; display:flex; flex-direction:column; gap:8px; border-right:1px solid var(--color-border-light-2); padding-right:8px; overflow-y:auto;">
              <strong style="font-size:0.95em; border-bottom:1px solid #ccc; padding-bottom:3px;">Select Template Item to Craft</strong>
              <div style="flex-grow:1; max-height:360px; overflow-y:auto; border:1px solid #ced6e0; border-radius:4px; padding:4px; background:#fff;">
                ${data.craftableItems.map(i => `
                  <div class="bench-select-row ${data.selectedBaseItem?._id === i._id ? "selected" : ""}" data-id="${i._id}" style="display:flex; align-items:center; gap:6px; padding:4px; cursor:pointer; border-bottom:1px solid #f1f2f6; background:${data.selectedBaseItem?._id === i._id ? "rgba(46,204,113,0.15)" : "transparent"};">
                    <img src="${i.img}" width="26" height="26" style="border-radius:3px;" />
                    <span style="font-size:0.85em; flex:1;">${i.name}</span>
                    <span style="font-size:0.75em; color:#777;">Base Price: ${i.system.price || 0} GP</span>
                  </div>
                `).join("") || '<p style="padding:10px; font-size:0.85em; color:#777;">No valid equipment templates in inventory.</p>'}
              </div>

              <div style="display:flex; gap:8px;">
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
            </div>

            <!-- BENCH SUMMARY CARD -->
            <div style="flex:1.1; display:flex; flex-direction:column; gap:8px; background:rgba(0,0,0,0.02); padding:10px; border-radius:6px; border:1px solid #ced6e0;">
              <strong style="font-size:0.95em; border-bottom:1px solid #ccc; padding-bottom:3px;">Forging Blueprint Details</strong>
              ${data.selectedBaseItem ? `
                <div style="font-size:0.85em; line-height:1.5;">
                  <div><strong>Target:</strong> ${data.selectedBaseItem.name}</div>
                  <div><strong>Target Goal:</strong> ${(data.selectedBaseItem.system.price || 10) + 300} GP (Includes Masterwork)</div>
                  <div><strong>Required Units:</strong> ${this._getMaterialRequirements(data.selectedBaseItem)} Material Units</div>
                  <div><strong>Required Shifts:</strong> ${Math.max(3, Math.ceil(((data.selectedBaseItem.system.price || 10) + 300) / 40))} Shifts (Hourly Checks)</div>
                  <div><strong>Craft DC:</strong> ${150 + data.acceleratedDcBonus} (Base 150 + Speed)</div>
                  <div style="margin-top:6px; font-size:0.8em; color:#555;">
                    <em>Starting this project will consume materials upfront and initialize your progression tracker.</em>
                  </div>
                </div>
                <button type="button" id="start-project-btn" style="margin-top:auto; padding:10px; font-weight:bold; background:#2f3542; color:#fff; border:none; border-radius:4px; cursor:pointer;">
                  🔥 Begin Crafting Project
                </button>
              ` : '<p style="text-align:center; color:#777; margin-top:40px;">Select an equipment blueprint on the left to review requirements.</p>'}
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
  /* Event Listeners & Execution Logic            */
  /* -------------------------------------------- */

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.workshop-tab-btn').click(e => {
      this.activeTab = $(e.currentTarget).data('tab');
      this.render();
    });

    html.find('.bench-select-row').click(e => {
      const id = $(e.currentTarget).data('id');
      this.selectedBaseItem = this.actor.items.get(id);
      this.render();
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
    /* Start Project Button                         */
    /* -------------------------------------------- */
    html.find('#start-project-btn').click(async () => {
      if (!this.selectedBaseItem) return;

      const basePrice = this.selectedBaseItem.system.price || 10;
      const targetGp = basePrice + 300; // Standard masterwork baseline
      const requiredUnits = this._getMaterialRequirements(this.selectedBaseItem);
      const requiredRolls = Math.max(3, Math.ceil(targetGp / 40));
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
        completed: false
      };

      const projects = this.actor.getFlag(MODULE_ID, "craftingProjects") || [];
      projects.push(newProject);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      ui.notifications.info(`Started crafting project for ${newProject.name}! (${requiredUnits} units consumed)`);
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

      const skillInfo = this._getActorSkillInfo(proj.baseItemData.type);
      const roll = await new Roll("1d200 + @mod", { mod: skillInfo.mod }).evaluate({ async: true });
      
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: `⚒️ <strong>${this.actor.name}</strong> works 1 hour on <em>${proj.name}</em> (DC ${proj.dc})`
      });

      const totalRoll = roll.total;
      const mos = totalRoll - proj.dc; // Margin of success
      const failLimit = Math.max(2, Math.floor(proj.requiredRolls / 3));

      // Calculate progress using Silver Mode (/1000) or Gold Mode (/100)
      const divisor = skillInfo.isGoldMode ? 100 : 1000;
      const shiftProgress = (totalRoll * proj.dc) / divisor;

      if (mos >= 0) {
        // Successful Shift
        proj.currentGp += shiftProgress;
        proj.shiftsLogged.push({ roll: totalRoll, mos, success: true });
        ui.notifications.info(`Shift Successful! Added +${shiftProgress.toFixed(1)} GP progress.`);
      } else {
        // Failed Shift
        proj.failedChecks += 1;
        proj.currentGp = Math.max(0, proj.currentGp - (shiftProgress * 0.5));
        proj.shiftsLogged.push({ roll: totalRoll, mos, success: false });
        ui.notifications.warn(`Shift Failed (Strike ${proj.failedChecks}/${failLimit}). Progress lost.`);
      }

      // Check Ruin Condition
      if (proj.failedChecks >= failLimit || (proj.shiftsLogged.length > 1 && proj.currentGp <= 0)) {
        ui.notifications.error(`Project Ruined! The forging of ${proj.name} collapsed. 50% scrap returned.`);
        projects.splice(idx, 1);
        await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
        this.render();
        return;
      }

      // Check Early Gold Completion (Roll remaining modifier checks immediately without time loss)
      if (proj.currentGp >= proj.targetGp && proj.shiftsLogged.length < proj.requiredRolls) {
        const needed = proj.requiredRolls - proj.shiftsLogged.length;
        ui.notifications.info(`GP Target reached early! Rolling remaining ${needed} modifier checks.`);
        for (let i = 0; i < needed; i++) {
          const modRoll = await new Roll("1d200 + @mod", { mod: skillInfo.mod }).evaluate({ async: true });
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

      // Split shifts chronologically into the 3 sequential phases
      const totalShifts = proj.shiftsLogged.length;
      const phase1 = proj.shiftsLogged.slice(0, Math.floor(totalShifts / 3));
      const phase2 = proj.shiftsLogged.slice(Math.floor(totalShifts / 3), Math.floor(totalShifts * 2 / 3));
      const phase3 = proj.shiftsLogged.slice(Math.floor(totalShifts * 2 / 3));

      // Calculate Phase Multipliers from average Margin of Success
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

      // Flags & Masterwork Injection
      itemData.flags = itemData.flags || {};
      itemData.flags[MODULE_ID] = { is10xScaled: true, disable10xSheet: true, disable10xCard: true };
      itemData.system.masterwork = true;

      // Apply Durability (Phase 1)
      let bHard = (typeof itemData.system.hardness === "object" ? itemData.system.hardness.value : itemData.system.hardness) || 0;
      let bHp = (itemData.system.hp?.base ?? itemData.system.hp?.max ?? 0);
      itemData.system.hardness = Math.max(0, Math.round((bHard * 10 + mat.hardnessMod) * hardMult));
      const fHp = Math.max(1, Math.round((bHp * 10 * mat.hpMult) * hardMult));
      itemData.system.hp = { base: fHp, max: fHp, value: fHp };

      // Apply Physical Stats (Phase 2)
      if (isArmor && itemData.system?.armor) {
        itemData.system.armor.value = Math.round((itemData.system.armor.value || 0) * 10 * physMult);
        let adjAcp = Math.round((itemData.system.armor.acp || 0) * 10 * (2.0 - physMult));
        if (mat.acpBonus) adjAcp = Math.min(0, adjAcp + mat.acpBonus);
        itemData.system.armor.acp = adjAcp;
      }

      // Apply Precision & 10x Iteratives (Phase 3)
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

      // Add to inventory and remove project
      await this.actor.createEmbeddedDocuments("Item", [itemData]);
      projects.splice(idx, 1);
      await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);

      ui.notifications.info(`Successfully crafted and claimed ${itemData.name}!`);
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
        content: `<p>Are you sure you want to scrap <strong>${proj.name}</strong>? You will salvage 50% of the materials.</p>`,
        yes: async () => {
          projects.splice(idx, 1);
          await this.actor.setFlag(MODULE_ID, "craftingProjects", projects);
          ui.notifications.warn(`Abandoned ${proj.name}. Scrap returned.`);
          this.render();
        }
      });
    });
  }
}