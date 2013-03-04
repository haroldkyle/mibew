/**
 * @preserve This file is part of Mibew Messenger project.
 * http://mibew.org
 * 
 * Copyright (c) 2005-2011 Mibew Messenger Community
 * License: http://mibew.org/license.php
 */

(function(Mibew, _){

    // Create shortcut for base model
    var BaseModel = Mibew.Models.BaseSurveyForm;

    /**
     * @class Represents survey form model
     */
    Mibew.Models.SurveyForm = BaseModel.extend(
        /** @lends Mibew.Models.SurveyForm.prototype */
        {
            /**
             * A list of default model values.
             * The model inherits default values from
             * {@link Mibew.Models.BaseSurveyForm.prototype.defaults}
             * @type Object
             */
            defaults : _.extend(
                {},
                BaseModel.prototype.defaults,
                {
                    /**
                     * Indicate if filed for email input should be shown
                     * @type Boolean
                     */
                    showEmail: false,

                    /**
                     * Indicate if field for input first message should be shown
                     * @type Boolean
                     */
                    showMessage: false,

                    /**
                     * Indicate if user name can be changed
                     */
                    canChangeName: false
                }
            ),

            /**
             * Check attributes before set
             * @param Object attributes Attributes hash for test
             */
            validate: function(attributes) {
                // Check email
                if (this.get('showEmail')) {
                    if (typeof attributes.email != 'undefined') {
                        if(! Mibew.Utils.checkEmail(attributes.email)) {
                            return Mibew.Localization.get(
                                'presurvey.error.wrong_email'
                            );
                        }
                    }
                }
            },

            /**
             * Send form information to server
             */
            submit: function() {
                if (! this.validate(this.attributes)) {
                    var self = this;
                    Mibew.Objects.server.callFunctions(
                        [{
                            "function": "processSurvey",
                            "arguments": {
                                "references": {},
                                "return": {
                                    'next': 'next',
                                    'options': 'options'
                                },
                                "groupId": self.get('groupId'),
                                "name": self.get('name'),
                                "info": self.get('info'),
                                "email": self.get('email'),
                                "message": self.get('message'),
                                "referrer": self.get('referrer'),
                                // There is no initialized thread yet
                                "threadId": null,
                                "token": null
                            }
                        }],
                        function(args){
                            if (args.errorCode == 0) {
                                self.trigger('submit:complete', self);
                                // Stop survey module
                                Mibew.Application.Survey.stop();

                                // Start next module
                                switch (args.next) {
                                    case 'chat':
                                        // Start chat module
                                        Mibew.Application.Chat.start(
                                            args.options
                                        );
                                        break;

                                    case 'leaveMessage':
                                        // Start leave message module
                                        Mibew.Application.LeaveMessage.start(
                                            args.options
                                        );
                                        break;

                                    default:
                                        throw new Error(
                                            'Do not know how to continue!'
                                        );
                                }
                            } else {
                                self.trigger(
                                    'submit:error',
                                    self,
                                    {
                                        code: args.errorCode,
                                        message: args.errorMessage || ''
                                    }
                                );
                            }
                        },
                        true
                    );
                }
            }
        }
    );

})(Mibew, _);