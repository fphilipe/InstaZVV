class Request
  constructor: (@query) ->

  perform: (callback) ->
    @callback = callback
    $.getScript @url(), => @requestLoaded()

  url: ->
    "http://online.fahrplan.zvv.ch/bin/stboard.exe/dn?L=vs_widgets&boardType=dep&maxJourneys=20&start=yes&monitor=0&requestType=0&timeFormat=cd&input=#{@query}&#{+ new Date}"

  requestLoaded: ->
    data = journeysObj # The var set by the remote script.

    if data and data.stationName != ''
      @callback new Schedule data
    else
      @callback()

