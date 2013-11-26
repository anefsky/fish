var Controls = Controls || {};  // namespace
var Utils = Utils || {};

Controls.BaseCtl = function() { // abstract
    this.getValue = function() {
        return this.elCtlAnchor.value.trim();
    };
    this.isRequired = function() {
        return this.elCtlAnchor.hasAttribute("required");
    };
    this.getName = function() {
        return this.elCtlAnchor.getAttribute("name");
    };
    this.populate = function() {
    };
    this.arm = function() {
    };
    this.postProcess = function() {
    };
    this.addClassTo = function(className) { 
//        this.elCtlAnchor.className = this.elCtlAnchor.className + " " + className;
        Utils.Classes.addClass(this.elCtlAnchor, className);
    };
    this.removeClassFrom = function(className) { 
//        this.elCtlAnchor.className = 
//                this.elCtlAnchor.className.replace( /(?:^|\s)className(?!\S)/ , '' );
        Utils.Classes.removeClass(this.elCtlAnchor, className);
    };
    this.isValid = function() {
        return !(this.isRequired() && this.getValue() === "");
    };
};

Controls.SelectCtl = function() {  // abstract
    this.selectedIdx = 0;  //first item is default

    this.populate = function() {
        this.elCtlAnchor.options.length = 0; //clear list
        var arrOptions = this.createOptions();
        for (var i = 0; i < arrOptions.length; i++) {
            var option = arrOptions[i];
            var isSelected = (i === this.selectedIdx);
            this.elCtlAnchor.add(new Option(
                    option.display, option.value, isSelected, isSelected));
        }
    };
    this.setSelectedIdx = function(selectedIdx) {
        this.selectedIdx = selectedIdx;
    };
    this.getSelectedIdx = function() {
        return this.elCtlAnchor.selectedIndex;
    };
};
Controls.SelectCtl.prototype = new Controls.BaseCtl();

Controls.TextInputCtl = function(elDivCtl, textString) { //todo: make abstract?
    this.elRoot = elDivCtl;
    this.elCtlAnchor = this.elRoot.getElementsByClassName("text-input")[0];
    this.elCtlAnchor.value = "";  // clear
    this.textString = textString;
    this.populate = function() {
        if (this.textString) {
            this.elCtlAnchor.value = this.textString;
        }
    };
};
Controls.TextInputCtl.prototype = new Controls.BaseCtl();

Controls.EmailInputCtl = function(elDivCtl, textString) {
    this.elRoot = elDivCtl;
    this.elCtlAnchor = this.elRoot.getElementsByClassName("text-input")[0];
    this.elCtlAnchor.value = "";  // clear
    this.textString = textString;

    this.populate = function() {
        if (this.textString) {
            this.elCtlAnchor.value = this.textString;
        }
    };
    this.isValid = function() {
        var text = this.getValue();
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(text);
    };
};
Controls.EmailInputCtl.prototype = new Controls.BaseCtl();

Controls.EmailConfirmInputCtl = function(elDivCtl, emailInputCtlToMatch, textString) {
    this.elRoot = elDivCtl;
    this.elCtlAnchor = this.elRoot.getElementsByClassName("text-input")[0];
    this.elCtlAnchor.value = "";  // clear
    this.textString = textString;
    this.emailInputCtlToMatch = emailInputCtlToMatch;

    this.populate = function() {
        if (this.textString) {
            this.elCtlAnchor.value = this.textString;
        }
    };
    this.isValid = function() {
        var text = this.getValue();
        var textPrimaryEmailEntry = this.emailInputCtlToMatch.getValue();
        return(text === textPrimaryEmailEntry && this.emailInputCtlToMatch.isValid());
    };
};
Controls.EmailConfirmInputCtl.prototype = new Controls.BaseCtl();

Controls.AmtCtl = function(elDivCtl, arrOptionValues) {
    this.elRoot = elDivCtl;
    this.elCtlAnchor = this.elRoot.getElementsByClassName("amt-control")[0];
    this.arrOptionValues = arrOptionValues;  // list of numbers

    this.createOptions = function() {
        var arrOptions = [];
        arrOptions.push({
            "value": "",
            "display": "Select"
        });
        for (var i = 0; i < this.arrOptionValues.length; i++) {
            var optionValue = this.arrOptionValues[i];
            arrOptions.push({
                "value": optionValue,
                "display": "$ " + optionValue
            });
        }
        return arrOptions;
    };
};
Controls.AmtCtl.prototype = new Controls.SelectCtl();

Controls.DesignSelectorCtl = function(elSection, vsDesignsData, currentItemNumber) {
    this.elRoot = elSection;
    this.elCtlAnchor = elSection.getElementsByClassName("design-options")[0];
    var _vsDesignsData = vsDesignsData;
    var _currentItemNumber = currentItemNumber; // needed for name=item[xxx] 
    var _elMainImage;
    var _submitName = "image";
    var _counter = 0;
    
    if (currentItemNumber === 0) { // first module on page
        _elMainImage = document.getElementById('main-page-img');
    } else {
        _elMainImage = this.elRoot.getElementsByClassName("main-image-display")[0];
    }

    var _handleChangeSelection = function(elSelectedSwatch) {
        elSelectedSwatch.checked = true;
        var img_url = elSelectedSwatch.getAttribute("main-img-url");
        _elMainImage.src = img_url;
    };
    var _createSingleOptionElement = function(option, id) {
        var input = document.createElement("input");
        input.id = id;
        input.type = "radio";
        input.name = "items[" + _currentItemNumber + "]." + _submitName;
        input.title = option.title;
        input.value = option.value;
        input.setAttribute("main-img-url", option.img_full_url);

        return input;
    };
    var _createLabelElement = function(option, id) {
        var label = document.createElement("label");
        label.setAttribute("for", id);
        label.style.backgroundImage = "url(" + option.img_thumb_url + ")";
        return label;
    };
    this.populate = function() {
        for (var i = 0; i < _vsDesignsData.length; i++) {
            var id = "button_" + _currentItemNumber + "_" + _counter++;
            this.elCtlAnchor.appendChild(_createSingleOptionElement(_vsDesignsData[i], id));
            this.elCtlAnchor.appendChild(_createLabelElement(_vsDesignsData[i], id));
        }
    };
    this.setDefaultMainImage = function() {
        var elFirstSwatch = this.elCtlAnchor.getElementsByTagName("input")[0];
        elFirstSwatch.checked = true;
        var img_url = elFirstSwatch.getAttribute("main-img-url");
        _elMainImage.src = img_url;
    };
    this.postProcess = function() {
        this.setDefaultMainImage();
    };
    this.arm = function() {
        var inputs = this.elCtlAnchor.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].addEventListener('click', function(event) {
                _handleChangeSelection(this);
            });
        }
    };
    this.getValue = function() {
        var buttons = this.elCtlAnchor.getElementsByTagName('input');
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].checked) {
                return buttons[i].value;
            }
        }
        return null;  // checked not found
    };
    this.getName = function() {
        var firstButton = this.elCtlAnchor.getElementsByTagName('input')[0];
        return firstButton.getAttribute("name");
    };
};
Controls.DesignSelectorCtl.prototype = new Controls.BaseCtl();

Controls.MessageWithCountdown = function(elDivCtl, textString) {
    this.elRoot = elDivCtl;
    this.elCtlAnchor = this.elRoot.getElementsByTagName("textarea")[0];
    this.elCountSpan = this.elRoot.getElementsByTagName("span")[0];
    this.textString = textString;
    this.elCtlAnchor.value = "";  // clear

    this.updateCount = function() {
        var maxCharsAllowed = this.elCtlAnchor.getAttribute('maxlength');
        var numCharsDisplayed = this.elCtlAnchor.value.length;
        var displayValue = maxCharsAllowed - numCharsDisplayed;
        this.elCountSpan.innerHTML = displayValue;

    };
    this.handleKeyupEvent = function() {
        this.updateCount();
    };
    this.populate = function() {
        if (this.textString) {
            this.elCtlAnchor.value = this.textString;
            this.updateCount();
        }
    };
    this.arm = function() {
        var _this = this;
        this.elCtlAnchor.addEventListener('keyup', function() {
            _this.handleKeyupEvent();
        });
    };
};
Controls.MessageWithCountdown.prototype = new Controls.BaseCtl();

Controls.DayCtl = function(elSelectCtl, vsDateRange) {
    this.elRoot = elSelectCtl;
    this.elCtlAnchor = this.elRoot.getElementsByClassName("selector")[0];
    this.vsDateRange = vsDateRange;
    var _arrOptionValues;
    this.monthDisplayedIdx = 0;

    var _getNumbersArray = function(min, max) {
        for (var arr = [], i = min; i <= max; arr.push(i++)) {
        }
        return arr;
    };
    this.setOptionValues = function() {
        var arrDateRange = this.vsDateRange[this.monthDisplayedIdx];
        _arrOptionValues = _getNumbersArray(arrDateRange[0], arrDateRange[1]);
    };
    this.createOptions = function() {
        this.setOptionValues();
        var arrOptions = [];
        for (var i = 0; i < _arrOptionValues.length; i++) {
            arrOptions.push({
                "value": _arrOptionValues[i],
                "display": _arrOptionValues[i]
            });
        }
        return arrOptions;
    };
    this.populate = function() {
        this.setOptionValues();
        var newDayToDisplayValue;
        var existingDayDisplayedIdx = this.getSelectedIdx();
        var minAvailableDayValue = _arrOptionValues[0];
        var maxAvailableDayValue = _arrOptionValues[_arrOptionValues.length - 1];
        if (existingDayDisplayedIdx === -1) { // on init, no day displayed yet
            newDayToDisplayValue = minAvailableDayValue; // today=min day current month
        } else {
            // note: displayed value not same as select index
            var existingDayDisplay = this.getValue();
            if (existingDayDisplay < minAvailableDayValue) {
                newDayToDisplayValue = minAvailableDayValue;
            } else if (existingDayDisplay > maxAvailableDayValue) {
                newDayToDisplayValue = maxAvailableDayValue;
            } else {
                newDayToDisplayValue = existingDayDisplay; // in range
            }
        }
        this.selectedIdx = _arrOptionValues.indexOf(parseInt(newDayToDisplayValue));
        var arrOptions = this.createOptions();
        this.elCtlAnchor.options.length = 0; //clear list
        for (var i = 0; i < arrOptions.length; i++) {
            var option = arrOptions[i];
            var isSelected = (i === this.selectedIdx);
            this.elCtlAnchor.add(new Option(
                    option.display, option.value, isSelected, isSelected));
        }
    };
    this.setMonthDisplayIdx = function(idx) {
        this.monthDisplayedIdx = idx;
    };
};
Controls.DayCtl.prototype = new Controls.SelectCtl();

Controls.MonthCtl = function(elSelectCtl, onChangeTargetCtl, vsDateRange) {
    this.vsDateRange = vsDateRange;
    this.elRoot = elSelectCtl;
    this.elCtlAnchor = this.elRoot.getElementsByClassName("selector")[0];
    var _targetCtl = onChangeTargetCtl;
    var _monthsOfYear = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.arrOptionValues = [];

    this.populate = function() {
        this.setOptionsValues();
        this.elCtlAnchor.options.length = 0; //clear list
        var arrOptions = this.createOptions();
        for (var i = 0; i < arrOptions.length; i++) {
            var option = arrOptions[i];
            var isSelected = (i === this.selectedIdx);
            this.elCtlAnchor.add(new Option(
                    option.display, option.value, isSelected, isSelected));
        }
    };
    this.setOptionsValues = function() {
        var arrOptionValues = [];
        var thisMonthIdx = new Date().getMonth();
        for (var i = 0; i < this.vsDateRange.length; i++) {
            var monthIdx = (thisMonthIdx + i) % _monthsOfYear.length;
            arrOptionValues.push(_monthsOfYear[monthIdx]);
        }
        this.arrOptionValues = arrOptionValues;
    };
    this.createOptions = function() {
        var arrOptions = [];
        for (var i = 0; i < this.arrOptionValues.length; i++) {
            arrOptions.push({
                "value": this.arrOptionValues[i],
                "display": this.arrOptionValues[i]
            });
        }
        return arrOptions;
    };
    this.arm = function() {
        var _this = this;
        this.elRoot.onchange = function() {
            _targetCtl.setMonthDisplayIdx(_this.getSelectedIdx());
            _targetCtl.populate();
        };
    };
};
Controls.MonthCtl.prototype = new Controls.SelectCtl();