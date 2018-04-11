import { parse, TypeMap, TypeKey, PegjsError } from './parser.pegjs';
import { once } from './decorators';

const enum Pads {
	year = 4,
	yearExtended = 6,
	month = 2,
	day = 2,

	hours = 2,
	minutes = 2,
	seconds = 2,
	milliseconds = 3,

	error = 4
}

const enum Consts {
	yearNormalMin = 0,
	yearNormalMax = 9999,
	minPerHour = 60,
	lengthLimit = 33
}

const
	defaultType: TypeKey = 'datetime',
	syntaxErrorPad = ' '.repeat(Pads.error);

function padN(num: number, place: number, sign: boolean = false): string {
	let str = String(Math.abs(num)).padStart(place, '0');

	if (num < 0) {
		str = '-' + str;

	} else if (sign) {
		str = '+' + str;
	}

	return str;
}

function invalidInputMessage(input: string, original: PegjsError, type: TypeKey = defaultType): string {
	let message = `Invalid ${type} string `;

	const
		{start: {offset: start}, end: {offset: end}} = original.location,
		pointerPad = syntaxErrorPad + ' '.repeat(message.length + start + 1);

	message += `${
		JSON.stringify(input.length > Consts.lengthLimit ? input.slice(0, Consts.lengthLimit) + '...' : input)
	}. ${original.message}`;

	if (start !== end) {
		message += `\n${pointerPad}${'^'.repeat(end - start)}`;
	}

	return `\n${syntaxErrorPad}${message}\n`;
}

export class ESDate {
	static parse(input: string, type: TypeKey = defaultType): ESDate {
		if (typeof input !== 'string') {
			throw new TypeError('input is not a string');
		}

		if (!input) {
			throw new TypeError('input is an empty string');
		}

		if (type !== 'datetime' && type !== 'date' && type !== 'time') {
			throw new TypeError('expected type to be a "date", "time" or "datetime"');
		}

		try {
			return new ESDate(parse(input, {
				startRule: type
			}));

		} catch (err) {
			if (err.name === 'SyntaxError') {
				throw new SyntaxError(invalidInputMessage(input, err, type));
			}

			throw err;
		}
	}

	readonly year: number = 0;
	readonly month: number = 1;
	readonly day: number = 1;

	readonly hours: number = 0;
	readonly minutes: number = 0;
	readonly seconds: number = 0;
	readonly milliseconds: number = 0;
	readonly timezone: null | 'Z' | number = null;

	protected constructor(value: TypeMap[TypeKey]) {
		Object.assign(this, value);

		if ((<TypeMap['time']>value).timezone == null) {
			this.timezone = -new Date().getTimezoneOffset();
		}

		Object.freeze(this);
	}

	@once()
	protected get yearString(): string {
		const extended = this.year > Consts.yearNormalMax || this.year < Consts.yearNormalMin;

		return extended ? padN(this.year, Pads.yearExtended, true) : padN(this.year, Pads.year);
	}

	@once()
	protected get timezoneString(): string {
		const {timezone} = this;

		if (typeof timezone === 'number') {
			const
				hours = Math.floor(timezone / Consts.minPerHour),
				minutes = timezone % Consts.minPerHour;

			return `${padN(hours, Pads.hours, true)}:${padN(minutes, Pads.minutes)}`;

		} else {
			return timezone || '';
		}
	}

	@once()
	toDateString(): string {
		return `${this.yearString}-${padN(this.month, Pads.month)}-${padN(this.day, Pads.day)}`;
	}

	@once()
	toTimeString(): string {
		return `${
			padN(this.hours, Pads.hours)
		}:${
			padN(this.minutes, Pads.minutes)
		}:${
			padN(this.seconds, Pads.seconds)
		}.${
			padN(this.milliseconds, Pads.milliseconds)
		}${
			this.timezoneString
		}`;
	}

	@once()
	toString(): string {
		return `${this.toDateString()}T${this.toTimeString()}`;
	}

	toDate(): Date {
		return new Date(this.toString());
	}

	@once()
	toUTCString(): string {
		return this.toDate().toISOString();
	}
}

export default ESDate.parse;
