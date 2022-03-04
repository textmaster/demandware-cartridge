var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('TMPageDesignersImpex-GetPage', function () {
    this.timeout(25000);

    var myRequest = {
        url: '',
        method: 'GET'
    };

    it('should return a page designer object JSON', function () {
        myRequest.url = config.baseUrl + '/TMPageDesignersImpex-GetPage?pageid=homepage-example';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            var bodyAsJson = JSON.parse(response.body);

            assert.equal(bodyAsJson.isPage, true);
        });
    });

    it('should not return a page designer object JSON', function () {
        myRequest.url = config.baseUrl + '/TMPageDesignersImpex-GetPage?pageid=not-a-page';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            var bodyAsJson = JSON.parse(response.body);

            assert.equal(bodyAsJson.isPage, false);
        });
    });
});