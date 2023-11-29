/* eslint-disable @typescript-eslint/no-this-alias */
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
import {
  delay,
  ICancellablePromise,
  swallowCancelledPromiseError,
} from './delay';

type Now<T> = () => T | undefined;

type BaseTypedDebouncedFunction<T> = {
  readonly now: Now<T>;
  readonly cancel: () => void;
  readonly isPending: () => boolean;
};

function debounceInternal<Args extends readonly unknown[], T>(func: (...args: Args) => T, wait: number): BaseTypedDebouncedFunction<T> {
  let timeout: ICancellablePromise<T | undefined> | null;
  let args: unknown[];
  let context: unknown;
  let later: () => T | undefined;

  // Has to be 'function' because of execution context.
  const res = function(this: any, ...latestArgs: unknown[]): { readonly now: Now<T> } {
    context = this;
    args = latestArgs;
    later = (): T | undefined => {
      timeout = null;
      return (func as any).apply(context, args);
    };

    if (timeout) {
      timeout.cancel();
      timeout = null;
    }

    timeout = delay(wait).then(later).catch(swallowCancelledPromiseError) as ICancellablePromise<T | undefined> | null;

    return {
      now: (): T | undefined => {
        if (timeout) {
          timeout.cancel();
          timeout = null;
          return (func as any).apply(context, args);
        }
        else {
          return undefined;
        }
      },
    };
  };

  return Object.assign(res, {
    now: (): T | undefined => {
      if (timeout) {
        timeout.cancel();
        timeout = null;
        return later();
      }
      return undefined;
    },
    cancel: (): void => {
      if (timeout) {
        timeout.cancel();
        timeout = null;
      }
    },
    isPending: (): boolean => {
      return !!timeout;
    },
  });
}

export type TypedDebouncedFunction<Args extends readonly unknown[], T> = BaseTypedDebouncedFunction<T> & {
  (..._args: Args): {
    readonly now: Now<T>;
  };
  // using field with const value disables implicit conversion
  // between this and strongly typed debounced function types caused by ...args:unknown[]
  readonly type: 'any-args';
};
export type DebouncedFunction = TypedDebouncedFunction<[], void>;

export function debounce<Args extends readonly unknown[], T>(func: (...args: Args) => T, wait: number): TypedDebouncedFunction<Args, T> {
  return Object.assign(debounceInternal<Args, T>(func, wait), { type: 'any-args' }) as TypedDebouncedFunction<Args, T>;
}

/*************************************************************
 Strongly typed debounced functions
 *************************************************************/

export type TypedDebouncedFunctionNoArgs<T> = BaseTypedDebouncedFunction<T> & {
  (): {
    readonly now: Now<T>;
  };
  readonly type: '0-arg';
};

// export function debounceNoArgs<T>(func: () => T, wait: number): TypedDebouncedFunctionNoArgs<T> {
//   return Object.assign(debounceInternal<T>(func, wait), { type: '0-arg' }) as TypedDebouncedFunctionNoArgs<T>;
// }
//
// export type TypedDebouncedFunction1Args<A1, T> = BaseTypedDebouncedFunction<T> & {
//   (a1: A1): {
//     readonly now: Now<T>;
//   };
//   readonly type: '1-arg';
// };
//
// export function debounce1Args<A1, T>(func: (a1: A1) => T, wait: number): TypedDebouncedFunction1Args<A1, T> {
//   return Object.assign(debounceInternal<T>(func as any, wait), { type: '1-arg' }) as TypedDebouncedFunction1Args<A1, T>;
// }
//
// export type TypedDebouncedFunction2Args<A1, A2, T> = BaseTypedDebouncedFunction<T> & {
//   (a1: A1, a2: A2): {
//     readonly now: Now<T>;
//   };
//   readonly type: '2-args';
// };
//
// export function debounce2Args<A1, A2, T>(func: (a1: A1, a2: A2) => T, wait: number): TypedDebouncedFunction2Args<A1, A2, T> {
//   return Object.assign(debounceInternal<T>(func as any, wait), { type: '2-args' }) as TypedDebouncedFunction2Args<A1, A2, T>;
// }
//
// export type TypedDebouncedFunction3Args<A1, A2, A3, T> = BaseTypedDebouncedFunction<T> & {
//   (a1: A1, a2: A2, a3: A3): {
//     readonly now: Now<T>;
//   };
//   readonly type: '3-args';
// };
//
// export function debounce3Args<A1, A2, A3, T>(func: (a1: A1, a2: A2, a3: A3) => T, wait: number): TypedDebouncedFunction3Args<A1, A2, A3, T> {
//   return Object.assign(debounceInternal<T>(func as any, wait), { type: '3-args' }) as TypedDebouncedFunction3Args<A1, A2, A3, T>;
// }
