var test = require('tst');
var Spectrum = require('./');
// var Formant = require('audio-formant');
// var Speaker = require('audio-speaker');
// var Sink = require('audio-sink');
// var Slice = require('audio-slice');
var ft = require('fourier-transform');
var blackman = require('scijs-window-functions/blackman-harris');
var isBrowser = require('is-browser');
var SCBadge = require('soundcloud-badge');
var Analyser = require('web-audio-analyser');
var Stats = require('stats.js');
var db = require('decibels');


var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );
stats.begin();
stats.dom.style.left = 'auto';
stats.dom.style.right = '1rem';
stats.dom.style.top = '1rem';


//stream soundcloud
var audio = new Audio;

var badge = SCBadge({
	client_id: '6b7ae5b9df6a0eb3fcca34cc3bb0ef14',
	song: 'https://soundcloud.com/wooded-events/wooded-podcast-cinthie',
	// song: 'https://soundcloud.com/einmusik/einmusik-live-watergate-4th-may-2016',
	// song: 'https://soundcloud.com/when-we-dip/atish-mark-slee-manjumasi-mix-when-we-dip-062',
	// song: 'https://soundcloud.com/dark-textures/dt-darkambients-4',
	// song: 'https://soundcloud.com/deep-house-amsterdam/diynamic-festival-podcast-by-kollektiv-turmstrasse',
	dark: false,
	getFonts: false
}, function(err, src, data, div) {
	if (err) throw err;

	//TODO: read url from href here
	audio.src = src;
	audio.crossOrigin = 'Anonymous';
	audio.addEventListener('canplay', function() {
		audio.play();
	}, false);
});


var analyser = Analyser(audio, { audible: true, stereo: false })


//generate input sine
var N = 2048;
var sine = new Float32Array(N);
var saw = new Float32Array(N);
var noise = new Float32Array(N);
var rate = 44100;

for (var i = 0; i < N; i++) {
	sine[i] = Math.sin(1000 * Math.PI * 2 * (i / rate));
	saw[i] = 2 * ((1000 * i / rate) % 1) - 1;
	noise[i] = Math.random() * 2 - 1;
}

//normalize browser style
if (isBrowser) {
	document.body.style.margin = '0';
	document.body.style.boxSizing = 'border-box';
	document.body.style.fontFamily = 'sans-serif';
}


test('line webgl', function () {
	// var frequencies = ft(sine);
	// var frequencies = new Float32Array(1024).fill(0.5);
	var frequencies = new Float32Array(analyser.analyser.frequencyBinCount);

	// var frequencies = ft(noise);
	// frequencies = frequencies.map((v, i) => v*blackman(i, noise.length)).map((v) => db.fromGain(v));

	var spectrum = new Spectrum({
		frequencies: frequencies,
		fill: 'yignbu',
		grid: true,
		minFrequency: 20,
		maxFrequency: 20000,
		logarithmic: true,
		smoothing: .5,
		maxDecibels: 0,
		// mask: null,
		align: 0.5,
		// viewport: function (w, h) {
		// 	return [50,20,w-70,h-60];
		// }
	}).on('render', function () {
		stats.end();
		stats.begin();

		// analyser.analyser.getFloatTimeDomainData(waveform);
		// frequencies = ft(waveform.map((v, i) => v*blackman(i, waveform.length)));
		// frequencies = frequencies.map((f, i) => db.fromGain(f));

		analyser.analyser.getFloatFrequencyData(frequencies);

		spectrum.setFrequencies(frequencies);
	});

	createColormapSelector(spectrum);
});

test.skip('bars 2d', function () {
	var frequencies = ft(sine);
	// var frequencies = new Float32Array(1024).fill(0.5);
	var frequencies = new Float32Array(analyser.analyser.frequencyBinCount);

	// var frequencies = ft(noise);
	// frequencies = frequencies.map((v, i) => v*blackman(i, noise.length)).map((v) => db.fromGain(v));

	var spectrum = new Spectrum({
		mask: createMask(10, 10),
		// mask: null,
		frequencies: frequencies,
		maxDecibels: 0,
		maxFrequency: 20000,
		grid: false,
		align: 0.5,
		// background: [1,0,0,1],
		// fill: [1,1,1,1],
		logarithmic: true
	}).on('render', function () {
		stats.end();
		stats.begin();
		analyser.analyser.getFloatFrequencyData(frequencies);
		spectrum.setFrequencies(frequencies);
	});

	createColormapSelector(spectrum);
});

test.skip('node', function () {});


test.skip('viewport', function () {});

test('clannels');

test('classic');

test('bars');

test('bars line');

test('dots');

test('dots line');

test('colormap (heatmap)');

test('multilayered (max values)');

test('line');

test('oscilloscope');




function createColormapSelector (spectrum) {
	var container = document.createElement('div');
	container.style.position = 'fixed';
	container.style.bottom = '0';
	container.style.left = '0';
	container.style.right = '0';
	container.style.padding = '.5rem';
	container.style.border = '0';
	container.style.zIndex = 999;
	document.body.appendChild(container);

	//append style switcher
	var switcher = document.createElement('select');
	switcher.classList.add('colormap');
	switcher.style.width = '4rem';
	switcher.style.color = 'inherit';
	switcher.style.fontSize = '.8rem';
	switcher.style.border = '0';
	switcher.style.background = 'none';
	switcher.title = 'Colormap';
	switcher.innerHTML = `
		<option value="jet">jet</option>
		<option value="hsv">hsv</option>
		<option value="hot">hot</option>
		<option value="cool">cool</option>
		<option value="spring">spring</option>
		<option value="summer">summer</option>
		<option value="autumn">autumn</option>
		<option value="winter">winter</option>
		<option value="bone">bone</option>
		<option value="copper">copper</option>
		<option value="greys">greys</option>
		<option value="yignbu" selected>yignbu</option>
		<option value="greens">greens</option>
		<option value="yiorrd">yiorrd</option>
		<option value="bluered">bluered</option>
		<option value="rdbu">rdbu</option>
		<option value="picnic">picnic</option>
		<option value="rainbow">rainbow</option>
		<option value="portland">portland</option>
		<option value="blackbody">blackbody</option>
		<option value="earth">earth</option>
		<option value="electric">electric</option>
		<!--<option value="alpha">alpha</option>-->
	`;
	switcher.addEventListener('input', function () {
		spectrum.setFill(switcher.value, inverseCheckbox.checked);
		updateView();
	});
	container.appendChild(switcher);


	//inversed colormap checkbox
	var inverseSwitch = createSwitch('inversed', function () {
		spectrum.setFill(switcher.value, this.checked);
		updateView();
	});
	var inverseCheckbox = inverseSwitch.querySelector('input');
	container.appendChild(inverseSwitch);


	//weighting switcher
	var weightingEl = document.createElement('select');
	weightingEl.classList.add('weighting');
	weightingEl.style.width = '4rem';
	weightingEl.style.border = '0';
	weightingEl.style.color = 'inherit';
	weightingEl.style.marginLeft = '1rem';
	weightingEl.style.background = 'none';
	weightingEl.title = 'Noise weighting';
	weightingEl.innerHTML = `
		<option value="a">A</option>
		<option value="b">B</option>
		<option value="c">C</option>
		<option value="d">D</option>
		<option value="itu" selected>ITU</option>
		<option value="z">Z (none)</option>
	`;
	weightingEl.addEventListener('input', function () {
		spectrum.weighting = weightingEl.value;

		updateView();
	});
	container.appendChild(weightingEl);


	//align slider
	var alignEl = document.createElement('input');
	alignEl.type = 'range';
	alignEl.min = 0;
	alignEl.max = 1;
	alignEl.step = .01;
	alignEl.classList.add('align');
	alignEl.style.width = '5rem';
	alignEl.style.height = '1rem';
	alignEl.style.border = '0';
	alignEl.style.color = 'inherit';
	alignEl.style.margin = '0 0 0 1rem';
	alignEl.style.verticalAlign = 'middle';
	alignEl.style.background = 'none';
	alignEl.title = 'Align: 0.5';
	alignEl.addEventListener('input', function () {
		spectrum.align = parseFloat(alignEl.value);
		alignEl.title = 'Align: ' + alignEl.value;
		updateView();
	});
	container.appendChild(alignEl);


	//grid colormap checkbox
	var gridSwitch = createSwitch('grid', function () {
		spectrum.grid = this.checked;
		updateView();
	});
	var gridCheckbox = gridSwitch.querySelector('input');
	gridCheckbox.checked = spectrum.grid;
	container.appendChild(gridSwitch);

	//bars checkbox
	container.appendChild(
		createSwitch('bars', function () {
			spectrum.setMask(this.checked ? createMask(10, 10) : null);
			updateView();
		})
	);


	updateView();

	function updateView () {
		spectrum.update();
		container.style.color = 'rgb(' + spectrum.fill.slice(-4, -1).map((v) => v*255).join(', ') + ')';
	}
}


function createSwitch (name, cb) {
	var switcher = document.createElement('label');
	switcher.innerHTML = `
		<input type="checkbox" id="${name}"/>
		${name}
	`;
	checkbox = switcher.querySelector('input');
	checkbox.setAttribute('type', 'checkbox');
	checkbox.style.width = '1rem';
	checkbox.style.height = '1rem';
	checkbox.style.verticalAlign = 'middle';

	switcher.style.fontSize = '.8rem';
	switcher.style.verticalAlign = 'middle';
	switcher.style.height = '1rem';
	switcher.classList.add(name + '-switcher');
	switcher.style.margin = '0 0 0 .5rem';
	switcher.style.border = '0';
	switcher.style.background = 'none';
	switcher.style.color = 'inherit';
	switcher.title = name;
	checkbox.addEventListener('click', cb);

	return switcher;
}



//create mask
function createMask (w, h) {
	w = w || 10;
	h = h || 10;
	var rect = [w, h];
	var radius = w/2;
	var canvas = document.createElement('canvas');
	canvas.width = rect[0] + 2;
	canvas.height = rect[1] + 2;
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, rect[0] + 2, rect[1] + 2);
	ctx.fillStyle = 'rgb(0,0,0)';
	ctx.fillRect(0, 0, rect[0] + 2, rect[1] + 2);
	ctx.strokeStyle = 'rgb(255,255,255)';
	ctx.fillStyle = 'rgb(255,255,255)';
	ctx.lineJoin = 'round';
	ctx.lineWidth = radius;
	ctx.strokeRect(1 + (radius/2), 1 + (radius/2), rect[0]-radius - 1, rect[1]-radius - 1);
	ctx.fillRect(1 + (radius/2), 1 + (radius/2), rect[0]-radius - 1, rect[1]-radius - 1);

	// document.body.appendChild(canvas);
	// canvas.style.zIndex = 999;
	// canvas.style.position = 'absolute';
	// canvas.style.top = '0px';
	// canvas.style.left = '0px';

	return canvas;
}