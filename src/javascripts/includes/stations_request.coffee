class StationsRequest
  constructor: (@query) ->

  perform: (@callback) ->
    $.getScript @url(), => @requestLoaded()

  url: ->
    "http://online.fahrplan.zvv.ch/bin/ajax-getstop.exe/eny?REQ0JourneyStopsS0A=255&REQ0JourneyStopsB=10&REQ0JourneyStopsS0G=#{@query}"

  requestLoaded: ->
    @callback @extractStationNames @rejectNonStations SLs.sls.suggestions

  rejectNonStations: (data=[]) ->
    data.filter (i) ->
      i.type == '1'

  extractStationNames: (data=[]) ->
    i.value for i in data

# The loaded script sets values on this object and calls showSuggestion.
SLs = showSuggestion: ->

