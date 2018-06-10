
function ChainstampError(title,message) {
	this.title=title;
	this.message=message;
}

function Chainstamp() {
	var self = this;

	var dev=false;
	this.cryptoMethod="SELF";  //SELF or BITPAY

	if(this.cryptoMethod=="SELF") {
		this.verifyTimeout=5*60;
	} else {
		this.verifyTimeout=30;
	}

	if(dev) {
		this.debug=true;
		this.host="https://devapi.chainstamp.io:8443";
		this.explorerTx="https://testnet.blockchain.info/tx";
		this.explorerBlock="https://testnet.blockchain.info/block";
		this.testMode=true;
		this.stripeKey="pk_test_0zVGSzh3lvUoLMwKSZkUvpIx"; //public 

	} else {
		this.debug=false;
		this.host="https://api.chainstamp.io:8443";
		this.explorerTx="https://blockchain.info/tx";
		this.explorerBlock="https://blockchain.info/block";
		this.testMode=false;	
		this.stripeKey="pk_live_9BJWCQDvq487SLpPM0eJHqDY"; //public
	}


	this.getProofLink =  function(seedHash) {
		return self.host+"/proof/"+seedHash;
	}

	this.getImageQR = function(address,amount) {
		return self.host+"/imageqr/"+address+"?amount="+amount;
	}

	 this.stampBasic = function(stampData,callback) {

		api("POST",
			"/stamp/basic",
			stampData,
			function(data) {
				debug("got result "+data);
				callback(data);
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}

	
	 this. stampCryptoSingle = function(stampData,callback) {
		api("POST",
			"/stamp/crypto",
			stampData,
			function(data) {
				debug("got result "+data);
				callback(data);
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}

	this. stampCrypto = function(stampData,callback) {
		api("POST",
			"/stamp/crypto",
			stampData,
			function(openResponse) {
				debug("got stamp cryptoresult "+openResponse);
				if(stampData.cryptoMethod=="BITPAY") {
					debug("fetching invoiceId");
					self.getInvoice(openResponse,function(invoiceData,invoiceError) {
						if(invoiceData) {
							openResponse.invoiceId=invoiceData.invoiceId;
							callback(openResponse);
						}
						if(invoiceError) {
							callback(null,new ChainstampError(invoiceError.title,invoiceError.message));
						}
					});
				} else {
					callback(openResponse);
				}
				
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}

	

	 this.stampCard = function(stampData, callback) {
		api("POST",
			"/stamp/card",
			stampData,
			function(data) {
				debug("got result "+data);
				callback(data);
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}

	

	this.getInvoice =  function(stampResponse,callback) {
		api("GET",
			"/invoice/"+stampResponse.paymentId,
			null,
			function(data) {
				debug("got result "+data);
				callback(data);
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}

	this.verifyStamp = function(stampData, callback) {
		api("GET",
			"/verify/stamp/"+stampData.stampId+"/"+stampData.stampHash,
			null,
			function(data) {
				debug("got result "+data);
				callback(data);
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}



	this.verifyItem = function(itemHash, callback) {
		api("GET",
			"/verify/item/"+itemHash,
			null,
			function(data) {
				debug("got result "+data);
				callback(data);
			},
			function(error){
				debug("got error "+JSON.stringify(error));
				callback(null, new ChainstampError(error.title,error.message));
			});
	}



	/*

	 verifyItem() {

	},
	*/


	function api(method, endpoint, data, success, error) {
		
		var url=self.host+endpoint;
		
		$.ajax({
			  type: method,
			  url: url,
			  data: JSON.stringify(data),
			  contentType: 'application/json',
	          dataType: 'json',
			})
			  .done(function(data, textStatus, jqXHR) {
			  	  debug("done calling "+endpoint)
				  success(data);
			  })
			  .fail(function(qXHR, textStatus, errorThrown) {
			  	  debug("fail calling "+endpoint+" textStatus="+textStatus+" errorThrown="+errorThrown+" status="+qXHR.status+ " statusText="+qXHR.statusText+ "responseText="+qXHR.responseText);
				  if(qXHR.responseJSON) {
				  	error(qXHR.responseJSON);
				  } else {
				  	error({"title":"Error","message":"An unknown error occurred. Probably a connection issue."});
				  }
			  });
	}

	function debug(message) {
		if(self.debug) {
			console.log(message);
		}
	}


}

