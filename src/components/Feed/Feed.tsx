import { useMemo, type HTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../lib/cx';
import { Avatar } from '../Avatar/Avatar';
import { DateText, RelativeTime } from '../DateText/DateText';
import { DEFAULT_LOCALE, formatDateTime, isValidDate, toDate, type DateInput } from '../../format/time';

/** Opt-in, for state the row's own words do not already carry. There is no
 *  `accent`: Borealis at 6px needs a rescue ring to be visible on --he-surface,
 *  and no history event is "Borealis". */
export type FeedItemTone = 'default' | 'ok' | 'warn' | 'error' | 'neutral';

export interface FeedItem {
  id: string;
  /** When the event OCCURRED — the sole ordering key. Never a due or scheduled
   *  date: a feed that prints a receipt's DUE date puts "cancelled" beside
   *  "in 4 months" in one row. */
  at: DateInput;
  /** Mono-caps eyebrow, e.g. 'Receipt'. */
  kind?: ReactNode;
  /** Headline. Wraps; never ellipsised. */
  title: ReactNode;
  /** Prose — a comment, a detail paragraph. */
  body?: ReactNode;
  /** Dim trailing line, e.g. 'GNP · cancelled'. */
  meta?: ReactNode;
  /** Renders an Avatar in the node slot instead of the dot. */
  actor?: { name: string; src?: string | null; initials?: string };
  /** Dot colour. Leave it off when the title or meta already says what happened —
   *  a tinted dot beside the word "cancelled" encodes the same fact twice. */
  tone?: FeedItemTone;
  href?: string;
  onSelect?: () => void;
}

export interface FeedProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly FeedItem[];
  /** Sort order. Default `newest`. Sorting happens on the ARRAY — never
   *  `flex-direction: column-reverse`, which desyncs DOM/tab order from reading order. */
  order?: 'newest' | 'oldest';
  /** Insert day headings. Default `none`. */
  groupBy?: 'day' | 'none';
  /** Hoisted so every timestamp in one feed shares a policy — per-call-site
   *  formatting is how the same instant prints as Jan 05 in one row and Jan 4
   *  six rows below it. `DEFAULT_LOCALE` is `es-MX`, so pass this in an English UI. */
  locale?: string;
  timeZone?: string;
  now?: DateInput;
  /** Comment box, rendered above the rail. Use `<Composer size="sm">`. */
  compose?: ReactNode;
  /** One dim line when there is nothing. Default `No activity yet.` */
  empty?: ReactNode;
  /** Accessible name for the list. Default `Activity`. */
  ariaLabel?: string;
}

const DAY_MS = 86400000;

export function Feed({
  items,
  order = 'newest',
  groupBy = 'none',
  locale,
  timeZone,
  now,
  compose,
  empty,
  ariaLabel,
  className,
  ...rest
}: FeedProps) {
  const sorted = useMemo(
    () =>
      items
        .filter((i) => isValidDate(i.at))
        .slice()
        .sort((a, b) =>
          order === 'oldest'
            ? toDate(a.at).getTime() - toDate(b.at).getTime()
            : toDate(b.at).getTime() - toDate(a.at).getTime(),
        ),
    [items, order],
  );

  const rows = useMemo(() => {
    // One Intl policy for the whole feed is what keeps the day boundaries honest.
    const dayKey = (at: DateInput): string => formatDateTime(at, { locale, timeZone, dateStyle: 'medium' });
    const nowRef = isValidDate(now) ? toDate(now) : new Date();
    const todayKey = dayKey(nowRef);
    const yesterdayKey = dayKey(nowRef.getTime() - DAY_MS);
    // Same switch formatRelativeTime() uses for 'ahora'/'now': the two relative
    // day labels are the only strings this component authors, and an English
    // 'Today' dropped into a Spanish screen is the language mix we forbid.
    const es = (locale ?? DEFAULT_LOCALE).startsWith('es');

    const out: ReactNode[] = [];
    let previousKey: string | null = null;

    for (const item of sorted) {
      if (groupBy === 'day') {
        const key = dayKey(item.at);
        if (key !== previousKey) {
          previousKey = key;
          // A flat sibling, not a wrapper: the heading carries the same rail
          // ::before, so the line runs unbroken through every date boundary.
          out.push(
            <li key={`day-${key}`} className="he-feed__day" role="presentation">
              <h4 className="he-feed__day-label">
                {key === todayKey ? (
                  es ? 'Hoy' : 'Today'
                ) : key === yesterdayKey ? (
                  es ? 'Ayer' : 'Yesterday'
                ) : (
                  <DateText date={item.at} dateStyle="medium" locale={locale} timeZone={timeZone} />
                )}
              </h4>
            </li>,
          );
        }
      }

      const eyebrow = item.kind ?? item.actor?.name;
      const content = (
        <>
          <div className="he-feed__head">
            {eyebrow != null && <span className="he-feed__kind">{eyebrow}</span>}
            {/* Under a day heading the relative label just restates the heading at
              * lower precision ("hace 2d" under "1 SEP 2026") and hides the one
              * fact the heading cannot give you — the clock time, and therefore
              * the order of two events inside the same day. */}
            {groupBy === 'day' ? (
              <DateText
                className="he-feed__time"
                date={item.at}
                timeStyle="short"
                locale={locale}
                timeZone={timeZone}
              />
            ) : (
              <RelativeTime className="he-feed__time" date={item.at} now={now} locale={locale} />
            )}
          </div>
          <span className="he-feed__title">{item.title}</span>
          {item.body != null && <p className="he-feed__body">{item.body}</p>}
          {item.meta != null && <span className="he-feed__meta">{item.meta}</span>}
        </>
      );

      out.push(
        <li
          key={item.id}
          className={cx(
            'he-feed__item',
            item.tone && item.tone !== 'default' && `he-feed__item--${item.tone}`,
          )}
        >
          {item.actor ? (
            <Avatar
              className="he-feed__node he-feed__node--actor"
              size="xs"
              name={item.actor.name}
              src={item.actor.src}
              initials={item.actor.initials}
            />
          ) : (
            <span className="he-feed__node" aria-hidden>
              <span className="he-feed__dot" />
            </span>
          )}
          {item.href != null ? (
            <a className="he-feed__content" href={item.href}>
              {content}
            </a>
          ) : item.onSelect != null ? (
            <button type="button" className="he-feed__content" onClick={item.onSelect}>
              {content}
            </button>
          ) : (
            <div className="he-feed__content">{content}</div>
          )}
        </li>,
      );
    }

    return out;
  }, [sorted, groupBy, locale, timeZone, now]);

  return (
    <div className={cx('he-feed', className)} {...rest}>
      {compose != null && <div className="he-feed__compose">{compose}</div>}
      {sorted.length === 0 ? (
        <p className="he-feed__empty">{empty ?? 'No activity yet.'}</p>
      ) : (
        <ol className="he-feed__list" aria-label={ariaLabel ?? 'Activity'}>
          {rows}
        </ol>
      )}
    </div>
  );
}
