/**
    Copyright 2014-2015 Amazon.com, Inc. or its affiliates. All Rights Reserved.
    Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
        http://aws.amazon.com/apache2.0/
    or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/**
 * This sample shows how to create a Lambda function for handling Alexa Skill requests that:
 *
 * Examples:
 * One-shot model:
 *  User: "Alexa, ask Air Quality Meter what is the air rating for 9 8 1 0 5"
 *  Alexa: "(reads back air quality rating)"
 */

'use strict';

var AlexaSkill = require('./AlexaSkill');

var APP_ID = 'amzn1.echo-sdk-ams.app.b319682d-7649-43dc-a7ba-582f0c74441f'; //replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';

/**
 * AirQualityHelper is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var AirQualityHelper = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
AirQualityHelper.prototype = Object.create(AlexaSkill.prototype);
AirQualityHelper.prototype.constructor = AirQualityHelper;

AirQualityHelper.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechText = {
        speech:  "<speak>Welcome to Air Quality Meter. You can ask a question like, "
                 +"What is the air quality rating in zip code <say-as interpret-as='digits'> 98105 </say-as> or simply say the 5 digit zip code. "
                 +"Which zip code would you like air quality information for?</speak>",
        type:   AlexaSkill.speechOutputType.SSML
    },
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    repromptText = {
        speech: "For instructions on what you can say, please say help me.",
        type:   AlexaSkill.speechOutputType.PLAIN_TEXT
    };
    response.ask(speechText, repromptText);
};

/* to test API connection and accuracy of data being spoken by Alexa is data received from API, open a web 
 browser and edit the location to a five digit zip code of choice
 http://api.breezometer.com/baqi/?location=98105&fields=breezometer_description&key=238c76b53931458d98fa2c71a718ab54
*/

AirQualityHelper.prototype.intentHandlers = {

    "AirQualityIntent": function (intent, session, response) {
        
        var zip = intent.slots.zip.value; ///user input for zip code
        //var zip = 94101;
        var endpoint = 'http://api.breezometer.com/baqi/';
        var queryString = '?location=' + zip; //'location=seattle,+wa,+united+states';
        var tokenKey = '238c76b53931458d98fa2c71a718ab54';
        var airQdesc = 'breezometer_description';
        var apiRequest = endpoint + queryString + '&fields=' + airQdesc + '&key=' + tokenKey
        var http = require('http');
        
        console.log('apiRequest: ' + apiRequest);
        
        http.get(apiRequest, function (res) {
            var aqResponseString = '';
            console.log('Status Code: ' + res.statusCode + ' = ' + res.statusMessage);

            // validate API connection    
            if (res.statusCode != 200) {
                
                var speechOutput = "Sorry, the zip code provided is not currently supported. Please try another zip code.";
                response.tell(speechOutput);
                
            } else {
                        res.on('data', function (data) {
                            aqResponseString += data;

                            // split string into array by using space as delimiter
                            var output = aqResponseString.split(' ');
                            
                            // test if zip code is valid or not 
                                console.log(output[1]);
                            if (output[1] === 'false,') {
                                
                                var speechOutput = "Sorry, that zip code could not be found, or data is not available for the zip code provided. Please try a different zip code.";
                                response.tell(speechOutput);
                                
                            } else {
                                
                            console.log('The air quality is rated ' + output[1] + '.');  /// add zip code user provided
                            var speechOutput = 'The air quality in zip code ' + "<say-as interpret-as='digits'> " + zip + " </say-as>" + ' is rated ' + output[1] + '.';  
                            response.tell(speechOutput);
                                
                            }

                        });
                    }

            res.on('end', function () {
                var aqResponseObject = JSON.parse(aqResponseString);
                console.log(aqResponseObject);
            });
        }).on('error', function (e) {
            console.log("Communications error: " + e.message);
        }); 
    
    },
    
    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Thanks for using Air Quality Meter, Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Thanks for using Air Quality Meter, Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = {
            speech:  "<speak>I can provide you the air quality rating for a location simply by providing a 5 digit zip code. "
                    +"You may ask something like, "
                    +"What is the air quality in zip code <say-as interpret-as='digits'> 98105 </say-as> or simply say the 5 digit zip code..."
                    +"Which zip code would you like air quality information for?</speak>",
            type:   AlexaSkill.speechOutputType.SSML
        },
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        repromptText = {
            speech: "For instructions on what you can say, please say help me.",
            type:   AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechText, repromptText);
    }
};

exports.handler = function (event, context) {
    var airQualityHelper = new AirQualityHelper(); // take note of lowercase airQ and uppercase AirQ
    airQualityHelper.execute(event, context); // take note of lowercase airQ and uppercase AirQ
};
