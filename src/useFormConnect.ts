import { useContext } from 'preact/hooks';
import { FormHookContext } from './types';
import { formContext } from './context';

export const useFormConnect = (): FormHookContext => useContext(formContext);
