var CAPI = (function() {
    "use strict";

    /**
     * Creates an instance of CAPI object
     *
     * @constructor
     * @param endPointUrl {string} url to REST root
     * @param authenticationAgent {object} literal object used to maintain authentication to REST server
     * @param connectionType {string} string related to one of the special connection objects used to implement exact technique ("XHR", "JSONP" etc.)
     */
    var CAPI = function (endPointUrl, authenticationAgent) {

        this.contentService_ = null;

        // Array of connections, should be filled-in in preferred order
        //TODO: consider moving to some sort of configuration file...
        var connectionStack = [
            {
                connection: XmlHttpRequestConnection
            },
            {
                connection: MicrosoftXmlHttpRequestConnection
            }
        ];
        var connectionFactory = new ConnectionFeatureFactory(connectionStack);

        this.connectionManager = new ConnectionManager(endPointUrl, authenticationAgent, connectionFactory);
        this.discoveryService = new DiscoveryService(this.connectionManager)

        //TODO: move hardcoded rootPath to the same config file as above...
        this.discoveryService.discoverRoot('/api/ezp/v2/');

    };

    // Public shared

    /**
     * Get instance of Content Service
     *
     * @method getContentService
     */
    CAPI.prototype.getContentService = function(){
        if  (!this.contentService_)  {
            this.contentService_  =  new ContentService(
                this.connectionManager,
                this.discoveryService
            );
        }
        return  this.contentService_;
    };

    return CAPI;

}());