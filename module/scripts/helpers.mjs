/**
 * @file Helpers Handlebars do PF1E Alt Sheet Reworked.
 *
 * Helpers de apresentação usados pelos templates `.hbs` do módulo, todos com
 * o prefixo `pf1ar_` para não colidir com helpers do Foundry ou do sistema
 * PF1E. Registrados uma única vez no hook `init` (ver `main.mjs`).
 */

/**
 * Registra os helpers Handlebars do módulo no ambiente global do Foundry.
 * Deve ser chamada uma única vez, antes de qualquer render dos templates.
 * @returns {void}
 */
export function registerHandlebarsHelpers() {
  /** Retorna true se o valor for negativo — usado para colorir modificadores de perícia. */
  Handlebars.registerHelper("pf1ar_isNegative", (value) => Number(value) < 0);

  /** Formata modificador com sinal explícito, como o Pathfinder imprime (ex.: +3, -1, +0). */
  Handlebars.registerHelper("pf1ar_signedNum", (value) => {
    const n = Number(value ?? 0);
    return n >= 0 ? `+${n}` : `${n}`;
  });

  /**
   * Indica se um atributo sofreu dano, dreno ou penalidade de habilidade
   * (regras de ability damage/drain/penalty do PF1), para destacar o card.
   */
  Handlebars.registerHelper("pf1ar_abilityDamaged", (abl) => {
    return (abl?.damage ?? 0) > 0 || (abl?.drain ?? 0) > 0 || (abl?.penalty ?? 0) > 0;
  });

  /**
   * Localiza chaves de i18n vindas do PF1E sem alterar rótulos já resolvidos.
   * O sistema ora entrega chaves ("PF1.Xyz"), ora texto pronto — o heurístico
   * do "." distingue os dois casos e o fallback devolve o valor original
   * quando a chave não existe no dicionário.
   */
  Handlebars.registerHelper("pf1ar_localize", (value) => {
    if (typeof value !== "string") return value ?? "";
    const localized = value.includes(".") ? game.i18n.localize(value) : value;
    return localized === value ? value : localized;
  });
}
