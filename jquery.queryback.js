/**
 * Queryback by Thinkbigr (@thinkbigr)
 * http://www.thinkbi.gr/
 *
 * Copyright 2014, Thinkbigr
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Wednesday, January 15, 2014
 */

/**
 * Extracts media queries from included and embedded style sheets
 * and fires events when they're entered and exited
 *
 * @author Allan Kiezel <allan@thinkbi.gr> (@allankiezel)
 */
(function($, window, document, undefined) {

    'use strict';

    var Queryback = {

        name: 'Queryback',

        version: '0.1',

        defaults: {
            selector: 'link, style'
        },

        settings: null, // Combination of defaults merge with passed in options

        combinedStyles: null, // Combined styles of all embedded and external stylesheets

        externalStylesheetCount: 0, // Stores external stylesheet count which helps with aysnc requests progress

        el: null, // HTMLElement of selected element

        $el: null, // jQuery wrapped element

        /**
         * Intializes the stylesheet parsing, etc.
         *
         * @constructor
         * @this Queryback
         * @param  {HTMLElement} el Selected HTML element
         */
        init: function (el) {

            // Cleanup all previously modified properties
            this.cleanup();

            this.el = el;
            this.$el = $(el);

            // Let's get this parsing started!
            try {
                this.startStylesheetProcessing($(this.settings.selector));
            } catch (error) {
                console.log(error);
            }

        },

        /**
         * Iterate over stylesheets and pass each to the parsing engine
         *
         * @param  {array} stylesheets jQuery wrapped stylesheet elements
         */
        startStylesheetProcessing: function (stylesheets) {

            var stylesheetContent = '';

            var externalStylesheets = [];

            var externalStylesheetCount = 0;

            for (var i = 0, len = stylesheets.length; i < len; i++) {

                var $stylesheet = stylesheets[i];

                if ($stylesheet.tagName === 'LINK') { // Stylesheet is external

                    externalStylesheetCount += 1;
                    externalStylesheets.push($stylesheet.href);

                } else { // Stylesheet is embedded

                    stylesheetContent += $stylesheet.textContent || $stylesheet.innerText || $stylesheet.innerHTML;

                }

            }

            this.combinedStyles = stylesheetContent;

            this.externalStylesheetCount = externalStylesheetCount;

            // Check to make sure we have external stylesheets or embedded content before proceeding
            if (externalStylesheetCount > 0 || stylesheetContent !== '') {

                if (externalStylesheetCount === 0) {
                    this.parseStyles(stylesheetContent);
                    return;
                }

                // Retrieve the remote stylesheets
                this.retrieveExternalStylesheets(externalStylesheets);

            }

        },

        /**
         * Parses styles for media queries
         *
         * @param  {string} styles Combined styles (optional)
         */
        parseStyles: function (styles) {

            var styles = styles || this.combinedStyles;

            // Remove line feeds, carriage returns, and white space from beginning and end of lines
            var content = styles.replace(/^[\n\r\s]+|[\n\r\s]+$/gm, '');

            var re = /\/\*\sName:\s([A-Za-z0-9_-]+)\s\*\/\s*[\n\r]+@media[\sa-zA-Z]+\(([a-z0-9\s-:]+)\)\s*(?:and)*\s*/gim;

            // TODO: Change of plans!  First we'll grab from /* Name...  to ) { using exec
            // and then in the loop we'll use match on the one line with the groups we need
            var myArray = re.exec(content);

            if (myArray != null) {
                for (var i = 0, len = myArray.length; i < len; i++) {
                    console.log("myArray[" + i + "] = " + myArray[i]);
                }
            }

        },

        /**
         * Iterate over external stylesheets and pass-thru each to be retrieved
         *
         * @param  {array} stylesheets External stylesheets
         */
        retrieveExternalStylesheets: function (stylesheets) {

            for (var i = 0, len = stylesheets.length; i < len; i++) {

                this.retrieveExternalStylesheet(stylesheets[i]);

            }

        },

        /**
         * Uses $.ajax to asynchronously retrieve stylesheet contents
         *
         * @param  {string} url Stylesheet external url
         * @return {string}     Stylesheet contents
         */
        retrieveExternalStylesheet: function (url) {

            var request = $.ajax({
                url: url,
                context: this
            })
            .done(function(data, textStatus, jqXHR) {

                this.combinedStyles += data;
                this.externalStylesheetCount -= 1;

                if (this.externalStylesheetCount === 0) {
                    this.parseStyles();
                }

            })
            .fail(function() {
                console.log("error");
            })
            .always(function() {
                //this.externalStylesheetCount +
            });

        },

        /**
         * Cleans up all properties that were previously modified
         */
        cleanup: function () {

            this.el = null;
            this.$el = null;
            this.combinedStyles = null;
            this.externalStylesheetCount = 0;

        }

    };

    $.fn.queryback = function () {

        Queryback.settings = $.extend(Queryback.defaults, arguments[0]);

        // Loop through all selected elements (ie: document) and run through Queryback
        return this.each(function() {
            Queryback.init.call(Queryback, this);
            return this;
        });

    };

}(jQuery, this, this.document));