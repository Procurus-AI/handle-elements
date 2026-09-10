import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { cx } from '../../lib/cx';

export interface EmailComposerChannel {
  /** Stable identity passed to `onChannelChange`. */
  id: string;
  /** Accessible name and native tooltip for the icon control. */
  label: string;
  /** Product-owned channel mark (email, WhatsApp, phone…). */
  icon: ReactNode;
  disabled?: boolean;
}

export interface EmailComposerContact {
  /** Stable React key. */
  id: string;
  /** Primary text shown inside the contact chip. */
  label: string;
  /** Optional full address, exposed as a tooltip when it differs from `label`. */
  address?: string;
  /** Optional avatar or channel mark. Initials are derived from `label` by default. */
  avatar?: ReactNode;
}

export interface EmailComposerProps
  extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'title' | 'onCopy'> {
  /** Window title. Default `New message`. */
  title?: ReactNode;
  /** Quiet drafting context beside the title. */
  meta?: ReactNode;
  /** Icon controls mounted in the window header. */
  channels?: readonly EmailComposerChannel[];
  activeChannel?: string;
  defaultActiveChannel?: string;
  onChannelChange?: (channel: EmailComposerChannel) => void;
  channelsLabel?: string;
  /** Extra window controls after the built-in copy action. */
  headerActions?: ReactNode;
  to?: readonly EmailComposerContact[];
  from?: EmailComposerContact;
  toLabel?: ReactNode;
  fromLabel?: ReactNode;
  subject?: string;
  defaultSubject?: string;
  subjectPlaceholder?: string;
  subjectLabel?: string;
  onSubjectChange?: (subject: string, event: ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
  bodyPlaceholder?: string;
  bodyLabel?: string;
  onValueChange?: (value: string, event: FormEvent<HTMLDivElement>) => void;
  /** Shows bold, italic, underline, and list controls. Default `true`. */
  formatting?: boolean;
  /** Product-owned formatting or attachment controls after the built-in tools. */
  toolbar?: ReactNode;
  /** Approval, send, edit, or product-specific actions in the footer. */
  actions?: ReactNode;
  /** Shows the library-owned clipboard control. Default `true`. */
  copyable?: boolean;
  /** Clipboard payload override. By default the subject and body are copied. */
  copyText?: string;
  copyLabel?: string;
  copiedLabel?: string;
  /** Called after text reaches the clipboard. */
  onCopyText?: (text: string) => void;
  onCopyError?: (error: unknown) => void;
}

function contactInitials(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function ContactChip({ contact }: { contact: EmailComposerContact }) {
  const title = contact.address && contact.address !== contact.label ? contact.address : undefined;
  return (
    <span className="he-email-composer__contact" title={title}>
      <span className="he-email-composer__avatar" aria-hidden>
        {contact.avatar ?? contactInitials(contact.label)}
      </span>
      <span className="he-email-composer__contact-label">{contact.label}</span>
    </span>
  );
}

function fallbackCopy(text: string) {
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand('copy');
  field.remove();
  if (!copied) throw new Error('The browser did not allow clipboard access.');
}

/**
 * A channel-aware drafting window for human review and handoff. It owns plain
 * text editing and clipboard behavior while leaving rich formatting and
 * workflow actions in slots so products can connect their own editor commands.
 */
export function EmailComposer({
  title = 'New message',
  meta,
  channels = [],
  activeChannel,
  defaultActiveChannel,
  onChannelChange,
  channelsLabel,
  headerActions,
  to = [],
  from,
  toLabel = 'To',
  fromLabel = 'From',
  subject,
  defaultSubject = '',
  subjectPlaceholder = 'Subject',
  subjectLabel = 'Subject',
  onSubjectChange,
  value,
  defaultValue = '',
  bodyPlaceholder = 'Write your message…',
  bodyLabel = 'Message',
  onValueChange,
  formatting = true,
  toolbar,
  actions,
  copyable = true,
  copyText,
  copyLabel = 'Copy',
  copiedLabel = 'Copied',
  onCopyText,
  onCopyError,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: EmailComposerProps) {
  const generatedTitleId = useId();
  const [internalChannel, setInternalChannel] = useState(
    defaultActiveChannel ?? channels[0]?.id,
  );
  const [internalSubject, setInternalSubject] = useState(defaultSubject);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [copied, setCopied] = useState(false);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const selectedChannel = activeChannel ?? internalChannel;
  const resolvedSubject = subject ?? internalSubject;
  const resolvedValue = value ?? internalValue;
  const titleId = ariaLabel || ariaLabelledBy ? undefined : generatedTitleId;

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.innerText === resolvedValue) return;
    editor.innerText = resolvedValue;
  }, [resolvedValue]);

  useEffect(() => {
    if (!formatting || typeof document === 'undefined') return;
    const updateActiveFormats = () => {
      const editor = editorRef.current;
      const selection = document.getSelection();
      if (!editor || !selection?.anchorNode || !editor.contains(selection.anchorNode)) return;
      const commands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
      setActiveFormats(commands.filter((command) => document.queryCommandState(command)));
    };
    document.addEventListener('selectionchange', updateActiveFormats);
    return () => document.removeEventListener('selectionchange', updateActiveFormats);
  }, [formatting]);

  const changeSubject = (event: ChangeEvent<HTMLInputElement>) => {
    if (subject === undefined) setInternalSubject(event.target.value);
    onSubjectChange?.(event.target.value, event);
  };

  const changeValue = (event: FormEvent<HTMLDivElement>) => {
    const nextValue = event.currentTarget.innerText;
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue, event);
  };

  const applyFormat = (command: string) => {
    const editor = editorRef.current;
    if (!editor || typeof document === 'undefined') return;
    editor.focus();
    document.execCommand(command);
    const commands = ['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'];
    setActiveFormats(commands.filter((candidate) => document.queryCommandState(candidate)));
  };

  const preserveSelection = (event: MouseEvent<HTMLButtonElement>) => event.preventDefault();

  const selectChannel = (channel: EmailComposerChannel) => {
    if (activeChannel === undefined) setInternalChannel(channel.id);
    onChannelChange?.(channel);
  };

  const handleCopy = async () => {
    const bodyText = editorRef.current?.innerText ?? resolvedValue;
    const text = copyText ?? [resolvedSubject, bodyText].filter(Boolean).join('\n\n');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(text);
        } catch (clipboardError) {
          if (typeof document === 'undefined') throw clipboardError;
          fallbackCopy(text);
        }
      } else if (typeof document !== 'undefined') {
        fallbackCopy(text);
      } else {
        throw new Error('Clipboard access is unavailable.');
      }
      onCopyText?.(text);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      onCopyError?.(error);
    }
  };

  return (
    <section
      className={cx('he-email-composer', className)}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy ?? titleId}
      {...rest}
    >
      <header className="he-email-composer__header">
        <div className="he-email-composer__heading">
          <h2 id={titleId} className="he-email-composer__title">
            {title}
          </h2>
          {meta != null && <span className="he-email-composer__meta">{meta}</span>}
        </div>

        <div className="he-email-composer__window-actions">
          {channels.length > 0 && (
            <div
              className="he-email-composer__channels"
              role="group"
              aria-label={channelsLabel ?? 'Message channel'}
            >
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  type="button"
                  className={cx(
                    'he-email-composer__channel',
                    selectedChannel === channel.id && 'he-email-composer__channel--active',
                  )}
                  aria-label={channel.label}
                  aria-pressed={selectedChannel === channel.id}
                  title={channel.label}
                  disabled={channel.disabled}
                  onClick={() => selectChannel(channel)}
                >
                  {channel.icon}
                </button>
              ))}
            </div>
          )}

          {copyable && (
            <button
              type="button"
              className={cx(
                'he-email-composer__copy',
                copied && 'he-email-composer__copy--copied',
              )}
              onClick={handleCopy}
              aria-label={copied ? copiedLabel : copyLabel}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
            </button>
          )}
          {headerActions != null && (
            <div className="he-email-composer__header-actions">{headerActions}</div>
          )}
        </div>
      </header>

      {(to.length > 0 || from != null) && (
        <div className="he-email-composer__addresses">
          {to.length > 0 && (
            <div className="he-email-composer__address-row">
              <span className="he-email-composer__address-label">{toLabel}</span>
              <div className="he-email-composer__contacts">
                {to.map((contact) => (
                  <ContactChip key={contact.id} contact={contact} />
                ))}
              </div>
            </div>
          )}
          {from != null && (
            <div className="he-email-composer__address-row">
              <span className="he-email-composer__address-label">{fromLabel}</span>
              <div className="he-email-composer__contacts">
                <ContactChip contact={from} />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="he-email-composer__draft">
        <input
          className="he-email-composer__subject"
          type="text"
          aria-label={subjectLabel}
          placeholder={subjectPlaceholder}
          value={resolvedSubject}
          onChange={changeSubject}
        />
        <div
          ref={editorRef}
          className="he-email-composer__body"
          role="textbox"
          contentEditable
          suppressContentEditableWarning
          aria-multiline="true"
          aria-label={bodyLabel}
          data-placeholder={bodyPlaceholder}
          onInput={changeValue}
        />
      </div>

      {(formatting || toolbar != null || actions != null) && (
        <footer className="he-email-composer__footer">
          {(formatting || toolbar != null) && (
            <div className="he-email-composer__toolbar">
              {formatting && (
                <div className="he-email-composer__formatting" role="toolbar" aria-label="Text formatting">
                  <FormatButton
                    label="Bold"
                    active={activeFormats.includes('bold')}
                    onMouseDown={preserveSelection}
                    onClick={() => applyFormat('bold')}
                  >
                    <strong>B</strong>
                  </FormatButton>
                  <FormatButton
                    label="Italic"
                    active={activeFormats.includes('italic')}
                    onMouseDown={preserveSelection}
                    onClick={() => applyFormat('italic')}
                  >
                    <em>I</em>
                  </FormatButton>
                  <FormatButton
                    label="Underline"
                    active={activeFormats.includes('underline')}
                    onMouseDown={preserveSelection}
                    onClick={() => applyFormat('underline')}
                  >
                    <span className="he-email-composer__underline">U</span>
                  </FormatButton>
                  <span className="he-email-composer__toolbar-rule" aria-hidden />
                  <FormatButton
                    label="Bulleted list"
                    active={activeFormats.includes('insertUnorderedList')}
                    onMouseDown={preserveSelection}
                    onClick={() => applyFormat('insertUnorderedList')}
                  >
                    <BulletedListIcon />
                  </FormatButton>
                  <FormatButton
                    label="Numbered list"
                    active={activeFormats.includes('insertOrderedList')}
                    onMouseDown={preserveSelection}
                    onClick={() => applyFormat('insertOrderedList')}
                  >
                    <NumberedListIcon />
                  </FormatButton>
                </div>
              )}
              {toolbar}
            </div>
          )}
          {actions != null && <div className="he-email-composer__actions">{actions}</div>}
        </footer>
      )}
    </section>
  );
}

interface FormatButtonProps {
  label: string;
  active: boolean;
  children: ReactNode;
  onMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
  onClick: () => void;
}

function FormatButton({ label, active, children, onMouseDown, onClick }: FormatButtonProps) {
  return (
    <button
      type="button"
      className={cx(
        'he-email-composer__format-button',
        active && 'he-email-composer__format-button--active',
      )}
      aria-label={label}
      aria-pressed={active}
      title={label}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function CopyIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <rect x="5" y="4.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M9.5 4.5V3A1.5 1.5 0 0 0 8 1.5H3A1.5 1.5 0 0 0 1.5 3v5A1.5 1.5 0 0 0 3 9.5h2" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="m2.5 7.8 3.1 3.1 6.9-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BulletedListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <circle cx="2.5" cy="4" r=".8" fill="currentColor" />
      <circle cx="2.5" cy="7.5" r=".8" fill="currentColor" />
      <circle cx="2.5" cy="11" r=".8" fill="currentColor" />
      <path d="M5 4h7.5M5 7.5h7.5M5 11h7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function NumberedListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden>
      <path d="M1.7 3.2h.8v2M1.7 8c.1-.6.9-.8 1.1-.3.2.7-1.1.8-1.1 1.8h1.2M1.7 11.3h.7c.7 0 .7 1 0 1h-.7" stroke="currentColor" strokeWidth=".9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 4h7.5M5 8.5h7.5M5 12h7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
