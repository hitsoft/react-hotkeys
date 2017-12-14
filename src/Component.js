var React = require('react');

var isEmpty = require('lodash/isEmpty');
var difference = require('lodash/difference');
var isEqual = require('lodash/isEqual');
var isFunction = require('lodash/isFunction');

module.exports = React.createClass({
  propTypes: {
    keys: React.PropTypes.array,
    simultaneous: React.PropTypes.bool,
    onKeysCoincide: React.PropTypes.func
  },

  getInitialState: function initialState() {
    var props = this.props || {};
    var keys = props.keys || [];
    var keysMap = {};

    keys.forEach(function iterator(key) {
      keysMap[key] = true;
    });

    return {
      buffer: [],
      eventsBuffer: [],
      maxLength: (props.keys && props.keys.length) || 0,
      keys: keys,
      keysMap: keysMap
    };
  },

  componentDidMount: function didMount() {
    document.addEventListener('keydown', this.onKeyPress);
  },

  componentWillUnmount: function willUnmount() {
    document.removeEventListener('keydown', this.onKeyPress);
  },

  onKeyPress: function keyPress(e) {
    var props = this.props || {};
    var state = this.state || {};

    var keys = state.keys;
    var keysMap = state.keysMap;
    var onKeysCoincide = props.onKeysCoincide;
    var simultaneous = props.simultaneous;

    var buffer = state.buffer || [];
    var eventsBuffer = state.eventsBuffer || [];

    var maxLength = state.maxLength || 0;

    var key = (e && e.key && e.key.toLowerCase()) || null;
    var keyCode = (e && e.keyCode) || null;

    var newBuffer = [];
    var newEventsBuffer = [];

    var isKeySetEmpty;
    var areKeysPressedTogether;
    var areKeysPressedSequently;

    if (key && !keysMap[key]) {
      key = null;
    }
    if (keyCode && !keysMap[keyCode]) {
      keyCode = null;
    }

    function appendBuffer(value) {
      var result;
      if (buffer.length >= maxLength) {
        result = buffer.slice(1).concat(value);
      } else {
        result = buffer.concat(value);
      }
      return result;
    }

    if (key || keyCode) {
      if (buffer.length >= maxLength) {
        newEventsBuffer = eventsBuffer.slice(1).concat(e);
      } else {
        newEventsBuffer = eventsBuffer.concat(e);
      }
      newBuffer = buffer;
      if (key) {
        newBuffer = appendBuffer(key);
      }
      if (keyCode) {
        newBuffer = appendBuffer(keyCode);
      }
    }

    isKeySetEmpty = !maxLength || (maxLength === 0);
    areKeysPressedTogether = simultaneous && isEmpty(difference(keys, newBuffer));
    areKeysPressedSequently = !simultaneous && isEqual(keys, newBuffer);

    if (!isKeySetEmpty) {
      if ((areKeysPressedTogether || areKeysPressedSequently)
          && isFunction(onKeysCoincide)) {
        onKeysCoincide(newBuffer, newEventsBuffer);
        this.setState({
          buffer: [],
          eventsBuffer: []
        });
      } else {
        this.setState({
          buffer: newBuffer,
          eventsBuffer: newEventsBuffer
        });
      }
    }
  },

  render: function renderComponent() {
    return null;
  },

  getDefaultProps: function defaultProps() {
    return {
      keys: [],
      simultaneous: false
    };
  }
});
