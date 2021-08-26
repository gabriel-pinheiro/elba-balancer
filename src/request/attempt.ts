export class Attempt {
    constructor(
        public readonly target: string,
        public readonly date: Date,
    ) { }

    static of(target: string): Attempt {
        return new Attempt(target, new Date());
    }
}
