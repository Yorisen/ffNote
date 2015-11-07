const data = require( "sdk/self" ).data;
const { pathFor } = require( 'sdk/system' );
const path = require( 'sdk/fs/path' );
const file = require( 'sdk/io/file' );
const { Hotkey } = require("sdk/hotkeys");
const fileName = "data.txt";
const preferences = require("sdk/simple-prefs");
const panel = require( "sdk/panel" );

var editor = panel.Panel({
	width: preferences.prefs.width,
	height: preferences.prefs.height,
	position: getPosition( preferences.prefs ),
	contentURL: data.url( "editor.html" ),
	contentScriptFile: data.url( "js/editor.js" )
});

const { getActiveView } = require("sdk/view/core");
getActiveView( editor ).setAttribute( "noautohide", true );

var toggleButton = require( "sdk/ui/button/toggle" ).ToggleButton({
	id: "show-panel",
	label: "Show ffNote(" + convertShortCutToCasual( preferences.prefs ) + ")",
	icon: {
		"16": "./imgs/icon-16.png",
		"32": "./imgs/icon-32.png",
		"64": "./imgs/icon-64.png"
	},
	onChange: handleClick
});

var showHotKey = Hotkey({
	combo: getShortCut( preferences.prefs ),
	onPress: callToggleButtonClick
});

editor.on( "show", function() {
	editor.port.emit( "show" );
});

editor.port.on( "text-entered", function ( text ) {
	saveText( fileName, text );
});

var options = panel.Panel({
	width: 450,
	height: 313,
	contentURL: data.url( "options.html" ),
	contentScriptFile: data.url( "js/options.js" )
});
getActiveView( options ).setAttribute( "noautohide", true );

var saveAs = panel.Panel({
	width: 618,
	height: 128,
	contentURL: data.url( "save-as.html" ),
	contentScriptFile: data.url( "js/save-as.js" )
});
getActiveView( saveAs ).setAttribute( "noautohide", true );

editor.port.on( "options", function () {
	options.port.emit( "init", preferences.prefs );
	options.show();
});

editor.port.on( "save", function () {
	var nowDate = new Date().toISOString();
	nowDate = replaceAll( replaceAll( nowDate.substr( 0, nowDate.length - 5 ), "-", "" ), ":", "" ).replace( "T", "" );

	var defaultPath = file.join( pathFor("Desk"), ( nowDate + ".txt" ) );
	saveAs.port.emit( 'show', defaultPath );
	saveAs.show();
});

saveAs.port.on( "cancel", function () {
	saveAs.hide();
	editor.show( getPositionWhenEditorExist( preferences.prefs ) );
});

saveAs.port.on( "save", function ( path ) {
	saveAs.hide();
	editor.show( getPositionWhenEditorExist( preferences.prefs ) );
	createFile( path, readText( fileName ) );
});

/*preferences.on( "", function() {
	changeHotKey( preferences.prefs );
	editor.show({
		width: preferences.prefs.width,
		height: preferences.prefs.height,
		position: getPosition( preferences.prefs )
	});
});*/

options.port.on( "cancel", function () {
	options.hide();
	editor.show( getPositionWhenEditorExist( preferences.prefs ) );
});

options.port.on( "save", function ( prefs ) {
	options.hide();
	editOptions( prefs );
	editor.show( getPositionWhenEditorExist( preferences.prefs ) );
});

function editOptions( prefs ) {
	var oldPrefs = preferences.prefs;
	oldPrefs.width = prefs.width;
	oldPrefs.height = prefs.height;
	oldPrefs.position = prefs.position;
	changeHotKey( prefs );
	editor.width = prefs.width;
	editor.height = prefs.height;
	editor.position = getPosition( preferences.prefs );
}

function getPosition( prefs ) {
	var position;

	if ( prefs.position === "top_left" ) {
        position = {
            top: 6,
            left: 12
        };
    }
    else if ( prefs.position === "top_right" ) {
        position = {
            top: 6,
            right: 12
        };
    }
    else if ( prefs.position === "bottom_left" ) {
        position = {
            bottom: 12,
            left: 12
        };
    }
    else if ( prefs.position === "bottom_right" ) {
        position = {
            bottom: 12,
            right: 12
        };
    }

	return position;
}

function getPositionWhenEditorExist( prefs ) {
	if ( prefs.position === "top_left" ) {
        editor.position.top = 6;
		editor.position.bottom = undefined;
        editor.position.left = 12;
		editor.position.right = undefined;
    }
    else if ( prefs.position === "top_right" ) {
		editor.position.top = 6;
		editor.position.bottom = undefined;
        editor.position.left = undefined;
		editor.position.right = 12;
    }
    else if ( prefs.position === "bottom_left" ) {
        editor.position.top = undefined;
		editor.position.bottom = 12;
        editor.position.left = 12;
		editor.position.right = undefined;
    }
    else if ( prefs.position === "bottom_right" ) {
		editor.position.top = undefined;
		editor.position.bottom = 12;
        editor.position.left = undefined;
		editor.position.right = 12;
    }

	return editor.position;
}

function changeHotKey( prefs ) {
	showHotKey.destroy();
	showHotKey = Hotkey({
		combo: getShortCut( prefs ),
		onPress: callToggleButtonClick
	});
	toggleButton.label = "Show ffNote(" + convertShortCutToCasual( prefs ) + ")";
}

function convertShortCutToCasual( prefs ) {
	var casualShortCut = getShortCut( prefs );

	casualShortCut = replaceAll( casualShortCut, "-", "+" );
	casualShortCut = replaceAll( casualShortCut, "accel", "ctrl" );
	casualShortCut = casualShortCut.toUpperCase();

	return casualShortCut;
}

function getShortCut( prefs ) {
	var shortCut = "";

	if ( prefs.isAccel ) {
		shortCut += "accel-";
	}
	if ( prefs.isAlt ) {
		shortCut += "alt-";
	}
	if ( prefs.isShift ) {
		shortCut += "shift-";
	}
	if ( shortCut.length > 0 && prefs.shortCut !== undefined ) {
		shortCut += prefs.shortCut;
	}
	else {
		shortCut = "accel-shift-o";
	}
	return shortCut;
}

function callToggleButtonClick() {
	toggleButton.click();
}

function handleClick( state ) {
	if ( state.checked ) {
		editor.port.emit( 'data-loaded', readText( fileName ) );
		editor.show( getPositionWhenEditorExist( preferences.prefs ) );
	}
	else {
		editor.hide();
	}
}

function saveText( name, str ){
	var filename = path.join(pathFor('ProfD'), name);//Desk
	var textWriter = file.open(filename, 'w');
	textWriter.write(str);
	textWriter.close();
}

function createFile( path, str ) {
	if ( !file.exists( path ) ) {
		var fileName = filePathTrail( path );
		var filePath = path.replace( "\\" + fileName );

		file.mkpath( filePath );
	}
	var textWriter = file.open(path, 'w');
	textWriter.write(str);
	textWriter.close();
}

function filePathTrail( path ){
	var parts = path.split('\\')
	return ( parts.length > 0 ) ? parts[parts.length - 1] : path;
}


function readText( name ){
	var filename = path.join( pathFor( 'ProfD' ), name );//Desk
	if( !file.exists( filename ) ){
		return null;
	}
	var textReader = file.open( filename, 'r' );
	var str = textReader.read();
	textReader.close();
	return str;
}

function replaceAll(str, search, replace){
	  return str.split(search).join(replace);
}
