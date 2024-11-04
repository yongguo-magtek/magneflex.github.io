
(function(exports){
    var UrlToObject = function (url) {
        return JSON.parse('{"' + decodeURI(url).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
    };

    var  sendNFCCommand = function(command, lastCommand, encrypt) {
        readerArgument = new MTMagneFlexParameter.readerParameter();
        readerArgument.timeLimit = '1E';
        readerArgument.hideUI = true;
        readerArgument.command = command;
        readerArgument.lastCommand = lastCommand;
        readerArgument.encrypt = encrypt;

        
        requestArgument = new MTMagneFlexParameter.requestParameter();
        requestArgument.operation = MagneFlexOp.REQUEST_SEND_NFC_COMMAND;
        requestArgument.httpMethod = HTTPMethod.NONE;
        requestArgument.closeDeviceAfter = false;
        requestArgument.destinationURL = "";

        return new Promise((resolve) =>{
            MTMagneFlexLib.requestSendNFCCommand(readerArgument,requestArgument,function(x){
                    resolve(UrlToObject(x));
                });
        });
    };

    var startNFCAccess = function() {
        readerArgument = new MTMagneFlexParameter.readerParameter();
        readerArgument.timeLimit = '1E';
        readerArgument.hideUI = true;

        
        requestArgument = new MTMagneFlexParameter.requestParameter();
        requestArgument.operation = MagneFlexOp.REQUEST_START_NFC;
        requestArgument.httpMethod = HTTPMethod.NONE;
        requestArgument.closeDeviceAfter = false;
        requestArgument.destinationURL = "";

        return new Promise((resolve) =>{
            MTMagneFlexLib.requestStartNFC(readerArgument,requestArgument,function (x){
                resolve(UrlToObject(x));
            });
        });
    };

    var stopNFCAccess = async function() {
        readerArgument = new MTMagneFlexParameter.readerParameter();
        readerArgument.timeLimit = '1E';
        readerArgument.hideUI = true;

        
        requestArgument = new MTMagneFlexParameter.requestParameter();
        requestArgument.operation = MagneFlexOp.REQUEST_STOP_NFC;
        requestArgument.httpMethod = HTTPMethod.NONE;
        requestArgument.closeDeviceAfter = false;
        requestArgument.destinationURL = "";

        return new Promise((resolve) =>{
            MTMagneFlexLib.requestStopNFC(readerArgument,requestArgument,function (x){
                resolve(UrlToObject(x));
            });
        });
    };

    // read the card and triger reading, readingerror
    var read = async function (onreading, onreadingerror) {
        console.log("start read card");
        if (typeof this.card !== "undefined") {
            var allBytes = await this.card.readAll();
            let message = NdefLibrary.NDefMessage.fromByteArray(allBytes);
            if (typeof onreading !== "undefined") {
                setTimeout(()=>{ onreading("DATA READ"); },100);
            }
        } else {
            if (typeof onreadingerror !== "undefined") {
                setTimeout(()=>{ onreadingerror("Unknown card"); },100);
            }
        }
    };

    // return a promise for the result of connect device
    exports.connect = async function( option ) {
        var reader = {
            _option : {},
            _tag : {},
            scan : async function(option) {
                console.log("start scan");

                if ( typeof option !== "undefined" && typeof option.signal !== "undefined") {
                    option.signal.onabort = async ()=>{ await stopNFCAccess(); };
                }

                if (typeof this.card !== "undefined") {
                    delete this.card;
                }
                var nfcStart = await startNFCAccess();
                if (nfcStart.errorCode == 0) {
                    if (nfcStart.CardType === "mifare_ultralight") {
                        // ntag
                        this.card = NTag(this.send);
                        this.card.UID = nfcStart.UID;
                    }
                    read(this.onreading, this.onreadingerror);
                    return nfcStart;
                } else {
                    throw Error(nfcStart.errorMessage);
                }
            },
            disconnect : async function () {
                MTMagneFlexLib.removeEventListener("*");
                return Promise.resolve("");
            }
        };

        if (typeof option === "undefined" || typeof option.nfc_mifare_ultralight_presented === "undefined") {
            reader._option.nfc_mifare_ultralight_presented = (reader, tag)=> { 
                reader.scan();
            }
        } else {
            reader._option.nfc_mifare_ultralight_presented = option.nfc_mifare_ultralight_presented;
        }

        if (typeof option === "undefined" || typeof option.nfc_mifare_ultralight_removed === "undefined") {
            reader._option.nfc_mifare_ultralight_removed = (reader)=> { 
                // do nothing
            }
        } else {
            reader._option.nfc_mifare_ultralight_removed = option.nfc_mifare_ultralight_removed;
        }

        var allEventHandler = function (userEvent) {
            console.log(`Event : name - ${userEvent.name}, data - ${userEvent.data}`);

            if (userEvent.name == "UserEvent") {
                if (userEvent.data.includes("presented")) {
                    reader._tag.type = userEvent.data.split(",",1)[0];
                }
                if (userEvent.data.includes("removed")) {
                    reader._tag = {};
                    if ( typeof reader._option[userEvent.data] !== "undefined") {
                        reader._option[userEvent.data](reader);
                    }   
                }
            }

            if (userEvent.name == "NFCData") {
                if (typeof reader._tag.UID === "undefined") {
                    reader._tag.UID = userEvent.data;
                    let tagType = reader._tag.type;
                    if ( typeof reader._option[tagType] !== "undefined") {
                        reader._option[tagType](reader, reader._tag);
                    }       
                }   
            }
        } ;

        return new Promise((resolve) =>{
            MTMagneFlexLib.addEventListener("all", allEventHandler, function(x) {
                let response = UrlToObject(x);
                if (response.errorCode == 0) {
                    reader.serialNumber = response.SerialNumber;
                    reader.firmware = response.Firmware;
                    reader.model = response.Model;
                    resolve(reader);
                } else {
                    throw Error(response.errorMessage);
                }
            });
        });
    };
    

    // return a promise for the result of sending
    exports.send = async function (command, lastCommand) {
        if (typeof lastCommand === "undefined")
            lastCommand = false;

        var response = await sendNFCCommand(command, lastCommand, false);
        if (response.errorCode == 0) {
            if (typeof response.data !== "undefined")
                return response.data;
            else 
                return;
        } else {
            throw Error(response.errorMessage);
        }
    };

})(typeof exports === 'undefined'? this['mtnfc']={}: exports);

