var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('TMAutoLaunch-Document', function () {
    this.timeout(25000);

    var myRequest = {
        url: '',
        method: 'POST'
    };

    it('should error on auto launch document', function () {
        myRequest.url = config.baseUrl + '/TMAutoLaunch-Document';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            var bodyAsJson = JSON.parse(response.body);

            assert.isFalse(bodyAsJson.success);
            assert.equal(bodyAsJson.message, 'Parameters projectid and documentid are required in URL');
        });
    });

    it('should wait on auto launch document', function () {
        myRequest.url = config.baseUrl + '/TMAutoLaunch-Document?projectid=1234&documentid=5678';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            var bodyAsJson = JSON.parse(response.body);

            assert.isFalse(bodyAsJson.success);
            assert.equal(bodyAsJson.message, 'Waiting for call backs of all documents');
        });
    });
});