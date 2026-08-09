import type { Meta, StoryObj } from '@storybook/react-vite';
import SourcingFoodsUi from './ui';

const meta: Meta<typeof SourcingFoodsUi> = {
  component: SourcingFoodsUi,
  title: 'SourcingFoodsUi',
};

export default meta;
type Story = StoryObj<typeof SourcingFoodsUi>;

export const Default: Story = {};
