var fileSize;
var fileName;
var soFar;
var needsdownload=false;
var fileStack;
var nextFileIndex;
var hashStack = [];
var toHash;

function getHashes() {
	return hashStack;
}

function getLastHash() {
	if(hashStack.length>0) {
		return hashStack[hashStack.length-1].toString();
	} else {
		return null;
	}
	
}

function showFileInfo() {
	app.$emit("fileName",fileStack[nextFileIndex].name);
	//$("#fileInfo").append(fileStack[nextFileIndex].name+" "+finalResult.toString()+"<br/>");
}

function clearDrop(event) {
	event.preventDefault();
	//$("#drop_zone").css({"border":"5px dashed #999"});
}

function singleInput() {
	console.log("singleInput");
	//$("#fileInput").click();
	app.$emit("singleInput",null);
}

function allowDrop(event) {
    event.preventDefault();
    //$("#drop_zone").css({"border":"5px dashed green"});
    return false;
}

function processInputEvent(fileList) {
	fileStack=fileList;
	nextFileIndex=0;
	//$("#dropInfo").html("1 file");
	processFile(fileStack[nextFileIndex]);
}

function processFileList(list) {
	fileStack=list;
	console.log("got "+fileStack.length+" files");
	app.$emit("newFiles",fileStack.length);
	if(fileStack.length>1) {
		//$("#dropInfo").html(fileStack.length+" files");
	} else {
		//$("#dropInfo").html("1 file");
	}
	
	nextFileIndex=0;

	processFile(fileStack[nextFileIndex]);
}

function drag_drop(event) {
	event.preventDefault();
	processFileList(event.dataTransfer.files);
}

function processNextFile() {
	if(fileStack!=null && fileStack.length>nextFileIndex+1) {
		nextFileIndex++;
		processFile(fileStack[nextFileIndex]);
		return true;
	}
	return false;
}

function didDownload() {
	needsdownload=false;
	console.log('didDownload');
}

function updateProgress(amount) {
	if(fileSize>0) {
		soFar+=amount;
		var pct =soFar/fileSize * 100;
		if(pct>=100) pct=100;
		//$("#prog").width(pct+"%");
	}
}

function reset() {
	console.log("reset");
	// uncheck();
	 fileSize=0;
	 fileName="";
	 soFar=0;
	 //$("#prog").width("0%");
	 //$("#downloadArea").html("");
	 //$( "#results" ).html( "" );
   	sha256 = CryptoJS.algo.SHA256.create(); 
   finalResult=null;
}

function isReadyToSubmit() {
	console.log("isReadyToSubmit");
}

function processFile(theFile) {
	console.log("processFile",theFile);
	if(theFile) {
		reset();
		fileSize=theFile.size;
		fileName=theFile.name;
	
		parseFile(theFile, {
			binary : true,
			chunk_size : 1048576,
			chunk_read_callback: function(chunk) {
				console.log("updating");
				updateProgress(1048576);
				sha256.update(CryptoJS.enc.u8array.parse(new Uint8Array(chunk)));
				//sha256.update(new Uint32Array(chunk));
			},
			success : function() {
				console.log("success");
				finalResult=sha256.finalize();
				hashStack.push(finalResult.toString());
				//$("#fileInfo").append(finalResult.toString()+"<br/>");
				showFileInfo();
				console.log(finalResult.toString());
				if(!processNextFile()) {
					isReadyToSubmit();
				}
			}
		});
	}
}