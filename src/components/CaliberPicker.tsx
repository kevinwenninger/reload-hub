import { StringPicker } from '@/components/StringPicker';
import { CALIBERS } from '@/lib/calibers';
import { t } from '@/lib/i18n';

interface CaliberPickerProps {
  label: string;
  value: string | null;
  onChange: (caliber: string) => void;
}

/** Normalized caliber selection with search; free text stays possible. */
export function CaliberPicker({ label, value, onChange }: CaliberPickerProps) {
  return (
    <StringPicker
      label={label}
      placeholder={t.firearms.caliberPlaceholder}
      options={CALIBERS}
      value={value}
      onChange={onChange}
    />
  );
}
