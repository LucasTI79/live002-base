import { useSyncExternalStore } from 'react';

type SetterFn<TState> = (prevState: TState) => Partial<TState>;
type ListenerFn = () => void;
type SetStateFn<T> = (partialState: Partial<T> | SetterFn<T>) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStore<TState extends Record<string, any>>(
  createState: (setState: SetStateFn<TState>, getState: () => TState) => TState,
) {
  let state: TState;
  let listeners: Set<ListenerFn>;

  function notify() {
    listeners.forEach((listener) => listener());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      newValue,
    };

    notify();
  }

  function getState() {
    return state;
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
    };
  }

  function useStore<TValue>(selector: (currentState: TState) => TValue) {
    return useSyncExternalStore(subscribe, () => selector(state));

    // const [value, setValue] = useState(() => selector(state));
    // useEffect(() => {
    //   const unsubscribe = subscribe(() => {
    //     const newValue = selector(state);
    //     if (value !== newValue) {
    //       setValue(newValue);
    //     }
    //   });

    //   return () => unsubscribe();
    // }, [selector, value]);

    // return value;
  }

  state = createState(setState, getState);
  listeners = new Set();

  return useStore;
}
