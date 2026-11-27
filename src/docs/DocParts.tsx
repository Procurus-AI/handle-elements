import type { CSSProperties, ReactNode } from 'react';

/*
 * Small helpers for the MDX docs pages. Storybook here has no remark-gfm,
 * so Markdown tables do not render; pages use DocTable instead.
 * Styles use semantic tokens only.
 */

const cell: CSSProperties = {
  padding: 'var(--he-spacing-2) var(--he-spacing-3)',
  textAlign: 'left',
  verticalAlign: 'top',
  borderBottom: 'var(--he-border-width) solid var(--he-border-default)',
  font: 'var(--he-type-body-sm-weight) var(--he-type-body-sm-size)/var(--he-type-body-sm-line) var(--he-font-sans)',
  color: 'var(--he-text-primary)',
};

export function DocTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        margin: 'var(--he-spacing-4) 0',
        background: 'var(--he-bg-surface)',
      }}
    >
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              style={{
                ...cell,
                color: 'var(--he-text-secondary)',
                fontWeight: 500,
                background: 'var(--he-bg-panel)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            {r.map((c, j) => (
              <td key={j} style={cell}>
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Kind = 'fill' | 'text' | 'border';

function Sample({ token, kind, on }: { token: string; kind: Kind; on?: string }) {
  const base: CSSProperties = {
    width: 120,
    height: 40,
    borderRadius: 'var(--he-corner-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    font: 'var(--he-type-label-md-weight) var(--he-type-label-md-size)/var(--he-type-label-md-line) var(--he-font-sans)',
  };
  if (kind === 'fill') {
    return (
      <div
        style={{
          ...base,
          background: `var(${token})`,
          border: 'var(--he-border-width) solid var(--he-border-default)',
        }}
      />
    );
  }
  if (kind === 'border') {
    return (
      <div
        style={{
          ...base,
          background: 'var(--he-bg-surface)',
          border: `var(--he-border-width) solid var(${token})`,
          outline: 'none',
        }}
      />
    );
  }
  return (
    <div style={{ ...base, background: `var(${on ?? '--he-bg-surface'})`, color: `var(${token})` }}>
      Aa Pagado
    </div>
  );
}

/** One row per token: the same variable rendered under the light and the dark theme. */
export function TokenTable({
  tokens,
}: {
  tokens: { token: string; kind: Kind; on?: string; use: string }[];
}) {
  return (
    <DocTable
      head={['Token', 'Light', 'Dark', 'Use']}
      rows={tokens.map((t) => [
        <code key="n">{t.token}</code>,
        <div key="l" data-theme="light" style={{ background: 'transparent' }}>
          <Sample token={t.token} kind={t.kind} on={t.on} />
        </div>,
        <div key="d" data-theme="dark" className="he-theme-dark" style={{ background: 'transparent' }}>
          <Sample token={t.token} kind={t.kind} on={t.on} />
        </div>,
        t.use,
      ])}
    />
  );
}

/** A short rule, set apart from running text. */
export function Rule({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      style={{
        margin: 'var(--he-spacing-4) 0',
        padding: 'var(--he-spacing-3) var(--he-spacing-4)',
        background: 'var(--he-bg-panel)',
        border: 'var(--he-border-width) solid var(--he-border-default)',
        borderRadius: 'var(--he-corner-lg)',
        color: 'var(--he-text-primary)',
      }}
    >
      <strong>{title}</strong>
      <div style={{ marginTop: 'var(--he-spacing-1)', color: 'var(--he-text-secondary)' }}>{children}</div>
    </div>
  );
}
