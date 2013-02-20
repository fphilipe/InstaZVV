class StationsSuggester
  constructor: (elements) ->
    @stationsList = elements.stationsList
    @searchField = elements.searchField

    @searchField.on 'keyup', =>
      @suggest(@searchField.val())

  suggest: (query) ->
    if @query != query
      @query = query
      @requestStations()

  requestStations: ->
    request = new StationsRequest @query
    request.perform (stations) => @stationsList.setStations stations

