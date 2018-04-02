const sym = Symbol();

function isFn(v: any): v is Function {
	return typeof v === 'function';
}

export function once(): any {
	return (target: Object, key: string, descriptor: TypedPropertyDescriptor<() => any>) => {
		let type: 'get' | 'value' | undefined;

		if (isFn(descriptor.get)) {
			type = 'get';

		} else if (isFn(descriptor.value)) {
			type = 'value';
		}

		if (type) {
			const
				map = new WeakMap(),
				fn = descriptor[type];

			descriptor[type] = function (this: any): any {
				if (!map.has(this)) {
					map.set(this, (<Function>fn).call(this));
				}

				return map.get(this);
			} as any;
		}
	};
}
