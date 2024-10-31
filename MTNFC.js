
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
        if (onreading) {
            setTimeout(()=>{ onreading("DATA READ") },100);
        }
    };

    // return a promise for the result of connect device
    exports.connect = async function( onTagPresented ) {
        let reader = {
            scan : async function(option) {
                console.log("start scan");

                if ( typeof option !== "undefined" && typeof option.signal !== "undefined") {
                    option.signal.onabort = async ()=>{ await stopNFCAccess(); };
                }

                var nfcStart = await startNFCAccess();
                if (nfcStart.errorCode == 0) {
                    read(this.onreading, this.onreadingerror);
                    return nfcStart;
                } else {
                    throw Error(nfcStart.errorMessage);
                }
            },
            disconnect : async function () {
            }
        };

        if (typeof onTagPresented === "undefined") {
            onTagPresented = (reader)=> { 
                reader.scan();
            }
        };

        return new Promise((resolve) =>{
            MTMagneFlexLib.addEventListener("UserEvent", (userEvent)=>{
                console.log(`UserEvent : name - ${userEvent.name}, data - ${userEvent.data}`);
                if (userEvent.data.includes("presented")) {
                    onTagPresented(reader);
                }
            }, function(x) {
                let response = UrlToObject(x);
                if (response.errorCode == 0) {
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

