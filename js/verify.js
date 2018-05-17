
var chainstamp=new Chainstamp();
chainstamp.debug=true;

var app = new Vue({
	  el: '#verify_top',
	  data: {
	  	verifyStatus:null,
	  	openResponse:null,
	    originalHashes: [],
	    fileNames:[],
	    filesAdded:0,
	    progressComment:"",
	    emailToNotify:"",
	    showProgress:false,
	   	errorTitle:"",
	    errorMessage:"",
	    generalTitle:"",
	    generalMessage:""
	  },

	  methods: {

	  	verifySubmit() {
	  		console.log("verifySubmit");
	  		this.originalHashes=getHashes();
	  		console.log("originalHashes=",app.originalHashes);
	  		if(this.originalHashes[0]) {
	  			if(this.originalHashes.length>1) {
	  				showError("Too Many Files", "Please only select 1 file for verification");
	  			} else {
	  				doVerify();
	  			}
	  		} else { 
	  			showError("No file","Select a file from your filesystem or drop into the file drop area on the screen.");
	  		}
	  	}


	  },
	  	computed: {
		  expected: function() {
		  	var exp=0;
		  	if(this.verifyStatus) {
		  		exp=this.verifyStatus.expectedSubmissionTime;
		  	} else if(this.openResponse) {
		  		exp=this.openResponse.expectedSubmissionTime;
		  	}
		  	if(this.openResponse || this.verifyStatus) {
		  		 var totalSeconds=exp/1000;
                var hours = Math.floor(totalSeconds/ 3600);
                totalSeconds %= 3600;
                var minutes = Math.floor(totalSeconds / 60);

                return hours+"hrs "+minutes+"min";
		  	} else {
		  		return "";
		  	}
		  },

		  expectedDate: function() {
			var exp=0;
		  	if(this.verifyStatus) {
		  		exp=this.verifyStatus.expectedSubmissionTime;
		  	} else if(this.openResponse) {
		  		exp=this.openResponse.expectedSubmissionTime;
		  	}
		  	if(this.openResponse || this.verifyStatus) {
		  		 var totalSeconds=exp/1000;
		  		 var date = new Date();
				date.setSeconds(date.getSeconds() + totalSeconds);
				return date.toString();
		  	} else {
		  		return "";
		  	}
		  },

		  seedHash: function() {
		  	if(this.verifyStatus) {
		  		return this.verifyStatus.seedHash;
		  	} else if(this.openResponse) {
		  		return this.openResponse.seedHash;
		  	} else {
		  		return "";
		  	}
		  },

		  transactionId: function() {
		  	if(this.verifyStatus) {
		  		return this.verifyStatus.txId;
		  	} else if(this.openResponse) {
		  		return this.openResponse.transactionId;
		  	} else {
		  		return "";
		  	}
		  },

		  txLink: function() {
		  	if(this.verifyStatus && this.verifyStatus.txId) {
		  		return chainstamp.explorerTx+"/"+this.verifyStatus.txId;
		  	}
		  	return "";
		  },

		  stampHash: function() {
		  	if(this.verifyStatus) {
		  		return this.verifyStatus.stampHash;
		  	}	
		  },

		  blockLink: function() {
		  	if(this.verifyStatus) {
		  		return chainstamp.explorerBlock+"/"+this.verifyStatus.blockHash;
		  	}
		  	return "";
		  },

		  blockTime: function() {
		  	if(this.verifyStatus && this.verifyStatus.blockTime) {
		  		var date=new Date(this.verifyStatus.blockTime);
		  		return date.toTimeString();
		  	}
		  	return "";
		  },

		  blockDate: function() {
		  	if(this.verifyStatus && this.verifyStatus.blockTime) {
		  		var date=new Date(this.verifyStatus.blockTime);
		  		return date.toDateString();
		  	}
		  	return "";
		  },

		  fileHash: function() {
		  	if(this.originalHashes && this.originalHashes.length>0) {
		  		return this.originalHashes[0];
		  	} else {
		  		return "";
		  	}
		  },

		  fileName: function() {
		  	if(this.fileNames.length>0) {
		  		return this.fileNames[0];
		  	} else {
		  		return "";
		  	}
		  },

		  verifyLink: function() {
		  	if(this.verifyStatus && this.verifyStatus.stampHash) {
		  		return "verify.html?stampId="+this.verifyStatus.stampId+"&stampHash="+this.verifyStatus.stampHash;
		  	}

		  	if(this.openResponse && this.openResponse.stampHash) {
		  		return "verify.html?stampId="+this.openResponse.stampId+"&stampHash="+this.openResponse.stampHash;
		  	}

		  	return "verify.html";
		  },
		  
		  proofLink: function() {
		  	if(chainstamp) {
		  		if(this.verifyStatus && this.verifyStatus.seedHash) {
					return chainstamp.getProofLink(this.verifyStatus.seedHash);
		  		} 
		  		if(this.openResponse && this.openResponse.seedHash) {
					return chainstamp.getProofLink(this.openResponse.seedHash);
		  		}
		  		return "";
		  	} else {
		  		return "";
		  	}
		  }

	  	},

		created: function () {
		    // `this` points to the vm instance
		    console.log('vue is created');
		  },
		  mounted () {
		  	const vm = this;
		  	vm.$on("fileName",fileName =>{
		  		console.log("got file "+fileName);
		  		vm.fileNames.push(fileName);
		  	});

		  	vm.$on("singleInput",data =>{
		  		$("#fileInput").click(); //how do eliminate jquery or dom action here?
		  	});

		  	vm.$on("newFiles", length =>{ 
		  		console.log("filesFound received "+length);
		  		vm.filesAdded=length;
		  	});
		  }
	});


	$( document ).ready(function() {
	    console.log( "ready!" );
	    setupModalEvents();
	    var stampId=getUrlParameter("stampId");
	    var stampHash=getUrlParameter("stampHash");
	    if(stampId && stampHash) {
	    	doVerifyStamp(stampId,stampHash);
	    }
	});

	function setupModalEvents() {
		/*modal event*/
		//if modal shown is fired and desired state is hidden, hide it
		$('#progressModal').on('shown.bs.modal', function (e) {
		 if(!app.showProgress) {
		 	console.log("delayed hide");
		 	progressModal(false);
		 }
		});

		//if hidden is shown and desired state is shown, show it.
		$('#progressModal').on('hidden.bs.modal', function (e) {
			app.progressComment="";
			if(app.showProgress) {
				console.log("delayed hide");
				progressModal(true,app.progressComment);
			}
		});
	}




	function progressModal(show,comment="") {
		if(show) console.log("showing "+comment);
		app.showProgress=show;
		if(show) {
			console.log("showing modal");
			app.progressComment=comment;
			$("#progressModal").modal({backdrop: 'static', keyboard: false});
		} else {
			console.log("hiding modal");
			$("#progressModal").modal("hide")
		}
		
	}

	function getUrlParameter(name) {
	    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	    var results = regex.exec(location.search);
	    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	};

	function getPathParameter(index) {
		var pathArray = window.location.pathname.split( '/' );

		if(pathArray.length>index) {
			return pathArray[index];
		} else {
			return "";
		}
	}

	function showPending() {
		$("#dropfile").hide();$("#status-area-pending").show();$(window).scrollTop(0);
	}

	function showSubmitted() {
		$("#dropfile").hide();$("#status-area-success").show();$(window).scrollTop(0);
		$(function () {
		  $('[data-toggle="tooltip"]').tooltip()
		})
		doProofDownload(1);
	}

	function showConfirmed() {
		$("#dropfile").hide();$("#status-area-verified").show();$(window).scrollTop(0);
		$(function () {
		  $('[data-toggle="tooltip"]').tooltip()
		})
		doProofDownload(2);
	}

	function showNotFound() {
		$("#dropfile").hide();$("#status-area-not-found").show();$(window).scrollTop(0);
	}

	function doVerify() {
		console.log("do verify");
		progressModal(true,"Checking Status...");
		chainstamp.verifyItem(app.originalHashes[0],processVerify);
	}

	function doVerifyStamp(stampId,stampHash) {
		console.log("do verify stamp");
		progressModal(true,"Checking Status...");
		chainstamp.verifyStamp({"stampHash":stampHash,"stampId":stampId}, processVerify);
	}

	function processVerify(verifyStatus,error) {
		progressModal(false);
		if(verifyStatus) {
			app.verifyStatus=verifyStatus;
			if(app.verifyStatus.blockHash && verifyStatus.status!=2) {
				console.log("got a block hash, convert status to confirmed. db may be out of sync.");
				app.verifyStatus.status=2;
			}
			if(verifyStatus.status==0) {
				showPending();
			} else if(verifyStatus.status==1) {
				showSubmitted();
			} else if(verifyStatus.status==2) {
				showConfirmed();
			} else {
				console.log("unknown status");
			}
		} 
		if(error) {
			showNotFound();//testing
		}
	}

	function showError(title,message) {
		console.log("error:"+title+" message:"+message);
		app.errorTitle=title;
		app.errorMessage=message;
		$("#errorModal").modal();
	}

	function showInfo(title,message) {
		app.generalTitle=title;
		app.generalMessage=message;
		$("#generalModal").modal();
	}

	function copyToClipboard(element) {
	  var $temp = $("<input>");
	  $("body").append($temp);
	  $temp.val($(element).text()).select();
	  document.execCommand("copy");
	  $temp.remove();
	}

	function doProofDownload(status) {
		if(getUrlParameter("proofDownload")=="true") {
			showInfo("Proof File","Your proof file is ready. Downdload your proof file using the button shown on this page. See the faq page for more information about using a proof file.");
		}
	}

	var $idown;  // Keep it outside of the function, so it's initialized once.
	function downloadURL(url) {
	  if ($idown) {
	    $idown.attr('src',url);
	  } else {
	    $idown = $('<iframe>', { id:'idown', src:url }).hide().appendTo('body');
	  }
	}


	