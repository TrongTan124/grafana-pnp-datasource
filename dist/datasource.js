'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.url = instanceSettings.url;
          this.name = instanceSettings.name;
          this.fill = instanceSettings.fill;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: 'query',
          value: function query(options) {
            var query = this.buildQueryParameters(options);
            query.targets = query.targets.filter(function (t) {
              return !t.hide;
            });

            if (query.targets.length <= 0) {
              return this.q.when({ data: [] });
            }

            query.start = Number(options.range.from.toDate().getTime() / 1000).toFixed();
            query.end = Number(options.range.to.toDate().getTime() / 1000).toFixed();

            var me = this;
            return this.backendSrv.datasourceRequest({
              url: this.url + '/index.php/api/metrics',
              data: query,
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }).then(function (result) {
              return me.dataQueryMapper(result, options);
            });
          }
        }, {
          key: 'dataQueryMapper',
          value: function dataQueryMapper(result, options) {
            var data = { data: [] };
            for (var x = 0; x < result.data.targets.length; x++) {
              var target = options.targets[x];
              var alias = target.perflabel;
              if (target.alias) {
                alias = target.alias;
              }
              var fill = options.targets[x].fill;
              if (fill != "fill") {
                if (fill == "zero") {
                  fill = 0;
                }
                if (fill == "gap") {
                  fill = undefined;
                }
                var datapoints = result.data.targets[x][0].datapoints;
                var length = datapoints.length;
                for (var y = 0; y < length; y++) {
                  if (datapoints[y][0] === null) {
                    datapoints[y][0] = fill;
                  }
                }
              }
              data.data.push({
                "target": alias,
                "datapoints": result.data.targets[x][0].datapoints
              });
            }
            return data;
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            return this.backendSrv.datasourceRequest({
              url: this.url + '/index.php/api',
              method: 'GET'
            }).then(function (response) {
              if (response.status === 200) {
                return { status: "success", message: "Data source is working", title: "Success" };
              }
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(options, type) {
            var interpolated = {
              host: this.templateSrv.replace(options.host, null, 'regex')
            };

            var mapper = this.mapToTextValueHost;
            var url = this.url + '/index.php/api/hosts';
            if (type == "service") {
              url = this.url + '/index.php/api/services/' + options.host, mapper = this.mapToTextValueService;
            }
            if (type == "perflabel") {
              url = this.url + '/index.php/api/labels/' + options.host + '/' + options.service, mapper = this.mapToTextValuePerflabel;
            }

            return this.backendSrv.datasourceRequest({
              url: url,
              data: interpolated,
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            }).then(mapper);
          }
        }, {
          key: 'mapToTextValueHost',
          value: function mapToTextValueHost(result) {
            return _.map(result.data.hosts, function (d, i) {
              return { text: d.name, value: d.name };
            });
          }
        }, {
          key: 'mapToTextValueService',
          value: function mapToTextValueService(result) {
            return _.map(result.data.services, function (d, i) {
              return { text: d.name, value: d.name };
            });
          }
        }, {
          key: 'mapToTextValuePerflabel',
          value: function mapToTextValuePerflabel(result) {
            return _.map(result.data.labels, function (d, i) {
              return { text: d.name, value: d.name };
            });
          }
        }, {
          key: 'buildQueryParameters',
          value: function buildQueryParameters(options) {
            var _this = this;

            //remove placeholder targets
            options.targets = _.filter(options.targets, function (target) {
              return target.host !== 'select host';
            });
            options.targets = _.filter(options.targets, function (target) {
              return target.service !== 'select service';
            });
            options.targets = _.filter(options.targets, function (target) {
              return target.perflabel !== 'select performance label';
            });

            var targets = _.map(options.targets, function (target) {
              return {
                host: _this.templateSrv.replace(target.host),
                service: _this.templateSrv.replace(target.service),
                perflabel: _this.templateSrv.replace(target.perflabel),
                alias: _this.templateSrv.replace(target.alias),
                type: _this.templateSrv.replace(target.type),
                fill: _this.templateSrv.replace(target.fill),
                refId: target.refId,
                hide: target.hide
              };
            });

            options.targets = targets;

            return options;
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
