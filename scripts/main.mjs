import { registerHandlebarsHelpers } from "./helpers.mjs";
import { AltCharacterSheetPF, AltNPCSheetPF } from "./sheet.mjs";

const MODULE_ID = "pf1-altsheet-reworked";

function _rerenderOpenAltSheets() {
  for (const app of Object.values(ui.windows)) {
    if (app?.element?.[0]?.classList?.contains("pf1ar-sheet")) app.render(false);
  }
}

// ─── CUSTOM CONDITION REGISTRY ENGINE ──────────────────────────────────────

function _registerConditionSettings() {
  game.settings.register(MODULE_ID, "customConditionScaling", {
    name: "Enable Custom Condition Scaling",
    hint: "Replaces default PF1e condition penalties with custom granular values across the system.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
    onChange: () => _patchConditionRegistry(),
  });

  game.settings.register(MODULE_ID, "conditionScaleMultiplier", {
    name: "Condition Penalty Multiplier",
    hint: "Global multiplier applied to core condition penalties (e.g., 10x turns -2 into -20).",
    scope: "world",
    config: true,
    type: Number,
    default: 10,
    onChange: () => _patchConditionRegistry(),
  });
}

function _patchConditionRegistry() {
  if (!game.settings.get(MODULE_ID, "customConditionScaling")) return;
  const mult = game.settings.get(MODULE_ID, "conditionScaleMultiplier") || 10;

  // 1. Patch static condition config
  if (pf1.config?.conditionDetails) {
    for (const [key, details] of Object.entries(pf1.config.conditionDetails)) {
      if (details.changes && Array.isArray(details.changes)) {
        details.changes.forEach(change => {
          let val = Number(change.formula);
          if (!isNaN(val) && val !== 0 && !change._pf1arConfigured) {
            change.formula = String(val * mult);
            change._pf1arConfigured = true;
          }
        });

        // Ensure conditions affecting checks explicitly debuff Initiative
        if (["shaken", "frightened", "panicked"].includes(key)) {
          const hasInit = details.changes.some(c => c.target === "init" || c.target === "attributes.init");
          if (!hasInit) {
            details.changes.push({
              formula: String(-2 * mult),
              target: "init",
              type: "untyped",
              _pf1arConfigured: true
            });
          }
        }
      }
    }
  }

  // 2. Patch active registry documents
  if (pf1.registry?.conditions?.contents) {
    pf1.registry.conditions.contents.forEach(cond => {
      const changes = cond.system?.changes || cond.changes;
      if (Array.isArray(changes)) {
        changes.forEach(change => {
          let val = Number(change.formula);
          if (!isNaN(val) && val !== 0 && !change._pf1arConfigured) {
            change.formula = String(val * mult);
            change._pf1arConfigured = true;
          }
        });
      }
    });
  }

  // 3. Reset existing actors to trigger a fresh data pass with scaled conditions
  for (const actor of game.actors.contents) {
    try {
      actor.reset();
    } catch (e) {}
  }
}

// ─── INIT: CONFIG, HELPERS & SETTINGS ──────────────────────────────────────

Hooks.once("init", () => {
  if (game.system?.id !== "pf1") return;

  registerHandlebarsHelpers();
  _registerConditionSettings();

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
    hint: "When enabled, conditions and buffs (e.g., Shaken) will only scale flat modifiers under 10.",
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

  if (pf1.config) {
    pf1.config.classSkillBonus = 30;
    pf1.config.nonProficiencyPenalty = -40;
  }

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

// ─── CUSTOM UI INJECTOR & FORM INPUT RESTORATION ──────────────────────────

Hooks.on("renderItemSheet", (app, html, data) => {
  const item = app.item;
  const is10xEnabled = game.settings.get(MODULE_ID, "enable10xGranularity");

  if (is10xEnabled) {
    if (item._source?.system?.armor?.value !== undefined) {
      html.find('input[name="system.armor.value"]').val(item._source.system.armor.value);
    }
    if (item._source?.system?.armor?.acp !== undefined) {
      html.find('input[name="system.armor.acp"]').val(item._source.system.armor.acp);
    }
    if (item._source?.system?.armor?.dex !== undefined) {
      html.find('input[name="system.armor.dex"]').val(item._source.system.armor.dex);
    }
    if (item._source?.system?.enh !== undefined) {
      html.find('input[name="system.enh"]').val(item._source.system.enh);
    }
  }

  let $advancedTab = html.find('.tab[data-tab="advanced"]');
  let $target = $advancedTab.length > 0 ? $advancedTab : html.find('.sheet-body');

  if (["weapon", "spell", "attack"].includes(item.type)) {
    let currentFumble = item.getFlag(MODULE_ID, "fumbleRange") ?? 10;
    let fumbleHtml = `
      <div class="form-group">
          <label>10x Fumble Range</label>
          <div class="form-fields">
              <input type="number" name="flags.${MODULE_ID}.fumbleRange" value="${currentFumble}" data-dtype="Number">
          </div>
          <p class="notes">Any d200 roll equal to or below this number is a fumble.</p>
      </div>
    `;
    $target.append(fumbleHtml);
  }

  let disable10x = item.getFlag(MODULE_ID, "disable10x") ?? false;
  let disable10xSheet = item.getFlag(MODULE_ID, "disable10xSheet") ?? false;
  let disable10xCard = item.getFlag(MODULE_ID, "disable10xCard") ?? false;

  let flagsHtml = `
    <div class="form-group">
        <label>Disable 10x Scaling (Global)</label>
        <div class="form-fields">
            <input type="checkbox" name="flags.${MODULE_ID}.disable10x" ${disable10x ? "checked" : ""}>
        </div>
        <p class="notes">Disables scaling everywhere. Tags: <strong>[nomulti]</strong> or <strong>[nm]</strong>.</p>
    </div>
    <div class="form-group">
        <label>Disable 10x on Sheet Only</label>
        <div class="form-fields">
            <input type="checkbox" name="flags.${MODULE_ID}.disable10xSheet" ${disable10xSheet ? "checked" : ""}>
        </div>
        <p class="notes">Raw on sheet, scales in chat rolls. Tags: <strong>[nomulti:sheet]</strong>, <strong>[nosheet]</strong>, or <strong>[nms]</strong>.</p>
    </div>
    <div class="form-group">
        <label>Disable 10x on Rolls/Cards Only</label>
        <div class="form-fields">
            <input type="checkbox" name="flags.${MODULE_ID}.disable10xCard" ${disable10xCard ? "checked" : ""}>
        </div>
        <p class="notes">Scales on sheet, raw in chat rolls. Tags: <strong>[nomulti:card]</strong>, <strong>[nocard]</strong>, or <strong>[nmc]</strong>.</p>
    </div>
  `;
  $target.append(flagsHtml);
});

// ─── READY: SYSTEM OVERRIDES & REGISTRY PATCH ─────────────────────────────

Hooks.once("ready", () => {
  if (game.system?.id !== "pf1") return;

  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltCharacterSheetPF, { label: game.i18n.localize("PF1AR.CharacterSheetLabel"), types: ["character"], makeDefault: false });
  DocumentSheetConfig.registerSheet(Actor, MODULE_ID, AltNPCSheetPF, { label: game.i18n.localize("PF1AR.NPCSheetLabel"), types: ["npc"], makeDefault: false });
  DocumentSheetConfig.updateDefaultSheets();

  if (game.settings.get(MODULE_ID, "enable10xGranularity") && pf1.config) {
    pf1.config.classSkillBonus = 30;
    pf1.config.nonProficiencyPenalty = -40;
  }

  _patchConditionRegistry();
});

// ─── STYLESHEET INJECTION ─────────────────────────────────────────────────

Hooks.once("init", () => {
  const aerisStyles = document.createElement("style");
  aerisStyles.innerHTML = `
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

  const EXCLUDE_TAG_REGEX = /\b(str|dex|con|int|wis|cha|strength|dexterity|constitution|intelligence|wisdom|charisma|bab|base attack bonus|ranks|rank|skill ranks|acp|armor check penalty|nomulti|nm|nomulti:sheet|nosheet|nmsheet|nms|nomulti:card|nocard|nmcard|nmc|sc|scaled|_pf1arscaled)\b/i;

  // 1. Roll Evaluation Hook
  libWrapper.register(MODULE_ID, "Roll.prototype._evaluate", async function (wrapped, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      const itemData = this.data?.item || this.options?.item || (this.data?.flags ? this.data : null);
      const isItemGlobalDisabled = itemData?.flags?.[MODULE_ID]?.disable10x === true;
      const isItemCardDisabled = itemData?.flags?.[MODULE_ID]?.disable10xCard === true;
      const skipCardScaling = isItemGlobalDisabled || isItemCardDisabled;

      for (let i = 0; i < this.terms.length; i++) {
        let term = this.terms[i];
        if (!term.options) term.options = {};

        if (term.faces && term.faces <= 20 && !term.options._pf1arScaled) {
          if (!skipCardScaling) {
            term.faces *= 10;
          }
          term.options._pf1arScaled = true;
        }

        const isNumericTerm = term.number !== undefined && term.faces === undefined;
        if (isNumericTerm && !term.options._pf1arScaled) {
          let prevTerm = i > 0 ? this.terms[i - 1] : null;
          let nextTerm = i < this.terms.length - 1 ? this.terms[i + 1] : null;
          
          let isMultiplier = (prevTerm && ["*", "/"].includes(prevTerm.operator)) || (nextTerm && ["*", "/"].includes(nextTerm.operator));
          let isFirstTerm = (i === 0);
          let flavor = String(term.options?.flavor || "").toLowerCase();

          let isExcluded = skipCardScaling || EXCLUDE_TAG_REGEX.test(flavor);

          if (!isMultiplier && !isFirstTerm && !isExcluded) {
            let val = term.number;
            if (val !== 0 && Math.abs(val) < 10) {
              term.number = val * 10;
              if (term._evaluated) {
                try { term.total = term.number; } catch(e) {}
              }
            }
          }
          term.options._pf1arScaled = true;
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
        let itemData = this.data?.item || this.options?.item || (this.data?.flags ? this.data : null);
        if (itemData?.flags?.[MODULE_ID]?.fumbleRange !== undefined) {
          customFumble = Number(itemData.flags[MODULE_ID].fumbleRange);
        }
      } catch (e) {}

      for (let term of this.terms) {
        if (term.faces === 200 && term.results) {
          for (let res of term.results) {
            res.fumble = res.result <= customFumble;
            res.failure = res.result <= customFumble;
          }
        }
      }
    }
    return evaluatedRoll;
  }, "WRAPPER");

  // 2. Base Item Data Hook
  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareBaseData", function (wrapped, ...args) {
    wrapped(...args); 
    
    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      const isGlobalDisabled = this.getFlag(MODULE_ID, "disable10x");
      const isSheetDisabled = this.getFlag(MODULE_ID, "disable10xSheet");

      if (isGlobalDisabled || isSheetDisabled) {
        if (!this.name.includes("[NM]")) this.name = `${this.name} [NM]`;
        return;
      }

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
        res = res.replace(/(min|max)\(\s*([^,]+)\s*,\s*(\d+)\s*\)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, func, variable, num, middle, faces) => {
          let fcs = Number(faces); return hide(`${func}(${variable}, ${num})${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        res = res.replace(/(@[a-zA-Z0-9_.]+)(\s*(?:\[.*?\])?\s*)d(\d+)/gi, (m, variable, middle, faces) => {
          let fcs = Number(faces); return hide(`${variable}${middle}d${fcs <= 20 ? fcs * 10 : fcs}`);
        });
        
        res = res.replace(/\b(\d*)(\s*(?:\[.*?\])?\s*)d(\d+)\b/gi, (m, count, middle, faces) => {
          let scaledFaces = Number(faces) <= 20 ? Number(faces) * 10 : faces;
          return hide(`${count || ""}${middle || ""}d${scaledFaces}`);
        });

        res = res.replace(/(^|[-+]\s*)(@[a-zA-Z0-9_.]+)(\s*(?:\[(.*?)\])?)(?!\s*[*\/xd])/gi, (m, sign, variable, flavorWrap, flavorText) => {
          let flavor = String(flavorText || "").toLowerCase();
          if (EXCLUDE_TAG_REGEX.test(flavor)) return m;
          
          let newFlavor = flavorWrap 
            ? (/\b(sc|scaled)\b/i.test(flavor) ? flavorWrap : flavorWrap.replace(/\]$/, ' sc]'))
            : '[sc]';
          return `${sign}(${variable} * 10)${newFlavor}`;
        });

        res = res.replace(/(^|[-+]\s*)(\d+)(\s*(?:\[(.*?)\])?)(?!\s*[*\/xd])/gi, (m, sign, num, flavorWrap, flavorText) => {
          let val = Number(num);
          let flavor = String(flavorText || "").toLowerCase();
          
          if (EXCLUDE_TAG_REGEX.test(flavor)) return m;
          if (Math.abs(val) >= 10) return m;
          if (isBuff && restrictBuffs && val >= 10) return m;
          
          let newFlavor = flavorWrap 
            ? (/\b(sc|scaled)\b/i.test(flavor) ? flavorWrap : flavorWrap.replace(/\]$/, ' sc]'))
            : '[sc]';
          return `${sign}${val * 10}${newFlavor}`;
        });

        for (const [key, val] of Object.entries(placeholders)) res = res.replace(key, val);
        return res;
      };

      if (this.system?.armor) {
        if (this._source?.system?.armor?.value != null) this.system.armor.value = Number(this._source.system.armor.value) * 10;
        if (this._source?.system?.armor?.acp != null) this.system.armor.acp = Number(this._source.system.armor.acp) * 10;
        if (this._source?.system?.armor?.dex != null) {
          let d = Number(this._source.system.armor.dex);
          if (!isNaN(d) && Math.abs(d) < 10) this.system.armor.dex = d * 10;
        }
      }

      if (this.system?.enh !== undefined || this._source?.system?.enh !== undefined) {
        let rawEnh = Number(this._source?.system?.enh ?? this.system.enh);
        if (!isNaN(rawEnh) && rawEnh !== 0 && Math.abs(rawEnh) < 10) {
          this.system.enh = rawEnh * 10;
        }
      }

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
            let cRange = action.ability.critRange ?? action.critRange;
            if (cRange === undefined || cRange === null || cRange === "") {
              action.ability.critRange = 191;
              action.critRange = 191;
            } else {
              cRange = Number(cRange);
              if (!isNaN(cRange)) {
                let scaled = (cRange > 0 && cRange <= 20) ? (cRange * 10) - 9 : cRange;
                action.ability.critRange = scaled;
                action.critRange = scaled;
              }
            }
          }
        });
      }
    }
  }, "WRAPPER");

  // 3. Item Derived Data Hook
  libWrapper.register(MODULE_ID, "CONFIG.Item.documentClass.prototype.prepareDerivedData", function (wrapped, ...args) {
    wrapped(...args);

    if (game.system.id === "pf1" && game.settings.get(MODULE_ID, "enable10xGranularity")) {
      const isGlobalDisabled = this.getFlag(MODULE_ID, "disable10x");
      const isSheetDisabled = this.getFlag(MODULE_ID, "disable10xSheet");
      if (isGlobalDisabled || isSheetDisabled) return;

      if (this.system?.armor) {
        if (this._source?.system?.armor?.value != null) {
          this.system.armor.value = Number(this._source.system.armor.value) * 10;
        }
        if (this._source?.system?.armor?.acp != null) {
          this.system.armor.acp = Number(this._source.system.armor.acp) * 10;
        }
        if (this._source?.system?.armor?.dex != null) {
          let d = Number(this._source.system.armor.dex);
          if (!isNaN(d) && Math.abs(d) < 10) {
            this.system.armor.dex = d * 10;
          }
        }
      }

      if (this._source?.system?.enh != null || this.system?.enh != null) {
        let rawEnh = Number(this._source?.system?.enh ?? this.system.enh);
        if (!isNaN(rawEnh) && rawEnh !== 0 && Math.abs(rawEnh) < 10) {
          this.system.enh = rawEnh * 10;
        }
      }

      if (this.system?.armor && typeof this.system.armor.value === "number") {
        const enhVal = Number(this.system.enh) || 0;
        if (this.system.armor.ac !== undefined) this.system.armor.ac = this.system.armor.value + enhVal;
        if (this.system.armor.total !== undefined) this.system.armor.total = this.system.armor.value + enhVal;
      }
    }
  }, "WRAPPER");

  // 4. Ability Modifier Hook (100-base conversion)
  libWrapper.register(MODULE_ID, "pf1.utils.getAbilityModifier", function (wrapped, score, ...args) {
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && typeof score === "number") {
      return Math.floor((score - 100) / 2);
    }
    return wrapped(score, ...args);
  }, "MIXED");

  // 5. DC Hook
  libWrapper.register(MODULE_ID, "pf1.components.ItemAction.prototype.getDC", function(wrapped, ...args) {
    let result = wrapped(...args);
    if (game.settings.get(MODULE_ID, "enable10xGranularity") && result != null) {
      const sl = this.spellLevel ?? this.item?.spellLevel ?? 0;
      const bonus = 90 + (sl * 9);
      if (typeof result === "number") result += bonus;
      else if (result.value !== undefined) result.value += bonus;
    }
    return result;
  }, "WRAPPER");

  // 6. Actor Derived Data Hook
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

      if (this.system.attributes?.maxDexBonus !== undefined && this.system.attributes.maxDexBonus !== null) {
        let mdb = Number(this.system.attributes.maxDexBonus);
        if (!isNaN(mdb) && Math.abs(mdb) < 10) {
          this.system.attributes.maxDexBonus = mdb * 10;
        }
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
      } else if (this.system.attributes?.bab?.total !== undefined) {
        this.system.attributes.bab.total *= 10;
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

// ─── CHAT HOOKS: BROADCASTING & JQUERY SCRUBBING ──────────────────────────

Hooks.on("preCreateChatMessage", (message, updateData, options, userId) => {
  if (game.user.id !== userId) return;

  let exportedRolls = [];
  let agnosticResult = null;
  let isFumble = false;

  const attacks = message?.system?.rolls?.attacks;
  if (attacks && Array.isArray(attacks) && attacks.length > 0) {
    attacks.forEach(attackGroup => {
      const atkRoll = attackGroup.attack;
      if (atkRoll?.terms?.[0]?.faces === 200) {
        const mainDie = atkRoll.terms[0];
        agnosticResult = mainDie.total; 
        if (mainDie.results.some(res => res.fumble)) isFumble = true;
        try { exportedRolls.push(JSON.stringify(atkRoll.toJSON())); } catch (e) {}
      }
    });
  }

  const stdRolls = message.rolls;
  if (stdRolls && Array.isArray(stdRolls) && stdRolls.length > 0) {
    stdRolls.forEach(roll => {
      if (roll?.terms?.[0]?.faces === 200) {
        const mainDie = roll.terms[0];
        agnosticResult = mainDie.total;
        if (mainDie.results.some(res => res.fumble || res.result <= 10)) isFumble = true;
      }
    });
  }

  let injectedData = {};
  if (agnosticResult !== null) {
    injectedData["flags.aeris.d200Result"] = agnosticResult;
    injectedData["flags.aeris.isFumble"] = isFumble;
    if (exportedRolls.length > 0) injectedData.rolls = exportedRolls;
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
          $(this).removeClass('critical success max fumble min natural-1 natural-20').addClass('aeris-crit-fail');
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
        $(this).removeClass('critical success max natural-20').addClass('aeris-crit-fail-die');
        $totals.removeClass('critical success max fumble min natural-1 natural-20').addClass('aeris-crit-fail');
        $container.removeClass('critical success max natural-20');
      } else if (!isCrit && dieVal >= 20) {
        $(this).removeClass('critical success max natural-20');
        $totals.removeClass('critical success max natural-20');
        $container.removeClass('critical success max natural-20');
        $totals.css({ 'color': 'unset', 'text-shadow': 'none', 'background-color': 'transparent' });
      }
    }
  });
});