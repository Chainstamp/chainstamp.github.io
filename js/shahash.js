var sha256 = CryptoJS.algo.SHA256.create(); 
var finalResult;
//sha256.update("Message Part 1");
 //sha256.update("Message Part 2");
  //sha256.update("Message Part 3");
   //var hash = sha256.finalize();
  // console.log(hash);
   
   //var test = CryptoJS.SHA256("Message");
   //console.log(test);
  // var fileResult;
   
/*
 * Valid options are:
 * - chunk_read_callback: a function that accepts the read chunk
                          as its only argument. If binary option
                          is set to true, this function will receive
                          an instance of ArrayBuffer, otherwise a String
 * - error_callback:      an optional function that accepts an object of type
                          FileReader.error
 * - success:             an optional function invoked as soon as the whole file has been
                          read successfully
 * - binary:              If true chunks will be read through FileReader.readAsArrayBuffer
 *                        otherwise as FileReader.readAsText. Default is false.
 * - chunk_size:          The chunk size to be used, in bytes. Default is 64K.
 */
function parseFile(file, options) {
    var opts       = typeof options === 'undefined' ? {} : options;
    var fileSize   = file.size;
    var chunkSize  = typeof opts['chunk_size'] === 'undefined' ?  64 * 1024 : parseInt(opts['chunk_size']); // bytes
    var binary     = typeof opts['binary'] === 'undefined' ? false : opts['binary'] == true;
    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var readBlock  = null;
    var chunkReadCallback = typeof opts['chunk_read_callback'] === 'function' ? opts['chunk_read_callback'] : function() {};
    var chunkErrorCallback = typeof opts['error_callback'] === 'function' ? opts['error_callback'] : function() {};
    var success = typeof opts['success'] === 'function' ? opts['success'] : function() {};

    var onLoadHandler = function(evt) {
        if (evt.target.error == null) {
			if(binary) {
			 offset += evt.target.result.byteLength;
			} else {
			 offset += evt.target.result.length;
			}
           
            chunkReadCallback(evt.target.result);
        } else {
            chunkErrorCallback(evt.target.error);
            return;
        }
        if (offset >= fileSize) {
            success(file);
            return;
        }

        readBlock(offset, chunkSize, file);
    }

    readBlock = function(_offset, length, _file) {
        var r = new FileReader();
        var blob = _file.slice(_offset, length + _offset);
        r.onload = onLoadHandler;
        if (binary) {
          r.readAsArrayBuffer(blob);
        } else {
          r.readAsText(blob);
        }
    }

    readBlock(offset, chunkSize, file);
}



CryptoJS.enc.u8array = {
        /**
         * Converts a word array to a Uint8Array.
         *
         * @param {WordArray} wordArray The word array.
         *
         * @return {Uint8Array} The Uint8Array.
         *
         * @static
         *
         * @example
         *
         *     var u8arr = CryptoJS.enc.u8array.stringify(wordArray);
         */
        stringify: function (wordArray) {
            // Shortcuts
            var words = wordArray.words;
            var sigBytes = wordArray.sigBytes;

            // Convert
            var u8 = new Uint8Array(sigBytes);
            for (var i = 0; i < sigBytes; i++) {
                var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
                u8[i]=byte;
            }

            return u8;
        },

        /**
         * Converts a Uint8Array to a word array.
         *
         * @param {string} u8Str The Uint8Array.
         *
         * @return {WordArray} The word array.
         *
         * @static
         *
         * @example
         *
         *     var wordArray = CryptoJS.enc.u8array.parse(u8arr);
         */
        parse: function (u8arr) {
            // Shortcut
            var len = u8arr.length;

            // Convert
            var words = [];
            for (var i = 0; i < len; i++) {
                words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
            }

            return CryptoJS.lib.WordArray.create(words, len);
        }
    };
    
