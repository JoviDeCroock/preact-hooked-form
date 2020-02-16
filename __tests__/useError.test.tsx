import { render, fireEvent, act } from '@testing-library/preact';
import { h } from 'preact';
import { Form, useError } from '../src';

const FormComponent = ({ change }: any) => {
  const error = useError('name');

  return (
    <div>
      <input
        onChange={(e: any) => change('name', e.target.value)}
        placeholder="name"
      />
      <p data-testid="name-error">{error}</p>
    </div>
  );
};

const makeForm = (props: any) =>
  render(
    <Form {...props}>{({ change }) => <FormComponent change={change} />}</Form>
  );

describe('useError', () => {
  it('should show the error', () => {
    const validate = jest.fn(values => {
      if (values.name === 'HF') {
        return { name: 'Illegal' };
      }
      return {};
    });
    const { getByPlaceholderText, getByTestId } = makeForm({
      validate,
      validateOnChange: true,
    });
    const input = getByPlaceholderText('name');
    let nameError = getByTestId('name-error');

    expect(nameError.textContent).toBe('');
    act(() => {
      fireEvent.change(input, { target: { value: 'HF' } });
    });

    expect(validate).toBeCalledTimes(1);
    expect(nameError.textContent).toBe('Illegal');

    act(() => {
      fireEvent.change(input, { target: { value: 'Preact' } });
    });

    expect(validate).toBeCalledTimes(2);
    expect(nameError.textContent).toBe('');
  });
});
