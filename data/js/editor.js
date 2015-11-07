var textArea = document.getElementById("edit-box");
var btnSave = document.getElementById("save");
var btnOptions = document.getElementById("options");

textArea.addEventListener( 'keyup', function( event ) {
    self.port.emit( "text-entered", textArea.value );
}, false );

self.port.on( "show", function() {
	textArea.focus();
});

self.port.on("data-loaded", function( dataFromFile ) {
	textArea.value = dataFromFile;
});

btnOptions.addEventListener( 'click', function( event ) {
	self.port.emit( "options", "" );
}, false );

btnSave.addEventListener( 'click', function( event ) {
    self.port.emit( "save", "" );
}, false );
