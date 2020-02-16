import { render, fireEvent, act } from '@testing-library/preact';
import { h } from 'preact';
import { Form, useField } from '../src';

const FormComponent = () => {
  const [fieldMethods, { value, error, touched }] = useField('name');

  return (
    <div>
      <input
        {...fieldMethods}
        onChange={(e: any) => fieldMethods.onChange(e.target.value.slice(0, 3))}
        placeholder="name"
        value={value}
      />
      {touched && error && <p data-testid="name-error">{error}</p>}
    </div>
  );
};

const makeForm = (props: any) =>
  render(<Form {...props}>{() => <FormComponent />}</Form>);

describe('useField', () => {
  it('should show the initial value and error', () => {
    const { getByPlaceholderText, getByTestId } = makeForm({
      initialValues: { name: 'HF' },
      initialErrors: { name: 'Illegal' },
    });
    const input = getByPlaceholderText('name');
    const nameError = getByTestId('name-error');

    expect(nameError.textContent).toBe('Illegal');
    // @ts-ignore
    expect(input.value).toBe('HF');
  });

  it('should handle changes', () => {
    const { getByPlaceholderText } = makeForm({});
    const input = getByPlaceholderText('name');

    // @ts-ignore
    expect(input.value).toBe('');

    act(() => {
      fireEvent.change(input, { target: { value: 'Pre' } });
    });

    // @ts-ignore
    expect(input.value).toBe('Pre');
  });

  it('should handle equal changes (vdom opt-out)', () => {
    const { getByPlaceholderText } = makeForm({ initialValues: 'abc' });
    const input = getByPlaceholderText('name');

    // @ts-ignore
    expect(input.value).toBe('');

    act(() => {
      fireEvent.change(input, { target: { value: 'abcd' } });
    });

    // @ts-ignore
    expect(input.value).toBe('abc');
  });

  it('should handle blurring', () => {
    const validate = jest.fn(({ name }) =>
      name === 'Pre' ? { name: 'incomplete' } : {}
    );
    const { getByPlaceholderText, getByTestId } = makeForm({
      initialValues: 'abc',
      validateOnBlur: true,
      validate,
    });
    const input = getByPlaceholderText('name');

    act(() => {
      fireEvent.change(input, { target: { value: 'Preact' } });
      fireEvent.blur(input);
    });

    const nameError = getByTestId('name-error');
    expect(nameError.textContent).toBe('incomplete');
  });
});
