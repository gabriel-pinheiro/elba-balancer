export async function returnError<E extends Error, T>(promise: Promise<T>): Promise<[E, undefined] | [undefined, T]> {
    try {
        return [void 0, await promise];
    } catch (e) {
        return [e, void 0];
    }
}

export function bucket(value: number, firstBucket: number): number {
    const normalizedValue = value / firstBucket;
    const bucket = Math.ceil(Math.log2(normalizedValue));
    const bucketValue = (2 ** bucket) * firstBucket;
    return Math.max(firstBucket, bucketValue);
}
