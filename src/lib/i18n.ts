/**
 * Single source for every user-facing string. UI language is English.
 * No hardcoded strings in components — always import { t } from '@/lib/i18n'.
 * The safety texts are binding copy from docs/MVP_SPEC.md — do not edit
 * without updating the spec.
 */
export const t = {
  app: {
    name: 'On-Target',
  },
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    done: 'Done',
    retry: 'Retry',
    continue: 'Continue',
    back: 'Back',
    loading: 'Loading…',
  },
  tabs: {
    loads: 'Loads',
    inventory: 'Inventory',
    range: 'Range',
    process: 'Process',
    profile: 'Profile',
  },
  auth: {
    signIn: 'Sign in',
    signUp: 'Create account',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    sendResetLink: 'Send reset link',
    resetLinkSent: 'Check your inbox for the reset link.',
    noAccount: 'No account yet?',
    haveAccount: 'Already have an account?',
    invalidCredentials: 'Wrong email or password.',
    signOut: 'Sign out',
  },
  offline: {
    banner: 'You are offline — changes will sync later.',
    actionNeedsConnection: 'This action needs an internet connection.',
  },
  errors: {
    offlineTitle: 'No connection',
    offlineBody: 'Could not load data. Check your connection and retry.',
    failedTitle: 'Something went wrong',
    failedBody: 'Could not load data. Please try again.',
    networkAlert: 'No internet connection. Please try again when back online.',
    genericAlert: 'Something went wrong. Please try again.',
  },
  safety: {
    // Compact disclaimer — rendered by LoadDataDisclaimer wherever load data is visible.
    loadDataDisclaimer:
      'Warning: Load data shown here is user-recorded, not laboratory tested. ' +
      'Always verify against current published data from powder and bullet ' +
      'manufacturers. Start at least 10% below published maximum loads and ' +
      'work up carefully. You are solely responsible for the ammunition you assemble.',
    // One-time onboarding acknowledgement — confirmation timestamp goes to profiles.safety_ack_at.
    onboardingAck:
      'On-Target is a record-keeping tool for handloaders. It does not provide, ' +
      'verify, or endorse load data. Reloading ammunition is inherently dangerous ' +
      'if done incorrectly. Always follow published reloading manuals and ' +
      'manufacturer instructions. By continuing you confirm that you reload at ' +
      'your own risk and in compliance with the laws of your jurisdiction.',
    onboardingAckButton: 'I understand and accept',
  },
  onboarding: {
    unitsTitle: 'Your units',
    unitsSubtitle: 'Pick a preset — you can change each unit later in your profile.',
    presetMetricMixed: 'Metric mixed (gr + mm + m/s)',
    presetUs: 'US (gr + in + fps)',
    presetMetric: 'Metric (g + mm + m/s)',
  },
} as const;
