var MutableValue = function( Value ) {
    var self = this;
    var Checkers = [];
    var Receivers = [];
    var Filters = [];
    var Dependencies = [];
    var Lists = [ Checkers, Receivers, Filters, Dependencies ];
    var CALLBACK = 0, MARKER = 1, CONNECTED = 2, MARKER_AS_THIS = 3;
    var Find = function( Source, Callback, Marker ) {
        for ( var i=0; i < Source.length; i++ ) {
            if ( Source[i][CALLBACK] === Callback
                && Source[i][MARKER] === Marker )
            { return i; }
        }
        return -1;
    };
    var AddListener = function( Type, Callback, Marker, MarkerAsThis ) {
        if ( Find(Type, Callback, Marker) < 0 ) { 
            Type.push([ Callback, Marker, true, MarkerAsThis]);
        }
    };
    var RemoveListener = function(Marker) {
        for ( var i=0; i < Lists.length; i++ ) {
            for ( var j=0; j < Lists[i].length; j++ ) {
                if ( Lists[i][j][MARKER] === Marker )
                { Lists[i].splice( j--, 1 ); }
            }
        }
    };
    var SetState = function( Connected, Marker, noArgs ) {
        for ( var i=0; i < Lists.length; i++ ) {
            for ( var j=0; j < Lists[i].length; j++ ) {
                if ( noArgs || Lists[i][j][MARKER] === Marker )
                { Lists[i][j][CONNECTED] = Connected; }
            }
        }
    };
    var CheckValue = function( Val ) {
        for ( var i=0; i < Checkers.length; i++ ) {
            var Chk = Checkers[i], Ret;
            if ( Chk[CONNECTED] ) {
                if ( !Chk[MARKER_AS_THIS] ) Ret = Chk[CALLBACK]( Val );
                else Ret = Chk[CALLBACK].call( Chk[MARKER], Val );
            }
            if ( Ret === false ) return false;
        }
        return true;
    };
    var AcceptValue = function( Val ) {
        for ( var i=0; i < Receivers.length; i++ ) {
            var R = Receivers[i], Ret;
            if ( R[CONNECTED] ) {
                if ( !R[MARKER_AS_THIS] ) Ret = R[CALLBACK]( Val, Value );
                else Ret = R[CALLBACK].call( R[MARKER], Val, Value );
            }
            if ( Ret !== undefined ) Val = Ret;
        }
        return Val;
    };
    var FilterValue = function( Val ) {
        if ( arguments.length < 1 ) Val = Value;
        var Result = Val;
        for ( var i=0; i < Filters.length; i++ ) {
            var F = Filters[i];
            if ( F[CONNECTED] ) {
                if ( !F[MARKER_AS_THIS] ) Result = F[CALLBACK]( Result, Val );
                else Result = F[CALLBACK].call( F[MARKER], Result, Val );
            }
        }
        return Result;
    };
    var ReportValue = function( Val, Marker, noArgs ) {
        if ( arguments.length < 1 ) Val = Value;
         for ( var i=0; i < Dependencies.length; i++ ) {
            var Depd = Dependencies[i];
            if ( (noArgs || Depd[MARKER] === Marker) && Depd[CONNECTED] ) {
                if ( !Depd[MARKER_AS_THIS] ) Depd[CALLBACK]( Val );
                else Depd[CALLBACK].call( Depd[MARKER], Val );
            }
        }
    };
    self.OnAssigning = function( Callback, Marker, MarkerAsThis ) {
        MarkerAsThis = ( MarkerAsThis === true );
        AddListener( Checkers, Callback, Marker, MarkerAsThis );
    };
    self.OnChange = function( Callback, Marker, MarkerAsThis ) {
        MarkerAsThis = ( MarkerAsThis === true );
        AddListener( Receivers, Callback, Marker, MarkerAsThis );
    };
    self.OnReporting = function( Callback, Marker, MarkerAsThis ) {
        MarkerAsThis = ( MarkerAsThis === true );
        AddListener( Filters, Callback, Marker, MarkerAsThis );
    };
    self.GetValue = function( Callback, Marker, MarkerAsThis ) {
        MarkerAsThis = ( MarkerAsThis === true );
        AddListener( Dependencies, Callback, Marker, MarkerAsThis );
        if ( MarkerAsThis ) Callback.call( Marker, FilterValue() );
        else Callback( FilterValue() );
    };
    self.TraceValue = function( Callback, Marker, MarkerAsThis ) {
        if ( typeof Callback !== "function" ) return FilterValue();
        MarkerAsThis = ( MarkerAsThis === true );
        AddListener( Dependencies, Callback, Marker, MarkerAsThis );
        return FilterValue();
    };
    self.SetValue = function( NewValue ) {
        if ( !CheckValue(NewValue) ) return;
        Value = AcceptValue( NewValue );
        ReportValue( FilterValue(), undefined, true );
    };
    self.ModifyValue = function( Callback ) {
        self.SetValue( Callback(Value) );
    };
    self.PassValue = function( Marker ) {
        var noArgs = arguments.length === 0;
        ReportValue( FilterValue(), Marker, noArgs );
    };
    self.Connect = function( Marker ) {
        var noArgs = arguments.length === 0;
        SetState( true, Marker, noArgs );
    };
    self.Disconn = function( Marker ) {
        var noArgs = arguments.length === 0;
        SetState( false, Marker, noArgs );
    };
    self.ReleaseAll = function() {
        Checkers = [];
        Receivers = [];
        Filters = [];
        Dependencies = [];
        Lists = [ Checkers, Receivers, Filters, Dependencies ];
    };
    self.Release = function( Marker ) {
        RemoveListener( Marker );
    };
};
if ( typeof exports === 'object' && typeof module === 'object' ) {
    module.exports = MutableValue;
}