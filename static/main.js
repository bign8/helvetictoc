var fuzzyTime = {
	createFuzzyTime: function (d) {
		d = d || new Date();
		var h = d.getHours(), m = d.getMinutes(), p = 'am';

		function getHours() {
			var r = h;
			if (m > 32) {
				r = r === 23 ? 0 : r + 1;
			}
			if (r > 11) {
				r = r - 12;
				p = 'pm';
			}
			return r;
		}

		function getMinutes() {
			var r = Math.round(m / 5) * 5
			return r === 60 ? 0 : r;
		}

		function getPeriod() {
			return p;
		}

		function isNight() {
			return h >= 18 || h < 6;
		}

		function isDay() {
			return !isNight();
		}

		function getFuzzyFactor() {
			var ff = m % 5;
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
		}

		function isEqual(t) {
			return t.toString() === toString();
		}

		function toString() {
			return pad(getHours()) + ':' + pad(getMinutes()) + 'ff' + getFuzzyFactor() + ' ' + getPeriod();
		}

		function to24HourString() {
			return pad(h) + ':' + pad(m);
		}

		function pad(i) {
			return (i > 9 ? '' : '0') + i;
		}

		return {
			getPeriod: getPeriod,
			getHours: getHours,
			getMinutes: getMinutes,
			getFuzzyFactor: getFuzzyFactor,
			isNight: isNight,
			isDay: isDay,
			isEqual: isEqual,
			toString: toString,
			to24HourString: to24HourString
		};
	}
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

		refresh(time);

		doc.body.appendChild(screens[0]);
		doc.body.appendChild(screens[1]);

		function getMinutesInWords() {
			return timeInWords.MINUTES[time.getMinutes()];
		}

		function getHoursInWords() {
			return timeInWords.HOURS[time.getHours()];
		}

		function getPreposition() {
			var ff = time.getFuzzyFactor(),
				p = pickOne(timeInWords.PREPOSITIONS[ff]);
			return ff === 0 ? pickOne(['', p]) : p;
		}

		function pickOne(elements) {
			var index = Math.floor(Math.random() * elements.length);
			return elements[index];
		}

		function isNight() {
			return time.isNight();
		}

		function isDay() {
			return time.isDay();
		}

		function setTime(t) {
			time = fuzzyTime.createFuzzyTime(t);
		}

		function isStale(t) {
			return !time.isEqual(t || fuzzyTime.createFuzzyTime());
		}

		function refreshContent(t) {
			setTime(t);
			var template, sc = timeInWords.SPECIAL_CASES[time.to24HourString()];

			if (sc) {
				return content = sc;
			}

			template = timeInWords[time.getMinutes() ? 'template' : 'onTheHourTemplate'];

			content = template.replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, m1) {
				switch (m1) {
					case 'p':
						return getPreposition();
					case 'm':
						return getMinutesInWords();
					case 'h':
						return getHoursInWords();
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
			doc.body.className = isNight() ? 'night' : 'day';
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

			if (isStale()) {
				refreshContent();
				redraw = true;
			}

			if (wasResized()) {
				refreshSize();
				redraw = true;
			}

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
