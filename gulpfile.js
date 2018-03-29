const
	path = require('path'),
	fs = require('fs-extra-promise'),
	gulp = require('gulp'),
	del = require('del'),
	merge = require('merge2'),
	peg = require('pegjs'),
	ts = require('gulp-typescript');

function pathFabric(...args) {
	const base = path.join(...args);
	return (...args) => path.join(base, ...args);
}

const
	cwd = process.cwd(),
	src = pathFabric(cwd, 'src'),
	dest = pathFabric(cwd, 'build'),
	parserSrc = src('parser.pegjs');

function clean() {
	return del([dest()]);
}

async function buildParser() {
	const
		source = await fs.readFileAsync(parserSrc, 'utf-8'),
		parser = peg.generate(source, {
			allowedStartRules: ['datetime', 'date', 'time'],
			output: 'source',
			format: 'commonjs'
		});

	return fs.outputFileAsync(dest('parser.pegjs.js'), parser);
}

async function copyDts() {
	return gulp.src(src('**/*.d.ts'))
		.pipe(gulp.dest(dest()));
}

const tsProject = ts.createProject('tsconfig.json');

function buildTs() {
	const res = gulp.src(src('**/*.ts'))
		.pipe(tsProject());

	return merge([
		res.dts.pipe(gulp.dest(dest())),
		res.js.pipe(gulp.dest(dest()))
	]);
}

const build = gulp.series(clean, gulp.parallel(buildParser, buildTs, copyDts));

gulp.task('default', build);
