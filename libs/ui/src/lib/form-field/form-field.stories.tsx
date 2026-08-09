import type { Meta, StoryObj } from '@storybook/react-vite';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { FormField } from './form-field';
import { Button } from '../button/button';

const meta: Meta<typeof FormField> = {
  component: FormField,
  title: 'FormField',
};

export default meta;
type Story = StoryObj<typeof FormField>;

const supplierSchema = z.object({
  companyName: z.string().min(1, 'El nombre es requerido'),
  contactEmail: z.string().email('Email inválido'),
});
type SupplierForm = z.infer<typeof supplierSchema>;

function ZodFormDemo() {
  const methods = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    mode: 'onSubmit',
  });

  return (
    <FormProvider {...methods}>
      <form
        className="flex w-80 flex-col gap-4"
        onSubmit={methods.handleSubmit(() => undefined)}
        noValidate
      >
        <FormField<SupplierForm> name="companyName" label="Empresa" required>
          <input className="h-10 rounded-md border border-border px-3 text-sm" />
        </FormField>
        <FormField<SupplierForm>
          name="contactEmail"
          label="Email de contacto"
          description="Se usará para las invitaciones a RFQ"
          required
        >
          <input className="h-10 rounded-md border border-border px-3 text-sm" />
        </FormField>
        <Button type="submit">Enviar</Button>
      </form>
    </FormProvider>
  );
}

export const WithZodValidation: Story = {
  render: () => <ZodFormDemo />,
};
