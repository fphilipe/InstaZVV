class StationsList
  constructor: ->
    @container = $('#stations-list')
    @stations = []

  setStations: (stations) ->
    if @stationsDifferFromCurrentStations(stations)
      @stations = stations
      @container.empty()
      @container.append @stationItem i for i in stations

  stationItem: (station) ->
    li = $('<li/>').addClass('station').text(station)

  stationsDifferFromCurrentStations: (stations) ->
    if stations.length == @stations.length
      for i in [0..stations.length]
        if stations[i] != @stations[i]
          return true
      false
    else
      true
