/* Editions in this build and the default. Add one line per new edition.
   An edition is picked by ?edition=<id> or #<id>, or from the chips on the home page. */
import type { Edition } from '../engine/types';
import { yamunaSkyCity } from './yamuna-sky-city';
import { showcase } from './showcase';

export const EDITIONS: Edition[] = [yamunaSkyCity, showcase];
export const DEFAULT_EDITION = 'yamuna-sky-city';

export function editionById(id: string | null | undefined): Edition {
  return EDITIONS.find(e => e.id === id) ?? EDITIONS.find(e => e.id === DEFAULT_EDITION)!;
}

/** Edition requested in the address, if it exists in this build. */
export function editionFromLocation(loc: Location = window.location): Edition {
  const q = new URLSearchParams(loc.search).get('edition') || loc.hash.replace('#', '');
  return editionById(q);
}

/** Path of an asset under public/, safe for both the dev server and file:// builds. */
export const asset = (p: string | null | undefined) => (p ? `./${p}` : '');
export const editionAsset = (e: Edition, p: string | null | undefined) => (p ? `./editions/${e.id}/${p}` : '');
