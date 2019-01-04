	var chainstamp=new Chainstamp();
	
	chainstamp.debug=true;

	var verifyIntervalId;
	
	var app = new Vue({
	  el: '#create_top',
	  data: {
	  	openResponse:null,
	  	verifyStatus:null,
	    originalHashes: [],
	    emailToNotify:"",
	    paymentLevel:"",
	    paymentType:"",
	    cardToken:"",
	    fileNames:[],
	    filesAdded:0,
	    progressComment:"",
	    showProgress:false,
	    errorTitle:"",
	    errorMessage:"",
	    showError:false,
	    elapsedStart:null,
	    elapsedNow:null,
		elapsedRun:false,
		plans:null

	  },

	  methods: {
	  	createSubmit1() {
	  		console.log("create submit1 was clicked");
	  		console.log("email=",app.emailToNotify);
	  		app.originalHashes=getHashes();
	  		console.log("originalHashes=",app.originalHashes);
	  		$("#create-chainstamp").hide("fast");$("#pricing").show();$(window).scrollTop(0);
	  	},

	  	backToFileDrop() {
	  		console.log("back to file drop");
	  		$("#pricing").hide("fast");$("#create-chainstamp").show();$(window).scrollTop(0);
	  	},

	  	backToPrcing() {
	  		$("#payment-method").hide("fast");$("#pricing").show();$(window).scrollTop(0);
	  	},

	  	basic() {
	  		console.log("basic submit");
	  		app.paymentLevel="BASIC";
	  		doStampBasic();
	  	},

	  	simple() {
			console.log("simple selected");
			app.paymentLevel="SIMPLE";
			$("#pricing").hide("fast");$("#payment-method").show();$(window).scrollTop(0);
	  	},

	  	pro() {
			console.log("pro selected");
			app.paymentLevel="PRO";
			$("#pricing").hide("fast");$("#payment-method").show();$(window).scrollTop(0);
	  	},

	  	card() {
	  		console.log("card selected");
	  		app.paymentType="CARD";
	  		doCard(app.paymentLevel);
	  	},

	  	crypto() {
	  		console.log("crypto selected");
	  		app.paymentType="CRYPTO";
	  		doStampCrypto(app.paymentLevel);
		  },

		getPlanName(plan) {
			return plan.name.charAt(0).toUpperCase() + plan.name.slice(1).toLowerCase();
		},

		getPlanTime(plan) {
			var secs=plan.delay/1000;
			secs=secs*1.5;  //because on avg you'll get middle. Then have to wait for end of next full interal.
			if(secs>86000) {
				return "Submitted once a day."; //assumes we won't go to a greater delay.
			} else if(secs>3600) {
				return "Confirms in "+ round(secs/3600,0)+" hours on average."
			} else if(secs>0) {
				return "Confirms in "+ (round(secs/60,0)+10)+" minutes on average." //70min is allowed.
			} else {
				return "Confirms in 10 minutes on average";
			}
		},

		getPlanPrice(plan) {
			var price=round(plan.price/100,2);
			if((price*100)%100 ==0 ) {
				price=round(price,0);
			}
			if(price==0) {
				return "FREE";
			} else {
				return "$"+price;
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

		  elapsed: function() {
		  	if(this.elapsedStart && this.elapsedNow) {
			  	var millis=this.elapsedNow-this.elapsedStart;
			  	var totalSeconds=millis/1000;

			  	//var hours=Math.floor(totalSeconds/3600);
			  	//totalSeconds%=3600;
			  	var minutes=Math.floor(totalSeconds/60);
			  	totalSeconds%=60;
			  	var seconds=Math.floor(totalSeconds);
			  	console.log(" min:"+minutes+" seconds:"+seconds);
			  	return minutes+"min "+seconds+"sec";
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
		  	} else if(this.openResponse && this.openResponse.transactionId) {
		  		return chainstamp.explorerTx+"/"+this.openResponse.transactionId;
		  	} else {
		  		return "";
		  	}
		  },

		  stampHash: function() {
		  	if(this.openResponse) {
		  		return openResponse.stampHash;
		  	}	
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
		  },

		  imageQRSrc: function() {
		  	if(chainstamp) { 
		  		if(this.openResponse && this.openResponse.paymentAddress) {
					return chainstamp.getImageQR(this.openResponse.paymentAddress, this.openResponse.paymentAmtBtc);
		  		}
		  		return "";
		  	} else {
		  		return "";
		  	}
		  },

		  paymentBtc: function() {
		  	if(this.openResponse) {
		  		return round(this.openResponse.paymentAmtBtc,7);
		  	} else {
		  		return "";
		  	}
		  },

		  paymentUSD: function() {
		  	if(this.paymentLevel=="SIMPLE") {
		  		return "3.00";
		  	} else if(this.paymentLevel=="PRO") {
		  		return "15.00";
		  	}
		  },

		  paymentBtcLink: function() {
		  	if(this.openResponse && this.openResponse.paymentAmtBtc && this.openResponse.paymentAddress) {
		  		return "bitcoin:"+this.openResponse.paymentAddress+"?amount="+this.openResponse.paymentAmtBtc;
		  	} else {
		  		return "#";
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
			
			getPlans();
		  }
	});

/** MISC **/


	//config	
	bitpay.enableTestMode(chainstamp.testMode);

	$( document ).ready(function() {
	    console.log( "ready!" );
	    setupModalEvents();
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

		//if hidden is fired and desired state is shown, show it.
		$('#progressModal').on('hidden.bs.modal', function (e) {
			app.progressComment="";
			if(app.showProgress) {
				console.log("delayed show");
				progressModal(true,app.progressComment);
			}
		});
	}
	
	function paymentModal(show) {
		if(show) {
			$("#Modal-Create").modal({backdrop: 'static', keyboard: false, show:true});
			$('#Modal-Create').on('hide.bs.modal', function () { 
				console.log("hiding payment modal");
			}); 
		} else {
			$("#Modal-Create").modal('hide');
		}
	}

	function progressModal(show,comment="") {
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

	function showError(title,message) {
		console.log("error:"+title+" message:"+message);
		app.errorTitle=title;
		app.errorMessage=message;
		$("#errorModal").modal();
	}

	function startElapsed() {
		app.elapsedRun=true;
		elapsedTimer();
	}

	function stopElapsed() {
		app.elapsedRun=false;
	}

	function elapsedTimer() {
		if(!app.elapsedStart) {
			app.elapsedStart=new Date();
		}
		app.elapsedNow=new Date();
		if(app.elapsedRun) {
			setTimeout(elapsedTimer,1000);
		}

	}

	function paymentToSuccess() {
		startElapsed();
		$("#payment-method").hide("fast");$("#status-area-success").show();$(window).scrollTop(0);
		$(function () {
		  $('[data-toggle="tooltip"]').tooltip()
		})
	}


	function startVerifyTimer(duration, display) {
	    var timer = duration, minutes, seconds;
	    verifyIntervalId=setInterval(function () {
	        minutes = parseInt(timer / 60, 10);
	        seconds = parseInt(timer % 60, 10);

	        minutes = minutes < 10 ? "0" + minutes : minutes;
	        seconds = seconds < 10 ? "0" + seconds : seconds;

	        display.text(minutes + ":" + seconds);

	        if (--timer < 0) {
	            doVerifyFail();
	        } 

	        if(timer % 5 ==0) {
	        	doVerify(app.openResponse);
	        }
	        //console.log("--");
	    }, 1000);
	}

	function stopVerifyTimer() {
		clearInterval(verifyIntervalId);
	}

	function round(number, precision) {
	  var shift = function (number, precision) {
	    var numArray = ("" + number).split("e");
	    return +(numArray[0] + "e" + (numArray[1] ? (+numArray[1] + precision) : precision));
	  };
	  return shift(Math.round(shift(number, +precision)), -precision);
	}

	var $idown;  // Keep it outside of the function, so it's initialized once.
	function downloadURL(url) {
	  if ($idown) {
	    $idown.attr('src',url);
	  } else {
	    $idown = $('<iframe>', { id:'idown', src:url }).hide().appendTo('body');
	  }
	}


/** END MISC **/

/****** CORE API CALLS ********/
	function doStampCard() {
		append("doStampCard submitting....");
		progressModal(true,"Submitting");
		chainstamp.stampCard(
			{"originalHashes":app.originalHashes,"emailToNotify":app.emailToNotify,"paymentLevel":app.paymentLevel,"cardToken":app.cardToken},
			function(openResponse,error) {
			progressModal(false);
			if(openResponse) {
				append("stampCard result="+JSON.stringify(openResponse));
				app.openResponse=openResponse;
				if(app.openResponse.seedHash) {
					paymentToSuccess();
				} else {
					$("#payment-method").hide("fast");$("#status-area-pending").show();$(window).scrollTop(0);
				}
			}
			if(error) {
				console.log("got error "+error.message);
				showError(error.title,error.message);
			}

		});
	}

	function doStampBasic() {
		append("doStampBasic submitting....");
		console.log("app hashes",app.originalHashes);
		progressModal(true,"Submitting");
		chainstamp.stampBasic({"originalHashes":app.originalHashes,"emailToNotify":app.emailToNotify},function(openResponse,error) {
			progressModal(false);
			if(openResponse) {
				append("basic result: "+JSON.stringify(openResponse));
				$("#pricing").hide("fast");$("#status-area-pending").show();$(window).scrollTop(0);
				app.openResponse=openResponse;
			}
			if(error) {
				console.log("error = "+error.message);
				showError(error.title,error.message);
			}
		});
	}

	function doStampCrypto(level) {
		append("doStampCrypto submitting....");
		progressModal(true,"Submitting");
		chainstamp.stampCrypto({"originalHashes":app.originalHashes,"emailToNotify":app.emailToNotify,"paymentLevel":app.paymentLevel,"paymentProcessor":chainstamp.cryptoMethod}
		,function(openResponse,error) {
			if(openResponse) {
				append("got openResponse, stampId="+openResponse.stampId+" stampHash="+openResponse.stampHash);
				console.log("got invoice id "+openResponse.invoiceId+" for stamp "+openResponse.stampId);
				app.openResponse=openResponse;
				doPaymentAndVerify();
			} 
			if(error) {
				progressModal(false);
				showError(error.title,error.message);
			}
		});
	}


	function doPaymentAndVerify() {
		append("opening crypto payment method");
		verifyCount=0;
		progressModal(false); //only for non bitpay?
		if(chainstamp.cryptoMethod=="BITPAY") {
			bitpay.showInvoice(app.openResponse.invoiceId);
		} else {
			paymentModal(true);
			startVerifyTimer(chainstamp.verifyTimeout, $("#modalCountdown"));
		}
	}

	function doVerifyAfterBitpay() {
		progressModal(true,"Verifying payment");
		startVerifyTimer(bitpayVerifyTimeout);
	}


	function doVerify(openResponse) {
		console.log("verify running");
		append("verifying stamp_id "+openResponse.stampId);

		chainstamp.verifyStamp(openResponse, function(verifyStatus,error) {
			verifyCount++;
			if(verifyStatus) {
				console.log("verifyStatus==>"+JSON.stringify(verifyStatus));
				app.verifyStatus=verifyStatus;
				if(verifyStatus.paid) {
					doVerifySuccess(verifyStatus);
				}
			}
			if(error) {
				doVerifyFail(error);
			}
		});
	}

	function doVerifyFail(error,didCancel) {
		console.log("doVerifyFail "+error+" "+didCancel);
		stopVerifyTimer();
		progressModal(false);
		paymentModal(false);
		if(!didCancel) {
			if(error) {
				showError("Error","We got an unknown error checking the status. Please try again.");
			} else {
				showError("Payment not detected","We couldn't verify payment. For help email contact@chainstamp.io");
			}
		} else {
			showError("Cancelled","For help with payments email us at contact@chainstamp.io");
		}
		
		
		//reset info
		app.openResponse=null;
		app.verifyStatus=null;
	}

	function doVerifySuccess(verifyStatus) {
		append("stampCrypt result="+JSON.stringify(verifyStatus));
		stopVerifyTimer();
		paymentModal(false);
		progressModal(false);
		if(app.verifyStatus.seedHash) {
			paymentToSuccess();
		} else {
			$("#payment-method").hide("fast");$("#status-area-pending").show();$(window).scrollTop(0);
		}
	}

	function getPlans() {
		chainstamp.getPlans(function(data,error) {
			if(data) {
				app.plans=data.plans;
			}
			if(error) {
				showError("Error retrieving plan information");
			}
		});
	}


	function append(message) {
		console.log(message);
	}

/****** END CORE API CALLS ********/


/*********STRIPE HANDLER ************/
	var stripeHandler = StripeCheckout.configure({
	  key: chainstamp.stripeKey,
	  image: 'https://chainstamp.io/images/favicon-96x96.png',
	  locale: 'auto',
	  zipCode: false,
	  billingAddress: false,
	  token: function(token) {
	    // You can access the token ID with `token.id`.
	    // Get the token ID to your server-side code for use.
	    console.log("got a token with id="+token.id);
	    app.cardToken=token.id;
	    doStampCard();
	  }
	});

	function doCard(level) {
		var amt;
		if(level=="SIMPLE") {
			amt=300;
		} else if(level=="PRO") {
			amt=1500;
		}
		stripeHandler.open({
			name: 'Chainstamp.io',
			description: 'Create a Chainstamp Proof',
			amount: amt
			});
	}

	/*********END STRIPE HANDLER ************/



/*******BITPAY EVENTS **********/

	//window.addEventListener("message", receiveMessage, false);

	 window.addEventListener("message", function(event) {
	    if(event.data && event.data.status) {
	    	console.log("got event data status="+event.data.status);
	  	}
	  }
	  , false);

	function receiveMessage(event)
	{
		console.log(event.toString());

	}

	bitpay.onModalWillEnter(function() {
	  progressModal(false);
	  console.log('modal is opening');
	});

	bitpay.onModalWillLeave(function() {
	  console.log('modal is closing');
	  doVerifyAfterBitpay();
	});