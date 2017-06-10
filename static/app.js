function FuzzyTime() {
	var d = new Date();
	this.h = d.getHours();
	this.m = d.getMinutes();
}

FuzzyTime.prototype.isNight = function() {
	return this.h >= 18 || this.h < 6;
};

FuzzyTime.prototype.toString = function() {
	return pad(this.h) + ':' + pad(this.m); // TODO: full string
};

function pad(i) {
	return (i > 9 ? '' : '0') + i;
}

FuzzyTime.prototype.isStale = function() {
	var now = new Date();
	return now.getMinutes() != this.m || now.getHours() != this.h;
};

FuzzyTime.prototype.getFuzzyFactor = function() {
	var ff = this.m % 5;
	switch (ff) {
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
	if (this.m > 32) {
		r = r === 23 ? 0 : r + 1;
	}
	if (r > 11) {
		r = r - 12;
	}
	return r;
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
		'00:00': 'It’s<br> midnight.',
		'00:01': 'It’s ’round about<br>midnight.',
		'00:02': 'It’s ’round about<br>midnight.',
		'12:00': 'It’s<br> noon.'
	},

	onTheHourTemplate: "It’s {{p}}<br>{{h}} o’clock.",
	template: "It’s {{p}}<br>{{m}}<br>{{h}}."
};

var clock = {
	timeInWords: timeInWords,

	createClock: function (doc) {

		var time, fontSize, content, screens = [doc.createElement('div'), doc.createElement('div')], clientHeight;

		refresh();

		doc.body.appendChild(screens[0]);
		doc.body.appendChild(screens[1]);

		function getPreposition() {
			var ff = time.getFuzzyFactor(),
				p = pickOne(timeInWords.PREPOSITIONS[ff]);
			return ff === 0 ? pickOne(['', p]) : p;
		}

		function pickOne(elements) {
			var index = Math.floor(Math.random() * elements.length);
			return elements[index];
		}

		function refreshContent() {
			time = new FuzzyTime();//fuzzyTime.createFuzzyTime();
			var sc = timeInWords.SPECIAL_CASES[time.toString()];

			if (sc) {
				return content = sc;
			}

			var template = timeInWords[time.getMinutes() ? 'template' : 'onTheHourTemplate'];

			content = template.replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, m1) {
				switch (m1) {
					case 'p':
						return getPreposition();
					case 'm':
						return timeInWords.MINUTES[time.getMinutes()];
					case 'h':
						return timeInWords.HOURS[time.getHours()];
				}
			});
		}

		function draw() {
			var s0 = screens[0],
				s1 = screens[1];
			s0.style.zIndex = 0;
			s1.style.zIndex = 1;
			s0.style.fontSize = fontSize;
			s1.style.fontSize = fontSize;
			s0.innerHTML = content;
			s0.className = 'screen';
			s1.className = 'screen previous';
			screens.reverse();
			doc.body.className = time.isNight() ? 'night' : 'day';
		}

		function setFontSize() {
			fontSize = Math.round(document.documentElement.clientHeight / 8.5) + 'px';
		}

		function refreshSize() {
			clientHeight = document.documentElement.clientHeight;
			fontSize = Math.round(clientHeight / 8.5) + 'px';
		}

		function wasResized() {
			return clientHeight !== document.documentElement.clientHeight;
		}

		function redraw() {
			var redraw = false;

			if (time.isStale()) {
				refreshContent();
				redraw = true;
			}

			if (wasResized()) {
				refreshSize();
				redraw = true;
			}

			console.log("redraw", redraw);
			if (redraw) {
				draw();
			}
		}

		function refresh(t) {
			refreshContent(t);
			refreshSize();
		}

		return {
			refresh: refresh,
			draw: draw,
			redraw: redraw
		}
	}
};

// program
var c = clock.createClock(document);
c.draw();
setInterval(c.redraw, 1000);
window.onresize = c.redraw;
