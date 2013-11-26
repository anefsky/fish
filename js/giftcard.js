var Giftcard = Giftcard || {};  // local namespace
var Controls = Controls || {};  // stops jshint warnings

Giftcard.App = (function() { // Singleton
    var instance; // stores reference to Singleton
    function init() { // runs on creation
        // Private methods and variables

        console.log(VS.data.monthDays);

        var _cfgParams = {
            "send_date_range": VS.data.monthDays, //ex: [[25, 31], [1, 30], [1, 31]];
            "max_orders_per_type": 3
        },
        _properties = {},
                _itemCounter = 0,
                _moduleTypeProperties = new Giftcard.ModuleTypeProperties();

        var _getNextItemNum = function() {
            return _itemCounter++;
        };

        var _addNewModule = function(collectionName) {
            var moduleCollection = Giftcard.App.getInstance().getProperty(collectionName);
            var nextItemNumber = _getNextItemNum();
            var newModule = moduleCollection.addModule(nextItemNumber);
            newModule.brand();
            newModule.populateAndArm();
            if (!moduleCollection.isAnyMoreAllowed()) {
                var buttonId = Giftcard.App.getInstance().
                        getModuleProperties()[newModule.getType()].add_more_button_id;
                var elButton = document.getElementById(buttonId);
                elButton.setAttribute("disabled", "disabled"); // changes appearance
                elButton.onclick = ""; // disables click action
            }
        };

        var _createPagewideEventHandlers = function() {
            var formProperties = new Giftcard.ModuleTypeProperties();
            var formParams = formProperties.getProperties();

            // add-more-at-a-time 
            var keys = Object.keys(formParams);
            for (var i = 0; i < keys.length; i++) {
                (function(i) {  // closure needed to create handlers in loop
                    var formType = keys[i];
                    var params = formParams[formType];
                    var buttonId = params.add_more_button_id;
                    document.getElementById(buttonId).onclick = function() {
                        _addNewModule(params.collection_name);
                    };
                })(i);
            }
            // add-to-bag
            var addToBagButtons = document.getElementsByClassName("add-to-bag");
            for (var i = 0; i < addToBagButtons.length; i++) {
                addToBagButtons[i].onclick = function() {
                    var formData = new Giftcard.FormData();
                    formData.validate();
                    formData.dump();
                };
            }

        };
        var _init = function() {
            var formParams = Giftcard.App.getInstance().getModuleProperties();
            var keys = Object.keys(formParams);
            for (var i = 0; i < keys.length; i++) {
                var formType = keys[i];
                var params = formParams[formType];
                var elModuleCollection = document.getElementById(params.section_id);
                var moduleCollection = new Giftcard.ModuleCollection(elModuleCollection,
                        Giftcard.App.getInstance().getCfgParam("max_orders_per_type"));
                Giftcard.App.getInstance().setProperty(params.collection_name, moduleCollection);
                var elExistingModule = elModuleCollection.getElementsByClassName("add-more-group")[0];
                var existingModule = new Giftcard.OrderModule(elExistingModule, formType, _getNextItemNum());
                moduleCollection.setMasterModule(existingModule);
                existingModule.brand();
                existingModule.populateAndArm();
            }
            _createPagewideEventHandlers();

        };
        return {
            // Public methods and variables
            getModuleProperties: function() {
                return _moduleTypeProperties.getProperties();
            },
            getCurrentItemNum: function() {
                return _itemCounter - 1;  //already incremented 
            },
            setProperty: function(key, value) {
                _properties[key] = value;
            },
            getProperty: function(key) {
                return _properties[key];
            },
            getCfgParam: function(key) {
                return _cfgParams[key];
            },
            init: function() {
                _init();
            }
        };
    }
    return {
        getInstance: function() {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();

Giftcard.ModuleTypeProperties = function() {
    var _properties = {
        "mail": {//todo: make primary/secondary
            "section_id": "section-order-mail",
            "collection_name": "MAIL_MODULE_COLLECTION",
            "data_amounts": VS.data.dollarAmountsMail,
            "data_designs": VS.data.designChoicesMail,
            "add_more_button_id": "add-more-at-a-time-mail"
        },
        "email": {
            "section_id": "section-order-email",
            "collection_name": "EMAIL_MODULE_COLLECTION",
            "data_amounts": VS.data.dollarAmountsEmail,
            "data_designs": VS.data.designChoicesEmail,
            "add_more_button_id": "add-more-at-a-time-email"
        }
    };
    return {
        getProperties: function() {
            return _properties;
        }
    };
};

Giftcard.FormData = function() {
    var _createErroneousControlsList = function() { // todo: necessary?
        var arrErrorControls = [];
        var formsData = _getFormsData();
        for (var i = 0; i < formsData.length; i++) {
            var arrControlsData = formsData[i]; //todo: fix
            for (var j = 0; j < arrControlsData.length; j++) {
                control = arrControlsData[j].objControl;
                //               if ((control.isRequired() && !control.getValue()) ||
                if (!control.isValid()) {
                    arrErrorControls.push(control);
                }
            }
        }
        return arrErrorControls;
    };

    var _flagForError = function(control) {  // todo: move to better class
        control.addClassTo("error");
    };

    var _removeErrorFlag = function(control) {
        control.removeClassFrom("error");
    };

    var _getModuleCollections = function() {
        var arrCollections = [];
        var formParams = Giftcard.App.getInstance().getModuleProperties();
        var formTypes = Object.keys(formParams);
        for (var i = 0; i < formTypes.length; i++) {
            var formType = formTypes[i];
            var collectionName = formParams[formType].collection_name;
            arrCollections.push(Giftcard.App.getInstance().getProperty(collectionName));
        }
        return arrCollections;
    };

    var _getFormsData = function() {
        var formsData = [];
        var arrControlsByModule = _getAllControlsOnPageByModule();
        for (var i = 0; i < arrControlsByModule.length; i++) {
            var arrControlsInModule = arrControlsByModule[i];
            arrValues = [];
            for (j = 0; j < arrControlsInModule.length; j++) {
                var control = arrControlsInModule[j];
                arrValues.push(// is all this needed?  Just get modules
                        {
                            "objControl": control
                        });
            }
            formsData.push(arrValues);
        }
        return formsData;
    };

//todo: eliminate next function?  May be redundant with how dump() is working
    var _getAllControlsOnPageByModule = function() { // array of array of controls
        var arrAllControlsByModule = [];
        var formParams = Giftcard.App.getInstance().getModuleProperties();
        var formTypes = Object.keys(formParams);

        for (var i = 0; i < formTypes.length; i++) {
            var formType = formTypes[i];
            var collectionName = formParams[formType].collection_name;
            var moduleCollection = Giftcard.App.getInstance().getProperty(collectionName);
            for (var j = 0; j < moduleCollection.getNumberModules(); j++) {
                var module = moduleCollection.getModule(j);
                var arrControlsInModule = module.getControls();
                arrAllControlsByModule.push(arrControlsInModule);
            }
        }
        return arrAllControlsByModule;
    };

    var _clearAllErrorFlags = function() {
        var arrControlsByModule = _getAllControlsOnPageByModule();
        for (var i = 0; i < arrControlsByModule.length; i++) {
            var arrControlsInModule = arrControlsByModule[i];
            for (j = 0; j < arrControlsInModule.length; j++) {
                _removeErrorFlag(arrControlsInModule[j]);
            }
        }
    };
    return {
        validate: function() {
            _clearAllErrorFlags();
//            $("#errors-on-page-notice").addClass("no-display");  // todo: fix, should not have dup classes
            // fix addClass to only add if not exists
            var erroneousControls = _createErroneousControlsList();
            for (var i = 0; i < erroneousControls.length; i++) {
                _flagForError(erroneousControls[i]);
            }
            if (erroneousControls.length > 0) {
//                $("#errors-on-page-notice").removeClass("no-display");
                window.scrollTo(0, 0); // go to top of page
            }
        },
        dump: function() {
            var moduleCollections = _getModuleCollections();
            for (var i = 0; i < moduleCollections.length; i++) {
                var collection = moduleCollections[i];
                console.log("+ collection type = " + collection.getType());
                for (var j = 0; j < collection.getNumberModules(); j++) {
                    var module = collection.getModule(j);
                    console.log("** module type = " + module.getType());
                    var controls = module.getControls();
                    for (var k = 0; k < controls.length; k++) {
                        var control = controls[k];
                        var validString = control.isValid() ? "valid" : "INVALID";
                        console.log(">>> " + control.getName() + ":\"" + control.getValue()
                                + "\" - " + validString);
                    }
                }
            }
        }
    };
};

//////////// Modules ///////////////////////////////

Giftcard.ModuleCollection = function(elSection, maxSize) {
    var _elRoot = elSection;
    var _elMasterModule;
    var _type; // todo: do we need this?  Maybe just id as primary/secondary, or anonymous
    var _modules = [];  // list of module for this type
    var _maxSize = maxSize;

    return {
        setMasterModule: function(module) { // on init
            _modules.push(module); // add one in markup to collection
            _elMasterModule = module.getRootElement().cloneNode(true);
            _type = module.getType();
        },
        addModule: function(itemNumber) {
            var clone = _elMasterModule.cloneNode(true);
            var newNode = _elRoot.appendChild(clone);
            var module = new Giftcard.OrderModule(newNode, _type, itemNumber);
            _modules.push(module);
            return module;
        },
        getNumberModules: function() {
            return _modules.length;
        },
        isAnyMoreAllowed: function() {
            return this.getNumberModules() < _maxSize;
        },
        getModule: function(idx) {
            return _modules[idx];
        },
        getType: function() {
            return _type;
        },
    };
};

Giftcard.OrderModule = function(elSection, type, itemNumber) {
    var _elRoot = elSection,
            _itemNumber = itemNumber,
            _type = type,
            _properties = {},
            _arrControls = [];  // list of included control objects
    var _getCtlElement = function(className) {
        return _elRoot.getElementsByClassName(className)[0];
    };
    var _initControls = function() {
        for (var i = 0; i < _arrControls.length; i++) {
            var control = _arrControls[i];
            control.populate();
            control.arm();
            control.postProcess();
        }
    };

    return {
        setProperty: function(key, value) {
            _properties[key] = value;
        },
        getProperty: function(key) {
            return _properties[key];
        },
        getType: function() {
            return _type;
        },
        getRootElement: function() {
            return _elRoot;
        },
        populateAndArm: function() {
            switch (_type) {
                case "mail" :
                    this.populateMailModule();
                    break;
                case "email" :
                    this.populateEmailModule();
            }
            _initControls();
        },
        brand: function() { // assigns item number throughout module
            var html = _elRoot.innerHTML;
            var replacementText = "items[" + _itemNumber + "]";
            var re = new RegExp("items" + "\\[" + "\\d" + "\\]", "g");
            var brandedHtml = html.replace(re, replacementText);
            _elRoot.innerHTML = brandedHtml;
        },
        populateMailModule: function() { // todo: move to outside js file
            var params = Giftcard.App.getInstance().getModuleProperties().mail;
            var currentItemNum = Giftcard.App.getInstance().getCurrentItemNum();

            _arrControls = [
                new Controls.DesignSelectorCtl(_getCtlElement("design-control-cntnr"),
                        params.data_designs, currentItemNum),
                new Controls.AmtCtl(_getCtlElement("amt-control-cntnr"),
                        params.data_amounts),
                new Controls.TextInputCtl(_getCtlElement("name-to-control-cntnr")),
                new Controls.TextInputCtl(_getCtlElement("name-from-control-cntnr"))
            ];


        },
        populateEmailModule: function() {
            var params = Giftcard.App.getInstance().getModuleProperties().email;
            var currentItemNum = Giftcard.App.getInstance().getCurrentItemNum();
            var vsDateRange = Giftcard.App.getInstance().getCfgParam("send_date_range");
            var dayTargetCtl, emailPrimaryCtl;

            _arrControls = [
//                new Controls.DesignSelectorCtl(_getCtlElement("design-control-cntnr"),
//                        params.data_designs, currentItemNum),
//                new Controls.AmtCtl(_getCtlElement("amt-control-cntnr"),
//                        params.data_amounts),
                new Controls.TextInputCtl(_getCtlElement("name-to-control-cntnr")),
//                new Controls.TextInputCtl(_getCtlElement("name-from-control-cntnr")),
                new Controls.MessageWithCountdown(_getCtlElement("message-with-countdown-cntnr")),
                dayTargetCtl = new Controls.DayCtl(_getCtlElement("day-control-cntnr"), vsDateRange),
                new Controls.MonthCtl(_getCtlElement("month-control-cntnr"), dayTargetCtl, vsDateRange),
//                emailPrimaryCtl = new Controls.EmailInputCtl(_getCtlElement("email-to-control-cntnr")),
//                new Controls.EmailConfirmInputCtl(_getCtlElement("email-confirm-control-cntnr"),
//                        emailPrimaryCtl)
            ];
        },
        getControls: function() {
            return _arrControls;
        }
    };
};

//////////// endModules ///////////////////////////////

window.onload = function() {
    var app = Giftcard.App.getInstance();
    app.init();
};



