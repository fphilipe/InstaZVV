class StationsList
  UPKEY:   38
  DOWNKEY: 40
  ENTERKEY: 13

  constructor: ->
    @container = $('#stations-list')
    @stations = []

    $(window).keydown (event) =>
      switch event.keyCode
        when @UPKEY    then @decreaseSelection()
        when @DOWNKEY  then @increaseSelection()
        when @ENTERKEY then @followSelection()

  setStations: (stations) ->
    @resetSelection()
    @show()

    if @stationsDifferFromCurrentStations(stations)
      @stations = stations
      @container.empty()
      @container.append @stationItem i for i in stations
      @selectStationIfOnlyOne()

  show: ->
    @container.show()

  hide: ->
    @container.hide()

  stationItem: (station) ->
    $('<li/>').addClass('station').append @stationLink station

  stationLink: (station) ->
    $('<a/>').attr('href', "##{HashUtil.encode(station)}").text(station)

  stationsDifferFromCurrentStations: (stations) ->
    if stations.length == @stations.length
      for i in [0..stations.length]
        if stations[i] != @stations[i]
          return true
      false
    else
      true

  selectStationIfOnlyOne: ->
    if @stations.length == 1
      @selectStationAtIndex 0

  selectStationAtIndex: (@selectedIndex) ->
    @container.find('li').removeClass('selected')
    @container.find("li:eq(#{@selectedIndex})").addClass('selected')

  resetSelection: ->
    @selectedIndex = -1

  increaseSelection: ->
    @selectStationAtIndex (@selectedIndex + 1) % @stations.length

  decreaseSelection: ->
    if @selectedIndex <= 0
      @selectStationAtIndex @maxPossibleSelectionIndex()
    else
      @selectStationAtIndex @selectedIndex - 1

  followSelection: ->
    console.log @container.find("li:eq(#{@selectedIndex}) a").text()

  maxPossibleSelectionIndex: ->
    @container.find('li').length - 1

