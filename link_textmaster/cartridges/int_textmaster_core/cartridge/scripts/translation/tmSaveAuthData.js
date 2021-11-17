'use strict';

/* Script Includes */
var utils = require('~/cartridge/scripts/utils/tmUtils');

/**
 * Saves Authentication Data to custom cache
 * @param {Object} input - input object
 */
function saveAuthData(input) {
    var customCache = require('~/cartridge/scripts/utils/customCacheWebdav');
    var authData = customCache.getCache(utils.config.cache.url.authentication) || {};

    if (input.clientID) {
        authData.clientID = input.clientID;
    }

    if (input.clientSecret) {
        authData.clientSecret = input.clientSecret;
    }

    if (input.redirectURI) {
        authData.redirectURI = input.redirectURI;
    }

    if (input.authCode) {
        authData.authCode = input.authCode;
    }

    if (input.access_token) {
        authData.accessToken = input.access_token;
    }

    if (input.expires_in && !isNaN(input.expires_in) && parseInt(input.expires_in, 10) > 0) {
        authData.expiresIn = parseInt(input.expires_in, 10) * 1000;
    }

    if (input.refresh_token) {
        authData.refreshToken = input.refresh_token;
    }

    if (input.access_token) {
        authData.createdAt = new Date().getTime();
    }

    customCache.setCache(utils.config.cache.url.authentication, authData);
}

module.exports = {
    execute: saveAuthData
};
