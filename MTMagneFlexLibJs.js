var HTTPMethod = {
    GET: { value: "GET" },
    POST: { value: "POST" },
    NONE: { value: "NONE" }
};

var MagneFlexOp = {
    REQUEST_CARD_SWIPE: { value: "requestCardSwipe" },
    REQUEST_CANCEL_CARD_SWIPE: { value: "requestCancelCardSwipe" },
    REQUEST_SEND_COMMAND: { value: "requestSendCommand" },
    REQUEST_SEND_EXTENDED_COMMAND: { value: "requestSendExtendedCommand" },
    REQUEST_SMART_CARD_TRANSACTION: { value: "requestStartEMVTransaction" },
    REQUEST_CANCEL_EMV_TRANSACTION: { value: "requestCancelEMVTransaction" },
    REQUEST_SEND_ARPC: { value: "sendARPC" },
    REQUEST_PIN_ENTRY: { value: "requestPIN" },
    REQUEST_MANUAL_CARD_ENTRY: { value: "requestManualCard" },
    REQUEST_DATA: { value: "requestData" },
    REQUEST_SCAN_BARCODE: { value: "requestScanBarCode" },
    REQUEST_STOP_BARCODE_READER: { value: "requestStopBarCodeReader" },
    REQUEST_OPEN_DEVICE: { value: "openDevice" },
    REQUEST_CLOSE_DEVICE: { value: "closeDevice" },
    NONE: { value: "NONE" }
};

var ParamType = {
    Reader: 0,
    Request: 1
};

var cardSwipeCallback2 = null;

var MTMagneFlexParameter = {
    readerParameter: function () {
        this.cardType;
        this.endSession;
        this.reservedBytes;
        this.option;
        this.amount;
        this.transactionType;
        this.cashBack;
        this.commandData;
        this.currencyCode;
        this.waitForReport;
        this.timeLimit;
        this.fieldSeparator;
        this.maxPinLength;
        this.minPinLength;
        this.pinMode;
        this.tone;
        this.pinOption;
        this.quickChipMode;
        this.sendBatchData;
        this.reservedBytes;
        this.needEncryption;
        this.emvOnly;
    },
    requestParameter: function () {
        this.requestVersion = 1;
        this.operation;
        this.customDisplayMessage;
        this.useJavaScriptEvents;
        this.httpMethod;
        this.fullScreenMode;
        this.requestLocation;
        this.destinationURL;
        this.hardwareConfigCheck;
    },
    tipArgument: function () {

        this.tipMode = "00";            // '00'=Disable Tip Mode  
        // '01'=Show Tip GUI immediately using %
        // '02'=Show Tip GUI immediately using $ 
        // '11'=Enable Read Channel(s), with +Tip Button using %
        // '12'=Enable Read Channel(s), with +Tip Button, using $

        this.tip1DisplayMode = "0"; // '0'=% or $ | '1'=Display Custom | '2'=Display NO TIP | '3'=Disabled
        this.tip2DisplayMode = "0";
        this.tip3DisplayMode = "0";
        this.tip4DisplayMode = "0";
        this.tip5DisplayMode = "0";
        this.tip6DisplayMode = "0";

        this.tip1Value = "10";
        this.tip2Value = "10";
        this.tip3Value = "10";
        this.tip4Value = "10";
        this.tip5Value = "10";
        this.tip6Value = "10";
    }


}


function onDataReceived(data) {

    MTMagneFlexLib.cardSwipeCallBack(data);
}

function onDeviceCardSwipeResult(data) {

    MTMagneFlexLib.cardSwipeCallBack(data);
}

function onDeviceResponse(data) {
    MTMagneFlexLib.commandCallBack(data);
}

function onDeviceExtendedResponse(data) {
    MTMagneFlexLib.extendedCommandCallback(data);
}

function onDeviceARQC(data) {
    MTMagneFlexLib.deviceArqcCallback(data);
}
function onDeviceTransactionResult(data) {
    MTMagneFlexLib.deviceBatchDataCallback(data);
}

function onDevicePINData(data) {
    MTMagneFlexLib.devicePINCallback(data);
}

function onDeviceManualEntry(data) {
    MTMagneFlexLib.manualCardDataCallback(data);
}
function onDeviceEMVMessage(data) {
    if (MTMagneFlexLib.displayMessageCallback == null) {
        displayEMVMessageCallback(data);
    }
    else MTMagneFlexLib.displayMessageCallback(data);
}

function onDeviceBarcodeData(data) {
    MTMagneFlexLib.barcodeDataCallback(data);
}
function onDeviceStopBarcode(data) {
    MTMagneFlexLib.stopScanBarcodeCallback(data);
}

function onDeviceCancelEMVTransaction(data) {
    MTMagneFlexLib.cancelTransactionCallback(data);
}

function onDeviceData(data) {
    MTMagneFlexLib.deviceDataCallback(data);
}

function onOpenDeviceComplete(e) {
    MTMagneFlexLib.openDeviceCallback(e);
}

function onCloseDeviceComplete(e) {
    MTMagneFlexLib.closeDeviceCallback(e);
}

var MTMagneFlexHelper = {
    parseQueryString: function parseQuery(queryString) {
        var query = {};
        var pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
        return query;
    },
}
var MTMagneFlexLib = {
    cardSwipeCallBack: null,
    commandCallBack: null,
    extendedCommandCallback: null,
    deviceArqcCallback: null,
    deviceBatchDataCallback: null,
    displayMessageCallback: null,
    devicePINCallback: null,
    manualCardDataCallback: null,
    deviceDataCallback: null,
    barcodeDataCallback: null,
    stopScanBarcodeCallback: null,
    cancelTransactionCallback: null,
    tipArgument: null,
    taxSurchargeAmount: null,
    requestData: function (readerArgument, requestArgument, callBack) {
        if (callBack) {
            this.deviceDataCallback = callBack;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);
        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestCardSwipe: function (readerArgument, requestArgument, callBack) {
        if (callBack) {
            this.cardSwipeCallBack = callBack;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestCancelCardSwipe: function (readerArgument, requestArgument, callBack) {
        if (callBack) {
            this.cardSwipeCallBack = callBack;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestSendCommandSync: function (readerArgument, requestArgument) {
        return new Promise(function (resolve) {

        });
    },
    requestSendCommand: function (readerArgument, requestArgument, callBack) {
        if (callBack) {
            this.commandCallBack = callBack;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);
        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestSendExtendedCommand: function (readerArgument, requestArgument, callBack) {
        if (callBack) {
            this.extendedCommandCallback = callBack;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);
        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestSmartCard: function (readerArgument, requestArgument, arqcCallback, batchCallback, displayMessageCallback, tipArgument, taxSurchargeAmount) {
        if (arqcCallback && batchCallback) {
            this.deviceArqcCallback = arqcCallback;
            this.deviceBatchDataCallback = batchCallback;
        }
        if (displayMessageCallback != null)
            this.displayMessageCallback = displayMessageCallback;
        if (tipArgument != null)
            this.tipArgument = tipArgument;
        if (taxSurchargeAmount != null)
            this.taxSurchargeAmount = taxSurchargeAmount;

        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestCancelEMVTransaction: function (readerArgument, requestArgument, cancelTransactionCallback, displayMessageCallback) {
        if (cancelTransactionCallback) {
            this.cancelTransactionCallback = cancelTransactionCallback;
        }
        if (displayMessageCallback != null) {
            this.displayMessageCallback = displayMessageCallback;
        }

        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestSendARPC: function (readerArgument, requestArgument) {
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestPinEntry: function (readerArgument, requestArgument, pinDataCallback) {
        if (pinDataCallback) {
            this.devicePINCallback = pinDataCallback;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestManualEntry: function (readerArgument, requestArgument, cardCallback) {
        if (manualCardDataCallback) {
            this.manualCardDataCallback = cardCallback;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestScanBarCode: function (readerArgument, requestArgument, barcodeDataCallback) {
        if (barcodeDataCallback) {
            this.barcodeDataCallback = barcodeDataCallback;
        }

        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestStopBarCodeReader: function (readerArgument, requestArgument, stopScanBarcodeCallback) {
        if (stopScanBarcodeCallback) {
            this.stopScanBarcodeCallback = stopScanBarcodeCallback;
        }
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },

    requestOpenDevice : function (readerArgument, requestArgument, openDeviceCallback) {
        if (openDeviceCallback) {
            this.openDeviceCallback = openDeviceCallback;
        }
        requestArgument.operation = MagneFlexOp.REQUEST_OPEN_DEVICE;
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },
    requestCloseDevice : function (readerArgument, requestArgument, closeDeviceCallback) {
        if (closeDeviceCallback) {
            this.closeDeviceCallback = closeDeviceCallback;
        }
        requestArgument.operation = MagneFlexOp.REQUEST_CLOSE_DEVICE;
        var request = this.buildRequestQuery(requestArgument, ParamType.Request) + this.buildRequestQuery(readerArgument, ParamType.Reader);

        this.buildAndSendRequest(request, requestArgument, readerArgument);
    },

    buildAndSendRequest: function (request, requestParam, readerParam) {
        var curUserAgent = navigator.userAgent;
        var curReqOp = MTMagneFlexHelper.parseQueryString(request);
        if (curReqOp["operation"] == MagneFlexOp.REQUEST_CARD_SWIPE.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestCardSwipe(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestCardSwipe.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestCardSwipe(readerParam, requestParam, onDeviceCardSwipeResult);
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_CANCEL_CARD_SWIPE.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.requestCancelCardSwipe(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.requestCancelCardSwipe.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestCancelCardSwipe(readerParam, requestParam, onDeviceCardSwipeResult);
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_SEND_COMMAND.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestSendCommand(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestSendCommand.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestSendCommand(readerParam, requestParam, onDeviceResponse);
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_SEND_EXTENDED_COMMAND.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestSendExtendedCommand(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestSendExtendedCommand.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestSendExtendedCommand(readerParam, requestParam, onDeviceExtendedResponse);
                })();
            }
        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_SMART_CARD_TRANSACTION.value) {

            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                //MTMagneFlexLib.displayMessageCallback = this.displayMessageCallback;
                WebViewJSInterface.RequestStartEMVTransaction(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestStartEMVTransaction.postMessage(request);
            } else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    var callback = (MTMagneFlexLib.displayMessageCallback == null) ? onDeviceEMVMessage : MTMagneFlexLib.displayMessageCallback;
                    mfxJSInterface.requestStartEMVTransaction(
                        readerParam,
                        requestParam,
                        onDeviceARQC,
                        onDeviceTransactionResult,
                        //callback,
                        onDeviceEMVMessage,
                        MTMagneFlexLib.tipArgument,
                        MTMagneFlexLib.taxSurchargeAmount
                    );
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_CANCEL_EMV_TRANSACTION.value) {

            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestCancelEMVTransaction(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestCancelEMVTransaction.postMessage(request);
            } else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');

                    mfxJSInterface.requestCancelEMVTransaction(
                        readerParam,
                        requestParam,
                        onDeviceCancelEMVTransaction
                    );
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_SEND_ARPC.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestSendARPC(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestSendARPC.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestSendARPC(readerParam, requestParam);
                })();
            }
        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_PIN_ENTRY.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestPinEntry(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestPinEntry.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestPinEntry(readerParam, requestParam, onDevicePINData);
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_MANUAL_CARD_ENTRY.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestManualEntry(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestManualEntry.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestManualEntry(readerParam, requestParam, onDeviceManualEntry);
                })();
            }

        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_DATA.value) {

            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestData(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestData.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestData(readerParam, requestParam, onDeviceData);
                })();
            }
        }
        else if (curReqOp["operation"] == MagneFlexOp.REQUEST_SCAN_BARCODE.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestScanBarCode(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestScanBarCode.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestScanBarCode(readerParam, requestParam, onDeviceBarcodeData);
                })();
            }
        } else if (curReqOp["operation"] == MagneFlexOp.REQUEST_STOP_BARCODE_READER.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestStopBarCodeScanner(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestStopBarCodeScanner.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestStopBarCodeReader(readerParam, requestParam, onDeviceStopBarcode);
                })();
            }
        } else if (curReqOp["operation"] == MagneFlexOp.REQUEST_OPEN_DEVICE.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestOpenDevice(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestOpenDevice.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestOpenDevice(readerParam, requestParam, onOpenDeviceComplete);
                })();
            }
        } else if (curReqOp["operation"] == MagneFlexOp.REQUEST_CLOSE_DEVICE.value) {
            if (curUserAgent.indexOf("MAGNEFLEX-ANDROID") > 0) {
                WebViewJSInterface.RequestCloseDevice(request);
            }
            else if (curUserAgent.indexOf("MAGNEFLEX-IOS") > 0) {
                window.webkit.messageHandlers.RequestCloseDevice.postMessage(request);
            }
            else if (curUserAgent.indexOf("Windows") > 0) {
                (async function () {
                    await CefSharp.BindObjectAsync('mfxJSInterface');
                    mfxJSInterface.requestCloseDevice(readerParam, requestParam, onCloseDeviceComplete);
                })();
            }
        }
    },
    buildRequestQuery: function (request, type) {

        if (type == ParamType.Reader) {
            var requestString = "&readerArgument=";
            if (request['commandValue']) {
                requestString += request['commandValue'];
                return requestString;
            }
            for (var key in request) {
                if (request[key]) {
                    requestString += key.concat(":" + request[key] + ",");
                }
            }
            return requestString.substring(0, requestString.length - 1);
        }
        else if (type == ParamType.Request) {
            var requestString = "";
            for (var key in request) {
                if (request[key]) {
                    if (request[key].value)
                        requestString += key.concat("=" + request[key].value + "&");
                    else
                        requestString += key.concat("=" + request[key] + "&");
                }

            }
            return requestString.substring(0, requestString.length - 1);
        }
    },
    eventPool : [],
    availableEventName : [
        "nfc_detected",
        "nfc_removed",
        "barcode_detected",
        "barcode_removed"
    ],
    onEvent: function(name, data) {

        evtObject = { name : name, data : data };

        // fire for name for equal
        var callbackforname = this.eventPool.filter(e => e.name == name);
        for (cb in callbackforname) {
            evthandler = callbackforname[cb];
            evthandler.callBack(evtObject);
        }
        
        // fire for name for "all"
        var callbackforall = this.eventPool.filter(e => e.name == "all");
        for (cb in callbackforall) {
            evthandler = callbackforall[cb];
            evthandler.callback(evtObject);
        }
    },
    addEventListener : function (name, callback, result) {
        if (callback === "undefined") {
            return;
        }

        this.eventPool.push({ name:name, callback:callback });

        readerArgument = new MTMagneFlexParameter.readerParameter();
        
        readerArgument.timeLimit = '3C';
        requestArgument = new MTMagneFlexParameter.requestParameter();
        requestArgument.operation = MagneFlexOp.REQUEST_OPEN_DEVICE;
        requestArgument.httpMethod = HTTPMethod.NONE;
        requestArgument.closeDeviceAfter = false;
        requestArgument.destinationURL = "";
        this.requestOpenDevice(readerArgument, requestArgument, result)

    },
    removeEventListener : function (name, callback) {
        if (name === "*") {
            // remove all listeners
            this.eventPool.length = 0;
        }
        else if (typeof callback === "undefined") {
            // remove all with this name
            var index = 0
            while (index >= 0) 
            {
                index = this.eventPool.findIndex(e=>e.name == name);
                if (index >= 0) {
                    this.eventPool.splice(index,1);
                }
            }
        } else {
            // remove one
            var index = this.eventPool.findIndex(e=>e.name == name);
            if (index >= 0) {
                this.eventPool.splice(index,1);
            }
        }
        
        if (this.eventPool.length == 0) {
            readerArgument = new MTMagneFlexParameter.readerParameter();
        
            requestArgument = new MTMagneFlexParameter.requestParameter();
            requestArgument.operation = MagneFlexOp.REQUEST_CLOSE_DEVICE;
            requestArgument.httpMethod = HTTPMethod.NONE;
            requestArgument.closeDeviceAfter = true;
            requestArgument.destinationURL = "";
            this.requestCloseDevice(readerArgument, requestArgument, function(x){ log("CloseDeviceComplete:"+x) });
        }
    }
};

