/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAvatar } from '@dicebear/core';
import * as avataaars from '@dicebear/avataaars';

// ============================================================
// TYPES
// ============================================================

export interface AvatarOptions {
  skinColor?: string;          // hex without # (e.g. "d08b5b")
  top?: string;                // e.g. "shortFlat"
  hairColor?: string;          // hex without # (e.g. "724133")
  eyes?: string;               // e.g. "default"
  eyebrows?: string;           // e.g. "default"
  mouth?: string;              // e.g. "smile"
  clothing?: string;           // e.g. "hoodie"
  clothesColor?: string;       // hex without # (e.g. "65c9ff")
  accessories?: string;        // e.g. "prescription01"
  accessoriesProbability?: number; // 0–100
  facialHair?: string;         // e.g. "beardLight"
  facialHairProbability?: number;  // 0–100
  backgroundColor?: string;   // hex without # or "transparent"
}

export const DEFAULT_AVATAR_OPTIONS: AvatarOptions = {
  skinColor: 'edb98a',
  top: 'shortFlat',
  hairColor: '724133',
  eyes: 'default',
  eyebrows: 'default',
  mouth: 'smile',
  clothing: 'hoodie',
  clothesColor: '65c9ff',
  accessoriesProbability: 0,
  facialHairProbability: 0,
  backgroundColor: 'b6e3f4',
};

// ============================================================
// URL / DATA-URI GENERATOR (uses npm library — no HTTP request)
// ============================================================

export function getAvatarUrl(avatarConfig?: string | null, seed?: string | null): string {
  const opts = parseConfig(avatarConfig);
  return buildDataUri(opts, seed || 'default');
}

function parseConfig(config?: string | null): AvatarOptions {
  if (!config) return {};
  try {
    return JSON.parse(config) as AvatarOptions;
  } catch {
    return {};
  }
}

function arr(val?: string): string[] | undefined {
  return val ? [val] : undefined;
}

function buildDataUri(opts: AvatarOptions, seed: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avatar = createAvatar(avataaars, {
    seed,
    ...(opts.skinColor        && { skinColor:        [opts.skinColor] }),
    ...(opts.top              && { top:               [opts.top] }),
    ...(opts.hairColor        && { hairColor:         [opts.hairColor] }),
    ...(opts.eyes             && { eyes:              [opts.eyes] }),
    ...(opts.eyebrows         && { eyebrows:          [opts.eyebrows] }),
    ...(opts.mouth            && { mouth:             [opts.mouth] }),
    ...(opts.clothing         && { clothing:          [opts.clothing] }),
    ...(opts.clothesColor     && { clothesColor:      [opts.clothesColor] }),
    ...(opts.backgroundColor  && { backgroundColor:   [opts.backgroundColor] }),
    ...(arr(opts.accessories)  && { accessories: arr(opts.accessories) }),
    accessoriesProbability: opts.accessoriesProbability ?? 0,
    ...(arr(opts.facialHair)   && { facialHair: arr(opts.facialHair) }),
    facialHairProbability: opts.facialHairProbability ?? 0,
  } as any);

  const svg = avatar.toString();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ============================================================
// OPTION LISTS  (all values from official DiceBear schema)
// ============================================================

export const SKIN_COLORS = [
  { value: 'ffdbb4', hex: '#ffdbb4' }, // pálido
  { value: 'edb98a', hex: '#edb98a' }, // claro
  { value: 'fd9841', hex: '#fd9841' }, // médio
  { value: 'd08b5b', hex: '#d08b5b' }, // bronzeado
  { value: 'ae5d29', hex: '#ae5d29' }, // moreno
  { value: '614335', hex: '#614335' }, // escuro
  { value: 'f8d25c', hex: '#f8d25c' }, // amarelo
];

export const TOP_STYLES = [
  // Longo
  { value: 'bigHair',              label: 'Volumoso' },
  { value: 'bob',                  label: 'Chanel' },
  { value: 'bun',                  label: 'Coque' },
  { value: 'curly',                label: 'Cacheado' },
  { value: 'curvy',                label: 'Ondulado' },
  { value: 'dreads',               label: 'Dreads longo' },
  { value: 'frida',                label: 'Frida' },
  { value: 'fro',                  label: 'Black power' },
  { value: 'froBand',              label: 'Black power c/ tiara' },
  { value: 'longButNotTooLong',    label: 'Comprido natural' },
  { value: 'miaWallace',           label: 'Mia Wallace' },
  { value: 'shavedSides',          label: 'Raspado lateral' },
  { value: 'straight01',           label: 'Liso 1' },
  { value: 'straight02',           label: 'Liso 2' },
  { value: 'straightAndStrand',    label: 'Liso com mecha' },
  // Curto
  { value: 'dreads01',             label: 'Dreads curto' },
  { value: 'dreads02',             label: 'Dreads curto 2' },
  { value: 'frizzle',              label: 'Frizz' },
  { value: 'shaggy',              label: 'Shaggy' },
  { value: 'shaggyMullet',         label: 'Mullet' },
  { value: 'shortCurly',           label: 'Curto cacheado' },
  { value: 'shortFlat',            label: 'Curto liso' },
  { value: 'shortRound',           label: 'Curto arredondado' },
  { value: 'shortWaved',           label: 'Curto ondulado' },
  { value: 'sides',                label: 'Lateral' },
  { value: 'theCaesar',            label: 'César' },
  { value: 'theCaesarAndSidePart', label: 'César c/ repartido' },
  // Cobertura
  { value: 'hat',                  label: 'Chapéu' },
  { value: 'hijab',                label: 'Hijab' },
  { value: 'turban',               label: 'Turbante' },
  { value: 'winterHat1',           label: 'Gorro 1' },
  { value: 'winterHat02',          label: 'Gorro 2' },
  { value: 'winterHat03',          label: 'Gorro 3' },
  { value: 'winterHat04',          label: 'Gorro 4' },
];

export const HAIR_COLORS = [
  { value: '2c1b18', hex: '#2c1b18' }, // preto
  { value: '4a312c', hex: '#4a312c' }, // castanho escuro
  { value: '724133', hex: '#724133' }, // castanho
  { value: 'a55728', hex: '#a55728' }, // castanho averm.
  { value: 'b58143', hex: '#b58143' }, // loiro
  { value: 'd6b370', hex: '#d6b370' }, // loiro dourado
  { value: 'ecdcbf', hex: '#ecdcbf' }, // platinado
  { value: 'e8e1e1', hex: '#e8e1e1' }, // grisalho
  { value: 'c93305', hex: '#c93305' }, // ruivo
  { value: 'f59797', hex: '#f59797' }, // rosa pastel
];

export const EYES_STYLES = [
  { value: 'default',   label: 'Padrão' },
  { value: 'happy',     label: 'Feliz' },
  { value: 'wink',      label: 'Piscando' },
  { value: 'hearts',    label: 'Coração' },
  { value: 'surprised', label: 'Surpreso' },
  { value: 'squint',    label: 'Semicerrados' },
  { value: 'side',      label: 'De lado' },
  { value: 'eyeRoll',   label: 'Revirando' },
  { value: 'closed',    label: 'Fechados' },  // ← "closed", não "close"
  { value: 'cry',       label: 'Chorando' },
  { value: 'winkWacky', label: 'Piscando Maluco' },
  { value: 'xDizzy',    label: 'Atordoado' },
];

export const EYEBROWS_STYLES = [
  { value: 'default',                label: 'Padrão' },
  { value: 'defaultNatural',         label: 'Natural' },
  { value: 'raisedExcited',          label: 'Empinadas' },
  { value: 'raisedExcitedNatural',   label: 'Empinadas natural' },
  { value: 'angry',                  label: 'Irritado' },
  { value: 'angryNatural',           label: 'Irritado natural' },
  { value: 'flatNatural',            label: 'Planas' },
  { value: 'sadConcerned',           label: 'Preocupado' },
  { value: 'sadConcernedNatural',    label: 'Preocupado natural' },
  { value: 'unibrowNatural',         label: 'Monocelha' },
  { value: 'upDown',                 label: 'Para cima/baixo' },
  { value: 'upDownNatural',          label: 'Para cima/baixo natural' },
  { value: 'frownNatural',           label: 'Franzidas' },
];

export const MOUTH_STYLES = [
  { value: 'smile',      label: 'Sorriso' },
  { value: 'default',    label: 'Padrão' },
  { value: 'twinkle',    label: 'Encantado' },
  { value: 'serious',    label: 'Sério' },
  { value: 'concerned',  label: 'Preocupado' },
  { value: 'sad',        label: 'Triste' },
  { value: 'disbelief',  label: 'Incrédulo' },
  { value: 'eating',     label: 'Comendo' },
  { value: 'grimace',    label: 'Careta' },
  { value: 'screamOpen', label: 'Gritando' },
  { value: 'tongue',     label: 'Língua' },
  { value: 'vomit',      label: 'Vomitando' },
];

export const CLOTHING_TYPES = [
  { value: 'hoodie',           label: 'Moletom' },
  { value: 'blazerAndShirt',   label: 'Blazer c/ Camisa' },
  { value: 'blazerAndSweater', label: 'Blazer c/ Suéter' },
  { value: 'collarAndSweater', label: 'Gola c/ Suéter' },
  { value: 'graphicShirt',     label: 'Camiseta Estampada' },
  { value: 'overall',          label: 'Macacão' },
  { value: 'shirtCrewNeck',    label: 'Camiseta Gola Redonda' },
  { value: 'shirtScoopNeck',   label: 'Camiseta Decote' },
  { value: 'shirtVNeck',       label: 'Camiseta Gola V' },
];

export const CLOTHING_COLORS = [
  { value: '65c9ff', hex: '#65c9ff' },
  { value: '5199e4', hex: '#5199e4' },
  { value: '25557c', hex: '#25557c' },
  { value: 'b1e2ff', hex: '#b1e2ff' },
  { value: 'a7ffc4', hex: '#a7ffc4' },
  { value: 'ffafb9', hex: '#ffafb9' },
  { value: 'ffffb1', hex: '#ffffb1' },
  { value: 'ff488e', hex: '#ff488e' },
  { value: 'ff5c5c', hex: '#ff5c5c' },
  { value: 'e6e6e6', hex: '#e6e6e6' },
  { value: '929598', hex: '#929598' },
  { value: '3c4f5c', hex: '#3c4f5c' },
  { value: '262e33', hex: '#262e33' },
  { value: 'ffffff', hex: '#ffffff' },
];

export const ACCESSORIES_TYPES = [
  { value: 'prescription01', label: 'Óculos 1' },
  { value: 'prescription02', label: 'Óculos 2' },
  { value: 'round',          label: 'Redondo' },
  { value: 'sunglasses',     label: 'Óculos de Sol' },
  { value: 'wayfarers',      label: 'Wayfarer' },
  { value: 'kurt',           label: 'Kurt' },
  { value: 'eyepatch',       label: 'Tapa-olho' },
];

export const FACIAL_HAIR_TYPES = [
  { value: 'beardLight',      label: 'Barba Rala' },
  { value: 'beardMedium',     label: 'Barba Média' },
  { value: 'beardMajestic',   label: 'Barba Majestosa' },
  { value: 'moustacheFancy',  label: 'Bigode Elegante' },
  { value: 'moustacheMagnum', label: 'Bigode Magnum' },
];

export const BACKGROUND_COLORS = [
  { value: 'b6e3f4', hex: '#b6e3f4' },
  { value: '65c9ff', hex: '#65c9ff' },
  { value: 'c0aede', hex: '#c0aede' },
  { value: 'd1d4f9', hex: '#d1d4f9' },
  { value: 'ffd5dc', hex: '#ffd5dc' },
  { value: 'ffdfbf', hex: '#ffdfbf' },
  { value: 'ffffbf', hex: '#ffffbf' },
  { value: 'bfffc8', hex: '#bfffc8' },
  { value: 'e8e8e8', hex: '#e8e8e8' },
  { value: 'transparent', hex: '#f8f9fa' }, // transparente (visual neutro)
];
