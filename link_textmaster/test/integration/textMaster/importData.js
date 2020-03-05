var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('TMImport-Data', function () {
    this.timeout(25000);

    var myRequest = {
        url: '',
        method: 'POST'
    };

    it('should error on importing translated data from TextMaster', function () {
        myRequest.url = config.baseUrl + '/TMImport-Data';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            var bodyAsJson = JSON.parse(response.body);

            assert.isFalse(bodyAsJson.success);
            assert.equal(bodyAsJson.message, 'Parameters projectid and documentid are required in URL');
        });
    });

    it('should successfully import translated data from TextMaster', function () {
        myRequest.url = config.baseUrl + '/TMImport-Data?projectid=1234&documentid=5678';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            var bodyAsJson = JSON.parse(response.body);

            assert.isTrue(bodyAsJson.success);
            assert.equal(bodyAsJson.message, 'Project import started');
        });
    });
});