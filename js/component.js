/**
 * @constructor
 */
CLifeComponent = function () {
	this.events_ = {}; // события, чтобы подписываться на них извне компонентов
};

/**
 * @param eventName
 * @param callback
 */
CLifeComponent.prototype.listen = function (eventName, callback) {
	if (!this.events_[eventName]) {
		this.events_[eventName] = [];
	}
	this.events_[eventName].push(callback);
};

/**
 * @param eventName
 * @param data
 */
CLifeComponent.prototype.fireEvent = function (eventName, data) {
	let events = this.events_[eventName];
	if (events) {
		for (let i = 0, ln = events.length; i < ln; i++) {
			events[i](data);
		}
	}
};

/**
 * @param eventName
 * @param {function=} callback
 */
CLifeComponent.prototype.unlisten = function (eventName, callback) {
	let events = this.events_[eventName];
	if (events) {
		if (callback) {
			for (let i = 0, ln = events.length; i < ln; i++) {
				if (callback === events[i]) {
					delete events[i];
					break;
				}
			}
		}
		else {
			delete this.events_[eventName];
		}
	}
};

CLifeComponent.extend = function (Child, Parent) {
	var F = function () {};
	F.prototype = Parent.prototype;
	Child.prototype = new F();
	Child.prototype.constructor = Child;
	Child.superclass = Parent.prototype;
	return true;
};