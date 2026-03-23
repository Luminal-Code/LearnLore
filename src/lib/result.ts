export type Result<T, E> =
  | { type: 'Ok'; value: T }
  | { type: 'Err'; error: E };

export function Ok<T, E = never>(value: T): Result<T, E> {
  return { type: 'Ok', value };
}

export function Err<E, T = never>(error: E): Result<T, E> {
  return { type: 'Err', error };
}

export function isOk<T, E>(result: Result<T, E>): result is { type: 'Ok'; value: T } {
  return result.type === 'Ok';
}

export function isErr<T, E>(result: Result<T, E>): result is { type: 'Err'; error: E } {
  return result.type === 'Err';
}
