var Utils = Utils || {};

Utils.Classes = {
    hasClass: function(el, name) {
        return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className);
    },
    addClass: function(el, name)
    {
        if (!this.hasClass(el, name)) {
            el.className += (el.className ? ' ' : '') + name;
        }
    },
    removeClass: function(el, name)
    {
        if (this.hasClass(el, name)) {
            el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, '');
        }
    }
};
