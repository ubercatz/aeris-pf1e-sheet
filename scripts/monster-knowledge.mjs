/**
 * @file scripts/monster-knowledge.mjs
 * Automated PF1e Monster Identification & Misinformation Engine
 * Module: pf1-altsheet-reworked
 */

export const MODULE_ID = "pf1-altsheet-reworked";

/* -------------------------------------------- */
/* Taxonomy Registries & Knowledge Skill Tables  */
/* -------------------------------------------- */

export const CREATURE_TYPE_SKILLS = {
  aberration: "kdu",
  animal: "kna",
  construct: "kar",
  dragon: "kar",
  fey: "kna",
  humanoid: "klo",
  magicalbeast: "kar",
  monstrous_humanoid: "kna",
  ooze: "kdu",
  outsider: "kpl",
  plant: "kna",
  undead: "kre",
  vermin: "kna"
};

export const ELEMENT_POOL = ["acid", "cold", "electricity", "fire", "sonic"];

export const DR_BYPASS_POOL = [
  "adamantine", "cold iron", "silver", 
  "bludgeoning", "piercing", "slashing", 
  "good", "evil", "lawful", "chaotic", "magic"
];

export const ARCHETYPE_MISINFO_POOL = {
  undead: [
    "Inflicts temporary negative levels on direct unarmed contact.",
    "Projects an unnatural fear aura within 30 feet that unnerves attackers.",
    "Bypasses physical armor entirely with incorporeal or necrotic touch attacks.",
    "Paralyzes mortal targets on a successful claw or slam strike."
  ],
  aberration: [
    "Projects a psychic confusion gaze that disorients targets on eye contact.",
    "Exudes a reactive caustic slime that degrades weapons upon physical impact.",
    "Possesses barbed tentacular appendages that immediately grab and constrict.",
    "Emits a disorienting sonic screech that disrupts spellcasting."
  ],
  outsider: [
    "Maintains constant supernatural truesight, seeing through magical deception.",
    "Capably blinks through the ethereal plane at will via short-range jaunts.",
    "Delivers a virulent extraplanar poison that drains physical constitution.",
    "Protected by ancient planar warding that completely shunts aside mortal spells."
  ],
  magicalbeast: [
    "Breathes a sweeping line of concentrated elemental energy when provoked.",
    "Exudes petrifying fumes capable of gradually turning flesh to stone.",
    "Tramples underfoot any creature smaller than its physical frame.",
    "Bleeds caustic fluid that corrodes metal and burns exposed flesh."
  ],
  construct: [
    "Repairs structural damage rapidly through ambient arcane conductivity.",
    "Detonates violently with jagged shrapnel when reduced to zero structural integrity.",
    "Absorbs specific elemental spells to accelerate its physical strike speed.",
    "Possesses internal gyroscopic locks immune to tripping and bull rushes."
  ],
  dragon: [
    "Enveloped in an oppressive aura of dragonfear that induces immediate panic.",
    "Can crush multiple medium opponents beneath its massive belly slam.",
    "Possesses specialized scales that reflect targeted ray spells back at the caster.",
    "Breathes a cloud of paralyzing spores in addition to elemental ruin."
  ],
  default: [
    "Averse to direct natural sunlight, suffering severe optical degradation.",
    "Averse to crossing running water under its own power.",
    "Compulsively halts to inspect intricate geometric figures or count scattered grains.",
    "Easily fascinated or distracted by bright alchemical flashes and polished mirrors."
  ]
};

export const PHANTOM_TEMPLATES = [
  {
    name: "Fiendish Infusion",
    claim: "This specimen carries an abyssal taint, granting darkvision, fire and cold resistance, and spell resistance.",
    audit: "Phantom Template: Fiendish"
  },
  {
    name: "Celestial Blessing",
    claim: "A blessed or sanctified specimen, resistant to acid, cold, and electricity with divine spell resistance.",
    audit: "Phantom Template: Celestial"
  },
  {
    name: "Apex Alpha (Advanced)",
    claim: "An exceptionally formidable alpha specimen displaying unnatural speed, thicker hide, and heightened lethal instinct.",
    audit: "Phantom Template: Advanced"
  },
  {
    name: "Gravebound Skeleton",
    claim: "Stripped of mortal organs; entirely impervious to cold and turning aside non-bludgeoning weaponry.",
    audit: "Phantom Template: Skeleton"
  },
  {
    name: "Rotting Zombie",
    claim: "A lumbering undead chassis; deadened to physical pain and bypassed only by clean slashing blows.",
    audit: "Phantom Template: Zombie"
  }
];

/* -------------------------------------------- */
/* Core Modular Engine                          */
/* -------------------------------------------- */

export class MonsterKnowledgeEngine {

  static registerSettings() {
    game.settings.register(MODULE_ID, "idEnforceBlind", {
      name: "Enforce Blind Knowledge Rolls",
      hint: "Forces all monster identification rolls to execute as Blind GM Rolls, keeping the roll margin hidden from players.",
      scope: "world",
      config: true,
      type: Boolean,
      default: false
    });

    game.settings.register(MODULE_ID, "idAutomateMisinfo", {
      name: "Automate Procedural Misinformation",
      hint: "Procedurally synthesizes believable falsehoods when a check fails by 5 or more.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
    });

    game.settings.register(MODULE_ID, "idMisinfoStep", {
      name: "Misinformation Penalty Threshold",
      hint: "The margin below DC required to trigger critical failure misinformation (Pathfinder default is -5).",
      scope: "world",
      config: true,
      type: Number,
      default: 5
    });
  }

  static async identifyTarget(sourceActor, targetToken = null) {
    if (!sourceActor) {
      ui.notifications.warn("No source character provided for monster identification.");
      return;
    }

    const token = targetToken || game.user.targets.first();
    if (!token || !token.actor) {
      ui.notifications.warn("Target an enemy token before attempting identification.");
      return;
    }

    const targetActor = token.actor;
    const taxonomy = this.extractTaxonomy(targetActor);
    const templates = this.getAppliedTemplates(targetActor);
    const hasTemplates = templates.length > 0;

    // Check system 10x Granularity world setting
    const is10x = Boolean(game.settings.get(MODULE_ID, "enable10xGranularity"));

    // Base DC: 10 + CR (or 15 + CR for rare / templated / uncommon)
    const isRare = targetActor.getFlag(MODULE_ID, "isRareMonster") || taxonomy.tags.has("rare") || taxonomy.tags.has("uncommon") || hasTemplates;
    const baseDcMod = isRare ? 15 : 10;
    
    // Calculate DC with 10x scaling support
    const targetDc = is10x ? Math.round((baseDcMod + taxonomy.cr) * 10) : Math.round(baseDcMod + taxonomy.cr);

    // Roll Knowledge check
    const skillKey = taxonomy.skillKey;
    const enforceBlind = game.settings.get(MODULE_ID, "idEnforceBlind");
    const rollOptions = enforceBlind ? { rollMode: CONST.DICE_ROLL_MODES.BLIND } : {};

    const rawRoll = await sourceActor.rollSkill(skillKey, rollOptions);
    if (!rawRoll) return; // User closed dialog

    // Robust unwrapping: PF1e rollSkill returns Roll[], a Roll, or an object containing rolls
    const rollObj = Array.isArray(rawRoll) ? rawRoll[0] : (rawRoll.rolls ? rawRoll.rolls[0] : rawRoll);
    const rollTotal = Number(rollObj?.total);

    if (isNaN(rollTotal)) {
      console.error("PF1e Alt Sheet | Failed to read roll total from rollSkill:", rawRoll);
      ui.notifications.error("Unable to evaluate Knowledge roll total.");
      return;
    }

    const margin = rollTotal - targetDc;
    const step = game.settings.get(MODULE_ID, "idMisinfoStep") * (is10x ? 10 : 1);
    const marginDivisor = 5 * (is10x ? 10 : 1);

    let outcome = "failure";
    let atoms = [];

    if (margin >= 0) {
      outcome = "success";
      const unlockedCount = 1 + Math.floor(margin / marginDivisor);
      atoms = this.generateTrueAtoms(targetActor, unlockedCount, taxonomy, templates);
    } else if (margin > -step) {
      outcome = "failure";
      atoms = [{
        id: "failure_generic",
        category: "failure",
        traitType: "NONE",
        factualState: "TRUE_FACT",
        formattedClaim: "You search your memory, but fail to recall any distinctive details about this creature.",
        auditData: `Margin: ${margin} (Failed by less than ${step})`
      }];
    } else {
      outcome = "misinformation";
      const falseCount = 1 + Math.floor((Math.abs(margin) - step) / marginDivisor);
      const autoMisinfo = game.settings.get(MODULE_ID, "idAutomateMisinfo");

      if (autoMisinfo) {
        atoms = this.generateMisinformationAtoms(targetActor, falseCount, taxonomy, templates);
      } else {
        atoms = [{
          id: "misinfo_manual_prompt",
          category: "misinformation",
          traitType: "MANUAL",
          factualState: "MISINFORMATION",
          formattedClaim: "[The GM will provide custom folkloric misinformation.]",
          auditData: `Margin: ${margin} (Misinformation triggered)`
        }];
      }
    }

    Hooks.call("pf1MonsterIdentification", {
      sourceActor,
      targetToken: token,
      outcome,
      margin,
      targetDc,
      atoms
    });

    await this.renderCards({
      sourceActor,
      targetToken: token,
      outcome,
      margin,
      targetDc,
      taxonomy,
      atoms
    });
  }

  /* -------------------------------------------- */
  /* Taxonomy & Template Extractors               */
  /* -------------------------------------------- */

  static extractTaxonomy(actor) {
    const rawType = (actor.system.traits?.creatureType || "humanoid").toLowerCase().replace(/[^a-z]/g, "");
    const skillKey = CREATURE_TYPE_SKILLS[rawType] || "kna";
    
    const rawSubtypes = actor.system.traits?.subTypes || actor.system.traits?.st || [];
    const subtypes = (Array.isArray(rawSubtypes) ? rawSubtypes : [rawSubtypes])
      .map(s => String(s).toLowerCase().trim())
      .filter(Boolean);

    const rawTags = actor.system.tags || [];
    const tags = new Set((Array.isArray(rawTags) ? rawTags : [rawTags]).map(t => String(t).toLowerCase().trim()));

    // Extract CR as a clean float
    const cr = Number(actor.system.details?.cr?.total ?? actor.system.details?.cr?.base ?? 1);

    return {
      type: rawType,
      skillKey,
      subtypes,
      tags,
      cr: isNaN(cr) ? 1 : cr
    };
  }

  static getAppliedTemplates(actor) {
    const templateItems = actor.items.filter(i => i.type === "template").map(i => i.name.trim());
    const rawTraits = actor.system.details?.templates || actor.system.traits?.templates || [];
    const traitList = (Array.isArray(rawTraits) ? rawTraits : [rawTraits]).map(t => String(t).trim());
    return [...new Set([...templateItems, ...traitList])].filter(Boolean);
  }

  /* -------------------------------------------- */
  /* Authentic Atom Generation Pipeline           */
  /* -------------------------------------------- */

  static generateTrueAtoms(actor, count, taxonomy, templates) {
    const pool = [];

    // 1. Identity & Applied Templates
    if (templates.length > 0) {
      pool.push({
        id: "id_template",
        category: "identity",
        traitType: "TEMPLATE",
        factualState: "TRUE_FACT",
        formattedClaim: `Distinguished as a specialized variant possessing the <strong>${templates.join(", ")}</strong> template(s).`,
        auditData: `Actual Templates: ${templates.join(", ")}`
      });
    }

    const subTypeStr = taxonomy.subtypes.length ? ` (${taxonomy.subtypes.join(", ")})` : "";
    pool.push({
      id: "id_classification",
      category: "identity",
      traitType: "IDENTITY",
      factualState: "TRUE_FACT",
      formattedClaim: `Classified as a creature of the <strong>${taxonomy.type.toUpperCase()}${subTypeStr}</strong> classification.`,
      auditData: `Type: ${taxonomy.type}, Subtypes: [${taxonomy.subtypes.join(", ")}]`
    });

    // 2. Senses & Locomotion
    const senses = actor.system.traits?.senses?.value || actor.system.traits?.senses || "";
    const speed = actor.system.attributes?.speed?.land?.total || actor.system.attributes?.speed?.land?.base;
    if (senses || speed) {
      const senseText = senses ? `Senses: ${senses}` : "";
      const speedText = speed ? `Land Speed: ${speed} ft.` : "";
      pool.push({
        id: "id_senses",
        category: "identity",
        traitType: "SENSES_MOBILITY",
        factualState: "TRUE_FACT",
        formattedClaim: `Locomotion & Awareness: <strong>${[senseText, speedText].filter(Boolean).join(" | ")}</strong>.`,
        auditData: `Senses: "${senses}", Land Speed: ${speed}`
      });
    }

    // 3. Defensive Traits: Damage Reduction
    const drList = actor.system.traits?.dr?.value || [];
    if (drList.length > 0) {
      const drText = drList.map(d => `${d.amount}/${d.operator || "—"}`).join(", ");
      pool.push({
        id: "def_dr",
        category: "defense",
        traitType: "DR",
        factualState: "TRUE_FACT",
        formattedClaim: `Possesses Damage Reduction bypassed only by <strong>${drList.map(d => d.operator).filter(Boolean).join(" or ") || "specific armaments"}</strong>.`,
        auditData: `DR: ${drText}`
      });
    }

    // 4. Defensive Traits: Energy Resistances & Immunities
    const eres = actor.system.traits?.eres?.value || [];
    if (eres.length > 0) {
      pool.push({
        id: "def_eres",
        category: "defense",
        traitType: "ENERGY_RESIST",
        factualState: "TRUE_FACT",
        formattedClaim: `Naturally resistant to <strong>${eres.map(r => r.name || r).join(", ")}</strong> damage.`,
        auditData: `Resistances: ${eres.join(", ")}`
      });
    }

    const di = actor.system.traits?.di?.value || [];
    if (di.length > 0) {
      pool.push({
        id: "def_di",
        category: "defense",
        traitType: "ENERGY_IMMUNITY",
        factualState: "TRUE_FACT",
        formattedClaim: `Completely immune to <strong>${di.join(", ")}</strong> effects.`,
        auditData: `Immunities: ${di.join(", ")}`
      });
    }

    // 5. Weaknesses & Lowest Saving Throw
    const dv = actor.system.traits?.dv?.value || [];
    if (dv.length > 0) {
      pool.push({
        id: "weak_vuln",
        category: "weakness",
        traitType: "ENERGY_VULN",
        factualState: "TRUE_FACT",
        formattedClaim: `Suffers crippling vulnerability (+50% damage) to <strong>${dv.join(", ")}</strong> damage.`,
        auditData: `Vulnerabilities: ${dv.join(", ")}`
      });
    }

    const saves = actor.system.attributes?.savingThrows || {};
    const f = saves.fort?.total ?? 0;
    const r = saves.ref?.total ?? 0;
    const w = saves.will?.total ?? 0;
    let lowestSave = "Fortitude";
    if (r < f && r <= w) lowestSave = "Reflex";
    else if (w < f && w < r) lowestSave = "Will";

    pool.push({
      id: "weak_save",
      category: "weakness",
      traitType: "SAVE_WEAKNESS",
      factualState: "TRUE_FACT",
      formattedClaim: `Tactical deficiency noted: Its <strong>${lowestSave}</strong> save is its weakest defense.`,
      auditData: `Saves: Fort +${f}, Ref +${r}, Will +${w}`
    });

    // 6. Special Attacks & Abilities
    const specialAttacks = actor.items.filter(i => i.type === "attack" && (i.system?.attackType === "special" || i.system?.subType === "special"));
    if (specialAttacks.length > 0) {
      const atk = specialAttacks[0];
      pool.push({
        id: "off_special_attack",
        category: "offense",
        traitType: "SPECIAL_ATTACK",
        factualState: "TRUE_FACT",
        formattedClaim: `Capable of deploying a hazardous <strong>${atk.name}</strong> combat ability.`,
        auditData: `Attack Item: ${atk.name}`
      });
    }

    return pool.slice(0, Math.max(1, count));
  }

  /* -------------------------------------------- */
  /* Procedural Misinformation Engine             */
  /* -------------------------------------------- */

  static generateMisinformationAtoms(actor, count, taxonomy, templates) {
    const atoms = [];
    const usedCategories = new Set();

    // 1. Template Misdirection
    if (templates.length > 0 && !usedCategories.has("template")) {
      const isSkeleton = templates.some(t => t.toLowerCase().includes("skeleton"));
      if (isSkeleton) {
        atoms.push({
          id: "mis_template_zombie",
          category: "template",
          traitType: "TEMPLATE",
          factualState: "MISINFORMATION",
          formattedClaim: "Animated through fleshy necrotic rites (Zombie); its rotting bulk turns aside all but clean slashing weapons.",
          auditData: `Told PC: Zombie (DR/Slashing). True Templates: ${templates.join(", ")} (Skeleton)`
        });
      } else {
        atoms.push({
          id: "mis_template_sickly",
          category: "template",
          traitType: "TEMPLATE",
          factualState: "MISINFORMATION",
          formattedClaim: "Displays severe malnourishment and stunted growth; treat as a sickly juvenile with reduced defenses.",
          auditData: `Told PC: Sickly Juvenile. True Templates: ${templates.join(", ")}`
        });
      }
      usedCategories.add("template");
    } else if (!usedCategories.has("template") && Math.random() < 0.5) {
      const phantom = PHANTOM_TEMPLATES[Math.floor(Math.random() * PHANTOM_TEMPLATES.length)];
      atoms.push({
        id: "mis_phantom_template",
        category: "template",
        traitType: "TEMPLATE",
        factualState: "MISINFORMATION",
        formattedClaim: phantom.claim,
        auditData: phantom.audit + " (True creature has no templates)"
      });
      usedCategories.add("template");
    }

    // 2. Randomized Elemental Resistance or False Vulnerability
    if (atoms.length < count && !usedCategories.has("element")) {
      const trueDi = (actor.system.traits?.di?.value || []).map(v => v.toLowerCase());
      const trueDv = (actor.system.traits?.dv?.value || []).map(v => v.toLowerCase());
      const trueRes = (actor.system.traits?.eres?.value || []).map(v => (v.name || v).toLowerCase());

      const neutralElements = ELEMENT_POOL.filter(e => !trueDi.includes(e) && !trueDv.includes(e) && !trueRes.includes(e));
      const targetElement = neutralElements.length > 0 ? neutralElements[Math.floor(Math.random() * neutralElements.length)] : "fire";

      if (Math.random() > 0.5) {
        atoms.push({
          id: `mis_vuln_${targetElement}`,
          category: "weakness",
          traitType: "ENERGY_VULN",
          factualState: "MISINFORMATION",
          formattedClaim: `Possesses extreme vulnerability (+50% damage) to <strong>${targetElement.toUpperCase()}</strong> damage.`,
          auditData: `Told PC: Vulnerable to ${targetElement}. True Immunities: [${trueDi.join(", ")}], Vulnerabilities: [${trueDv.join(", ")}]`
        });
      } else {
        atoms.push({
          id: `mis_resist_${targetElement}`,
          category: "defense",
          traitType: "ENERGY_RESIST",
          factualState: "MISINFORMATION",
          formattedClaim: `Its hide naturally absorbs and negates <strong>${targetElement.toUpperCase()}</strong> damage.`,
          auditData: `Told PC: Resists ${targetElement}. True Resistances: [${trueRes.join(", ")}]`
        });
      }
      usedCategories.add("element");
    }

    // 3. DR Bypass Material Inversion
    if (atoms.length < count && !usedCategories.has("dr")) {
      const trueDr = actor.system.traits?.dr?.value || [];
      const trueBypasses = trueDr.map(d => (d.operator || "").toLowerCase());
      const falseBypasses = DR_BYPASS_POOL.filter(m => !trueBypasses.includes(m));
      const falseMaterial = falseBypasses[Math.floor(Math.random() * falseBypasses.length)] || "cold iron";

      atoms.push({
        id: "mis_dr_bypass",
        category: "defense",
        traitType: "DR",
        factualState: "MISINFORMATION",
        formattedClaim: `Possesses damage reduction penetrated only by weapons forged from <strong>${falseMaterial.toUpperCase()}</strong>.`,
        auditData: `Told PC: DR bypassed by ${falseMaterial}. True DR: ${trueDr.map(d => `${d.amount}/${d.operator}`).join(", ") || "None"}`
      });
      usedCategories.add("dr");
    }

    // 4. Save Defect Reversal
    if (atoms.length < count && !usedCategories.has("save")) {
      const saves = actor.system.attributes?.savingThrows || {};
      const savePairs = [
        { name: "Fortitude", val: saves.fort?.total ?? 0 },
        { name: "Reflex", val: saves.ref?.total ?? 0 },
        { name: "Will", val: saves.will?.total ?? 0 }
      ].sort((a, b) => b.val - a.val);

      const falseWeakness = savePairs[0].name;
      atoms.push({
        id: "mis_save_defect",
        category: "weakness",
        traitType: "SAVE_WEAKNESS",
        factualState: "MISINFORMATION",
        formattedClaim: `Its physical balance and responses are brittle; target its <strong>${falseWeakness.toUpperCase()}</strong> save.`,
        auditData: `Told PC to target ${falseWeakness} (+${savePairs[0].val}). Lowest save is actually ${savePairs[2].name} (+${savePairs[2].val})`
      });
      usedCategories.add("save");
    }

    // 5. Archetype Cross-Hallucination or Folk Myth
    while (atoms.length < count) {
      const typeKey = ARCHETYPE_MISINFO_POOL[taxonomy.type] ? taxonomy.type : "default";
      const pool = ARCHETYPE_MISINFO_POOL[typeKey];
      const claim = pool[Math.floor(Math.random() * pool.length)];

      atoms.push({
        id: `mis_archetype_${atoms.length}`,
        category: "offense",
        traitType: "SPECIAL_ATTACK",
        factualState: "MISINFORMATION",
        formattedClaim: claim,
        auditData: `Attributed Archetype Feature (${typeKey}) to ${actor.name}`
      });
    }

    return atoms.slice(0, count);
  }

  /* -------------------------------------------- */
  /* Chat Card Rendering (Player vs GM Whisper)    */
  /* -------------------------------------------- */

  static async renderCards({ sourceActor, targetToken, outcome, margin, targetDc, taxonomy, atoms }) {
    // Correct localized skill name lookup
    const rawSkillName = sourceActor.system.skills[taxonomy.skillKey]?.name 
      || (pf1.config?.skills?.[taxonomy.skillKey] ? game.i18n.localize(pf1.config.skills[taxonomy.skillKey]) : null)
      || "Knowledge";

    // Format fractional CR (e.g. 1/3) for clean display
    let crDisplay = String(taxonomy.cr);
    if (Math.abs(taxonomy.cr - 1/3) < 0.05 || taxonomy.cr === 0.3375) crDisplay = "1/3";
    else if (Math.abs(taxonomy.cr - 1/2) < 0.05) crDisplay = "1/2";
    else if (Math.abs(taxonomy.cr - 1/4) < 0.05) crDisplay = "1/4";
    else if (Math.abs(taxonomy.cr - 1/8) < 0.05) crDisplay = "1/8";

    // 1. Player Card
    const playerCardHtml = `
      <div class="pf1 chat-card monster-id-card aeris-knowledge-card">
        <header class="card-header flexrow" style="display:flex; align-items:center; gap:8px; border-bottom:1px solid #747d8c; padding-bottom:4px; margin-bottom:6px;">
          <img src="${targetToken.document.texture.src}" width="32" height="32" style="border-radius:4px;" />
          <h3 style="margin:0; font-size:1.1em;">${outcome === "failure" ? "Unidentified Entity" : targetToken.name}</h3>
        </header>
        <div class="card-content" style="font-size:0.9em; line-height:1.4;">
          <p style="margin-bottom:4px;"><strong>${sourceActor.name}</strong> recalls the following lore via <em>${rawSkillName}</em>:</p>
          <ul style="padding-left:18px; margin:4px 0;">
            ${atoms.map(a => `<li style="margin-bottom:3px;">${a.formattedClaim}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
      content: playerCardHtml,
      whisper: [game.user.id, ...ChatMessage.getWhisperRecipients("GM")]
    });

    // 2. GM Diagnostic Card
    const statusColor = outcome === "success" ? "#27ae60" : outcome === "failure" ? "#f39c12" : "#c0392b";
    const auditRows = atoms.map(a => `
      <div style="border-bottom:1px solid rgba(0,0,0,0.06); padding:3px 0; font-size:0.8em;">
        <span style="font-weight:bold; color:${a.factualState === "MISINFORMATION" ? "#c0392b" : "#27ae60"};">[${a.factualState}]</span>
        <strong>${a.traitType}:</strong> ${a.auditData}
      </div>
    `).join("");

    const gmCardHtml = `
      <div class="pf1 chat-card aeris-gm-audit" style="border-left:4px solid ${statusColor}; padding-left:8px;">
        <header style="border-bottom:1px solid #ccc; margin-bottom:4px;">
          <strong style="font-size:0.95em;">[GM Knowledge Audit] ${targetToken.name}</strong>
        </header>
        <div style="font-size:0.85em; line-height:1.3;">
          <div><strong>Actor:</strong> ${sourceActor.name} | <strong>Skill:</strong> ${rawSkillName}</div>
          <div><strong>Target DC:</strong> ${targetDc} (CR ${crDisplay}) | <strong>Margin:</strong> ${margin >= 0 ? `+${margin}` : margin}</div>
          <div><strong>Engine State:</strong> <span style="color:${statusColor}; font-weight:bold;">${outcome.toUpperCase()}</span></div>
        </div>
        <div style="margin-top:6px; background:rgba(0,0,0,0.02); border:1px solid #ddd; border-radius:4px; padding:4px;">
          <strong>Data Verification Payload:</strong>
          ${auditRows || '<div style="color:#777; font-style:italic;">No data items returned.</div>'}
        </div>
      </div>
    `;

    await ChatMessage.create({
      content: gmCardHtml,
      whisper: ChatMessage.getWhisperRecipients("GM")
    });
  }
}

// Hook initialization
Hooks.once("init", () => {
  MonsterKnowledgeEngine.registerSettings();
});