### MutableValue.js

### Description
An implementation of a pattern of handling dependencies on a changeable value. 
It implies that the user of the value retrieves it the same way as the changes
will be subsequently reported. In general there's two underpinning parts: 
declaring a dependency on the value by supplying a listener 
and reporting a change of the value to the specified listeners.

### Usage
```javascript
/******************[creating an instance]***********************/
var value = new MutableValue("initial value");

/********[getting the value and declaring a dependency]*********/
value.GetValue(function(value) { 
    alert(value); 
}, /*optional*/ "marker");
//passes the value to the callback now and any time 
//the value changes, if the third parameter is passed 
//and has a value of **true** the marker will be used 
//as a value of **this** to the given callback

/*******************[setting a new value]***********************/
value.SetValue("new value");
//changes the value and invokes each added callback
//with this value as the first argument

//******************[modifying the value]***********************/
value.ModifyValue(function(v) { return v + 1; });
//assigns the value to a call result of the passed function
//which accepts the current value as the first argument

//************[checking a value for correctness]****************/
value.OnAssigning(function(v) { if (v < 0) return false; });
//if one of these functions returns a value of **false**
//no more callbacks will be invoked on this assignment
//and the new value will not be assigned

//**************[adding a value preprocessor]*******************/
value.OnChange(function(newValue, currentValue) {
    if ( newValue < 0 ) return currentValue;
}, /*optional*/ "marker");
//a return of each of these functions 
//will be passed to the next one as the first argument
//a return of the last one will replace the new value
//these functions will be invoked after those
//associated with **OnAssigning()** method

/**[modifying the value before sending it to the dependencies]**/
value.OnReporting(function(filteredValue, initialValue) {
    return "["+filteredValue+"]";
});
//these functions form a value that will be actually reported 
//as one representing the underlying value 
//that itself will not be modified

/*[another way of getting the value and declaring a dependency]*/
var v = value.TraceValue(function(value) { 
    alert("["+value+"]"); 
}, "m");
//the value is returned as the current call result,
//a callback, if supplied, will be invoked on change later on
//the third parameter defines whether or not 
//to use the marker as a value of **this**

/********[manually invoking the process of reporting]***********/
value.PassValue("m");
//the first argument specifies the marker
//if it is omitted all associated listeners will be invoked

/********************[removing a callback]**********************/
value.Release("marker");
value.ReleaseAll();

/****[suspending and resuming the utilization of a callback]****/
value.Disconn("marker");
value.Connect("marker");
//if these methods are called without an argument
//actions will be applied to all callbacks
```