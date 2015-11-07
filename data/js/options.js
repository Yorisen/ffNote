var shortCut = document.getElementById("btn"),
    isAccel = document.getElementById("ctrl"),
    isShift = document.getElementById("shift"),
    isAlt = document.getElementById("alt"),
    winWidth = document.getElementById("w"),
    winHeight = document.getElementById("h"),
    winPosition = document.getElementById("position"),
    btnSave = document.getElementById("save"),
    btnCancel = document.getElementById("cancel");

btnCancel.addEventListener( 'click', function( event ) {
	self.port.emit( "cancel", "" );
}, false );

btnSave.addEventListener( 'click', function( event ) {
    var options = {
        isAccel: isAccel.checked,
        isAlt: isAlt.checked,
        isShift: isShift.checked,
        shortCut: shortCut.value,
        width: Number( winWidth.value ),
        height: Number( winHeight.value ),
        position: winPosition.value
    };

    self.port.emit( "save", options );
}, false );

self.port.on("init", function( prefs ) {
	shortCut.value = prefs.shortCut;
    isAccel.checked = prefs.isAccel;
    isShift.checked = prefs.isShift;
    isAlt.checked = prefs.isAlt;
    winWidth.value = prefs.width;
    winHeight.value = prefs.height;
    winPosition.value = prefs.position;
});
