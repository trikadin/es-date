import { parse, TypeMap } from './parser.pegjs';
import { once } from './decorators';

const enum Pads {
	year = 4,
	yearExtended = 6,
	month = 2,
	day = 2,

	hours = 2,
	minutes = 2,
	seconds = 2,
	milliseconds = 3
}

const enum Consts {
	yearNormalMin = 0,
	yearNormalMax = 9999,
	minPerHour = 60
}

function padN(num: number, place: number, sign: boolean = false): string {
	let str = String(Math.abs(num));

	if (str.length < place) {
		str = '0'.repeat(place - str.length) + str;
	}

	if (num < 0) {
		str = '-' + str;

	} else if (sign) {
		str = '+' + str;
	}

	return str;
}

export class ESDate {
	static parse(input: string, type: keyof TypeMap = 'datetime'): ESDate {
		return new ESDate(parse(input, {
			startRule: type
		}));
	}

	readonly year: number = 0;
	readonly month: number = 1;
	readonly day: number = 1;

	readonly hours: number = 0;
	readonly minutes: number = 0;
	readonly seconds: number = 0;
	readonly milliseconds: number = 0;
	readonly timezone: null | 'Z' | number = 'Z';

	protected constructor(value: TypeMap[keyof TypeMap]) {
		Object.assign(this, value);
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
