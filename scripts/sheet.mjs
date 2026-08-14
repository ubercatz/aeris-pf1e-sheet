/**
 * @file PF1E Alt Sheet Reworked — classes de sheet.
 *
 * Estende as sheets Application V1 do PF1E (ActorSheetPFCharacter /
 * ActorSheetPFNPC), substituindo o template e aplicando o estilo moderno do
 * módulo. Toda a lógica de dados (getData, _onX, listeners) é herdada do
 * sistema PF1E; aqui só entram o painel inline de contêineres, o binding dos
 * nossos data-action de rolagem e a aplicação de tema/densidade.
 */

const MODULE_ID = "pf1-altsheet-reworked";
const M = `modules/${MODULE_ID}`;

// ─── CONTEÚDO DE CONTÊINERES ─────────────────────────────────────────────────
// O PF1E guarda os itens de um contêiner no próprio item contêiner
// (`container.system.items`, preparado como `container.items`). Esses itens
// NÃO são embedded items diretos do Actor, então os controles padrão da sheet
// não os alcançam — por isso preparamos aqui um render model próprio
// (leitura/escrita) e fazemos o binding de controles dedicados logo abaixo.

/**
 * Formata um valor em moedas separadas (po/pp/pc…) usando o formatador de
 * moeda do próprio sistema PF1E.
 * @param {number} value - Valor na menor denominação (peças de cobre).
 * @returns {string} Rótulo localizado, ex.: "12 po, 5 pc".
 */
function _formatCurrencySplit(value) {
  return game.i18n.format("PF1.SplitValue", pf1.utils.currency.split(value, { pad: true }));
}

/**
 * Obtém (criando sob demanda) o conjunto de contêineres com o painel inline
 * aberto nesta sheet. Vive na instância da sheet para sobreviver a re-renders
 * (o Application V1 recria o DOM inteiro a cada render).
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do estado.
 * @returns {Set<string>} Ids dos itens contêiner atualmente abertos.
 */
function _getOpenInlineContainers(sheet) {
  sheet._pf1arOpenContainers ??= new Set();
  return sheet._pf1arOpenContainers;
}

/**
 * Marca um contêiner como aberto/fechado no estado da sheet, para que o
 * `<details>` re-renderize no mesmo estado em que o jogador o deixou.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do estado.
 * @param {string|undefined} containerId - Id do item contêiner (ignorado se vazio).
 * @param {boolean} [open] - true para abrir, false para fechar.
 * @returns {void}
 */
function _setInlineContainerOpen(sheet, containerId, open = true) {
  if (!containerId) return;
  const openContainers = _getOpenInlineContainers(sheet);
  if (open) openContainers.add(containerId);
  else openContainers.delete(containerId);
}

/**
 * Monta o render model do painel inline de conteúdo de um item contêiner.
 * Sempre retorna objeto para itens do tipo contêiner — inclusive vazios
 * (`count: 0`, `sections: []`) — para que o template renderize o `<details>`
 * com o dropzone convidativo de estado vazio em vez de sumir com ele.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {Item|undefined} container - O documento do item contêiner.
 * @param {object} context - Contexto do getData usado para preparar as seções.
 * @returns {object|null} O render model do conteúdo, ou null se `container` não for contêiner.
 */
function _prepareContainerContents(sheet, container, context) {
  if (container?.type !== "container") return null;

  const inventory = Object.values(pf1.config.sheetSections.inventory)
    .map((data) => foundry.utils.deepClone(data))
    .sort((a, b) => a.sort - b.sort);

  for (const section of inventory) {
    sheet._prepareSection(section);
  }

  const items = (container.items ?? [])
    .map((item) => sheet._prepareItem(item))
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));

  for (const item of items) {
    const section = inventory.find((section) => sheet._applySectionFilter(item, section));
    if (!section) continue;

    sheet._prepareItemForSection(item, section, context);
    section.items ??= [];
    section.items.push(item);
  }

  const sections = inventory.filter((section) => section.items?.length);

  const currency = container.system.currency ?? {};
  const coinage = pf1.utils.currency.merge(currency);
  const value =
    container.getValue({ recursive: true, sellValue: 1, inLowestDenomination: true }) -
    container.getValue({ recursive: false, sellValue: 1, inLowestDenomination: true }) -
    coinage;
  const sellValue =
    container.getValue({ recursive: true, inLowestDenomination: true }) -
    container.getValue({ recursive: false, inLowestDenomination: true }) -
    coinage;

  return {
    count: items.length,
    sections,
    weight: container.system.weight?.converted?.contents ?? 0,
    valueLabel: _formatCurrencySplit(value),
    sellValueLabel: _formatCurrencySplit(sellValue),
    currencyLabel: _formatCurrencySplit(coinage),
    hasCurrency: Object.values(currency).some((amount) => Number(amount) > 0),
    open: _getOpenInlineContainers(sheet).has(container.id),
  };
}

/**
 * Anota cada item contêiner do inventário preparado pelo getData do sistema
 * com `pf1arIsContainer` e o render model `pf1arContents` (ver
 * {@link _prepareContainerContents}), consumidos pelo `inventory.hbs`.
 * @param {ActorSheetPFCharacter|ActorSheetPFNPC} sheet - A sheet dona do ator.
 * @param {object} data - Contexto retornado pelo getData do sistema (mutado in-place).
 * @returns {void}
 */
function _prepareInventoryContainers(sheet, data) {
  if (!Array.isArray(data.inventory)) return;

  for (const section of data.inventory) {
    for (const item of section.items ?? []) {
      const container = item.document;
      if (container?.type === "container") {
        item.pf1arIsContainer = true;
      }

      const contents = _prepareContainerContents(sheet, container, data);
      if (!contents) continue;

      item.pf1arContents = contents;
    }
  }
}

// ─── FILHOS DE LINK NA ABA FEATURES ──────────────────────────────────────────

function _prepareLinkedFeatChildren(sheet, data) {
  const sections = Array.isArray(data.features) ? data.features : Object.values(data.features ?? {});
  if (!sections.length) return;

  const entryById = new Map();
  for (const section of sections) {
    for (const entry of section.items ?? []) entryById.set(entry.id, entry);
  }

  const parentOf = new Map();
  const childIdsOf = new Map();
  for (const entry of entryById.values()) {
    const doc = sheet.actor.items.get(entry.id);
    const kids = (doc?.getLinkedItemsSync?.("children") ?? []).filter((c) => entryById.has(c.id));
    if (!kids.length) continue;
    childIdsOf.set(
      entry.id,
      kids.map((c) => c.id),
    );
    for (const c of kids) if (!parentOf.has(c.id)) parentOf.set(c.id, entry.id);
  }
  if (!parentOf.size) return;

  for (const section of sections) {
    const out = [];
    const emit = (entry, depth, seen) => {
      entry.pf1arLinkDepth = depth;
      entry.pf1arIsLinkChild = depth > 0;
      out.push(entry);
      for (const childId of childIdsOf.get(entry.id) ?? []) {
        if (seen.has(childId)) continue;
        const child = entryById.get(childId);
        if (child) emit(child, depth + 1, new Set(seen).add(childId));
      }
    };
    for (const entry of section.items ?? []) {
      if (parentOf.has(entry.id)) continue; 
      emit(entry, 0, new Set([entry.id]));
    }
    section.items = out;
  }
}

function _getContainedItemContext(sheet, element) {
  const row = element.closest("[data-container-id][data-contained-item-id]");
  if (!row) return {};
  const container = sheet.actor.items.get(row.dataset.containerId);
  const item = container?.items?.get(row.dataset.containedItemId);
  return { row, container, item };
}

function _rememberContainedContainerOpen(sheet, element) {
  const row = element.closest("[data-container-id]");
  _setInlineContainerOpen(sheet, row?.dataset.containerId, true);
}

function _getInlineContainerDropTarget(element) {
  return element.closest("[data-container-drop-id], .pf1ar-container-contents");
}

function _getInlineContainerDropId(element) {
  const target = _getInlineContainerDropTarget(element);
  return target?.dataset.containerDropId || target?.dataset.containerId;
}

function _onContainedItemDragStart(sheet, event) {
  const { container, item } = _getContainedItemContext(sheet, /** @type {HTMLElement} */ (event.currentTarget));
  if (!container || !item) return;

  event.stopPropagation();
  event.stopImmediatePropagation?.();

  _setInlineContainerOpen(sheet, container.id, true);

  const dragData = {
    type: "Item",
    data: item.toObject(),
    containerId: container.id,
    itemId: item.id,
    actorUuid: sheet.actor?.uuid,
  };

  event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  event.dataTransfer.effectAllowed = "move";
}

async function _dropItemIntoInlineContainer(sheet, event) {
  event.preventDefault();
  event.stopPropagation();

  if (!sheet.isEditable || !sheet.actor?.isOwner) return;

  const containerId = _getInlineContainerDropId(/** @type {HTMLElement} */ (event.target));
  const container = sheet.actor.items.get(containerId);
  if (!container || container.type !== "container") return;

  sheet.element?.[0]
    ?.querySelectorAll(".pf1ar-container-drop-hover")
    .forEach((el) => el.classList.remove("pf1ar-container-drop-hover"));
  _setInlineContainerOpen(sheet, container.id, true);

  const data = TextEditor.getDragEventData(event);
  if (data.type !== "Item") return;

  const droppedItem = await Item.implementation.fromDropData(data);
  if (!droppedItem) return;

  if (droppedItem === container || droppedItem === container.rootItem) {
    ui.notifications.warn("This item cannot be placed inside itself.");
    return;
  }

  let sourceActor = data.actorUuid ? await fromUuid(data.actorUuid) : null;
  sourceActor ??= droppedItem.actor;
  const sameActor = sourceActor === sheet.actor;

  if (sameActor && data.containerId === container.id) return;

  const itemData = game.items.fromCompendium(droppedItem, {
    clearFolder: true,
    keepId: sameActor,
    clearSort: !sameActor,
  });

  if (itemData.type === "spell" && pf1.documents?.item?.ItemSpellPF?.toConsumablePrompt) {
    const resultData = await pf1.documents.item.ItemSpellPF.toConsumablePrompt(itemData, {
      allowSpell: false,
      actor: sheet.actor,
    });
    if (resultData) return container.createContainerContent(resultData);
    return false;
  }

  if (!droppedItem.isPhysical) {
    ui.notifications.warn("Only physical items can be placed inside a container.");
    return;
  }

  const created = await container.createContainerContent(itemData);

  if (sameActor && created?.length) {
    if (data.containerId) {
      sourceActor.containerItems
        ?.find((item) => item.id === data.itemId && item.parentItem?.id === data.containerId)
        ?.parentItem.deleteContainerContent(data.itemId);
    } else {
      await sourceActor.items.get(droppedItem.id)?.delete();
    }
  }

  return created;
}

function _bindContainerContents(sheet, html) {
  const root = html[0];
  if (!root) return;

  root.querySelectorAll(".pf1ar-container-contents").forEach((el) => {
    el.addEventListener("click", (event) => event.stopPropagation());
    el.addEventListener("toggle", (event) => {
      const details = event.currentTarget;
      _setInlineContainerOpen(sheet, details.dataset.containerId, details.open);
    });
  });

  root.querySelectorAll("[data-container-drop-id], .pf1ar-container-contents").forEach((el) => {
    el.addEventListener("dragenter", (event) => {
      event.preventDefault();
      event.stopPropagation();
      el.classList.add("pf1ar-container-drop-hover");
    });
    el.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      el.classList.add("pf1ar-container-drop-hover");
    });
    el.addEventListener("dragleave", (event) => {
      if (!event.relatedTarget || !el.contains(event.relatedTarget)) {
        el.classList.remove("pf1ar-container-drop-hover");
      }
    });
    el.addEventListener("drop", (event) => _dropItemIntoInlineContainer(sheet, event));
  });

  root.querySelectorAll(".pf1ar-contained-row[draggable='true']").forEach((el) => {
    el.addEventListener("dragstart", (event) => _onContainedItemDragStart(sheet, event), { capture: true });
  });

  html.find('[data-action="pf1arContainedCard"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    return item?.displayCard();
  });

  html.find('[data-action="pf1arContainedAction"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    return item?.use({ ev: event });
  });

  html.find('[data-action="pf1arContainedEdit"]').on("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    return item?.sheet.render(true, { focus: true, editable: sheet.isEditable });
  });

  html.find('[data-action="pf1arContainedQuantity"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!item) return;

    let delta = Number(event.currentTarget.dataset.delta) || 0;
    if (event.shiftKey) delta *= 5;
    if (event.ctrlKey) delta *= 10;

    const current = Number(item.system.quantity) || 0;
    let quantity = Math.max(0, current + delta);
    if (item.type === "container" && quantity > 1) quantity = 1;
    return item.update({ "system.quantity": quantity });
  });

  html.find('[data-action="pf1arContainedIdentify"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!game.user.isGM) return void ui.notifications.error(game.i18n.localize("PF1.Error.CantIdentify"));
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!item || item.system.identified === undefined) return;
    return item.update({ "system.identified": !item.system.identified });
  });

  html.find('[data-action="pf1arContainedDuplicate"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { container, item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!container || !item) return;

    const itemData = item.toObject();
    delete itemData._id;
    delete itemData.system?.links?.children;
    delete itemData.system?.links?.charges;

    itemData._stats ??= {};
    itemData._stats.duplicateSource ||= item.uuid;
    itemData.name = `${itemData.name} (${game.i18n.localize("PF1.Copy")})`;
    if (item.isPhysical && !item.system.identified) {
      itemData.system.unidentified ??= {};
      itemData.system.unidentified.name = `${item.system.unidentified?.name ?? item.name} (${game.i18n.localize(
        "PF1.Copy",
      )})`;
    }

    return container.createContainerContent(itemData);
  });

  html.find('[data-action="pf1arContainedTake"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { container, item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!container || !item) return;

    const created = await Item.implementation.create(item.toObject(), { parent: sheet.actor });
    if (created) return container.deleteContainerContent(item.id);
  });

  html.find('[data-action="pf1arContainedDelete"]').on("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const { container, item } = _getContainedItemContext(sheet, event.currentTarget);
    if (!container || !item) return;

    const confirm = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.format("PF1.DeleteItemTitle", { name: item.name }), icon: "fa-solid fa-trash" },
      classes: ["pf1-v2", "delete-item"],
      content: `<p>${game.i18n.localize("PF1.DeleteItemConfirmation")}</p>`,
      rejectClose: false,
      modal: true,
    });

    if (confirm) return container.deleteContainerContent(item.id);
  });

  html.find(".pf1ar-contained-uses-input").on("change wheel", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!sheet.isEditable) return;
    _rememberContainedContainerOpen(sheet, event.currentTarget);

    const input = event.currentTarget;
    const { item } = _getContainedItemContext(sheet, input);
    if (!item) return;

    if (event.originalEvent instanceof WheelEvent) {
      const current = Number(input.value);
      if (!Number.isFinite(current)) return;
      const step = Number(input.dataset.wheelStep) || 1;
      input.value = current + step * -Math.sign(event.originalEvent.deltaY);
    }

    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    return item.update({ "system.uses.value": value });
  });
}

function _bindRollActions(sheet, html) {
  if (!sheet.isEditable) return;

  const actor = sheet.actor;
  const token = sheet.token;

  html.find('[data-action="rollAbility"]').on("click", (e) => {
    e.preventDefault();
    const ability = e.currentTarget.dataset.ability;
    actor.rollAbilityTest(ability, { token });
  });

  html.find('[data-action="rollSave"]').on("click", (e) => {
    e.preventDefault();
    const save = e.currentTarget.dataset.savingthrow;
    actor.rollSavingThrow(save, { token });
  });

  html.find('[data-action="rollInit"]').on("click", (e) => {
    e.preventDefault();
    actor.rollInitiative({ createCombatants: true, rerollInitiative: game.user.isGM, token });
  });

  html.find('[data-action="rollBAB"]').on("click", (e) => {
    e.preventDefault();
    actor.rollBAB({ token });
  });

  html.find('[data-action="rollCMB"]').on("click", (e) => {
    e.preventDefault();
    actor.rollAttack({ maneuver: true, ranged: false, token });
  });

  html.find('[data-action="rollGenericAttack"]').on("click", (e) => {
    e.preventDefault();
    const ranged = e.currentTarget.dataset.ranged === "true";
    actor.rollAttack({ maneuver: false, ranged, token });
  });

  html.find('[data-action="rollSkill"]').on("click", (e) => {
    e.preventDefault();
    const skill = e.currentTarget.dataset.skill;
    const subSkill = e.currentTarget.dataset.subSkill || undefined;
    actor.rollSkill(skill, { subSkill, token });
  });
}

const PF1AR_THEMES = ["parchment", "hybrid", "slate"];

function _applyTheme(sheet) {
  const root = sheet.element?.[0];
  if (!root) return;

  root.classList.toggle("pf1ar-dark", !!game.settings.get(MODULE_ID, "darkMode"));

  const theme = game.settings.get(MODULE_ID, "theme") || "parchment";
  for (const t of PF1AR_THEMES) root.classList.toggle(`pf1ar-theme-${t}`, t === theme);

  root.classList.toggle("pf1ar-compact", !!game.settings.get(MODULE_ID, "compact"));
}

function _bindThemeToggle(sheet, html) {
  html.find('[data-action="pf1arToggleTheme"]').on("click", async (e) => {
    e.preventDefault();
    const next = !game.settings.get(MODULE_ID, "darkMode");
    await game.settings.set(MODULE_ID, "darkMode", next);
    const root = sheet.element?.[0];
    if (root) root.classList.toggle("pf1ar-dark", next);
    const icon = e.currentTarget.querySelector("i");
    if (icon) icon.className = `fa-solid ${next ? "fa-sun" : "fa-moon"}`;
  });
}

function _bindThemeCycle(sheet, html) {
  html.find('[data-action="pf1arCycleTheme"]').on("click", async (e) => {
    e.preventDefault();
    const current = game.settings.get(MODULE_ID, "theme") || "parchment";
    const next = PF1AR_THEMES[(PF1AR_THEMES.indexOf(current) + 1) % PF1AR_THEMES.length];
    await game.settings.set(MODULE_ID, "theme", next);
  });
}

// ─── FICHA DE PERSONAGEM ──────────────────────────────────────────────────────

export class AltCharacterSheetPF extends pf1.applications.actor.ActorSheetPFCharacter {
  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/pf1/templates/actors/limited-sheet.hbs";
    }
    return `${M}/templates/character-sheet.hbs`;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pf1-altsheet-reworked", "pf1ar-sheet", "sheet", "actor", "character"],
      width: 1005,
      height: 1029,
      scrollY: [
        ".primary-body > .tab",
        ".attacks-body",
        ".inventory-body",
        ".feats-body",
        ".buffs-body",
        ".skillset-body",
      ],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
        {
          navSelector: "nav.tabs[data-group='skillset']",
          contentSelector: "section.skillset-body",
          initial: "adventure",
          group: "skills",
        },
        {
          navSelector: "nav.tabs[data-group='spellbooks']",
          contentSelector: "section.spellbooks-body",
          initial: "primary",
          group: "spellbooks",
        },
      ],
    });
  }

  async getData(options) {
    const data = await super.getData(options);
    
    // --- 10X GRANULAR ENCUMBRANCE INJECTION ---
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      const strScore = this.actor.system.abilities?.str?.total || 100;
      const carryBonus = this.actor.system.attributes?.carryStrength || 0;
      const carryMult = this.actor.system.attributes?.carryMultiplier || 1;

      // Downscale the 10x stat to standard PF1e ranges (e.g. 223 -> 22) for the math
      const effStr = Math.floor((strScore + carryBonus) / 10);

      // Core Pathfinder 1e Heavy Load Progression
      let heavy = 0;
      if (effStr <= 10) {
          heavy = effStr * 10;
      } else {
         const base = [100, 115, 130, 150, 175, 200, 230, 260, 300, 350][effStr % 10];
         heavy = base * Math.pow(4, Math.floor(effStr / 10) - 1);
      }

      // Re-apply multipliers and scale up by 10x to match your granular item weights
      heavy = heavy * carryMult * 10;

      // Safely overwrite the sheet's display thresholds
      const enc = data.system?.attributes?.encumbrance;
      if (enc) {
          enc.heavy = heavy;
          enc.medium = Math.floor((heavy * 2) / 3);
          enc.light = Math.floor(heavy / 3);
          enc.lift = heavy;
          enc.heavyLift = heavy * 2;
          enc.drag = heavy * 5;

          // Recalculate encumbrance penalty state based on our new granular limits
          const carried = enc.carriedWeight || 0;
          if (carried > enc.heavy) enc.level = 4; // Overburdened
          else if (carried > enc.medium) enc.level = 3; // Heavy
          else if (carried > enc.light) enc.level = 2; // Medium
          else enc.level = 1; // Light
      }
    }

    data.pf1arDark = game.settings.get(MODULE_ID, "darkMode");
    data.summarySkillsMode = game.settings.get(MODULE_ID, "summarySkills");
    _prepareInventoryContainers(this, data);
    _prepareLinkedFeatChildren(this, data);
    
    // NOTE: I see you added this back in your uploaded file! 
    // Keep an eye out for double-dipping (e.g. 1d600 instead of 1d60) 
    // since main.mjs is already scaling the data behind the scenes.
    _apply10xVisuals(this, data); 

    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    _applyTheme(this);
    _bindThemeToggle(this, html);
    _bindThemeCycle(this, html);
    _bindRollActions(this, html);
    _bindContainerContents(this, html);
  }
}

// ─── FICHA DE NPC ─────────────────────────────────────────────────────────────

export class AltNPCSheetPF extends pf1.applications.actor.ActorSheetPFNPC {
  get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/pf1/templates/actors/limited-sheet.hbs";
    }
    return `${M}/templates/npc-sheet.hbs`;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pf1-altsheet-reworked", "pf1ar-sheet", "pf1ar-npc", "sheet", "actor", "npc"],
      width: 1005,
      height: 1029,
      scrollY: [
        ".primary-body > .tab",
        ".attacks-body",
        ".inventory-body",
        ".feats-body",
        ".buffs-body",
        ".skillset-body",
      ],
      tabs: [
        {
          navSelector: "nav.tabs[data-group='primary']",
          contentSelector: "section.primary-body",
          initial: "summary",
          group: "primary",
        },
        {
          navSelector: "nav.tabs[data-group='skillset']",
          contentSelector: "section.skillset-body",
          initial: "adventure",
          group: "skills",
        },
        {
          navSelector: "nav.tabs[data-group='spellbooks']",
          contentSelector: "section.spellbooks-body",
          initial: "primary",
          group: "spellbooks",
        },
      ],
    });
  }

  async getData(options) {
    const data = await super.getData(options);
    
    // --- 10X GRANULAR ENCUMBRANCE INJECTION ---
    if (game.settings.get(MODULE_ID, "enable10xGranularity")) {
      const strScore = this.actor.system.abilities?.str?.total || 100;
      const carryBonus = this.actor.system.attributes?.carryStrength || 0;
      const carryMult = this.actor.system.attributes?.carryMultiplier || 1;

      // Downscale the 10x stat to standard PF1e ranges (e.g. 223 -> 22) for the math
      const effStr = Math.floor((strScore + carryBonus) / 10);

      // Core Pathfinder 1e Heavy Load Progression
      let heavy = 0;
      if (effStr <= 10) {
          heavy = effStr * 10;
      } else {
         const base = [100, 115, 130, 150, 175, 200, 230, 260, 300, 350][effStr % 10];
         heavy = base * Math.pow(4, Math.floor(effStr / 10) - 1);
      }

      // Re-apply multipliers and scale up by 10x to match your granular item weights
      heavy = heavy * carryMult * 10;

      // Safely overwrite the sheet's display thresholds
      const enc = data.system?.attributes?.encumbrance;
      if (enc) {
          enc.heavy = heavy;
          enc.medium = Math.floor((heavy * 2) / 3);
          enc.light = Math.floor(heavy / 3);
          enc.lift = heavy;
          enc.heavyLift = heavy * 2;
          enc.drag = heavy * 5;

          // Recalculate encumbrance penalty state based on our new granular limits
          const carried = enc.carriedWeight || 0;
          if (carried > enc.heavy) enc.level = 4; // Overburdened
          else if (carried > enc.medium) enc.level = 3; // Heavy
          else if (carried > enc.light) enc.level = 2; // Medium
          else enc.level = 1; // Light
      }
    }

    data.pf1arDark = game.settings.get(MODULE_ID, "darkMode");
    data.summarySkillsMode = game.settings.get(MODULE_ID, "summarySkills");
    _prepareInventoryContainers(this, data);
    _prepareLinkedFeatChildren(this, data);
    
    // NOTE: I see you added this back in your uploaded file! 
    // Keep an eye out for double-dipping (e.g. 1d600 instead of 1d60) 
    // since main.mjs is already scaling the data behind the scenes.
    _apply10xVisuals(this, data); 

    return data;
  }
  

  activateListeners(html) {
    super.activateListeners(html);
    _applyTheme(this);
    _bindThemeToggle(this, html);
    _bindThemeCycle(this, html);
    _bindRollActions(this, html);
    _bindContainerContents(this, html);
  }
}