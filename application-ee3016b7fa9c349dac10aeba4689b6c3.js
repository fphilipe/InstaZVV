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
var Request;

Request = (function() {

  function Request(query) {
    this.query = query;
  }

  Request.prototype.perform = function(callback) {
    var _this = this;
    this.callback = callback;
    return $.getScript(this.url(), function() {
      return _this.requestLoaded();
    });
  };

  Request.prototype.url = function() {
    return "http://online.fahrplan.zvv.ch/bin/stboard.exe/dn?L=vs_widgets&boardType=dep&maxJourneys=20&start=yes&monitor=0&requestType=0&timeFormat=cd&input=" + this.query;
  };

  Request.prototype.requestLoaded = function() {
    var data;
    data = journeysObj;
    if (data && data.stationName !== '') {
      return this.callback(new Schedule(data));
    } else {
      return this.callback();
    }
  };

  return Request;

})();
var Schedule;

Schedule = (function() {

  function Schedule(data) {
    this.station = data.stationName;
    this.departures = (function() {
      var _i, _len, _ref, _results;
      _ref = data.journey;
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
var UI;

UI = (function() {

  function UI() {
    var _this = this;
    this.form = $('form');
    this.input = $('input');
    this.list = $('ul');
    this.filteredDirectionText = 'Zürich, ';
    this.form.submit(function(event) {
      event.preventDefault();
      return _this.doRequest(_this.input.val());
    });
    this.list.on('click', function() {
      return _this.list.toggleClass('countdown');
    });
    this.doRequest('zurich hb');
  }

  UI.prototype.doRequest = function(query) {
    var request,
      _this = this;
    request = new Request(query);
    return request.perform(function(schedule) {
      return _this.scheduleLoaded(schedule);
    });
  };

  UI.prototype.scheduleLoaded = function(schedule) {
    if (schedule) {
      this.input.val(schedule.station);
      this.input.blur();
      console.dir(schedule);
      return this.listDepartures(schedule.departures);
    } else {
      return console.log('not found');
    }
  };

  UI.prototype.listDepartures = function(departures) {
    var departure, _i, _len, _results;
    this.list.empty();
    _results = [];
    for (_i = 0, _len = departures.length; _i < _len; _i++) {
      departure = departures[_i];
      _results.push(this.list.append(this.listItemForDeparture(departure)));
    }
    return _results;
  };

  UI.prototype.listItemForDeparture = function(departure) {
    var li, line, time;
    li = $('<li/>');
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

  UI.prototype.spanForListItem = function(li, className, text) {
    return $('<span/>').addClass(className).text(text).appendTo(li);
  };

  UI.prototype.filterDirectionText = function(text) {
    return text.replace(this.filteredDirectionText, '');
  };

  return UI;

})();

new UI;
