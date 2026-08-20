import { useEffect, useMemo, useState, type HTMLAttributes } from 'react';
import { cx } from '../../lib/cx';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
export type AvatarTone = 0 | 1 | 2 | 3 | 4;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name?: string;
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: AvatarSize;
  tone?: AvatarTone;
  status?: 'online' | 'busy' | 'offline';
}

export interface AvatarStackItem {
  id?: string | number;
  name?: string;
  src?: string | null;
  alt?: string;
  initials?: string;
  tone?: AvatarTone;
}

export interface AvatarStackProps extends HTMLAttributes<HTMLDivElement> {
  items: readonly AvatarStackItem[];
  max?: number;
  size?: AvatarSize;
  overlap?: 'default' | 'tight';
}

function hash(input: string): AvatarTone {
  let value = 0;
  for (let index = 0; index < input.length; index += 1) {
    value = (value * 31 + input.charCodeAt(index)) % 997;
  }
  return (value % 5) as AvatarTone;
}

function getInitials(name?: string, fallback?: string): string {
  if (fallback) return fallback.slice(0, 3).toUpperCase();
  if (!name) return '—';

  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '—';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function Avatar({
  name,
  src,
  alt,
  initials,
  size = 'md',
  tone,
  status,
  className,
  ...rest
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const resolvedTone = useMemo(() => tone ?? hash(name ?? initials ?? src ?? ''), [tone, name, initials, src]);
  const label = alt ?? name ?? initials ?? 'Avatar';
  const fallback = getInitials(name, initials);
  const showImage = Boolean(src) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <span
      className={cx('he-avatar', `he-avatar--${size}`, `he-avatar--tone-${resolvedTone}`, className)}
      aria-label={label}
      {...rest}
    >
      {showImage ? (
        <img className="he-avatar__image" src={src ?? undefined} alt={label} onError={() => setFailed(true)} />
      ) : (
        <span className="he-avatar__initials" aria-hidden>
          {fallback}
        </span>
      )}
      {status && <span className={cx('he-avatar__status', `he-avatar__status--${status}`)} aria-hidden />}
    </span>
  );
}

export function AvatarStack({
  items,
  max = 4,
  size = 'sm',
  overlap = 'default',
  className,
  ...rest
}: AvatarStackProps) {
  const visible = items.slice(0, max);
  const remaining = Math.max(0, items.length - visible.length);

  return (
    <div className={cx('he-avatar-stack', `he-avatar-stack--${overlap}`, className)} {...rest}>
      {visible.map((item, index) => (
        <Avatar
          key={item.id ?? item.name ?? index}
          name={item.name}
          src={item.src}
          alt={item.alt}
          initials={item.initials}
          tone={item.tone}
          size={size}
          style={{ zIndex: visible.length - index }}
        />
      ))}
      {remaining > 0 && (
        <span className={cx('he-avatar', `he-avatar--${size}`, 'he-avatar--more')} style={{ zIndex: 0 }}>
          +{remaining}
        </span>
      )}
    </div>
  );
}
