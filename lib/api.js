"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sendLoginSignedMessage = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const sendLoginSignedMessage = (signed, username) => {
  return Promise.resolve().then(function () {
    const uri = `${document.location.origin}/radiks/auth/login`;

    const data = _objectSpread({
      username
    }, signed, {
      origin: document.location.origin
    });

    console.log(data);
    return fetch(uri, {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
      body: JSON.stringify(data)
    });
  }).then(function (_resp) {
    const request = _resp;
    return request.json();
  }).then(function (_resp) {
    const {
      success
    } = _resp;
    return success;
  });
};

exports.sendLoginSignedMessage = sendLoginSignedMessage;