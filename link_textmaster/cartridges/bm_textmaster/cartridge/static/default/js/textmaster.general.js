/* global localStorage, document */
/* eslint-disable no-unused-vars */

var textMasterGeneralApp = {
    urls: {
        attributeList: 'TMComponents-AttributeList',
        categoryDropdown: 'TMComponents-CategoryDropdown',
        createTranslation: 'TMComponents-CreateTranslation',
        getLanguageToList: 'TMComponents-GetLanguageToList',
        getTemplatesResponse: 'TMComponents-GetTemplatesResponse',
        handleAutoLaunch: 'TMComponents-HandleAutoLaunch',
        saveAPIConfigurations: 'TMComponents-SaveAPIConfigurations',
        saveDefaultAttributes: 'TMComponents-SaveDefaultAttributes',
        translationItemList: 'TMComponents-ItemList',
        newMappingRow: 'TMLanguageMapping-NewMappingRow',
        saveLanguageMapping: 'TMLanguageMapping-SaveLanguageMapping',
        deleteRowMapping: 'TMLanguageMapping-DeleteLanguageMappingRow',
        clearCache: 'TMComponents-ClearCache',
        getPageDesigners: 'TMComponents-GetPageDesigners',
        getPageComponents: 'TMComponents-GetPageComponents',
        saveAuthData: 'TMComponents-SaveAuthData',
        generateToken: 'TMComponents-GenerateToken',
        clearToken: 'TMComponents-ClearToken'
    },
    utils: {
        firstLetterCapital: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        setCookie: function (cname, cvalue, exdays) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            var expires = 'expires=' + d.toUTCString();
            document.cookie = cname + '=' + cvalue + ';' + (exdays ? expires + ';' : '') + 'Secure';
        },
        getCookie: function (cname) {
            var name = cname + '=';
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return '';
        }
    }
};
