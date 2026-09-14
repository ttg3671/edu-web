/**
 * Utility functions for subscription plans.
 */

/**
 * Finds a matching plan from an array of plan objects based on a query parameter.
 * Supports matching by exact/case-insensitive plan_name, id, duration_unit,
 * partial substring matches, English/Spanish synonyms (e.g. monthly/mensual, yearly/anual),
 * and numeric indices.
 *
 * @param {Array<Object>} plansList - List of plan objects
 * @param {string|number|null|undefined} queryPlan - The query parameter value to match against
 * @returns {Object|null} The matched plan object, or null if no match is found
 */
export const findMatchingPlan = (plansList, queryPlan) => {
  if (!queryPlan || !Array.isArray(plansList) || plansList.length === 0) return null;

  const q = String(queryPlan).trim().toLowerCase();
  if (!q) return null;

  // 1. Exact or case-insensitive match on plan_name
  let match = plansList.find(p => p.plan_name && p.plan_name.toLowerCase() === q);
  if (match) return match;

  // 2. Match on plan id
  match = plansList.find(p => String(p.id) === q);
  if (match) return match;

  // 3. Match on duration_unit (e.g. 'month', 'year')
  match = plansList.find(p => p.duration_unit && p.duration_unit.toLowerCase() === q);
  if (match) return match;

  // 4. English / Spanish synonyms
  if (q.includes('month') || q.includes('mes') || q.includes('mensual')) {
    match = plansList.find(p =>
      p.duration_unit === 'month' ||
      (p.plan_name && (p.plan_name.toLowerCase().includes('month') ||
        p.plan_name.toLowerCase().includes('mes') ||
        p.plan_name.toLowerCase().includes('mensual')))
    );
    if (match) return match;
  }

  if (q.includes('year') || q.includes('ano') || q.includes('año') || q.includes('anual') || q.includes('annual')) {
    match = plansList.find(p =>
      p.duration_unit === 'year' ||
      (p.plan_name && (p.plan_name.toLowerCase().includes('year') ||
        p.plan_name.toLowerCase().includes('anual') ||
        p.plan_name.toLowerCase().includes('annual')))
    );
    if (match) return match;
  }

  // 5. Match if plan_name contains query or query contains plan_name
  match = plansList.find(p => {
    const name = p.plan_name ? p.plan_name.toLowerCase() : '';
    return name && (name.includes(q) || q.includes(name));
  });
  if (match) return match;

  // 6. Number index (1-based or 0-based)
  if (!isNaN(q)) {
    const num = parseInt(q, 10);
    if (num >= 1 && num <= plansList.length) {
      return plansList[num - 1];
    }
  }

  return null;
};
