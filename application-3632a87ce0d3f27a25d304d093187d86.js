var App;

App = (function() {

  function App() {
    var _this = this;
    this.form = $('form');
    this.input = $('input');
    this.list = $('#departures-list');
    this.filteredDirectionText = 'Zürich, ';
    this.stationsList = new StationsList;
    this.stationsSuggester = new StationsSuggester({
      stationsList: this.stationsList,
      searchField: this.input
    });
    this.stateController = new StateController(function(state) {
      return _this.stateChanged(state);
    });
    this.form.submit(function(event) {
      event.preventDefault();
      return _this.stateController.setState(_this.input.val());
    });
    this.list.on('click', function() {
      return _this.list.toggleClass('countdown');
    });
    this.input.on('keydown', function() {
      return _this.input.removeClass('error');
    });
  }

  App.prototype.stateChanged = function(state) {
    if (state) {
      return this.performQuery(state);
    } else {
      return this.reset();
    }
  };

  App.prototype.performQuery = function(query) {
    var _this = this;
    if (this.activeQuery && this.activeQuery.station === query) {
      console.log('abort');
      return;
    }
    if (this.activeQuery) {
      this.activeQuery.stop();
    }
    this.activeQuery = new Query(query, {
      error: (function() {
        return _this.queryFailed();
      }),
      success: (function() {
        return _this.queryLoaded();
      })
    });
    return this.activeQuery.start(function(departures) {
      return _this.listDepartures(departures);
    });
  };

  App.prototype.queryFailed = function() {
    this.stateController.setState('');
    return this.input.addClass('error');
  };

  App.prototype.queryLoaded = function() {
    this.input.val(this.activeQuery.station);
    this.input.select();
    this.stateController.setState(this.activeQuery.station);
    return this.stationsList.hide();
  };

  App.prototype.reset = function() {
    this.activeQuery = null;
    this.input.select();
    return this.list.empty();
  };

  App.prototype.listDepartures = function(departures) {
    var departure, _i, _len, _results;
    this.list.empty();
    if (departures.length > 0) {
      this.list.removeClass('empty');
      _results = [];
      for (_i = 0, _len = departures.length; _i < _len; _i++) {
        departure = departures[_i];
        _results.push(this.list.append(this.listItemForDeparture(departure)));
      }
      return _results;
    } else {
      return this.list.addClass('empty');
    }
  };

  App.prototype.listItemForDeparture = function(departure) {
    var li, line, time;
    li = $('<li/>').addClass('departure');
    this.spanForListItem(li, 'countdown', departure.countdown);
    if (departure.status) {
      this.spanForListItem(li, 'status', departure.status);
    }
    this.spanForListItem(li, 'direction', this.filterDirectionText(departure.direction));
    time = this.spanForListItem(li, 'time', departure.actualTime);
    if (departure.delay) {
      time.addClass('delayed');
    }
    line = this.spanForListItem(li, 'line', departure.line);
    if (departure.colors) {
      line.css('color', departure.colors[0]).css('background-color', departure.colors[1]);
    }
    return li;
  };

  App.prototype.spanForListItem = function(li, className, text) {
    return $('<span/>').addClass(className).text(text).appendTo(li);
  };

  App.prototype.filterDirectionText = function(text) {
    return text.replace(this.filteredDirectionText, '');
  };

  return App;

})();
var Departure;

Departure = (function() {

  function Departure(data) {
    var color;
    this.scheduledTime = data.ti;
    this.delayedTime = data.rt.dlt;
    this.delay = parseInt(data.rt.dlm);
    this.countdown = parseInt(data.countdown_val);
    this.line = data.pr;
    if (data.lc) {
      this.colors = (function() {
        var _i, _len, _ref, _results;
        _ref = data.lc.split(' ');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          color = _ref[_i];
          _results.push("#" + color);
        }
        return _results;
      })();
    }
    this.status = data.rt.status;
    this.direction = data.st;
    this.actualTime = this.delayedTime || this.scheduledTime;
  }

  return Departure;

})();
var HashUtil;

HashUtil = {
  encode: function(string) {
    return encodeURI(string.replace(' ', '+'));
  },
  decode: function(string) {
    return decodeURI(string.replace('+', ' '));
  }
};
var Query;

Query = (function() {

  Query.prototype.nop = function() {};

  Query.prototype.refreshInterval = 15000;

  function Query(query, callbacks) {
    this.query = query;
    this.successCallback = callbacks.success || nop;
    this.errorCallback = callbacks.error || nop;
  }

  Query.prototype.start = function(departuresCallback) {
    this.departuresCallback = departuresCallback;
    return this.requestSchedule();
  };

  Query.prototype.stop = function() {
    if (this.interval) {
      return this.stopRefreshing();
    }
  };

  Query.prototype.requestSchedule = function() {
    var request,
      _this = this;
    request = new ScheduleRequest(this.query);
    return request.perform(function(schedule) {
      return _this.scheduleLoaded(schedule);
    });
  };

  Query.prototype.scheduleLoaded = function(schedule) {
    if (schedule) {
      this.queryLoaded(schedule.station);
      return this.departuresCallback(schedule.departures);
    } else {
      return this.errorCallback();
    }
  };

  Query.prototype.queryLoaded = function(station) {
    this.station = station;
    if (!this.loadedBefore) {
      this.loadedBefore = true;
      this.successCallback();
      return this.startRefreshing();
    }
  };

  Query.prototype.startRefreshing = function() {
    var _this = this;
    return this.interval = setInterval((function() {
      return _this.requestSchedule();
    }), this.refreshInterval);
  };

  Query.prototype.stopRefreshing = function() {
    clearInterval(this.interval);
    return this.departuresCallback = this.nop;
  };

  return Query;

})();
var Schedule;

Schedule = (function() {

  function Schedule(data) {
    this.station = data.stationName;
    this.departures = (function() {
      var _i, _len, _ref, _results;
      _ref = data.journey || [];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        data = _ref[_i];
        _results.push(new Departure(data));
      }
      return _results;
    })();
  }

  return Schedule;

})();
var ScheduleRequest;

ScheduleRequest = (function() {

  function ScheduleRequest(query) {
    this.query = query;
  }

  ScheduleRequest.prototype.perform = function(callback) {
    var _this = this;
    this.callback = callback;
    return $.getScript(this.url(), function() {
      return _this.requestLoaded();
    });
  };

  ScheduleRequest.prototype.url = function() {
    return "http://online.fahrplan.zvv.ch/bin/stboard.exe/dn?L=vs_widgets&boardType=dep&maxJourneys=20&start=yes&monitor=0&requestType=0&timeFormat=cd&input=" + this.query + "&" + (+(new Date));
  };

  ScheduleRequest.prototype.requestLoaded = function() {
    var data;
    data = journeysObj;
    if (data && data.stationName !== '') {
      return this.callback(new Schedule(data));
    } else {
      return this.callback();
    }
  };

  return ScheduleRequest;

})();
var StateController;

StateController = (function() {

  function StateController(callback) {
    var _this = this;
    this.callback = callback;
    this.titleElement = $('title');
    this.baseTitle = this.titleElement.text();
    window.onhashchange = function() {
      return _this.stateChanged();
    };
    this.stateChanged();
  }

  StateController.prototype.state = function() {
    var state;
    state = HashUtil.decode(location.hash.replace('#', ''));
    if (state.length > 0) {
      return state;
    }
  };

  StateController.prototype.setState = function(state) {
    return location.hash = HashUtil.encode(state);
  };

  StateController.prototype.stateChanged = function() {
    this.updateTitle();
    return this.callback(this.state());
  };

  StateController.prototype.updateTitle = function() {
    return this.titleElement.text([this.baseTitle, this.state()].filter(function(i) {
      return !!i;
    }).join(' | '));
  };

  return StateController;

})();
var StationsList;

StationsList = (function() {

  StationsList.prototype.UPKEY = 38;

  StationsList.prototype.DOWNKEY = 40;

  StationsList.prototype.ENTERKEY = 13;

  function StationsList() {
    var _this = this;
    this.container = $('#stations-list');
    this.stations = [];
    $(window).keydown(function(event) {
      switch (event.keyCode) {
        case _this.UPKEY:
          return _this.decreaseSelection();
        case _this.DOWNKEY:
          return _this.increaseSelection();
        case _this.ENTERKEY:
          return _this.followSelection();
      }
    });
  }

  StationsList.prototype.setStations = function(stations) {
    var i, _i, _len;
    this.resetSelection();
    this.show();
    if (this.stationsDifferFromCurrentStations(stations)) {
      this.stations = stations;
      this.container.empty();
      for (_i = 0, _len = stations.length; _i < _len; _i++) {
        i = stations[_i];
        this.container.append(this.stationItem(i));
      }
      return this.selectStationIfOnlyOne();
    }
  };

  StationsList.prototype.show = function() {
    return this.container.show();
  };

  StationsList.prototype.hide = function() {
    return this.container.hide();
  };

  StationsList.prototype.stationItem = function(station) {
    return $('<li/>').addClass('station').append(this.stationLink(station));
  };

  StationsList.prototype.stationLink = function(station) {
    return $('<a/>').attr('href', "#" + (HashUtil.encode(station))).text(station);
  };

  StationsList.prototype.stationsDifferFromCurrentStations = function(stations) {
    var i, _i, _ref;
    if (stations.length === this.stations.length) {
      for (i = _i = 0, _ref = stations.length; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (stations[i] !== this.stations[i]) {
          return true;
        }
      }
      return false;
    } else {
      return true;
    }
  };

  StationsList.prototype.selectStationIfOnlyOne = function() {
    if (this.stations.length === 1) {
      return this.selectStationAtIndex(0);
    }
  };

  StationsList.prototype.selectStationAtIndex = function(selectedIndex) {
    this.selectedIndex = selectedIndex;
    this.container.find('li').removeClass('selected');
    return this.container.find("li:eq(" + this.selectedIndex + ")").addClass('selected');
  };

  StationsList.prototype.resetSelection = function() {
    return this.selectedIndex = -1;
  };

  StationsList.prototype.increaseSelection = function() {
    return this.selectStationAtIndex((this.selectedIndex + 1) % this.stations.length);
  };

  StationsList.prototype.decreaseSelection = function() {
    if (this.selectedIndex <= 0) {
      return this.selectStationAtIndex(this.maxPossibleSelectionIndex());
    } else {
      return this.selectStationAtIndex(this.selectedIndex - 1);
    }
  };

  StationsList.prototype.followSelection = function() {
    return console.log(this.container.find("li:eq(" + this.selectedIndex + ") a").text());
  };

  StationsList.prototype.maxPossibleSelectionIndex = function() {
    return this.container.find('li').length - 1;
  };

  return StationsList;

})();
var SLs, StationsRequest;

StationsRequest = (function() {

  function StationsRequest(query) {
    this.query = query;
  }

  StationsRequest.prototype.perform = function(callback) {
    var _this = this;
    this.callback = callback;
    return $.getScript(this.url(), function() {
      return _this.requestLoaded();
    });
  };

  StationsRequest.prototype.url = function() {
    return "http://online.fahrplan.zvv.ch/bin/ajax-getstop.exe/eny?REQ0JourneyStopsS0A=255&REQ0JourneyStopsB=10&REQ0JourneyStopsS0G=" + this.query;
  };

  StationsRequest.prototype.requestLoaded = function() {
    return this.callback(this.extractStationNames(this.rejectNonStations(SLs.sls.suggestions)));
  };

  StationsRequest.prototype.rejectNonStations = function(data) {
    if (data == null) {
      data = [];
    }
    return data.filter(function(i) {
      return i.type === '1';
    });
  };

  StationsRequest.prototype.extractStationNames = function(data) {
    var i, _i, _len, _results;
    if (data == null) {
      data = [];
    }
    _results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      i = data[_i];
      _results.push(i.value);
    }
    return _results;
  };

  return StationsRequest;

})();

SLs = {
  showSuggestion: function() {}
};
var StationsSuggester;

StationsSuggester = (function() {

  function StationsSuggester(elements) {
    var _this = this;
    this.stationsList = elements.stationsList;
    this.searchField = elements.searchField;
    this.searchField.on('keyup', function() {
      return _this.suggest(_this.searchField.val());
    });
  }

  StationsSuggester.prototype.suggest = function(query) {
    if (this.query !== query) {
      this.query = query;
      return this.requestStations();
    }
  };

  StationsSuggester.prototype.requestStations = function() {
    var request,
      _this = this;
    request = new StationsRequest(this.query);
    return request.perform(function(stations) {
      return _this.stationsList.setStations(stations);
    });
  };

  return StationsSuggester;

})();

new App;
