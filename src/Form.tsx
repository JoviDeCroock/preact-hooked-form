import { h, VNode } from 'preact';
import { useState as preactUseState, useEffect, useRef } from 'preact/hooks';
import { deriveInitial } from './helpers/deriveInitial';
import useState, { EMPTY_OBJ } from './helpers/useState';
import { Errors, Touched } from './types';
import { formContext } from './context';

export interface SuccessBag {
  resetForm: () => void;
}

export interface ErrorBag {
  setErrors: (errors: Errors) => void;
  setFormError: (error: string) => void;
}

export interface CallBag {
  props?: object;
  setErrors: (errors: Errors) => void;
  setFormError: (error: string) => void;
}

export interface Payload {
  change: (fieldId: string, value: any) => void;
  formError?: string | null;
  isDirty?: boolean | null;
  isSubmitting?: boolean | null;
  handleSubmit: (e?: any) => void;
  resetForm: () => void;
}

export interface FormOptions<T> {
  children: (form: Payload) => VNode;
  enableReinitialize?: boolean;
  initialErrors?: Errors;
  initialValues?: Partial<T>;
  noForm?: boolean;
  onError?: (error: object, callbag: ErrorBag) => void;
  onSuccess?: (result: any, callbag: SuccessBag) => void;
  onSubmit: (values: Partial<T>, callbag: CallBag) => Promise<any> | any;
  shouldSubmitWhenInvalid?: boolean;
  validate?: (values: Partial<T>) => object | undefined;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
}

export const Form = <Values extends object>({
  children,
  enableReinitialize,
  initialErrors,
  initialValues,
  onSubmit,
  noForm,
  validate,
  onError,
  onSuccess,
  shouldSubmitWhenInvalid,
  validateOnBlur,
  validateOnChange,
}: FormOptions<Values>) => {
  const { 0: values, 1: setFieldValue, 2: setValuesState } = useState(
    initialValues
  );
  const { 0: touched, 1: touch, 2: setTouchedState } = useState(
    initialErrors && (() => deriveInitial(initialErrors, true))
  );
  const { 0: errors, 1: setFieldError, 2: setErrorState } = useState(
    initialErrors
  );
  const { 0: isSubmitting, 1: setSubmitting } = preactUseState<boolean>(false);
  const { 0: formError, 1: setFormError } = preactUseState<string | undefined>(
    undefined
  );

  const isDirty = useRef(false);

  const validateForm = () => {
    const validationErrors = (validate && validate(values)) || EMPTY_OBJ;
    setErrorState(validationErrors);
    return validationErrors;
  };

  const resetForm = () => {
    isDirty.current = false;
    setValuesState(initialValues);
    setTouchedState(initialErrors && deriveInitial(initialErrors, true));
    setErrorState(initialErrors);
  };

  const handleSubmit = () => {
    const fieldErrors = validateForm();
    setTouchedState(deriveInitial(fieldErrors, true));
    if (!shouldSubmitWhenInvalid && Object.keys(fieldErrors).length > 0) {
      setSubmitting(false);
    }

    const setFormErr = (err: string) => {
      setFormError(err);
    };

    return new Promise(resolve =>
      resolve(
        onSubmit(values, { setErrors: setErrorState, setFormError: setFormErr })
      )
    )
      .then((result: any) => {
        setSubmitting(false);
        if (onSuccess) onSuccess(result, { resetForm });
      })
      .catch((e: any) => {
        setSubmitting(false);
        if (onError)
          onError(e, { setErrors: setErrorState, setFormError: setFormErr });
      });
  };

  const submit = (e?: any) => {
    if (e && e.preventDefault) e.preventDefault();
    setSubmitting(true);
  };

  useEffect(() => {
    // This convenience method ensures we don't have to pass handleSubmit
    // to the context/childComponent (since this rebinds on every value change)
    // This avoids a lot of rerenders
    if (isSubmitting) handleSubmit();
  }, [isSubmitting]);

  useEffect(() => {
    if (enableReinitialize) resetForm();
  }, [initialValues]);

  useEffect(() => {
    if (
      (validateOnBlur === undefined || validateOnChange || validateOnBlur) &&
      isDirty.current
    ) {
      validateForm();
    }
  }, [
    validateOnBlur === undefined ? touched : validateOnBlur && touched,
    validateOnChange && values,
    isDirty.current,
  ]);

  const change = (fieldId: string, value: any) => {
    isDirty.current = true;
    setFieldValue(fieldId, value);
  };

  return (
    <formContext.Provider
      value={{
        errors: errors as Errors,
        formError,
        isDirty: isDirty.current,
        isSubmitting,
        resetForm,
        setFieldError: (fieldId: string, error?: any) => {
          setFieldError(fieldId, error);
        },
        setFieldTouched: (fieldId: string, value?: boolean) => {
          touch(fieldId, value == null ? true : value);
        },
        setFieldValue: change,
        submit,
        touched: touched as Touched,
        validate: validateForm,
        values,
      }}
    >
      {children({
        change,
        formError,
        isDirty: isDirty.current,
        isSubmitting,
        handleSubmit: submit,
        resetForm,
      })}
    </formContext.Provider>
  );
};
