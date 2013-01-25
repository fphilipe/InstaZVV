class Query
  nop: ->
  refreshInterval: 15000

  constructor: (@query, callbacks) ->
    @successCallback = callbacks.success || nop
    @errorCallback   = callbacks.error   || nop

  start: (@departuresCallback) ->
    @requestSchedule()

  stop: ->
    if @interval
      @stopRefreshing()

  requestSchedule: ->
    request = new ScheduleRequest @query
    request.perform (schedule) => @scheduleLoaded(schedule)

  scheduleLoaded: (schedule) ->
    if schedule
      @queryLoaded(schedule.station)
      @departuresCallback(schedule.departures)
    else
      @errorCallback()

  queryLoaded: (@station) ->
    unless @loadedBefore
      @loadedBefore = true
      @successCallback()
      @startRefreshing()

  startRefreshing: ->
    @interval = setInterval (=> @requestSchedule()), @refreshInterval

  stopRefreshing: ->
    clearInterval @interval
    @departuresCallback = @nop

