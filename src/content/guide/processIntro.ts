/**
 * Beginner introduction shown at the top of the Process tab. Educational
 * copy only — no die settings, no load data. Points to manuals.
 */
export const PROCESS_INTRO = {
  title: 'What is a reloading process?',
  lead:
    'A process is your fixed sequence of steps from fired brass to a finished, ' +
    'inspected round. Doing the same steps in the same order every time is what ' +
    'makes ammunition consistent — and safe.',
  common: [
    {
      title: 'Bottleneck rifle',
      body:
        'Cases are lubed and full-length sized, often trimmed, then primed, ' +
        'charged (usually weighed) and seated to a measured length. Crimping is ' +
        'the exception, not the rule.',
    },
    {
      title: 'Straight-wall pistol',
      body:
        'Carbide dies size without lube; the mouth is belled so the bullet starts ' +
        'cleanly, then charged, seated and taper-crimped so it feeds and headspaces ' +
        'on the case mouth.',
    },
    {
      title: 'Straight-wall revolver',
      body:
        'Same as pistol, but finished with a roll crimp into the bullet\'s ' +
        'cannelure so recoil cannot pull bullets forward in the cylinder.',
    },
  ],
  howTo:
    'Start from a system template, copy it, and make it yours: reorder, drop what ' +
    'you do not do, add what you do. Then run it as a checklist for every batch — ' +
    'the app books your components and logs the rounds on the load version.',
  reminder:
    'Templates describe the order of work only. Die settings, trim lengths and ' +
    'charges always come from your reloading manual and your own recorded load data.',
} as const;
