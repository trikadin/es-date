export interface DateParsed {
	year: number;
	month: number;
	day: number;
}

export interface TimeParsed {
	hours: number;
	minutes: number;
	seconds: number
	milliseconds: number;
	timezone: null | 'Z' | number;
}

export interface DateTimeParsed extends DateParsed, TimeParsed {}

export interface TypeMap {
	date: DateParsed;
	time: TimeParsed;
	datetime: DateTimeParsed;
}

export type TypeKey = keyof TypeMap;

export function parse(source: string, options?: undefined | {}): DateTimeParsed;
export function parse<T extends TypeKey>(source: string, options: {
	startRule?: T;
}): TypeMap[T];

interface Location {
	line: number;
	column: number;
	offset: number;
}

export interface LocationRange {
	start: Location,
	end: Location
}

interface ExpectedItem {
	type: string;
	value?: string;
	description: string;
}

export interface PegjsError extends Error {
	name: string;
	message: string;
	location: LocationRange;
	found?: any;
	expected?: ExpectedItem[];
	stack?: any;
}
