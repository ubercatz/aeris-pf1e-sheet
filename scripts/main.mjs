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
    if (!["weapon", "spell", "attack"].includes(app.item.type)) return;

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

    let $advancedTab = html.find('.tab[data-tab="advanced"]');
    if ($advancedTab.length > 0) {
        $advancedTab.append(fumbleHtml);
    } else {
        html.find('.sheet-body').append(fumbleHtml);
    }
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
      for (let term of this.terms) {
        if (term.faces && term.faces <= 20 && !term._pf1arScaled) {
          term.faces *= 10;
          term._pf1arScaled = true;
        }
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
            let fcs = Number(faces);
            return hide(`${func}(${num}, ${variable})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, num, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`(${func}(${num}, ${variable}))${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*\*\s*)(\d*)d(\d+)/gi, (m, func, num, variable, middle, count, faces) => {
            let fcs = Number(faces);
            return hide(`(${func}(${num}, ${variable}))${middle}${count || ""}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*\*\s*)(\d*)d(\d+)/gi, (m, func, num, variable, middle, count, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${num}, ${variable})${middle}${count || ""}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(min|max)\(\s*([^,]+)\s*,\s*(\d+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, num, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${variable}, ${num})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(floor|ceil)\(\s*([^)]+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${func}(${variable})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/\(\s*(floor|ceil)\(\s*([^)]+)\s*\)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`(${func}(${variable}))${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(@[a-zA-Z0-9_.]+)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, variable, middle, faces) => {
            let fcs = Number(faces);
            return hide(`${variable}${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });

        res = res.replace(/\b(\d*)d(\d+)\b/gi, (m, count, faces) => {
            let scaledFaces = Number(faces) <= 20 ? Number(faces) * 10 : faces;
            return hide(`${count || ""}d${scaledFaces}`);
        });
        
        res = res.replace(/(min|max)\(\s*(\d+)\s*,\s*(@[a-zA-Z0-9_.]+)\s*\)/gi, (m, func, num, variable) => {
            return `${func}(${Number(num) * 10}, (${variable} * 10))`;
        });
        res = res.replace(/(min|max)\(\s*(@[a-zA-Z0-9_.]+)\s*,\s*(\d+)\s*\)/gi, (m, func, variable, num) => {
            return `${func}((${variable} * 10), ${Number(num) * 10})`;
        });

        res = res.replace(/(^|[-+]\s*)(@[a-zA-Z0-9_.]+)/gi, (m, sign, variable) => {
            return `${sign}(${variable} * 10)`;
        });
        res = res.replace(/(^|[-+]\s*)(\d+)\b/gi, (m, sign, num) => {
            return `${sign}${Number(num) * 10}`;
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

      if (this.system?.changes && this._source?.system?.changes) {
        this.system.changes.forEach((change, i) => {
          const srcFormula = this._source.system.changes[i]?.formula;
          if (srcFormula) change.formula = scaleCL(String(srcFormula));
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
    }
  }, "WRAPPER");
});

// ─── CHAT HOOKS: DATA BROADCASTING & JQUERY DOM SCRUBBING ─────────────────

Hooks.on("preCreateChatMessage", (message, updateData, options, userId) => {
    if (game.user.id !== userId) return;

    let exportedRolls = [];
    let agnosticResult = null;
    let isFumble = false;

    // Process Attack Rolls 
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

    // Process Skill Checks & Saves
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

    if (agnosticResult !== null) {
        const injectedData = {
            "flags.aeris.d200Result": agnosticResult,
            "flags.aeris.isFumble": isFumble
        };
        if (exportedRolls.length > 0) injectedData.rolls = exportedRolls;
        message.updateSource(injectedData);
    }
});

Hooks.on("renderChatMessage", (message, html, data) => {
    if (!game.settings.get(MODULE_ID, "enable10xGranularity")) return;

    // Use jQuery for flawless DOM parsing across standard rolls and PF1e templates
    const $html = $(html);
    
    // 1. SURGICALLY STRIP TAMPERED WARNINGS
    $html.removeClass('tampered is-tampered');
    $html.find('.tampered, .is-tampered').removeClass('tampered is-tampered');
    $html.find('.fa-triangle-exclamation').remove();

    // 2. SURGICALLY STYLE PF1e ATTACK ROLLS
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

    // 3. SURGICALLY STYLE SKILL CHECKS & SAVES
    if (message.rolls && message.rolls.length > 0) {
        message.rolls.forEach(roll => {
            const firstTerm = roll.terms?.[0];
            if (firstTerm?.class === "Die" && firstTerm.faces === 200 && firstTerm.results) {
                const resultVal = firstTerm.results[0].result;
                const isFumble = firstTerm.results.some(r => r.fumble) || resultVal <= 10;
                const isCrit = resultVal === 200; 

                // A. Strip false positives from standard Total Boxes
                $html.find('.dice-total').each(function() {
                    if (isFumble) {
                        $(this).removeClass('critical success max fumble min natural-1 natural-20');
                        $(this).addClass('aeris-crit-fail');
                    } else if (!isCrit && resultVal >= 20) {
                        $(this).removeClass('critical success max natural-20');
                    }
                });
                
                // B. Strip false positives directly from the dropdown Tooltip Dice
                $html.find('li.die.d200').each(function() {
                    const dieVal = parseInt($(this).text(), 10);
                    if (!isNaN(dieVal)) {
                        if (dieVal <= 10 || isFumble) {
                            $(this).removeClass('critical success max natural-20');
                            $(this).addClass('aeris-crit-fail-die');
                        } else if (!isCrit && dieVal >= 20) {
                            $(this).removeClass('critical success max natural-20');
                        }
                    }
                });
            }
        });
    }
});