class StationsSuggester
  constructor: ->
    @stationsList = new StationsList
    @input = $('input')

    @input.on 'keyup', =>
      @suggest(@input.val())

  suggest: (query) ->
    if @query != query
      @query = query
      @requestStations()

  requestStations: ->
    request = new StationsRequest @query
    request.perform (stations) => @stationsList.setStations stations

