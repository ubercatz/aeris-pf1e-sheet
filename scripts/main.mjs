import { registerHandlebarsHelpers } from "./helpers.mjs";
import { AltCharacterSheetPF, AltNPCSheetPF } from "./sheet.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

function _rerenderOpenAltSheets() {
  for (const app of Object.values(ui.windows)) {
    if (app?.element?.[0]?.classList?.contains("pf1ar-sheet")) app.render(false);
  }
}

// ─── INIT: HELPERS & SETTINGS ─────────────────────────────────────────────

Hooks.once("init", () => {
  if (game.system?.id !== "pf1") return;

  registerHandlebarsHelpers();

  game.settings.register(MODULE_ID, "enable10xGranularity", {
    name: "Enable 10x Granularity Engine",
    hint: "Scales base dice faces (1d6 -> 1d60) and flat modifiers by 10x.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "enableFractionalProgression", {
    name: "Enable Fractional Progression",
    hint: "Uses true fractional stacking for Base Attack Bonus across multiclassing.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "scaleSmallBuffs", {
    name: "Scale Small Buffs/Debuffs (<10)",
    hint: "When enabled, conditions and buffs (e.g., Shaken) will only scale flat modifiers under 10. Prevents massive stats like +30ft speed from becoming +300.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: _rerenderOpenAltSheets,
  });

  game.settings.register(MODULE_ID, "darkMode", { name: "PF1AR.Settings.DarkMode", scope: "client", config: false, type: Boolean, default: false });
  game.settings.register(MODULE_ID, "theme", { name: "PF1AR.Settings.Theme", scope: "client", config: true, type: String, default: "parchment", choices: { parchment: "PF1AR.Theme.Parchment", hybrid: "PF1AR.Theme.Hybrid", slate: "PF1AR.Theme.Slate" }, onChange: _rerenderOpenAltSheets });
  game.settings.register(MODULE_ID, "compact", { name: "PF1AR.Settings.Compact", scope: "client", config: true, type: Boolean, default: false, onChange: _rerenderOpenAltSheets });
  game.settings.register(MODULE_ID, "summarySkills", { name: "PF1AR.Settings.SummarySkills", scope: "client", config: true, type: String, default: "ranked", choices: { ranked: "PF1AR.Labels.Ranked", class: "PF1AR.Labels.SkillsClass", all: "PF1AR.Labels.SkillsAll" }, onChange: _rerenderOpenAltSheets });

  loadTemplates([
    `modules/${MODULE_ID}/templates/character-sheet.hbs`,
    `modules/${MODULE_ID}/templates/npc-sheet.hbs`,
    `modules/${MODULE_ID}/templates/parts/summary.hbs`,
    `modules/${MODULE_ID}/templates/parts/attributes.hbs`,
    `modules/${MODULE_ID}/templates/parts/combat.hbs`,
    `modules/${MODULE_ID}/templates/parts/inventory.hbs`,
    `modules/${MODULE_ID}/templates/parts/features.hbs`,
    `modules/${MODULE_ID}/templates/parts/skills.hbs`,
    `modules/${MODULE_ID}/templates/parts/skill-list.hbs`,
    `modules/${MODULE_ID}/templates/parts/spells.hbs`,
    `modules/${MODULE_ID}/templates/parts/buffs.hbs`,
    `modules/${MODULE_ID}/templates/parts/biography.hbs`,
    `modules/${MODULE_ID}/templates/parts/notes.hbs`,
    `modules/${MODULE_ID}/templates/parts/settings.hbs`,
  ]);
});

// ─── CUSTOM UI INJECTOR ───────────────────────────────────────────────────

Hooks.on("renderItemSheet", (app, html, data) => {
    let $advancedTab = html.find('.tab[data-tab="advanced"]');
    let $target = $advancedTab.length > 0 ? $advancedTab : html.find('.sheet-body');

    // 1. Fumble Range Injection
    if (["weapon", "spell", "attack"].includes(app.item.type)) {
        let currentFumble = app.item.getFlag(MODULE_ID, "fumbleRange");
        if (currentFumble === undefined) currentFumble = 10;

        let fumbleHtml = `
            <div class="form-group">
                <label>10x Fumble Range</label>
                <div class="form-fields">
                    <input type="number" 
                           name="flags.${MODULE_ID}.fumbleRange" 
                           value="${currentFumble}" 
                           data-dtype="Number">
                </div>
                <p class="notes">Any d200 roll equal to or below this number is a fumble.</p>
            </div>
        `;
        $target.append(fumbleHtml);
    }

    // 2. Disable 10x Scaling Injection
    let disable10x = app.item.getFlag(MODULE_ID, "disable10x");
    if (disable10x === undefined) disable10x = false;

    let toggleHtml = `
        <div class="form-group">
            <label>Disable 10x Scaling</label>
            <div class="form-fields">
                <input type="checkbox" name="flags.${MODULE_ID}.disable10x" ${disable10x ? "checked" : ""}>
            </div>
            <p class="notes">Check to skip scaling. You can also type <strong>[nomulti]</strong> or <strong>[nm]</strong> next to any flat number in a formula to manually exclude it!</p>
        </div>
    `;
    $target.append(toggleHtml);
});

// ─── READY: SYSTEM OVERRIDES ──────────────────────────────────────────────

Hooks.once("ready", () => {
  if (game.system?.id !== "pf1") return;

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltCharacterSheetPF, { label: game.i18n.localize("PF1AR.CharacterSheetLabel"), types: ["character"], makeDefault: false });
  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltNPCSheetPF, { label: game.i18n.localize("PF1AR.NPCSheetLabel"), types: ["npc"], makeDefault: false });
  DocumentSheetConfig.updateDefaultSheets();

  if (game.settings.get(MODULE_ID, "enable10xGranularity") && pf1.config) {
    pf1.config.classSkillBonus = 30;
    pf1.config.nonProficiencyPenalty = -40;
  }
});

// ─── STYLESHEET INJECTION (THE ANTI-TAMPER SHIELD) ────────────────────────

Hooks.once("init", () => {
    const aerisStyles = document.createElement("style");
    aerisStyles.innerHTML = `
        /* Custom Fumble Styling */
        .aeris-crit-fail {
            color: #aa0200 !important;
            border-color: #aa0200 !important;
            text-shadow: 0 0 4px rgba(170, 2, 0, 0.4) !important;
            background-color: rgba(170, 2, 0, 0.1) !important;
        }
        .aeris-crit-fail-die {
            color: #aa0200 !important;
            font-weight: bold !important;
        }

        /* NUCLEAR OVERRIDE: Destroy Foundry V12's Blue Tampered Visuals globally */
        .dice-roll.is-tampered .dice-total,
        .dice-roll.tampered .dice-total,
        .is-tampered .dice-total {
            background: rgba(0, 0, 0, 0.1) !important;
            border: 1px solid var(--color-border-light-2, #999) !important;
            color: var(--color-text-dark-primary, #191813) !important;
            box-shadow: none !important;
        }
        
        .is-tampered .fa-triangle-exclamation,
        .tampered .fa-triangle-exclamation,
        .dice-roll.is-tampered .fa-triangle-exclamation {
            display: none !important;
        }
    `;
    document.head.appendChild(aerisStyles);
});

// ─── LIBWRAPPER INTERCEPTIONS (10X ENGINE) ────────────────────────────────

Hooks.once("init", () => {
  if (typeof libWrapper === "undefined") return;

  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {

      for (let i = 0; i < this.terms.length; i++) {
        let term = this.terms[i];

        if (!term.options) term.options = {};

        // 1. SCALE DICE (1d20 -> 1d200)
        if (term.faces && term.faces <= 20 && !term.options._pf1arScaled) {
          term.faces *= 10;
          term.options._pf1arScaled = true;
        }

        // 2. THE BRUTE-FORCE MATH CATCHER
        const isNumericTerm = term.number !== undefined && term.faces === undefined;
        if (isNumericTerm && !term.options._pf1arScaled) {
          
          let prevTerm = i > 0 ? this.terms[i-1] : null;
          let nextTerm = i < this.terms.length - 1 ? this.terms[i+1] : null;
          
          let isMultiplier = false;
          if (prevTerm && prevTerm.operator !== undefined && ["*", "/"].includes(prevTerm.operator)) isMultiplier = true;
          if (nextTerm && nextTerm.operator !== undefined && ["*", "/"].includes(nextTerm.operator)) isMultiplier = true;
          let isFirstTerm = (i === 0);

          let flavor = String(term.options?.flavor || "").toLowerCase();
          
          // ─── SHIELD 6: COMPREHENSIVE ATTRIBUTE & FLAG EXCLUDER ───
          // Now officially ignores 'ranks', 'skill ranks', and your custom 'nomulti' flag!
          let isExcluded = /\b(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma|bab|base attack bonus|ranks|skill ranks|nomulti|nm)\b/i.test(flavor);

          let isDisabledItem = false;
          if (flavor) {
              for (const actor of game.actors.values()) {
                  if (actor.items.some(i => i.name.toLowerCase() === flavor && i.getFlag(MODULE_ID, "disable10x"))) {
                      isDisabledItem = true;
                      break;
                  }
              }
          }

          if (!isMultiplier && !isFirstTerm && !isExcluded && !isDisabledItem) {
             let val = term.number;
             
             if (val !== 0 && Math.abs(val) < 10) {
                 term.number = val * 10;
                 if (term._evaluated) {
                     try { term.total = term.number; } catch(e) {}
                 } 
                 term.options._pf1arScaled = true;
             }
          }
        }
      }
      
      try {
          this._formula = this.constructor.getFormula(this.terms);
      } catch (e) {
          try { this._formula = this.terms.map(t => t.expression || t.formula || t.number).join(""); } catch(e2) {}
      }
    }

    let evaluatedRoll = await wrapped(...args);

    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      let customFumble = 10;
      try {
          let itemData = this.data?.item || this.options?.item;
          if (!itemData && this.data?.flags) itemData = this.data; 
          
          if (itemData?.flags && itemData.flags[MODULE_ID]?.fumbleRange !== undefined) {
              customFumble = Number(itemData.flags[MODULE_ID].fumbleRange);
          }
      } catch (e) {}

      for (let term of this.terms) {
        if (term.faces === 200 && term.results) {
          for (let res of term.results) {
            if (res.result <= customFumble) {
              res.fumble = true;
              res.failure = true; 
            } else {
              res.fumble = false;
              res.failure = false;
            }
          }
        }
      }
    }
    return evaluatedRoll;
  }, "WRAPPER");

  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareBaseData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      
      if (this.getFlag(MODULE_ID, "disable10x")) return;

      const restrictBuffs = game.settings.get(MODULE_ID, "scaleSmallBuffs");
      const isBuff = this.type === "buff";

      const scaleCL = (f) => {
        if (typeof f !== "string") return f;
        let res = f;
        let pId = 0;
        let placeholders = {};
        const hide = (str) => {
            const key = `__PF1AR_${pId++}__`;
            placeholders[key] = str;
            return key;
        };

        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, num, variable, middle, faces) => {
            let fcs = Number(faces); return hide(`${func}(${num}, ${variable})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, num, variable, middle, faces) => {
            let fcs = Number(faces); return hide(`(${func}(${num}, ${variable}))${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*\*\s*)(\d*)d(\d+)/gi, (m, func, num, variable, middle, count, faces) => {
            let fcs = Number(faces); return hide(`(${func}(${num}, ${variable}))${middle}${count || ""}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*\*\s*)(\d*)d(\d+)/gi, (m, func, num, variable, middle, count, faces) => {
            let fcs = Number(faces); return hide(`${func}(${num}, ${variable})${middle}${count || ""}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(min|max)\(\s*([^,]+)\s*,\s*(\d+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, num, middle, faces) => {
            let fcs = Number(faces); return hide(`${func}(${variable}, ${num})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(floor|ceil)\(\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, middle, faces) => {
            let fcs = Number(faces); return hide(`${func}(${variable})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(floor|ceil)\(\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, middle, faces) => {
            let fcs = Number(faces); return hide(`(${func}(${variable}))${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(@[a-zA-Z0-9_.]+)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, variable, middle, faces) => {
            let fcs = Number(faces); return hide(`${variable}${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        res = res.replace(/\b(\d*)(\s*(?:\[.*?\])?\s*)d(\d+)\b/gi, (m, count, middle, faces) => {
            let scaledFaces = Number(faces) <= 20 ? Number(faces) * 10 : faces;
            return hide(`${count || ""}${middle || ""}d${scaledFaces}`);
        });
        
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*(@[a-zA-Z0-9_.]+)\s*\)/gi, (m, func, num, variable) => {
            return `${func}(${Number(num) * 10}, (${variable} * 10))`;
        });
        res = res.replace(/(min|max)\(\s*(@[a-zA-Z0-9_.]+)\s*,\s*(\d+)\s*\)/gi, (m, func, variable, num) => {
            return `${func}((${variable} * 10), ${Number(num) * 10})`;
        });

        // ─── FIX: Variables properly check for [nomulti] text before scaling
        res = res.replace(/(^|[-+]\s*)(@[a-zA-Z0-9_.]+)(\s*(?:\[(.*?)\])?)(?!\s*[*\/xd])/gi, (m, sign, variable, flavorWrap, flavorText) => {
            let flavor = String(flavorText || "").toLowerCase();
            let isExcluded = /\b(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma|bab|base attack bonus|ranks|skill ranks|nomulti|nm)\b/i.test(flavor);
            
            if (isExcluded) return m;
            return `${sign}(${variable} * 10)${flavorWrap || ""}`;
        });

        // ─── FIX: Flat Numbers properly check for [nomulti] and [ranks] text before scaling
        res = res.replace(/(^|[-+]\s*)(\d+)(\s*(?:\[(.*?)\])?)(?!\s*[*\/xd])/gi, (m, sign, num, flavorWrap, flavorText) => {
            let val = Number(num);
            let flavor = String(flavorText || "").toLowerCase();
            let isExcluded = /\b(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma|bab|base attack bonus|ranks|skill ranks|nomulti)\b/i.test(flavor);

            if (isExcluded) return m; 
            if (isBuff && restrictBuffs && val >= 10) return m; 
            return `${sign}${val * 10}${flavorWrap || ""}`;
        });

        for (const [key, val] of Object.entries(placeholders)) {
            res = res.replace(key, val);
        }
        return res;
      };

      if (this.system?.armor) {
        if (this._source?.system?.armor?.value !== undefined) this.system.armor.value = Number(this._source.system.armor.value) * 10;
        if (this._source?.system?.armor?.acp !== undefined) this.system.armor.acp = Number(this._source.system.armor.acp) * 10;
      }
      if (this.system?.enh !== undefined && this._source?.system?.enh !== undefined) this.system.enh = Number(this._source.system.enh) * 10;

      if (this.system?.changes) {
        this.system.changes.forEach((change, i) => {
          const rawFormula = this._source?.system?.changes?.[i]?.formula ?? change.formula;
          if (rawFormula && !change._pf1arScaled) {
            change.formula = scaleCL(String(rawFormula));
            change._pf1arScaled = true; 
          }
        });
      }

      if (this.system?.actions && this._source?.system?.actions) {
        this.system.actions.forEach((action, i) => {
          const srcAction = this._source.system.actions[i];
          
          if (srcAction && action.damage?.parts) {
            action.damage.parts.forEach((part, j) => {
              const srcFormula = srcAction.damage.parts[j]?.formula;
              if (srcFormula) part.formula = scaleCL(String(srcFormula));
            });
          }

          if (action.actionType) {
              action.ability = action.ability || {};
              
              let cRange = action.ability.critRange;
              if (cRange === undefined || cRange === null || cRange === "") {
                  cRange = action.critRange;
              }
              
              if (cRange === undefined || cRange === null || cRange === "") {
                  action.ability.critRange = 191; 
                  action.critRange = 191; 
              } else {
                  cRange = Number(cRange);
                  if (!isNaN(cRange)) {
                      if (cRange > 0 && cRange <= 20) {
                          let scaled = (cRange * 10) - 9;
                          action.ability.critRange = scaled;
                          action.critRange = scaled; 
                      } else {
                          action.ability.critRange = cRange;
                          action.critRange = cRange;
                      }
                  }
              }
          }
        });
      }
    }
  }, "WRAPPER");

  libWrapper.register(MODULE_ID, "pf1.utils.getAbilityModifier", function (wrapped, score, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && typeof score === "number") {
       return Math.floor((score - 100) / 2);
    }
    return wrapped(score, ...args);
  }, "MIXED");

  libWrapper.register(MODULE_ID, "pf1.components.ItemAction.prototype.getDC", function(wrapped, ...args) {
    let result = wrapped(...args);
    
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && result != null) {
      const sl = this.spellLevel ?? this.item?.spellLevel ?? 0;
      const bonus = 90 + (sl * 9);
      
      if (typeof result === "number") {
          result += bonus;
      } else if (result.value !== undefined) {
          result.value += bonus;
      }
    }
    return result;
  }, "WRAPPER");

  libWrapper.register(MODULE_ID, "CONFIG.Actor.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      
      if (this.system.attributes?.ac) {
        ["normal", "touch", "flatFooted"].forEach(type => {
          if (this.system.attributes.ac[type]?.total !== undefined) {
             this.system.attributes.ac[type].total += 90; 
          }
        });
      }

      if (game.settings.get(MODULE_ID, "enableFractionalProgression")) {
        let granularBab = 0;
        for (const item of this.items) {
          if (item.type === "class") {
            const lvl = item.system.level || 0, btype = item.system.bab;
            if (btype === "high") granularBab += lvl * 10;
            else if (btype === "medium") granularBab += lvl * 7.5;
            else if (btype === "low") granularBab += lvl * 5;
          }
        }
        if (this.system.attributes?.bab) this.system.attributes.bab.total = Math.floor(granularBab);
      } else {
        if (this.system.attributes?.bab?.total !== undefined) this.system.attributes.bab.total *= 10;
      }

      if (this.system.attributes?.encumbrance && this.system.abilities?.str?.total) {
        const str = Math.floor(this.system.abilities.str.total / 10); 
        let heavy = 0;
        if (str <= 10) heavy = str * 10;
        else {
           const base = [100, 115, 130, 150, 175, 200, 230, 260, 300, 350][str % 10];
           heavy = base * Math.pow(4, Math.floor(str / 10) - 1);
        }
        this.system.attributes.encumbrance.light = Math.floor(heavy / 3) * 10;
        this.system.attributes.encumbrance.medium = Math.floor((heavy * 2) / 3) * 10;
        this.system.attributes.encumbrance.heavy = heavy * 10;
      }

      // ─── NEW: SHEET UI DATA RE-SYNC (TOOLTIPS & TOTALS) ───
      let disabledItemNames = new Set();
      this.items.forEach(i => {
          if (i.getFlag(MODULE_ID, "disable10x")) disabledItemNames.add(i.name.toLowerCase());
      });

      const applyModifierDiff = (targetObj, totalKey) => {
          if (targetObj && targetObj.modifiers && Array.isArray(targetObj.modifiers)) {
              let diff = 0;
              targetObj.modifiers.forEach(modObj => {
                  if (modObj.modifier !== undefined && modObj.name !== undefined) {
                      let val = Number(modObj.modifier);
                      let name = String(modObj.name).toLowerCase();
                      
                      // Completely protects base attributes, skill ranks, and your manual tags!
                      let isExcluded = /\b(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma|bab|base attack bonus|ranks|skill ranks|nomulti|nm)\b/i.test(name);
                      let isDisabled = disabledItemNames.has(name);

                      if (!isExcluded && !isDisabled && !isNaN(val) && val !== 0 && Math.abs(val) < 10) {
                          let scaledVal = val * 10;
                          diff += (scaledVal - val);   // Calculate the mathematical difference
                          modObj.modifier = scaledVal; // Mutate the visual tooltip array
                      }
                  }
              });
              
              // Apply the mathematical difference directly to the sheet's final total!
              if (diff !== 0 && targetObj[totalKey] !== undefined) {
                  targetObj[totalKey] += diff;
              }
          }
      };

      // 1. Scrub & Sync Skills
      if (this.system.skills) {
          for (let sk of Object.values(this.system.skills)) {
              applyModifierDiff(sk, "mod");
          }
      }

      // 2. Scrub & Sync Saves & Combat Attributes
      if (this.system.attributes) {
          if (this.system.attributes.savingThrows) {
              for (let sv of Object.values(this.system.attributes.savingThrows)) {
                  applyModifierDiff(sv, "total");
              }
          }
          ['cmd', 'cmb', 'attack', 'damage'].forEach(attr => {
              applyModifierDiff(this.system.attributes[attr], "total");
          });
          
          // Re-sync AC penalties (like AC drops from specific debuffs)
          if (this.system.attributes.ac) {
              ['normal', 'touch', 'flatFooted'].forEach(type => {
                   applyModifierDiff(this.system.attributes.ac[type], "total");
              });
          }
      }
    }
  }, "WRAPPER");
});

// ─── CHAT HOOKS: DATA BROADCASTING & JQUERY DOM SCRUBBING ─────────────────

Hooks.on("preCreateChatMessage", (message, updateData, options, userId) => {
    if (game.user.id !== userId) return;

    let exportedRolls = [];
    let agnosticResult = null;
    let isFumble = false;

    const attacks = message?.system?.rolls?.attacks;
    if (attacks && Array.isArray(attacks) && attacks.length > 0) {
        attacks.forEach(attackGroup => {
            const atkRoll = attackGroup.attack;
            if (atkRoll && atkRoll.terms && atkRoll.terms[0]) {
                const mainDie = atkRoll.terms[0];
                if (mainDie.faces === 200) {
                    agnosticResult = mainDie.total; 
                    if (mainDie.results.some(res => res.fumble)) isFumble = true;
                    try { exportedRolls.push(JSON.stringify(atkRoll.toJSON())); } catch (e) {}
                }
            }
        });
    }

    const stdRolls = message.rolls;
    if (stdRolls && Array.isArray(stdRolls) && stdRolls.length > 0) {
        stdRolls.forEach(roll => {
            if (roll && roll.terms && roll.terms[0]) {
                const mainDie = roll.terms[0];
                if (mainDie.faces === 200) {
                    agnosticResult = mainDie.total;
                    if (mainDie.results.some(res => res.fumble || res.result <= 10)) isFumble = true;
                }
            }
        });
    }

    let injectedData = {};
    
    if (agnosticResult !== null) {
        injectedData["flags.aeris.d200Result"] = agnosticResult;
        injectedData["flags.aeris.isFumble"] = isFumble;
        if (exportedRolls.length > 0) injectedData.rolls = exportedRolls;
    }

    // ─── SHIELD 5 & 6: STRICT VISUAL TOOLTIP CATCHER & EXCLUDERS ───
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && message.system) {
        
        let msgActor = null;
        if (message.speaker) {
            msgActor = game.actors.get(message.speaker.actor);
            if (!msgActor && message.speaker.token && message.speaker.scene) {
                msgActor = game.scenes.get(message.speaker.scene)?.tokens.get(message.speaker.token)?.actor;
            }
        }
        
        let disabledItemNames = new Set();
        if (msgActor) {
            msgActor.items.forEach(i => {
                if (i.getFlag(MODULE_ID, "disable10x")) {
                    disabledItemNames.add(i.name.toLowerCase());
                }
            });
        }

        let metaClone = foundry.utils.deepClone(message.system);
        const scaleModifiersStrictly = (obj, visited = new Set()) => {
            if (!obj || typeof obj !== 'object') return;
            if (visited.has(obj)) return;
            visited.add(obj);

            if (Array.isArray(obj)) {
                obj.forEach(i => scaleModifiersStrictly(i, visited));
            } else {
                if (obj.modifier !== undefined && obj.name !== undefined && obj.dice === undefined && obj.faces === undefined && obj.formula === undefined) {
                    
                    let val = Number(obj.modifier);
                    let name = String(obj.name).toLowerCase();
                    
                    // Excludes natively scaled core attributes/BAB, Skill Ranks, and your manual [nomulti] tags!
                    let isExcluded = /\b(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma|bab|base attack bonus|ranks|skill ranks|nomulti|nm)\b/i.test(name);
                    let isDisabled = disabledItemNames.has(name);

                    if (!isExcluded && !isDisabled && !isNaN(val) && val !== 0 && Math.abs(val) < 10) {
                        obj.modifier = val * 10;
                    }
                }
                for (let key in obj) {
                    if (['parent', 'document', 'actor', 'item', 'token', 'target', 'roll', 'scene', 'combatant'].includes(key)) continue;
                    if (typeof obj[key] === 'object') {
                        scaleModifiersStrictly(obj[key], visited);
                    }
                }
            }
        };
        
        scaleModifiersStrictly(metaClone);
        injectedData["system"] = metaClone;
    }

    if (Object.keys(injectedData).length > 0) {
        message.updateSource(injectedData);
    }
});

Hooks.on("renderChatMessage", (message, html, data) => {
    if (!game.settings.get(MODULE_ID, "enable10xGranularity")) return;

    const $html = $(html);
    
    $html.removeClass('tampered is-tampered validation-failed');
    $html.find('.tampered, .is-tampered, .validation-failed').removeClass('tampered is-tampered validation-failed');
    $html.find('.fa-triangle-exclamation, .validation-failures, .tamper-warning').remove();
    $html.find('[data-tooltip*="Tampered"], [data-tooltip*="Validation"]').removeAttr('data-tooltip');
    
    $html.find('i.abnormal, [data-tooltip="PF1.CustomRollDesc"]').remove();

    $html.find('.inline-roll[data-roll]').each(function() {
        try {
            const rollData = JSON.parse(decodeURIComponent($(this).attr('data-roll')));
            const firstTerm = rollData.terms?.[0];
            
            if (firstTerm?.class === "Die" && firstTerm.faces === 200 && firstTerm.results) {
                const resultVal = firstTerm.results[0].result;
                const isCustomFumble = firstTerm.results.some(r => r.fumble);
                const critThreshold = rollData.options?.critical ?? 200;
                
                if (isCustomFumble) {
                    const $icon = $(this).find('.fa-dice-d20');
                    if ($icon.length) $icon.addClass('aeris-crit-fail-die');
                    $(this).removeClass('critical success max fumble min natural-1 natural-20');
                    $(this).addClass('aeris-crit-fail');
                } else if (resultVal >= 20 && resultVal < critThreshold) {
                    $(this).removeClass('critical success max natural-20');
                }
            }
        } catch (e) {
            console.warn("PF1 Alt Sheet: Failed to decode chat card roll data.", e);
        }
    });

    $html.find('li.die.d200').each(function() {
        if ($(this).closest('.inline-roll').length > 0) return;

        const dieVal = parseInt($(this).text(), 10);
        if (!isNaN(dieVal)) {
            const isFumble = dieVal <= 10 || $(this).hasClass('fumble') || $(this).hasClass('failure');
            const isCrit = dieVal >= 191;

            let $container = $(this).closest('.dice-roll');
            if ($container.length === 0) $container = $html;

            const $totals = $container.find('.dice-total, .roll-total, .total');

            if (isFumble) {
                $(this).removeClass('critical success max natural-20');
                $(this).addClass('aeris-crit-fail-die');
                
                $totals.removeClass('critical success max fumble min natural-1 natural-20');
                $totals.addClass('aeris-crit-fail');
                $container.removeClass('critical success max natural-20');
            } else if (!isCrit && dieVal >= 20) {
                $(this).removeClass('critical success max natural-20');
                $totals.removeClass('critical success max natural-20');
                $container.removeClass('critical success max natural-20');
                
                $totals.css({
                    'color': 'unset',
                    'text-shadow': 'none',
                    'background-color': 'transparent'
                });
            }
        }
    });
});