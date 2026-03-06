import { useRef, useCallback } from "react";

/**
 * Returns a stable debounced function.
 * Each call resets the timer. The callback fires after `delay` ms of inactivity.
 * Timer is cleaned up on unmount via the returned cancel function.
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
    callback: T,
    delay: number
): [(...args: Parameters<T>) => void, () => void] {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const cancel = useCallback(() => {
        if (timerRef.current !== null) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const debounced = useCallback(
        (...args: Parameters<T>) => {
            cancel();
            timerRef.current = setTimeout(() => {
                callbackRef.current(...args);
                timerRef.current = null;
            }, delay);
        },
        [delay, cancel]
    );

    return [debounced, cancel];
}
