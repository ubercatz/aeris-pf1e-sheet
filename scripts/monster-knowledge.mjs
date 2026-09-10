/**
 * @file scripts/monster-knowledge.mjs
 * Automated PF1e Monster Identification & Misinformation Engine
 * Module: pf1-altsheet-reworked
 */

export const MODULE_ID = "pf1-altsheet-reworked";

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

export const STANDARD_TEMPLATES = {
  advanced: "An exceptionally formidable alpha specimen displaying unnatural speed, tougher hide, and heightened lethal instinct.",
  giant: "An abnormally overgrown specimen possessing enormous reach, elevated mass, and crushing physical power.",
  celestial: "A sanctified planar specimen resistant to acid, cold, and electricity, warding mortal magic with divine spell resistance.",
  fiendish: "Carries an abyssal taint; possesses cold and fire resistance, darkvision, and spell resistance.",
  skeleton: "Stripped of mortal organs; entirely impervious to cold and turning aside non-bludgeoning weaponry.",
  zombie: "A lumbering undead chassis; deadened to physical pain and bypassed only by clean slashing blows.",
  lich: "An undead arcanist bound to a phylactery; immune to cold and electricity, protected by spell resistance and damage reduction.",
  vampire: "An aristocratic blood-drinker; fast healing, dominated gaze attack, gaseous retreat, and vulnerability to sunlight."
};

export const ARCHETYPE_MISINFO_POOL = {
  undead: [
    "Inflicts temporary negative levels on direct unarmed contact.",
    "Projects an unnatural fear aura within 30 feet that unnerves attackers.",
    "Bypasses physical armor entirely with incorporeal touch attacks.",
    "Paralyzes mortal targets on a successful claw or slam strike."
  ],
  aberration: [
    "Projects a psychic confusion gaze that disorients targets on eye contact.",
    "Exudes a reactive caustic slime that degrades weapons upon physical impact.",
    "Possesses barbed tentacular appendages that immediately grab and constrict.",
    "Emits a disorienting sonic screech that disrupts nearby spellcasting."
  ],
  outsider: [
    "Maintains constant supernatural truesight, seeing through magical illusions.",
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
    "Possesses internal gyroscopic locks immune to tripping and combat maneuvers."
  ],
  dragon: [
    "Enveloped in an oppressive aura of dragonfear that induces immediate panic.",
    "Can crush multiple medium opponents beneath its massive frame.",
    "Possesses specialized scales that reflect targeted ray spells back at the caster.",
    "Breathes a cloud of paralyzing spores in addition to elemental ruin."
  ],
  humanoid: [
    "Carries concealed alchemical blinding flash powder to deter pursuit.",
    "Coats its weaponry in debilitating paralytic venom.",
    "Fights with fanatical zeal; gains ferocity and continues fighting past zero hit points.",
    "Highly superstitious; panics and retreats if presented with fresh wolfsbane or religious icons."
  ],
  default: [
    "Averse to direct natural sunlight, suffering severe visual degradation.",
    "Unable to cross running water under its own power.",
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

export const LORE_REPOSITORY = {
  goblinoid: "Harbors an intense superstition against written words (believing writing steals words from one's head) and possesses a rabid hatred of horses and dogs.",
  orc: "Adheres to a ruthless culture where physical strength is paramount; possesses natural light sensitivity in direct sunlight.",
  kobold: "Skilled sappers and trap architects; revere true dragons with fanatical religious devotion and prefer ambush tactics.",
  undead: "Driven by necrotic compulsion or undying malice toward living organisms; immune to all mental influence, sleep, and natural disease.",
  aberration: "Possesses an alien physiology and bizarre sensory faculties incomprehensible to mortal biology.",
  fey: "Capricious and unpredictable; deeply bound to ancient primordial pacts and inherently resistant to non-cold-iron metals.",
  dragon: "Apex magical predators; possess immense pride, sharp territorial instincts, and complete immunity to sleep and paralysis."
};

const NON_SUBTYPE_TAGS = new Set([
  "uncommon", "rare", "common", "unique", "mythic", "10x scaled", "scaled", "boss", "minion"
]);

export class MonsterKnowledgeEngine {
  static lastAuditPayload = null;

  static registerSettings() {
    game.settings.register(MODULE_ID, "idEnforceBlind", {
      name: "Enforce Blind Knowledge Rolls",
      hint: "Forces monster identification checks to execute as Blind GM Rolls, keeping the roll margin and raw total hidden from players.",
      scope: "world",
      config: true,
      type: Boolean,
      default: true
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

  static cleanHtml(html) {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    let text = doc.body.textContent || "";
    return text.replace(/\s+/g, " ").trim();
  }

  static async identifyTarget(sourceActor = null, targetToken = null) {
    // 1. Resolve source actor safely based on role
    let actor = sourceActor;
    if (!actor) {
      if (!game.user.isGM) {
        // Player: Always prioritize their own assigned character or owned token
        actor = game.user.character 
          || canvas.tokens.controlled.find(t => t.actor?.isOwner)?.actor
          || game.actors.find(a => a.isOwner && a.type === "character");
      } else {
        // GM: Controlled token or assigned character
        actor = canvas.tokens.controlled[0]?.actor || game.user.character;
      }
    }

    if (!actor) {
      ui.notifications.warn("Please select or assign a character token before identifying.");
      return;
    }

    // 2. Resolve target token (the creature to identify)
    let token = targetToken || game.user.targets.first();

    // If a player clicked the enemy token on canvas instead of using the target tool
    if (!token && canvas.tokens.controlled.length > 0) {
      const otherToken = canvas.tokens.controlled.find(t => t.actor && t.actor.id !== actor.id);
      if (otherToken) token = otherToken;
    }

    if (!token || !token.actor) {
      ui.notifications.warn("Please target an enemy creature (press 'T' while hovering over it) before identifying.");
      return;
    }

    if (token.actor.id === actor.id) {
      ui.notifications.warn("You cannot identify yourself! Please target an enemy creature.");
      return;
    }

    const targetActor = token.actor;
    const taxonomy = this.extractTaxonomy(targetActor);
    const templates = this.extractTemplates(targetActor);
    const hasTemplates = templates.length > 0;

    const is10x = Boolean(game.settings.get(MODULE_ID, "enable10xGranularity"));
    const isRare = targetActor.getFlag(MODULE_ID, "isRareMonster") || taxonomy.tags.has("rare") || taxonomy.tags.has("uncommon") || hasTemplates;
    const baseDcMod = isRare ? 15 : 10;
    const targetDc = is10x ? Math.round((baseDcMod + taxonomy.cr) * 10) : Math.round(baseDcMod + taxonomy.cr);

    const skillKey = taxonomy.skillKey;
    const enforceBlind = game.settings.get(MODULE_ID, "idEnforceBlind");
    const rollOptions = enforceBlind ? { rollMode: CONST.DICE_ROLL_MODES.BLIND } : {};

    const rawRoll = await actor.rollSkill(skillKey, rollOptions);
    if (!rawRoll) return;

    // Robust roll total extraction across all PF1e versions
    let rollTotal = NaN;
    if (typeof rawRoll === "number") {
      rollTotal = rawRoll;
    } else if (rawRoll?.total !== undefined) {
      rollTotal = Number(rawRoll.total);
    } else if (Array.isArray(rawRoll) && rawRoll[0]?.total !== undefined) {
      rollTotal = Number(rawRoll[0].total);
    } else if (rawRoll?.rolls && Array.isArray(rawRoll.rolls) && rawRoll.rolls[0]?.total !== undefined) {
      rollTotal = Number(rawRoll.rolls[0].total);
    }

    if (isNaN(rollTotal)) {
      console.error("PF1e Alt Sheet | Failed to read roll total from rollSkill:", rawRoll);
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
      const falseCount = Math.max(1, 1 + Math.floor((Math.abs(margin) - step) / marginDivisor));
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
      sourceActor: actor,
      targetToken: token,
      outcome,
      margin,
      targetDc,
      atoms
    });

    await this.dispatchResults({
      sourceActor: actor,
      targetToken: token,
      outcome,
      margin,
      targetDc,
      taxonomy,
      atoms
    });
  }

  static extractSize(actor) {
    const raw = actor.system.traits?.size;
    if (raw === undefined || raw === null) return "";
    let val = raw;
    if (typeof raw === "object") {
      val = raw.value ?? raw.total ?? raw.label ?? "";
    }
    val = String(val).toLowerCase().trim();

    const sizeMap = {
      "0": "Fine", "fine": "Fine",
      "1": "Diminutive", "dim": "Diminutive", "diminutive": "Diminutive",
      "2": "Tiny", "tiny": "Tiny",
      "3": "Small", "sm": "Small", "small": "Small",
      "4": "Medium", "med": "Medium", "medium": "Medium",
      "5": "Large", "lg": "Large", "large": "Large",
      "6": "Huge", "huge": "Huge",
      "7": "Gargantuan", "grg": "Gargantuan", "gargantuan": "Gargantuan",
      "8": "Colossal", "col": "Colossal", "colossal": "Colossal"
    };

    return sizeMap[val] || (val ? val.charAt(0).toUpperCase() + val.slice(1) : "");
  }

  static extractTemplates(actor) {
    const templates = [];
    const seenNames = new Set();

    const record = (name, desc = "") => {
      if (!name || typeof name !== "string") return;
      const cleanName = name.trim();
      const lower = cleanName.toLowerCase();
      if (!cleanName || seenNames.has(lower)) return;
      seenNames.add(lower);
      templates.push({
        name: cleanName,
        description: this.cleanHtml(desc)
      });
    };

    if (actor.itemTypes?.template) {
      actor.itemTypes.template.forEach(i => record(i.name, i.system?.description?.value));
    }

    actor.items?.forEach(i => {
      const sType = (i.system?.subType || i.system?.featType || "").toLowerCase();
      if (i.type === "template" || sType === "template") {
        record(i.name, i.system?.description?.value);
      }
      if (i.system?.tags?.some?.(t => String(t).toLowerCase().includes("template"))) {
        record(i.name, i.system?.description?.value);
      }
    });

    const directTemplates = actor.system?.details?.templates || actor.system?.traits?.templates || actor.system?.details?.template;
    if (Array.isArray(directTemplates)) {
      directTemplates.forEach(t => typeof t === "object" ? record(t.name, t.description) : record(t));
    } else if (typeof directTemplates === "string") {
      directTemplates.split(/[,;]/).forEach(t => record(t));
    }

    return templates;
  }

  static extractSubtypes(actor) {
    const rawSet = new Set();
    const scan = (v) => {
      if (!v) return;
      if (Array.isArray(v) || v instanceof Set) {
        for (const item of v) scan(item);
      } else if (typeof v === "object") {
        if (v.value) scan(v.value);
        if (v.custom) scan(v.custom);
        if (v.total) scan(v.total);
      } else if (typeof v === "string") {
        v.split(/[,;/|]/).map(s => s.trim()).filter(Boolean).forEach(s => {
          const lower = s.toLowerCase();
          if (!NON_SUBTYPE_TAGS.has(lower)) rawSet.add(lower);
        });
      }
    };

    scan(actor.system?.traits?.st);
    scan(actor.system?.traits?.subTypes);
    scan(actor.system?.traits?.subtypes);
    scan(actor.system?.details?.subType);
    scan(actor.system?.details?.subtypes);

    const raceItem = actor.race || actor.items?.find(i => i.type === "race");
    if (raceItem) {
      scan(raceItem.system?.subType);
      scan(raceItem.system?.subTypes);
      scan(raceItem.system?.subtypes);
      scan(raceItem.system?.st);
      if (raceItem.name && typeof raceItem.name === "string") {
        const rName = raceItem.name.toLowerCase().trim();
        if (rName.includes("goblin") && !rawSet.has("goblinoid")) rawSet.add("goblinoid");
      }
    }

    const fullName = `${actor.name || ""} ${actor.token?.name || ""}`.toLowerCase();
    const commonChecks = ["goblin", "orc", "kobold", "elf", "dwarf", "gnome", "halfling", "giant", "aquatic"];
    for (const c of commonChecks) {
      if (fullName.includes(c)) {
        rawSet.add(c === "goblin" ? "goblinoid" : c);
      }
    }

    return [...rawSet].map(s => s.charAt(0).toUpperCase() + s.slice(1));
  }

  static extractSenses(actor) {
    const senses = actor.system.traits?.senses;
    if (!senses) return "";
    if (typeof senses === "string") return senses.trim();

    const labels = {
      dv: "Darkvision",
      bs: "Blindsight",
      bse: "Blindsense",
      ts: "Tremorsense",
      sc: "Scent",
      tr: "True Seeing",
      ls: "Low-Light Vision"
    };

    const parts = [];
    for (const [key, label] of Object.entries(labels)) {
      const entry = senses[key];
      if (!entry) continue;
      const dist = typeof entry === "object" ? (entry.total ?? entry.value) : entry;
      if (typeof dist === "number" && dist > 0) {
        parts.push(`${label} ${dist} ft.`);
      } else if (dist === true || (typeof dist === "number" && dist === 1 && key === "ls")) {
        parts.push(label);
      }
    }

    if (senses.custom && typeof senses.custom === "string" && senses.custom.trim()) {
      parts.push(senses.custom.trim());
    }
    if (senses.value && typeof senses.value === "string" && senses.value.trim()) {
      parts.push(senses.value.trim());
    }

    return [...new Set(parts)].join(", ");
  }

  static extractSpeeds(actor) {
    const speedObj = actor.system.attributes?.speed;
    if (!speedObj) return "";
    const speeds = [];
    
    const land = speedObj.land?.total ?? speedObj.land?.base;
    if (land) speeds.push(`Land ${land} ft.`);
    const fly = speedObj.fly?.total ?? speedObj.fly?.base;
    if (fly) speeds.push(`Fly ${fly} ft.`);
    const swim = speedObj.swim?.total ?? speedObj.swim?.base;
    if (swim) speeds.push(`Swim ${swim} ft.`);
    const climb = speedObj.climb?.total ?? speedObj.climb?.base;
    if (climb) speeds.push(`Climb ${climb} ft.`);
    const burrow = speedObj.burrow?.total ?? speedObj.burrow?.base;
    if (burrow) speeds.push(`Burrow ${burrow} ft.`);

    return speeds.join(", ");
  }

  static extractTaxonomy(actor) {
    const rawType = (actor.system.traits?.creatureType || "humanoid").toLowerCase().replace(/[^a-z]/g, "");
    const skillKey = CREATURE_TYPE_SKILLS[rawType] || "kna";
    const subtypes = this.extractSubtypes(actor);

    const rawTags = actor.system.tags || [];
    const tags = new Set((Array.isArray(rawTags) ? rawTags : [rawTags]).map(t => String(t).toLowerCase().trim()));
    const cr = Number(actor.system.details?.cr?.total ?? actor.system.details?.cr?.base ?? 1);

    return {
      type: rawType,
      skillKey,
      subtypes,
      tags,
      cr: isNaN(cr) ? 1 : cr
    };
  }

  static generateTrueAtoms(actor, count, taxonomy, templates) {
    const sizeStr = this.extractSize(actor);
    const sizeCategory = sizeStr ? ` ${sizeStr.toUpperCase()}` : "";
    const typeLabel = taxonomy.type.toUpperCase();
    const formattedSubtypes = taxonomy.subtypes.join(", ");
    const subTypeStr = formattedSubtypes ? ` (${formattedSubtypes})` : "";

    const lockedFirstAtom = {
      id: "id_classification",
      category: "identity",
      traitType: "IDENTITY",
      factualState: "TRUE_FACT",
      formattedClaim: `Classified as a${sizeCategory} creature of the <strong>${typeLabel}${subTypeStr}</strong> classification.`,
      auditData: `Type: ${taxonomy.type}, Subtypes: [${taxonomy.subtypes.join(", ")}], Size: ${sizeStr || "unspecified"}`
    };

    if (count <= 1) return [lockedFirstAtom];

    const candidatePool = [];
    const is10x = Boolean(game.settings.get(MODULE_ID, "enable10xGranularity"));

    if (templates.length > 0) {
      templates.forEach((t, idx) => {
        const lowerName = t.name.toLowerCase();
        let desc = STANDARD_TEMPLATES[lowerName] || t.description;
        if (desc && desc.length > 250) desc = desc.slice(0, 247) + "...";

        const claimText = desc 
          ? `Altered by the <strong>${t.name}</strong> template: ${desc}`
          : `Distinguished as an abnormal specimen possessing the <strong>${t.name}</strong> template.`;

        candidatePool.push({
          id: `id_template_${idx}`,
          category: "template",
          traitType: "TEMPLATE",
          factualState: "TRUE_FACT",
          formattedClaim: claimText,
          auditData: `Template: ${t.name}`
        });
      });
    }

    const ac = actor.system.attributes?.ac;
    if (ac) {
      const normal = ac.normal?.total ?? 10;
      const touch = ac.touch?.total ?? 10;
      const flat = ac.flatFooted?.total ?? 10;

      const spread = is10x ? 8 : 1;
      const step = is10x ? 5 : 1;
      const lowAc = Math.floor((normal - spread) / step) * step;
      const highAc = Math.ceil((normal + spread) / step) * step;

      let tier = "Moderate";
      const normalizedAc = is10x ? normal / 10 : normal;
      if (normalizedAc < 12) tier = "Lightly Protected";
      else if (normalizedAc <= 15) tier = "Moderate";
      else if (normalizedAc <= 19) tier = "Heavily Armored";
      else if (normalizedAc <= 24) tier = "Fortified Shielding";
      else tier = "Impenetrable Bastion";

      let tacticalNote = "";
      if (touch <= (normal - (is10x ? 25 : 3))) {
        tacticalNote = " Relies heavily on physical shielding or thick hide; touch attacks easily bypass its armor.";
      } else if (touch >= (normal - (is10x ? 5 : 1))) {
        tacticalNote = " Exceptionally nimble; touch attacks struggle to find an opening.";
      }

      candidatePool.push({
        id: "def_ac_profile",
        category: "defense",
        traitType: "ARMOR_PROFILE",
        factualState: "TRUE_FACT",
        formattedClaim: `Armor Assessment: <strong>${tier}</strong> (estimated AC bracket <strong>${lowAc}–${highAc}</strong>).${tacticalNote}`,
        auditData: `AC: ${normal} (Touch: ${touch}, Flat-Footed: ${flat})`
      });
    }

    const hpObj = actor.system.attributes?.hp;
    const maxHp = Number(hpObj?.max ?? hpObj?.value);
    if (!isNaN(maxHp) && maxHp > 0) {
      const hpStep = is10x ? 5 : 1;
      const lowHp = Math.max(1, Math.floor((maxHp * 0.85) / hpStep) * hpStep);
      const highHp = Math.ceil((maxHp * 1.15) / hpStep) * hpStep;

      let vitTier = "Average Durability";
      const normalizedHp = is10x ? maxHp / 10 : maxHp;
      if (normalizedHp < 15) vitTier = "Fragile / Low Endurance";
      else if (normalizedHp <= 40) vitTier = "Moderate Durability";
      else if (normalizedHp <= 85) vitTier = "Sturdy / Resilient";
      else if (normalizedHp <= 160) vitTier = "Massive Reserves";
      else vitTier = "Colossal Vitality";

      candidatePool.push({
        id: "def_vitality_profile",
        category: "defense",
        traitType: "VITALITY_PROFILE",
        factualState: "TRUE_FACT",
        formattedClaim: `Vitality Assessment: <strong>${vitTier}</strong> (estimated durability between <strong>${lowHp}–${highHp} HP</strong>).`,
        auditData: `Exact Max HP: ${maxHp}`
      });
    }

    const senseStr = this.extractSenses(actor);
    const speedStr = this.extractSpeeds(actor);
    const infoParts = [];
    if (senseStr) infoParts.push(`Senses: ${senseStr}`);
    if (speedStr) infoParts.push(`Speed: ${speedStr}`);
    if (infoParts.length > 0) {
      candidatePool.push({
        id: "id_senses",
        category: "identity",
        traitType: "SENSES_MOBILITY",
        factualState: "TRUE_FACT",
        formattedClaim: `Locomotion & Awareness: <strong>${infoParts.join(" | ")}</strong>.`,
        auditData: `${infoParts.join(" | ")}`
      });
    }

    const saves = actor.system.attributes?.savingThrows || {};
    const f = saves.fort?.total ?? 0;
    const r = saves.ref?.total ?? 0;
    const w = saves.will?.total ?? 0;
    let lowestSave = "Fortitude";
    if (r < f && r <= w) lowestSave = "Reflex";
    else if (w < f && w < r) lowestSave = "Will";

    candidatePool.push({
      id: "weak_save",
      category: "weakness",
      traitType: "SAVE_WEAKNESS",
      factualState: "TRUE_FACT",
      formattedClaim: `Tactical deficiency noted: Its <strong>${lowestSave}</strong> save is its most exploitable defense.`,
      auditData: `Saves: Fort +${f}, Ref +${r}, Will +${w}`
    });

    const drList = actor.system.traits?.dr?.value || [];
    if (drList.length > 0) {
      candidatePool.push({
        id: "def_dr",
        category: "defense",
        traitType: "DR",
        factualState: "TRUE_FACT",
        formattedClaim: `Possesses Damage Reduction penetrated only by <strong>${drList.map(d => d.operator).filter(Boolean).join(" or ") || "specific armaments"}</strong>.`,
        auditData: `DR: ${drList.map(d => `${d.amount}/${d.operator || "—"}`).join(", ")}`
      });
    }

    const eres = actor.system.traits?.eres?.value || [];
    if (eres.length > 0) {
      const resLabels = eres.map(r => typeof r === "object" ? (r.name || r.operator || r.type) : r).filter(Boolean);
      if (resLabels.length > 0) {
        candidatePool.push({
          id: "def_eres",
          category: "defense",
          traitType: "ENERGY_RESIST",
          factualState: "TRUE_FACT",
          formattedClaim: `Naturally resistant to <strong>${resLabels.join(", ")}</strong> damage.`,
          auditData: `Resistances: ${resLabels.join(", ")}`
        });
      }
    }

    const di = actor.system.traits?.di?.value || [];
    if (di.length > 0) {
      const immLabels = di.map(d => typeof d === "object" ? (d.name || d.operator || d.type) : d).filter(Boolean);
      if (immLabels.length > 0) {
        candidatePool.push({
          id: "def_di",
          category: "defense",
          traitType: "ENERGY_IMMUNITY",
          factualState: "TRUE_FACT",
          formattedClaim: `Completely immune to <strong>${immLabels.join(", ")}</strong> effects.`,
          auditData: `Immunities: ${immLabels.join(", ")}`
        });
      }
    }

    if (drList.length === 0 && eres.length === 0 && di.length === 0) {
      candidatePool.push({
        id: "def_mundane_resilience",
        category: "defense",
        traitType: "DEFENSIVE_ABSENCE",
        factualState: "TRUE_FACT",
        formattedClaim: "Possesses no supernatural Damage Reduction or elemental immunities; fully vulnerable to standard weapon strikes.",
        auditData: "Target possesses no DR, ER, or DI."
      });
    }

    const dv = actor.system.traits?.dv?.value || [];
    if (dv.length > 0) {
      const vulnLabels = dv.map(d => typeof d === "object" ? (d.name || d.operator || d.type) : d).filter(Boolean);
      if (vulnLabels.length > 0) {
        candidatePool.push({
          id: "weak_vuln",
          category: "weakness",
          traitType: "ENERGY_VULN",
          factualState: "TRUE_FACT",
          formattedClaim: `Suffers crippling vulnerability (+50% damage) to <strong>${vulnLabels.join(", ")}</strong> damage.`,
          auditData: `Vulnerabilities: ${vulnLabels.join(", ")}`
        });
      }
    }

    const weapons = actor.items.filter(i => i.type === "weapon" && i.system?.equipped);
    if (weapons.length > 0) {
      candidatePool.push({
        id: "off_arsenal",
        category: "offense",
        traitType: "WEAPONRY",
        factualState: "TRUE_FACT",
        formattedClaim: `Combat Arsenal: Equipped with <strong>${weapons.slice(0, 3).map(w => w.name).join(", ")}</strong>.`,
        auditData: `Equipped Weapons: ${weapons.map(w => w.name).join(", ")}`
      });
    }

    const feats = actor.items.filter(i => i.type === "feat" && (i.system?.subType || "") !== "template");
    if (feats.length > 0) {
      const featSample = feats.slice(0, 3).map(f => f.name).join(", ");
      candidatePool.push({
        id: "feat_tactics",
        category: "tactics",
        traitType: "NOTABLE_FEATS",
        factualState: "TRUE_FACT",
        formattedClaim: `Combat Capabilities: Trained in <strong>${featSample}</strong>.`,
        auditData: `Feats: ${featSample}`
      });
    }

    const trainedSkills = Object.entries(actor.system.skills || {})
      .filter(([k, s]) => (s.ranks ?? 0) > 0 || Math.abs(s.mod ?? 0) > 0)
      .sort((a, b) => (b[1].mod ?? 0) - (a[1].mod ?? 0))
      .slice(0, 2);

    if (trainedSkills.length > 0) {
      const skillText = trainedSkills.map(([k, s]) => {
        const name = s.name || pf1.config?.skills?.[k] || k;
        return `${name} (+${s.mod ?? 0})`;
      }).join(", ");

      candidatePool.push({
        id: "skill_proficiency",
        category: "skills",
        traitType: "SKILL_PROFICIENCY",
        factualState: "TRUE_FACT",
        formattedClaim: `Exceptional Proficiencies: Highly trained in <strong>${skillText}</strong>.`,
        auditData: `Skills: ${skillText}`
      });
    }

    const matchedLoreKey = taxonomy.subtypes.map(s => s.toLowerCase()).find(s => LORE_REPOSITORY[s]) || (LORE_REPOSITORY[taxonomy.type] ? taxonomy.type : null);
    if (matchedLoreKey && LORE_REPOSITORY[matchedLoreKey]) {
      candidatePool.push({
        id: "ecology_lore",
        category: "ecology",
        traitType: "BEHAVIORAL_LORE",
        factualState: "TRUE_FACT",
        formattedClaim: `Behavior & Ecology: ${LORE_REPOSITORY[matchedLoreKey]}`,
        auditData: `Lore matched to key: ${matchedLoreKey}`
      });
    }

    for (let i = candidatePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
    }

    const selected = [lockedFirstAtom];
    for (const cand of candidatePool) {
      if (selected.length >= count) break;
      selected.push(cand);
    }

    return selected;
  }

  static generateMisinformationAtoms(actor, count, taxonomy, templates) {
    const candidatePool = [];
    const is10x = Boolean(game.settings.get(MODULE_ID, "enable10xGranularity"));

    const cleanElement = (entry) => {
      if (!entry) return "";
      if (typeof entry === "string") return entry.toLowerCase().trim();
      if (typeof entry === "object") return String(entry.operator || entry.name || entry.type || entry.value || "").toLowerCase().trim();
      return "";
    };

    if (templates.length > 0) {
      candidatePool.push({
        id: "mis_template_sickly",
        category: "template",
        traitType: "TEMPLATE",
        factualState: "MISINFORMATION",
        formattedClaim: "Displays severe malnourishment and stunted growth; treat as a sickly juvenile with reduced physical defenses.",
        auditData: `Told PC: Sickly juvenile. True Templates: [${templates.map(t => t.name).join(", ")}]`
      });
    }

    const phantom = PHANTOM_TEMPLATES[Math.floor(Math.random() * PHANTOM_TEMPLATES.length)];
    candidatePool.push({
      id: "mis_phantom_template",
      category: "template",
      traitType: "TEMPLATE",
      factualState: "MISINFORMATION",
      formattedClaim: phantom.claim,
      auditData: `${phantom.audit} (Creature has no such template)`
    });

    candidatePool.push({
      id: "mis_ac_fragile",
      category: "defense",
      traitType: "ARMOR_PROFILE",
      factualState: "MISINFORMATION",
      formattedClaim: is10x 
        ? "Armor Assessment: <strong>Lightly Protected</strong> (estimated AC bracket <strong>85–105</strong>); weapons will easily find clean purchase."
        : "Armor Assessment: <strong>Lightly Protected</strong> (estimated AC bracket <strong>9–11</strong>); weapons will easily find clean purchase.",
      auditData: `Told PC: Frail AC bracket. True AC: ${actor.system.attributes?.ac?.normal?.total ?? "Unknown"}`
    });

    candidatePool.push({
      id: "mis_hp_massive",
      category: "defense",
      traitType: "VITALITY_PROFILE",
      factualState: "MISINFORMATION",
      formattedClaim: is10x 
        ? "Vitality Assessment: <strong>Massive Reserves</strong> (estimated durability between <strong>140–180 HP</strong>); prepare for prolonged attrition."
        : "Vitality Assessment: <strong>Massive Reserves</strong> (estimated durability between <strong>35–50 HP</strong>); prepare for prolonged attrition.",
      auditData: `Told PC: Massive HP reserve. True HP: ${actor.system.attributes?.hp?.max ?? "Unknown"}`
    });

    const trueDi = (actor.system.traits?.di?.value || []).map(cleanElement).filter(Boolean);
    const trueDv = (actor.system.traits?.dv?.value || []).map(cleanElement).filter(Boolean);
    const trueRes = (actor.system.traits?.eres?.value || []).map(cleanElement).filter(Boolean);
    const neutralElements = ELEMENT_POOL.filter(e => !trueDi.includes(e) && !trueDv.includes(e) && !trueRes.includes(e));

    const elementA = neutralElements[0] || "fire";
    const elementB = neutralElements[1] || "cold";

    candidatePool.push({
      id: `mis_vuln_${elementA}`,
      category: "weakness",
      traitType: "ENERGY_VULN",
      factualState: "MISINFORMATION",
      formattedClaim: `Suffers crippling vulnerability (+50% damage) to <strong>${elementA.toUpperCase()}</strong> damage.`,
      auditData: `Told PC: Vulnerable to ${elementA}. True Immunities: [${trueDi.join(", ")}], Vulnerabilities: [${trueDv.join(", ")}]`
    });

    candidatePool.push({
      id: `mis_resist_${elementB}`,
      category: "defense",
      traitType: "ENERGY_RESIST",
      factualState: "MISINFORMATION",
      formattedClaim: `Its anatomy naturally absorbs and completely negates <strong>${elementB.toUpperCase()}</strong> damage.`,
      auditData: `Told PC: Resists ${elementB}. True Resistances: [${trueRes.join(", ")}]`
    });

    const trueDr = actor.system.traits?.dr?.value || [];
    const trueBypasses = trueDr.map(d => String(d.operator || "").toLowerCase());
    const falseBypasses = DR_BYPASS_POOL.filter(m => !trueBypasses.includes(m));
    const falseMaterial = falseBypasses[Math.floor(Math.random() * falseBypasses.length)] || "cold iron";

    candidatePool.push({
      id: "mis_dr_bypass",
      category: "defense",
      traitType: "DR",
      factualState: "MISINFORMATION",
      formattedClaim: `Possesses supernatural Damage Reduction penetrated only by weapons forged from <strong>${falseMaterial.toUpperCase()}</strong>.`,
      auditData: `Told PC: DR bypassed by ${falseMaterial}. True DR: ${trueDr.map(d => `${d.amount}/${d.operator}`).join(", ") || "None"}`
    });

    const saves = actor.system.attributes?.savingThrows || {};
    const savePairs = [
      { name: "Fortitude", val: saves.fort?.total ?? 0 },
      { name: "Reflex", val: saves.ref?.total ?? 0 },
      { name: "Will", val: saves.will?.total ?? 0 }
    ].sort((a, b) => b.val - a.val);

    const falseWeakness = savePairs[0].name;
    const lowestSaveName = savePairs[2]?.name || "Will";
    const lowestSaveVal = savePairs[2]?.val ?? 0;

    candidatePool.push({
      id: "mis_save_defect",
      category: "weakness",
      traitType: "SAVE_WEAKNESS",
      factualState: "MISINFORMATION",
      formattedClaim: `Tactical deficiency noted: Its <strong>${falseWeakness.toUpperCase()}</strong> save is by far its weakest defense.`,
      auditData: `Told PC to target ${falseWeakness} (+${savePairs[0].val}). Lowest save is actually ${lowestSaveName} (+${lowestSaveVal})`
    });

    candidatePool.push({
      id: "mis_tactical_flank",
      category: "tactics",
      traitType: "TACTICAL_FLAW",
      factualState: "MISINFORMATION",
      formattedClaim: "Displays sluggish spatial awareness; it is completely unable to defend against flanking maneuvers.",
      auditData: "Told PC: Cannot handle flanking. (False claim)"
    });

    const typeKey = ARCHETYPE_MISINFO_POOL[taxonomy.type] ? taxonomy.type : "default";
    const archetypeList = ARCHETYPE_MISINFO_POOL[typeKey] || ARCHETYPE_MISINFO_POOL.default;
    archetypeList.forEach((text, i) => {
      candidatePool.push({
        id: `mis_archetype_${i}`,
        category: "offense",
        traitType: "SPECIAL_ATTACK",
        factualState: "MISINFORMATION",
        formattedClaim: text,
        auditData: `Attributed Archetype Feature (${typeKey}) to ${actor.name}`
      });
    });

    const folkMyths = [
      "Averse to crossing running water under its own power.",
      "Compulsively halts to inspect intricate geometric patterns or count spilled grains.",
      "Terrified of direct natural sunlight or bright alchemical flares; easily blinded.",
      "Repelled by the strong scent of crushed garlic, rock salt, or holy water."
    ];
    folkMyths.forEach((myth, idx) => {
      candidatePool.push({
        id: `mis_myth_${idx}`,
        category: "ecology",
        traitType: "BEHAVIORAL_LORE",
        factualState: "MISINFORMATION",
        formattedClaim: `Folkloric Superstition: ${myth}`,
        auditData: `False Folk Myth attributed to ${actor.name}`
      });
    });

    for (let i = candidatePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
    }

    return candidatePool.slice(0, Math.max(1, count));
  }

  static async dispatchResults({ sourceActor, targetToken, outcome, margin, targetDc, taxonomy, atoms }) {
    const rawSkillName = sourceActor.system.skills[taxonomy.skillKey]?.name 
      || (pf1.config?.skills?.[taxonomy.skillKey] ? game.i18n.localize(pf1.config.skills[taxonomy.skillKey]) : null)
      || "Knowledge";

    let crDisplay = String(taxonomy.cr);
    if (Math.abs(taxonomy.cr - 1/3) < 0.05 || taxonomy.cr === 0.3375) crDisplay = "1/3";
    else if (Math.abs(taxonomy.cr - 1/2) < 0.05) crDisplay = "1/2";
    else if (Math.abs(taxonomy.cr - 1/4) < 0.05) crDisplay = "1/4";
    else if (Math.abs(taxonomy.cr - 1/8) < 0.05) crDisplay = "1/8";

    const headerTitle = outcome === "success" ? (targetToken.name || "Identified Creature") : "Unidentified Creature";
    const targetImg = targetToken.document?.texture?.src 
      || targetToken.texture?.src 
      || targetToken.actor?.img 
      || "icons/svg/mystery-man.svg";

    // 1. Lore Card (Visible to Player and GM)
    const playerCardHtml = `
      <div class="pf1 chat-card monster-id-card aeris-knowledge-card">
        <header class="card-header flexrow" style="display:flex; align-items:center; gap:8px; border-bottom:1px solid #747d8c; padding-bottom:4px; margin-bottom:6px;">
          <img src="${targetImg}" width="32" height="32" style="border-radius:4px;" />
          <h3 style="margin:0; font-size:1.1em;">${headerTitle}</h3>
        </header>
        <div class="card-content" style="font-size:0.9em; line-height:1.4;">
          <p style="margin-bottom:4px;"><strong>${sourceActor.name}</strong> recalls the following lore via <em>${rawSkillName}</em>:</p>
          <ul style="padding-left:18px; margin:4px 0;">
            ${atoms.map(a => `<li style="margin-bottom:3px;">${a.formattedClaim}</li>`).join("")}
          </ul>
        </div>
      </div>
    `;

    const gmPayload = {
      sourceActorName: sourceActor.name,
      targetTokenName: targetToken.name || "Target",
      targetTokenImg: targetImg,
      skillName: rawSkillName,
      targetDc,
      crDisplay,
      outcome,
      margin,
      atoms
    };

    MonsterKnowledgeEngine.lastAuditPayload = gmPayload;

    const gmRecipients = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    const whisperList = [...new Set([game.user.id, ...gmRecipients])];

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: sourceActor }),
      content: playerCardHtml,
      whisper: whisperList,
      flags: {
        [MODULE_ID]: {
          auditPayload: gmPayload
        }
      }
    });

    if (game.user.isGM) {
      new MonsterKnowledgeAuditDialog(gmPayload).render(true);
    }
  }
}

export class MonsterKnowledgeAuditDialog extends Application {
  constructor(payload, options = {}) {
    super(options);
    this.payload = payload;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "pf1ar-monster-audit-popup",
      title: "Monster Identification Audit",
      template: null,
      width: 480,
      height: "auto",
      resizable: true,
      classes: ["pf1ar-audit-window"]
    });
  }

  getData() {
    return this.payload;
  }

  async _renderInner(data) {
    const { sourceActorName, targetTokenName, targetTokenImg, skillName, targetDc, crDisplay, outcome, margin, atoms } = this.payload;
    const statusColor = outcome === "success" ? "#27ae60" : outcome === "failure" ? "#f39c12" : "#c0392b";

    const rows = atoms.map(a => `
      <div style="border-bottom: 1px solid rgba(0,0,0,0.1); padding: 5px 0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
          <span style="font-weight:bold; font-size:0.8em; color:${a.factualState === "MISINFORMATION" ? "#c0392b" : "#27ae60"};">[${a.factualState}] ${a.traitType}</span>
        </div>
        <div style="font-size:0.85em; margin-bottom:2px;"><strong>Claim:</strong> ${a.formattedClaim}</div>
        <div style="font-size:0.75em; color:#555; background:rgba(0,0,0,0.03); padding:2px 4px; border-radius:3px;"><strong>Truth:</strong> ${a.auditData}</div>
      </div>
    `).join("");

    const html = `
      <div style="padding: 8px; font-family: var(--font-primary);">
        <header style="display:flex; align-items:center; gap:10px; border-bottom:2px solid ${statusColor}; padding-bottom:6px; margin-bottom:8px;">
          <img src="${targetTokenImg}" width="40" height="40" style="border-radius:4px; border:1px solid #777;" />
          <div>
            <h3 style="margin:0; font-size:1.15em;">${targetTokenName}</h3>
            <span style="font-size:0.8em; color:#666;">CR ${crDisplay} | Tested by ${sourceActorName} (${skillName})</span>
          </div>
          <div style="margin-left:auto; text-align:right;">
            <div style="font-weight:bold; font-size:0.9em; color:${statusColor};">${outcome.toUpperCase()}</div>
            <div style="font-size:0.75em; color:#555;">DC ${targetDc} | Margin: ${margin >= 0 ? `+${margin}` : margin}</div>
          </div>
        </header>

        <div style="max-height: 380px; overflow-y:auto; margin-bottom:10px; padding-right:4px;">
          <strong style="font-size:0.85em; text-transform:uppercase; color:#333;">Recalled Traits Verification</strong>
          ${rows || '<div style="color:#777; font-style:italic; padding:6px 0;">No knowledge recalled.</div>'}
        </div>

        <div style="display:flex; justify-content:flex-end; gap:6px; border-top:1px solid #ddd; padding-top:6px;">
          <button type="button" class="btn-whisper-chat" style="font-size:0.8em; padding:4px 8px; cursor:pointer;">
            <i class="fas fa-comment"></i> Log Audit to Chat
          </button>
          <button type="button" class="btn-close-audit" style="font-size:0.8em; padding:4px 8px; cursor:pointer;">
            Close
          </button>
        </div>
      </div>
    `;

    return $(html);
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.btn-close-audit').click(() => this.close());

    html.find('.btn-whisper-chat').click(async () => {
      const { sourceActorName, targetTokenName, skillName, targetDc, crDisplay, outcome, margin, atoms } = this.payload;
      const statusColor = outcome === "success" ? "#27ae60" : outcome === "failure" ? "#f39c12" : "#c0392b";

      const auditRows = atoms.map(a => `
        <div style="border-bottom:1px solid rgba(0,0,0,0.06); padding:2px 0; font-size:0.8em;">
          <strong style="color:${a.factualState === "MISINFORMATION" ? "#c0392b" : "#27ae60"};">[${a.factualState}]</strong>
          <strong>${a.traitType}:</strong> ${a.auditData}
        </div>
      `).join("");

      const gmCardHtml = `
        <div class="pf1 chat-card aeris-gm-audit" style="border-left:4px solid ${statusColor}; padding-left:8px;">
          <header style="border-bottom:1px solid #ccc; margin-bottom:4px;">
            <strong style="font-size:0.95em;">[GM Knowledge Audit] ${targetTokenName}</strong>
          </header>
          <div style="font-size:0.85em; line-height:1.3;">
            <div><strong>Actor:</strong> ${sourceActorName} | <strong>Skill:</strong> ${skillName}</div>
            <div><strong>Target DC:</strong> ${targetDc} (CR ${crDisplay}) | <strong>Margin:</strong> ${margin >= 0 ? `+${margin}` : margin}</div>
            <div><strong>Engine State:</strong> <span style="color:${statusColor}; font-weight:bold;">${outcome.toUpperCase()}</span></div>
          </div>
          <div style="margin-top:6px; background:rgba(0,0,0,0.02); border:1px solid #ddd; border-radius:4px; padding:4px;">
            ${auditRows}
          </div>
        </div>
      `;

      await ChatMessage.create({
        content: gmCardHtml,
        whisper: ChatMessage.getWhisperRecipients("GM").map(u => u.id)
      });

      ui.notifications.info("Audit card logged to GM chat.");
    });
  }
}

MonsterKnowledgeEngine.MonsterKnowledgeAuditDialog = MonsterKnowledgeAuditDialog;

Hooks.once("init", () => {
  MonsterKnowledgeEngine.registerSettings();
});

Hooks.on("createChatMessage", (message, options, userId) => {
  if (!game.user.isGM) return;
  if (message.author?.id === game.user.id) return;

  const auditPayload = message.getFlag(MODULE_ID, "auditPayload");
  if (auditPayload) {
    new MonsterKnowledgeAuditDialog(auditPayload).render(true);
  }
});