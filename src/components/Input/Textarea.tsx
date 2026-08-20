import type { TextareaHTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, rows = 3, ...rest }: TextareaProps) {
  return <textarea className={cx('he-textarea', className)} rows={rows} {...rest} />;
}
