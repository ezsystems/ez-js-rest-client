    // Exporting needed parts of the CAPI to public

    window.eZ = window.eZ || {};

    window.eZ.HttpBasicAuthAgent = require('authAgents/HttpBasicAuthAgent');
    window.eZ.SessionAuthAgent = require('authAgents/SessionAuthAgent');
    window.eZ.CAPI = require('CAPI');
    window.eZ.PromiseCAPI = require('PromiseCAPI');

}));