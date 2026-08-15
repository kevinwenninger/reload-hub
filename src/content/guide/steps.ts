/**
 * Beginner guide — the "why" behind each generic process step. Keyed by the
 * step ids used in the system templates. Educational copy only: no die
 * settings, no measurements, no load data. Always points to the manuals.
 */
export interface GuideEntry {
  title: string;
  why: string;
  tips: string[];
}

export const STEP_GUIDE: Record<string, GuideEntry> = {
  clean: {
    title: 'Clean & inspect cases',
    why: 'Dirty brass wears dies and hides defects. Inspection is the only chance to catch a cracked neck, a loose primer pocket or an incipient head separation before it becomes a problem in the chamber.',
    tips: [
      'Look for a bright ring above the case head — a classic sign of head separation.',
      'A primer that seats with almost no resistance means the pocket is worn out.',
      'When in doubt, throw the case away. Brass is the cheapest part.',
    ],
  },
  lube: {
    title: 'Lubricate cases',
    why: 'Bottleneck cases are resized under a lot of force. Without lube a case sticks in the die — a stuck case is a lost afternoon.',
    tips: [
      'A thin, even film is enough; too much lube on the shoulder dents it.',
      'Keep lube out of the case mouth and off the neck interior unless your process calls for it.',
    ],
  },
  size: {
    title: 'Size & decap',
    why: 'Firing expands the case to the chamber. Sizing brings it back so the next round chambers freely; decapping removes the spent primer in the same stroke.',
    tips: [
      'Follow the die manufacturer\'s setup instructions for your press — this app does not provide die settings.',
      'Consistency comes from a consistent stroke: same speed, full travel, every time.',
    ],
  },
  trim: {
    title: 'Trim, chamfer & deburr',
    why: 'Cases stretch with each firing. Too long, and the mouth can pinch the bullet in the throat — dangerous pressure. Chamfer and deburr let the bullet seat without shaving.',
    tips: [
      'Trim-to length comes from your reloading manual, not from this app.',
      'A light chamfer is all it takes; you are breaking an edge, not sharpening a knife.',
    ],
  },
  pocket: {
    title: 'Clean primer pockets',
    why: 'Residue in the pocket keeps the primer from seating fully. A high primer can cause misfires or slam-fires in some actions.',
    tips: ['Check the flash hole is clear while you are at it.'],
  },
  delube: {
    title: 'Remove lube',
    why: 'Lube left on a case lets it slide instead of gripping the chamber wall on firing, putting extra load on the bolt face.',
    tips: ['Wipe with a cloth or tumble briefly — either works.'],
  },
  expand: {
    title: 'Expand / bell case mouth',
    why: 'Straight-wall cases need a slight bell so the bullet base starts without shaving lead or jacket.',
    tips: [
      'Just enough for the bullet to sit upright. Over-belling works the brass and shortens case life.',
    ],
  },
  prime: {
    title: 'Prime',
    why: 'A fully seated primer sits flush or slightly below the case head. High primers misfire; crushed primers can fire.',
    tips: [
      'Feel for the anvil bottoming out, then look — run a finger across the case head.',
      'Never force a primer. If it resists, stop and find out why.',
    ],
  },
  charge: {
    title: 'Charge with powder',
    why: 'This is the step that decides pressure. A double charge or a missed charge (a squib) can destroy a firearm and injure you.',
    tips: [
      'Work only from your own recorded load data, verified against current published manuals — start low and work up.',
      'Charge a block of cases, then look into every single one under a good light before seating.',
      'One powder on the bench at a time. Put the container away before you open another.',
    ],
  },
  seat: {
    title: 'Seat bullets',
    why: 'Seating depth affects pressure and accuracy. Consistent COAL/CBTO is what makes a load repeatable.',
    tips: [
      'Measure the first few rounds and spot-check as you go.',
      'Record COAL and, if you measure it, CBTO on the load version — that is what your notes are for.',
    ],
  },
  crimp: {
    title: 'Crimp',
    why: 'A crimp keeps the bullet from moving under recoil (revolvers) or during feeding (autoloaders). Too much crimp bulges the case or cuts the jacket.',
    tips: [
      'Taper crimp for cases that headspace on the mouth; roll crimp into a cannelure for revolver rounds.',
      'Only crimp if your recipe calls for it — many rifle loads need none.',
    ],
  },
  gauge: {
    title: 'Case gauge / plunk test',
    why: 'A round that drops freely into a case gauge or your barrel will chamber. One that does not will jam at the worst moment.',
    tips: ['Test a sample from every batch, and every round when something changed.'],
  },
  inspect: {
    title: 'Final inspection & record',
    why: 'The last look catches what slipped through: a high primer, a missing charge you somehow missed, a seating depth that drifted. Recording the batch is what turns loading into load development.',
    tips: [
      'Box and label the batch with load version and date.',
      'Log the batch here so your inventory and cost per round stay honest.',
    ],
  },
};
