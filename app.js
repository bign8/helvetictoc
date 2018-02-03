function FuzzyTime(d) {
	d = d || new Date(); // For testing
	this.h = d.getHours();
	this.m = d.getMinutes();
	this.hour = (this.h + (this.m > 32)) % 12; // round to next hour if > 32 mins
	this.min = (Math.round(this.m / 5) * 5) % 60; // break int 5 min blocks
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

FuzzyTime.prototype.toString = (function() {
	var hours = ['twelve', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven'],
		mins = {
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
		}, prepositions = {
			'-1': ['almost', 'nearly'],
			'0': ['exactly', 'precisely', 'now', ''],
			'1': ['about', 'around', 'just after', 'right after', 'shortly after']
		}, special = {
			'23:58': 'It’s ’round about<br>midnight.',
			'23:59': 'It’s ’round about<br>midnight.',
			'0:0': 'It’s<br>midnight.',
			'0:1': 'It’s ’round about<br>midnight.',
			'0:2': 'It’s ’round about<br>midnight.',
			'12:0': 'It’s<br>noon.'
		};
	return function() {
		var sc = special[this.h + ':' + this.m], that = this;
		if (sc) return sc;
		return "It’s {{p}}<br>{{m}}<br>{{h}}.".replace(/\{\{\s*(\w+)\s*\}\}/g, function (m, m1) {
			switch (m1) {
				case 'p':
					var pre = prepositions[that.getFuzzyFactor()];
					return pre[Math.floor(Math.random() * pre.length)];
				case 'm':
					return mins[that.min] || '';
				case 'h':
					return hours[that.hour];
			}
		}).replace("<br><br>", "<br>");
	};
})();

var clock = (function (doc) {
	var size, time, height, redraw, screens = [doc.createElement('div'), doc.createElement('div')];
	doc.body.appendChild(screens[0]);
	doc.body.appendChild(screens[1]);

	function refreshContent() {
		time = new FuzzyTime();
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
		s0.innerHTML = time.toString();
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

// Load favicon from svg for non-firefox browsers
// Thanks: https://stackoverflow.com/a/34440779/3220865
!function(d, s) {
	var img = d.createElement('img'), can = d.createElement('canvas'), lnk = d.createElement("link");
	img.onload = function() {
		can.width = s, can.height = s, lnk.rel = "icon";
		can.getContext('2d').drawImage(img, 0, 0, s, s);
		lnk.href = can.toDataURL();
		d.head.appendChild(lnk);
	};
	img.src = d.querySelector('link[rel="icon"]').href;
}(document, 32);
