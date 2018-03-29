export interface DateParsed {
	year: number;
	month: number;
	day: number;
}

export interface TimeParsed {
	hours: number;
	minutes: number;
	milliseconds: number;
	seconds: number
	timezone: null | 'Z' | number;
}

export interface DateTimeParsed extends DateParsed, TimeParsed {}

export interface TypeMap {
	date: DateParsed;
	time: TimeParsed;
	datetime: DateTimeParsed;
}

export function parse(source: string): DateTimeParsed;
export function parse<T extends keyof TypeMap>(source: string, options: {
	startRule: T
}): TypeMap[T];