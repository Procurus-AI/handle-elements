import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Container, Stack } from '../Layout/Layout';
import { Pagination } from './Pagination';

const meta = {
  title: 'Elements/Pagination',
  component: Pagination,
  args: { page: 1, pageSize: 50, total: 4592 },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// The Policies footer, live. Changing the page size does NOT reset the page —
// that is the caller's decision, made here.
export const Footer: Story = {
  render: () => {
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(50);
    return (
      <Pagination
        page={page}
        pageSize={size}
        total={4592}
        onPageChange={setPage}
        onPageSizeChange={(n) => {
          setSize(n);
          setPage(1);
        }}
      />
    );
  },
};

// First page, last page, and empty — the arrows are really `disabled`, so focus
// skips them rather than landing on a dead control.
export const Edges: Story = {
  render: () => (
    <Stack gap={4}>
      <Pagination page={1} pageSize={50} total={4592} />
      <Pagination page={92} pageSize={50} total={4592} />
      <Pagination page={1} pageSize={50} total={0} />
    </Stack>
  ),
};

export const Compact: Story = {
  render: () => (
    <Container max={320} padding={0}>
      <Pagination compact page={1} pageSize={50} total={4592} />
    </Container>
  ),
};

export const Dense: Story = {
  render: () => (
    <Stack gap={4}>
      <Pagination page={3} pageSize={50} total={4592} />
      <Pagination dense page={3} pageSize={50} total={4592} />
    </Stack>
  ),
};

// Every visible string is a hook — localisation needs no fork.
export const CustomLabels: Story = {
  args: {
    page: 3,
    labels: {
      range: (from, to, total) => `${from}–${to} de ${total}`,
      pageSize: (n) => `${n} por página`,
      previous: 'Página anterior',
      next: 'Página siguiente',
      pageSizeAria: 'Filas por página',
      nav: 'Paginación',
    },
  },
};
