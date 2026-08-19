import { Text, TextInput } from 'react-native';

import { fonts } from '@/lib/colors';

/**
 * App-wide default typeface (Inter). Called once from the root layout so every
 * <Text>/<TextInput> inherits it; headings opt into the serif via
 * `font-display` classes.
 */
export function applyDefaultTypography(): void {
  const textDefaults = (Text as unknown as { defaultProps?: { style?: unknown } });
  textDefaults.defaultProps = {
    ...(textDefaults.defaultProps ?? {}),
    style: [{ fontFamily: fonts.sans }, textDefaults.defaultProps?.style],
  };
  const inputDefaults = (TextInput as unknown as { defaultProps?: { style?: unknown } });
  inputDefaults.defaultProps = {
    ...(inputDefaults.defaultProps ?? {}),
    style: [{ fontFamily: fonts.sans }, inputDefaults.defaultProps?.style],
  };
}
