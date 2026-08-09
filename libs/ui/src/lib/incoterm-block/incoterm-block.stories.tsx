import type { Meta, StoryObj } from '@storybook/react-vite';
import { IncotermBlock } from './incoterm-block';

const meta: Meta<typeof IncotermBlock> = {
  component: IncotermBlock,
  title: 'IncotermBlock',
};

export default meta;
type Story = StoryObj<typeof IncotermBlock>;

export const Default: Story = { args: { code: 'FOB', location: 'Puerto de Valencia' } };
export const WithoutLocation: Story = { args: { code: 'EXW' } };
