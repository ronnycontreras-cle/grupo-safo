import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: 'Badge',
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Draft: Story = { args: { variant: 'draft', children: 'Draft' } };
export const Review: Story = { args: { variant: 'review', children: 'Review' } };
export const Approved: Story = { args: { variant: 'approved', children: 'Approved' } };
export const Incoterm: Story = { args: { variant: 'incoterm', children: 'FOB' } };
