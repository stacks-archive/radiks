"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _v = _interopRequireDefault(require("uuid/v4"));

var blockstack = _interopRequireWildcard(require("blockstack"));

var _merge = _interopRequireDefault(require("lodash/merge"));

var _pouchdb = _interopRequireDefault(require("pouchdb"));

var _pouchdbFind = _interopRequireDefault(require("pouchdb-find"));

var _helpers = require("./helpers");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// PouchDB.plugin(PouchDebug);
_pouchdb.default.plugin(_pouchdbFind.default);

let Model =
/*#__PURE__*/
function () {
  _createClass(Model, null, [{
    key: "fromSchema",
    value: function fromSchema(schema) {
      this.schema = schema;
      return this;
    }
  }, {
    key: "fetch",
    value: function (_fetch) {
      function fetch() {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function () {
      var _this = this;

      return Promise.resolve().then(function () {
        return fetch(_this.apiServerPath());
      }).then(function (_resp) {
        const request = _resp;
        return request.json();
      });
    })
  }, {
    key: "fetchList",
    value: function fetchList(selector, options = {}) {
      var _this2 = this;

      return Promise.resolve().then(function () {
        selector.radiksType = _this2.name;

        const db = _this2.db();

        return db.find(_objectSpread({
          selector
        }, options));
      }).then(function (_resp) {
        const {
          docs
        } = _resp;
        console.log(_this2);
        const clazz = _this2; // console.log(docs);

        const models = docs.map(doc => {
          const model = new clazz(doc);
          model.decrypt();
          return model;
        });
        return models;
      });
    }
  }]);

  function Model(attrs = {}) {
    _classCallCheck(this, Model);

    const {
      schema,
      defaults,
      name
    } = this.constructor;
    this.schema = schema;
    this.id = attrs.id || (0, _v.default)();
    const {
      username
    } = blockstack.loadUserData();
    this.attrs = (0, _merge.default)({}, defaults, attrs, {
      createdBy: username,
      radiksType: name
    });
  }

  _createClass(Model, [{
    key: "hello",
    value: function hello() {
      console.log(this.schema);
    }
  }, {
    key: "fetchSchema",
    value: function fetchSchema() {
      var _this3 = this;

      return Promise.resolve().then(function () {
        const {
          name
        } = _this3.schema;
        const url = `${_this3.constructor.apiServer}/radiks/models/${name}/schema`; // console.log(url);

        return fetch(url);
      }).then(function (_resp) {
        const request = _resp;
        return request.json();
      }).then(function (_resp) {
        const data = _resp;
        return data;
      });
    }
  }, {
    key: "save",
    value: function save() {
      const encrypted = this.encrypted();
      return Promise.all([this.saveFile(encrypted), this.saveItem(), this.saveToDB(encrypted)]);
    }
  }, {
    key: "encrypted",
    value: function encrypted() {
      return (0, _helpers.encryptObject)(this);
    }
  }, {
    key: "saveFile",
    value: function saveFile(encrypted) {
      // console.log(this);
      // const data = encryptObject(this);
      // console.log(data);
      return blockstack.putFile(this.blockstackPath(), JSON.stringify(encrypted), {
        encrypt: false
      });
    }
  }, {
    key: "blockstackPath",
    value: function blockstackPath() {
      const path = `${this.constructor.name}/${this.id}`;
      return path;
    }
  }, {
    key: "saveItem",
    value: function saveItem() {
      return new Promise((resolve, reject) => {
        var _this4 = this;

        return Promise.resolve().then(function () {
          const itemsPath = 'items';
          return Promise.resolve().then(function () {
            return blockstack.getFile(itemsPath, {
              decrypt: false
            });
          }).then(function (_resp) {
            let items = _resp;

            const filePath = _this4.blockstackPath(); // console.log(items);


            items += `\n${filePath}`;
            return blockstack.putFile(itemsPath, items, {
              encrypt: false
            });
          }).then(function (_resp) {
            resolve(_resp);
          }).catch(function (error) {
            reject(error);
          });
        }).then(function () {});
      });
    }
  }, {
    key: "saveToDB",
    value: function saveToDB(encrypted) {
      var _this5 = this;

      return Promise.resolve().then(function () {
        // PouchDB.debug.enable('*');
        // console.log(encrypted);
        const filePath = _this5.blockstackPath();

        const attributes = (0, _merge.default)({}, encrypted, {
          filePath
        }); // console.log('data for radiks', attributes);

        const db = _this5.db();

        attributes._id = attributes.id;
        return Promise.resolve().then(function () {
          return db.put(attributes);
        }).then(function (_resp) {
          const result = _resp;
          _this5.attrs._rev = result.rev;
        }).catch(function (error) {
          console.error('Error when saving to PouchDB', error);
          throw error;
        });
      }).then(function () {});
    }
  }, {
    key: "db",
    value: function db() {
      return this.constructor.db();
    }
  }, {
    key: "fetch",
    value: function fetch() {
      var _this6 = this;

      return Promise.resolve().then(function () {
        return _this6.db().get(_this6.id);
      }).then(function (_resp) {
        const attrs = _resp;
        _this6.attrs = (0, _merge.default)(attrs, _this6.attrs);

        _this6.decrypt();

        if (_this6.afterFetch) {
          return _this6.afterFetch();
        }
      }).then(function () {
        return _this6;
      });
    }
  }, {
    key: "decrypt",
    value: function decrypt() {
      this.attrs = (0, _helpers.decryptObject)(this.attrs, this.constructor);
    }
  }, {
    key: "apiServerPath",
    value: function apiServerPath(path) {
      return this.constructor.apiServerPath(path);
    }
  }, {
    key: "update",
    value: function update(attrs) {
      this.attrs = _objectSpread({}, this.attrs, attrs);
    }
  }], [{
    key: "db",
    value: function db() {
      return new _pouchdb.default('http://127.0.0.1:5984/kanstack', {
        auth: _objectSpread({}, (0, _helpers.authOptions)())
      });
    }
  }, {
    key: "apiServerPath",
    value: function apiServerPath(path) {
      let url = `${this.apiServer}/radiks/models/${this.constructor.name}`;

      if (path) {
        url += `/${path}`;
      }

      return url;
    }
  }]);

  return Model;
}();

exports.default = Model;

_defineProperty(Model, "apiServer", null);

_defineProperty(Model, "defaults", {});