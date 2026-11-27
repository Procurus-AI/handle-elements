import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination';

/**
 * Sits inside the table panel, below the last row. Range text left, controls right.
 * The range is a polite live region, so paging announces the new range. Page buttons carry
 * `aria-label="Página N"` and the current one `aria-current="page"`.
 */
const meta = {
  title: 'Molecules/Pagination',
  component: Pagination,
  args: { page: 1, pageSize: 50, total: 53938, pageSizeOptions: [] },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Figma board: "1–10 de 143", prev, pages, next. */
export const Figma: Story = {
  args: { page: 1, pageSize: 10, total: 143 },
  render: (args) => (
    <div style={{ width: 900, padding: '0 16px' }}>
      <Pagination {...args} />
    </div>
  ),
};

/** First page, a middle page, the last page and an empty result. Disabled steps are real `disabled`. */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 720 }}>
      <Pagination page={1} pageSize={50} total={53938} pageSizeOptions={[]} />
      <Pagination page={8} pageSize={50} total={53938} pageSizeOptions={[]} />
      <Pagination page={1079} pageSize={50} total={53938} pageSizeOptions={[]} />
      <Pagination page={1} pageSize={50} total={0} pageSizeOptions={[]} />
    </div>
  ),
};

/** With the rows-per-page select (the 0.x footer) and the dense variant. */
export const WithPageSize: Story = {
  render: () => {
    const [page, setPage] = useState(3);
    const [size, setSize] = useState(50);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 720 }}>
        <Pagination
          page={page}
          pageSize={size}
          total={4592}
          pageSizeOptions={[25, 50, 100]}
          onPageChange={setPage}
          onPageSizeChange={(n) => {
            setSize(n);
            setPage(1);
          }}
        />
        <Pagination dense page={3} pageSize={50} total={4592} pageSizeOptions={[]} />
      </div>
    );
  },
};

export const Compact: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Pagination compact page={1} pageSize={50} total={4592} />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    return (
      <div style={{ width: 720 }}>
        <Pagination page={page} pageSize={50} total={53938} pageSizeOptions={[]} onPageChange={setPage} />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('1–50 de 53,938')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Página 1' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Página siguiente' }));
    await expect(canvas.getByText('51–100 de 53,938')).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Página 2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Página anterior' }));
    await expect(canvas.getByRole('button', { name: 'Página anterior' })).toBeDisabled();
  },
};
