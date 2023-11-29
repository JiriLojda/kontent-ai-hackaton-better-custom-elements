export interface ICancellable {
  cancel: () => void;
}

export interface ICancellablePromise<T = void> extends Promise<T>, ICancellable {
  then: <TResult1 = T, TResult2 = never>(
    onFulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
  ) => ICancellablePromise<TResult1 | TResult2>;
  catch: <TResult = never>(
    onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
  ) => ICancellablePromise<T | TResult>;
}

export class CancelledPromiseError extends Error {
}

export function swallowCancelledPromiseError(error: unknown) {
  if (!(error instanceof CancelledPromiseError)) {
    throw error;
  }
}

type PromiseCallback<T = unknown> = ((value: T) => T) | null | undefined;

function makeCancellable<T>(thePromise: Promise<T>, onCancel: () => void): ICancellablePromise<T> {
  const { then: originalThen, catch: originalCatch } = thePromise;

  return Object.assign(thePromise, {
    cancel() {
      onCancel();
    },
    then(success: PromiseCallback<T>, fail: PromiseCallback) {
      return makeCancellable(originalThen.call(thePromise, success, fail), onCancel);
    },
    catch(fail: PromiseCallback) {
      return makeCancellable(originalCatch.call(thePromise, fail), onCancel);
    },
  });
}

/**
 * Example:
 * useEffect(() => {
 *  const fetchMyEntity = makeCancellablePromise(() => repository.get(entityId))
 *    .then((myEntity) => setMyValueState(myEntity.property))
 *    .catch(swallowCancelledPromiseError)
 *    .catch((error) => setMyErrorState(error));
 *
 *  return () => fetchMyEntity.cancel();
 * }, [entityId]);
 */
export function makeCancellablePromise<TReturn>(asyncFunction: () => Promise<TReturn>): ICancellablePromise<TReturn> {
  let performCancellation: () => void = noOperation;

  const thePromise = new Promise<TReturn>((resolve, reject) => {
    performCancellation = () => {
      reject(new CancelledPromiseError('Cancellable Promise was cancelled.'));
    };

    asyncFunction().then(resolve).catch(reject);
  });

  return makeCancellable(thePromise, performCancellation);
}

/**
 * Example:
 * useEffect(() => {
 *  const delayedAction = delay(1_000)
 *    .then(() => doAction(argument))
 *    .catch(swallowCancelledPromiseError);
 *
 *  return () => delayedAction.cancel();
 * }, [argument]);
 */
export function delay(duration: number): ICancellablePromise {
  let timeoutId: number | null = null;
  let performCancellation: () => void = noOperation;
  const thePromise = new Promise<void>((resolve, reject) => {
    timeoutId = setTimeout(resolve, duration) as any;

    performCancellation = () => {
      clearTimeout(timeoutId ?? undefined);
      reject(new CancelledPromiseError('Delayed Promise was cancelled.'));
    };
  });

  return makeCancellable(thePromise, performCancellation);
}

export const identity = <T>(x: T): T => x;

export const noOperation = () => undefined;

export const noOperationAsync = () => Promise.resolve();

export type Executor<T extends any[]> = (...args: T) => void;
export type CancellableExecutor<T extends any[]> = Executor<T> & ICancellable;
