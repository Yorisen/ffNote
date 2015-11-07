var filePathInput = document.getElementById("file-path");
var btnSave = document.getElementById("file-save");
var btnCancel = document.getElementById("cancel");

self.port.on( "show", function( defaultPath ) {
    if ( defaultPath ) {
        filePathInput.value = defaultPath;
    }

	filePathInput.focus();
});

btnCancel.addEventListener( 'click', function( event ) {
	self.port.emit( "cancel", "" );
}, false );

btnSave.addEventListener( 'click', function( event ) {
    self.port.emit( "save", filePathInput.value );
}, false );
