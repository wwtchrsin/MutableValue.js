var MutableValue = require("./mutablevalue.js");
var mVal = new MutableValue("default value");
var getExecTime = (function() {
	var startTime = (new Date()).valueOf();
	return function() {
		var currentTime = (new Date()).valueOf();
		var timeDiff = (currentTime - startTime) / 1000;
		var intPart = Math.floor(timeDiff);
		var fractPart = (timeDiff - intPart).toString();
		if ( fractPart === "0" ) fractPart = ".";
		else fractPart = fractPart.substr(1);
		fractPart = (fractPart+"000").substr(0, 4);
		return ("000"+intPart+fractPart).slice(-7);
	};
})();
console.log( "#############(test start)############" );
mVal.OnAssigning(function(value) {
	if ( value.indexOf("abcd") > -1 ) return false;
	return true;
});
mVal.OnAssigning(function(value) {
	if ( value.indexOf("other") > -1 ) {
		console.log( getExecTime() + " | value [" + value + "] was declined" );
		return false;
	}
	return true;
});
mVal.OnChange(function(newValue, currentValue) {
	console.log( "------- | value preprocessing a" );
	return newValue.toUpperCase();
});
mVal.OnChange(function(newValue, currentValue) {
	console.log( "------- | value preprocessing b" );
	return newValue.replace(/\s/g, "_");
});
mVal.OnReporting(function(value) {	
	return "<" + value + ">";
});
mVal.OnReporting(function(value) {
	return "-" + value + "-";
});
mVal.TraceValue(function(value) {
	console.log( getExecTime() + " | VALUE IS " + value );
}, "reporter-b");
mVal.GetValue(function(value) {
	console.log( getExecTime() + " | value: " + value );
}, "reporter-a");
mVal.Disconn("reporter-b");
setTimeout(function() { 
	mVal.SetValue("new value");
	setTimeout(function() {
		mVal.SetValue("other new value");
		setTimeout(function() {
			mVal.ModifyValue(function(value) {
				return value + " modified";
			});
			mVal.Disconn();
			setTimeout(function() { 
				mVal.SetValue("new reporter");
				mVal.Release("reporter-a");
				mVal.Connect();
				mVal.PassValue();
				setTimeout(function() {
					mVal.SetValue("it seems working");
					mVal.ReleaseAll();
					setTimeout(function() { 
						mVal.SetValue("***");
						console.log( "#############(test end)##############" );
					});
				}, 1500);
			}, 1500);
		}, 1500);
	}, 1500);
}, 1500); 
