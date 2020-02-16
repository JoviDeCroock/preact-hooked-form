import { useState } from 'preact/hooks';
import { set } from './operations';

export const EMPTY_OBJ = {};

type Output = [
  object,
  (id: string, value: any) => void,
  (newState?: object) => void
];

export default (initial?: object | (() => object)): Output => {
  const data = useState(initial || EMPTY_OBJ);
  return [
    data[0],
    (id: string, value: any) => {
      data[1]((state: object) => set(state, id, value));
    },
    (newState?: object) => {
      data[1](newState || EMPTY_OBJ);
    },
  ];
};
