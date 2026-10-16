import {t} from '@/i18n';

/**
 * Category names come from the data in English. Translations live in the
 * locale files under adhkarCategories; a missing one falls back to English.
 */
export function localizeCategoryTitle(id: string, title: string): string {
  const clean = title.trim();
  return t(`adhkarCategories.cat.${id}`, {defaultValue: clean});
}

export function localizeSuperTitle(id: string, title: string): string {
  return t(`adhkarCategories.super.${id}`, {defaultValue: title});
}
