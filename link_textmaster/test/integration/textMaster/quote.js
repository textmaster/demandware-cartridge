var assert = require('chai').assert;
var request = require('request-promise');
var config = require('../it.config');

describe('TMQuote-Send', function () {
    this.timeout(25000);

    var myRequest = {
        url: '',
        method: 'POST'
    };

    it('should add project in queue for sending quote', function () {
        myRequest.url = config.baseUrl + '/TMQuote-Send?projectid=12345';
        request(myRequest, function (error, response) {
            assert.equal(response.statusCode, 200, 'Expected request statusCode to be 200');
            assert.include(response.body, "Project ID is kept in queue. System will check the project status and user will get the quote in mail box shortly");
        });
    });
});