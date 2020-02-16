import { createContext } from 'preact';
import { FormHookContext } from './types';

export const formContext = createContext<FormHookContext>(null as any);
