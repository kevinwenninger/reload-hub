/**
 * Bullet caliber families: bullets belong to a groove-diameter family, not to
 * a cartridge — a .308" bullet loads in .308 Win, .30-06 or .300 WM alike.
 * Cartridges map to exactly one family; the load's cartridge therefore
 * filters matching bullets automatically.
 */

export interface BulletFamily {
  id: string;
  label: string;
}

export const BULLET_FAMILIES: readonly BulletFamily[] = [
  { id: '172', label: '.17 (.172″)' },
  { id: '204', label: '.20 (.204″)' },
  { id: '224', label: '.22 / 5.56 mm (.224″)' },
  { id: '243', label: '6 mm (.243″)' },
  { id: '264', label: '6.5 mm (.264″)' },
  { id: '277', label: '.270 (.277″)' },
  { id: '284', label: '7 mm (.284″)' },
  { id: '308', label: '.30 / 7.62 mm (.308″)' },
  { id: '311', label: '.303 / 7.62x39 (.311″)' },
  { id: '312', label: '.32 (.312″)' },
  { id: '323', label: '8 mm (.323″)' },
  { id: '338', label: '.338 (.338″)' },
  { id: '355', label: '9 mm (.355″)' },
  { id: '357', label: '.38 / .357 (.357″)' },
  { id: '366', label: '9.3 mm (.366″)' },
  { id: '400', label: '10 mm / .40 (.400″)' },
  { id: '429', label: '.44 (.429″)' },
  { id: '452', label: '.45 (.452″)' },
  { id: '500', label: '.50 (.500″)' },
];

/** Cartridge (src/lib/calibers.ts names) → bullet family id. */
export const CARTRIDGE_FAMILY: Record<string, string> = {
  '.17 HMR': '172',
  '.204 Ruger': '204',
  '.22 LR': '224',
  '.222 Remington': '224',
  '.223 Remington': '224',
  '5.56x45 NATO': '224',
  '.243 Winchester': '243',
  '6mm Creedmoor': '243',
  '6.5 Creedmoor': '264',
  '6.5x55 SE': '264',
  '6.5 PRC': '264',
  '.270 Winchester': '277',
  '7mm-08 Remington': '284',
  '7x64': '284',
  '7.62x39': '311',
  '.308 Winchester': '308',
  '.30-06 Springfield': '308',
  '.300 Winchester Magnum': '308',
  '.300 PRC': '308',
  '8x57 IS': '323',
  '9.3x62': '366',
  '.338 Lapua Magnum': '338',
  '.32 ACP': '312',
  '.380 ACP': '355',
  '9mm Luger': '355',
  '.38 Special': '357',
  '.357 Magnum': '357',
  '.357 SIG': '355',
  '.40 S&W': '400',
  '10mm Auto': '400',
  '.44 Special': '429',
  '.44 Magnum': '429',
  '.45 ACP': '452',
  '.45 Colt': '452',
  '.454 Casull': '452',
  '.500 S&W Magnum': '500',
};

export function familyLabel(id: string | undefined): string | undefined {
  return BULLET_FAMILIES.find((family) => family.id === id)?.label;
}

export function familyForCartridge(cartridge: string | undefined): string | undefined {
  return cartridge === undefined ? undefined : CARTRIDGE_FAMILY[cartridge];
}
