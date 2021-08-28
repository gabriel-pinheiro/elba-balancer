
export type Labels = Record<string, string>;

export class MetricValue<T extends Labels> {
    constructor(
        public value: number,
        public readonly labels: T,
    ) { }

    set(value: number): MetricValue<T> {
        this.value = value;
        return this;
    }

    add(value = 1): MetricValue<T> {
        this.value += value;
        return this;
    }
}

export class Metric<T extends Labels> {
    protected readonly values: MetricValue<T>[] = [];

    constructor(
        protected readonly name: string,
        protected readonly help: string,
        protected readonly type: 'counter' | 'gauge',
    ) { }

    createValue(labels: T, value = NaN): MetricValue<T> {
        const metricValue = new MetricValue(value, labels);
        this.values.push(metricValue);

        return metricValue;
    }

    stringify(): string {
        const help = `# HELP ${this.name} ${this.help}`;
        const type = `# TYPE ${this.name} ${this.type}`;
        const values = this.values.map(({ labels, value }) => `${this.name}{${Object.entries(labels).map(([k, v]) => `${k}="${v}"`).join(',')}} ${value}`);
        return [help, type, ...values].join('\n') + '\n';
    }
}

export class Counter<T extends Labels> extends Metric<T> {
    constructor(name: string, help: string) {
        super(name, help, 'counter');
    }

    createValue(labels: T, value = 0): MetricValue<T> {
        return super.createValue(labels, value);
    }
}

export class Gauge<T extends Labels> extends Metric<T> {
    constructor(name: string, help: string) {
        super(name, help, 'gauge');
    }
}
