export async function returnError<E extends Error, T>(promise: Promise<T>): Promise<[E, undefined] | [undefined, T]> {
    try {
        return [void 0, await promise];
    } catch (e) {
        return [e, void 0];
    }
}
