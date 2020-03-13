import { useReducer } from 'preact/hooks';
import { get } from './helpers/operations';
import { FieldInformation } from './types';
import { useFormConnect } from './useFormConnect';

export interface FieldOperations<T> {
  onBlur: () => void;
  onChange: (value: T) => void;
  onFocus: () => void;
}

export interface FieldOptions {
  length?: number;
  uppercase?: boolean;
}

export function useField<T = any>(
  fieldId: string
): [FieldOperations<T>, FieldInformation<T>] {
  const state = useReducer((c: boolean) => !c, false);

  if (
    process.env.NODE_ENV !== 'production' &&
    (!fieldId || typeof fieldId !== 'string')
  ) {
    throw new Error(
      'The Field needs a valid "fieldId" property to function correctly.'
    );
  }

  const ctx = useFormConnect();
  const currentValue = get(ctx.values, fieldId) || '';

  return [
    {
      onBlur: () => {
        ctx.setFieldTouched(fieldId, true);
      },
      onChange: (value: T) => {
        ctx.setFieldValue(fieldId, value);
        // If our consumer has some custom-formatter this ensures we don't fallback to uncontrolled
        if (currentValue === value) {
          // @ts-ignore
          state[1]();
        }
      },
      onFocus: () => {
        ctx.setFieldTouched(fieldId, false);
      },
    },
    {
      error: get(ctx.errors, fieldId),
      touched: get(ctx.touched, fieldId),
      value: currentValue,
    },
  ];
}
