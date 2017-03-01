var Utility = (function(U){

	U.cancelEventBubble = function(e)
	{
		var evt = e ? e:window.event;
		if (evt.stopPropagation)    evt.stopPropagation();
		if (evt.cancelBubble!=null) evt.cancelBubble = true;
	}

	if (window.performance.now)
	{
		U.getTime = function() { return window.performance.now(); };
	}
	else if(window.performance.webkitNow)
	{
		U.getTime = function() { return window.performance.webkitNow(); };
	}
	else
	{
		U.getTime = function() { return new Date().getTime(); }
	}

	Array.prototype.indexOf || (Array.prototype.indexOf = function(d, e) {
	    var a;
	    if (null == this) throw new TypeError('"this" is null or not defined');
	    var c = Object(this),
	        b = c.length >>> 0;
	    if (0 === b) return -1;
	    a = +e || 0;
	    Infinity === Math.abs(a) && (a = 0);
	    if (a >= b) return -1;
	    for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
	        if (a in c && c[a] === d) return a;
	        a++
	    }
	    return -1
	});

	Array.prototype.clone = function(){
		return this.slice(0);
	};
	Array.prototype.removeElement = function(elem) {
		var ind = this.indexOf(elem);
		if(ind > -1)
		{
			this.splice(ind, 1);
			return true;
		}
		return false;
	};

	U.combine = function(a, b)
	{
		for (var attrname in a) { a[attrname] = b[attrname]; }
		return a;
	}

	return U;
}(Utility || {}));
