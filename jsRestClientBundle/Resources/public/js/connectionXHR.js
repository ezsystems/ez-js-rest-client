var connectionXHR = (function() {
    "use strict";

    // Constructor
    var connection = function () {

        // Private
        var getXHR = function(){
            var result = null;
            if (window.XMLHttpRequest) {
                // FireFox, Safari, etc.
                result = new XMLHttpRequest();
            }
            else if (window.ActiveXObject) {
                // MSIE Old versions
                result = new ActiveXObject("Microsoft.XMLHTTP");
            }
            else {
                console.log("No known mechanism to build XHR!");
            }
            return result;
        }

        // Public for this instance
        this.sendRequest = function(method, url, data, headers, callback) {
            var XHR = getXHR();

            // Create the state change handler:
            XHR.onreadystatechange = function() {
                if (XHR.readyState != 4) return; // Not ready yet
                if ((XHR.status < 200) && (XHR.status > 204)) {
                    console.log("Request failed!");
                    return;
                }
                // Request successful
                callback(XHR.responseText);
            }

            XHR.open(method, url, true);

            for (var headerType in headers) {
                XHR.setRequestHeader(
                    headerType,
                    headers[headerType]
                );
            }

            XHR.send(data);
        }
    };

    return connection;


}());