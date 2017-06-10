function FuzzyTime(d) {
	d = d || new Date();
	this.h = d.getHours();
	this.m = d.getMinutes();
}

FuzzyTime.prototype.isNight = function() {
	return this.h >= 18 || this.h < 6;
};

FuzzyTime.prototype.isStale = function() {
	var now = new Date();
	return now.getMinutes() != this.m || now.getHours() != this.h;
};

FuzzyTime.prototype.getFuzzyFactor = function() {
	switch (this.m % 5) {
		case 1:
		case 2:
			return 1;
		case 3:
		case 4:
			return -1;
		default:
			return 0;
	}
};

FuzzyTime.prototype.getHours = function() {
	var r = this.h;
	if (this.m > 32) r++;
	return r % 12;
};

FuzzyTime.prototype.getMinutes = function() {
	var r = Math.round(this.m / 5) * 5
	return r === 60 ? 0 : r;
};

var timeInWords = {
	HOURS: ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'],

	MINUTES: {
		'5': 'five past',
		'10': 'ten past',
		'15': 'quarter past',
		'20': 'twenty past',
		'25': 'twenty-five past',
		'30': 'half past',
		'35': 'twenty-five to',
		'40': 'twenty to',
		'45': 'quarter to',
		'50': 'ten to',
		'55': 'five to'
	},

	PREPOSITIONS: {
		'-1': ['almost', 'nearly'],
		'0': ['exactly', 'precisely', 'now', ''],
		'1': ['about', 'around', 'just after', 'right after', 'shortly after']
	},

	SPECIAL_CASES: {
		'23:58': 'It’s ’round about<br>midnight.',
		'23:59': 'It’s ’round about<br>midnight.',
		'0:0': 'It’s<br>midnight.',
		'0:1': 'It’s ’round about<br>midnight.',
		'0:2': 'It’s ’round about<br>midnight.',
		'12:0': 'It’s<br>noon.'
	},
};

function stringify(time) {
	var sc = timeInWords.SPECIAL_CASES[time.h + ':' + time.m];
	if (sc) return sc;

	var template = time.getMinutes() ? "It’s {{p}}<br>{{m}}<br>{{h}}." : "It’s {{p}}<br>{{h}} o’clock.";
	return template.replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, m1) {
		switch (m1) {
			case 'p':
				var pre = timeInWords.PREPOSITIONS[time.getFuzzyFactor()];
				return pre[Math.floor(Math.random() * pre.length)];
			case 'm':
				return timeInWords.MINUTES[time.getMinutes()];
			case 'h':
				return timeInWords.HOURS[time.getHours()];
		}
	});
}

var clock = (function (doc) {
	var redraw, time, size, content, height, screens = [doc.createElement('div'), doc.createElement('div')];
	doc.body.appendChild(screens[0]);
	doc.body.appendChild(screens[1]);

	function refreshContent() {
		time = new FuzzyTime();
		content = stringify(time);
		redraw = true;
	}

	function refreshSize() {
		height = doc.documentElement.clientHeight;
		size = Math.round(height / 8.5) + 'px';
		redraw = true;
	}

	function draw() {
		var s0 = screens[0], s1 = screens[1];
		s0.style.zIndex = 0;
		s1.style.zIndex = 1;
		s0.style.fontSize = size;
		s1.style.fontSize = size;
		s0.innerHTML = content;
		s0.className = 'screen';
		s1.className = 'screen previous';
		screens.reverse();
		doc.body.className = time.isNight() ? 'night' : 'day';
		redraw = false;
	}

	refreshContent(), refreshSize(), draw();
	return function() {
		if (time.isStale()) refreshContent();
		if (height !== doc.documentElement.clientHeight) refreshSize();
		if (redraw) draw();
	};
})(document);

// program
window.setInterval(clock, 1000);
window.onresize = clock; // TODO: request-animation frame or debounce
