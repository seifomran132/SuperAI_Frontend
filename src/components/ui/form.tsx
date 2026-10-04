import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { Slot } from 'radix-ui';
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import { CircleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Label } from '~/components/ui/label';
import { cn } from '~/lib/utils';

export const Form = FormProvider;

interface FormFieldContextValue {
  name: string;
}
const FormFieldContext = createContext<FormFieldContextValue | null>(null);

interface FormItemContextValue {
  id: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
}
const FormItemContext = createContext<FormItemContextValue | null>(null);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function useFormField() {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext?.name });
  if (!fieldContext || !itemContext) {
    throw new Error(
      'useFormField must be used inside <FormField> and <FormItem>',
    );
  }
  const fieldState = getFieldState(fieldContext.name, formState);
  const { id, hasDescription } = itemContext;
  return {
    id,
    hasDescription,
    name: fieldContext.name,
    formItemId: `${id}-item`,
    formDescriptionId: `${id}-description`,
    formMessageId: `${id}-message`,
    ...fieldState,
  };
}

export function FormItem({ className, ...props }: ComponentProps<'div'>) {
  const id = useId();
  const [hasDescription, setHasDescription] = useState(false);
  return (
    <FormItemContext.Provider value={{ id, hasDescription, setHasDescription }}>
      <div
        data-slot="form-item"
        className={cn('grid gap-2', className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

export function FormLabel({
  className,
  ...props
}: ComponentProps<typeof Label>) {
  const { formItemId } = useFormField();
  return (
    <Label
      data-slot="form-label"
      className={className}
      htmlFor={formItemId}
      {...props}
    />
  );
}

export function FormControl(props: ComponentProps<typeof Slot.Root>) {
  const {
    error,
    hasDescription,
    formItemId,
    formDescriptionId,
    formMessageId,
  } = useFormField();
  // Reference only ids that are rendered, so aria-describedby never dangles.
  const describedBy = [
    hasDescription && formDescriptionId,
    error && formMessageId,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={describedBy || undefined}
      aria-invalid={!!error}
      {...props}
    />
  );
}

/** Hint under the field. Registers itself so FormControl can reference it. */
export function FormDescription({ className, ...props }: ComponentProps<'p'>) {
  const { formDescriptionId } = useFormField();
  const setHasDescription = useContext(FormItemContext)?.setHasDescription;
  useLayoutEffect(() => {
    setHasDescription?.(true);
    return () => setHasDescription?.(false);
  }, [setHasDescription]);
  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn('text-fg-muted text-sm leading-6 empty:hidden', className)}
      {...props}
    />
  );
}

/**
 * Error under the field, with an icon. The error text is an i18n key (schemas
 * and setError carry keys, never prose); `children` is used when there is no
 * form error.
 */
export function FormMessage({
  className,
  children,
  ...props
}: ComponentProps<'p'>) {
  const { t } = useTranslation();
  const { error, formMessageId } = useFormField();
  const body: ReactNode = error ? t(String(error.message ?? '')) : children;
  if (!body) return null;
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn(
        'text-danger flex items-start gap-2 text-sm leading-6 font-medium',
        className,
      )}
      {...props}
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{body}</span>
    </p>
  );
}
