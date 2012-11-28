class Schedule
  constructor: (data) ->
    @station = data.stationName
    @departures = (new Departure data for data in data.journey)

class Departure
  constructor: (data) ->
    @scheduledTime = data.ti
    @delayedTime = data.rt.dlt
    @delay = parseInt(data.rt.dlm)
    @countdown = parseInt(data.countdown_val)
    @line = data.pr
    @colors = ("##{color}" for color in data.lc.split ' ')  if data.lc
    @status = data.rt.status
    @direction = data.st
    @actualTime = @delayedTime || @scheduledTime

class Request
  constructor: (@query) ->

  perform: (callback) ->
    @callback = callback
    $.getScript @url(), => @requestLoaded()

  url: ->
    "http://online.fahrplan.zvv.ch/bin/stboard.exe/dn?L=vs_widgets&boardType=dep&maxJourneys=20&start=yes&monitor=0&requestType=0&timeFormat=cd&input=#{@query}"

  requestLoaded: ->
    data = journeysObj

    if data and data.stationName != ''
      @callback new Schedule data
    else
      @callback()

class UI
  constructor: ->
    @form = $('form')
    @input = $('input')
    @list = $('ul')
    @filteredDirectionText = 'Zürich, '

    @form.submit (event) =>
      event.preventDefault()
      @doRequest @input.val()

    @list.on 'click', =>
      @list.toggleClass('countdown')

    # @input.focus()
    @doRequest 'zurich hb'

  doRequest: (query) ->
    request = new Request query
    request.perform (schedule) => @scheduleLoaded(schedule)

  scheduleLoaded: (schedule) ->
    if schedule
      @input.val schedule.station
      @input.blur()
      console.dir schedule
      @listDepartures schedule.departures
    else
      console.log 'not found'

  listDepartures: (departures) ->
    @list.empty()
    @list.append @listItemForDeparture departure for departure in departures

  listItemForDeparture: (departure) ->
    li = $('<li/>')

    @spanForListItem li, 'countdown', departure.countdown
    @spanForListItem li, 'status', departure.status  if departure.status
    @spanForListItem li, 'direction', @filterDirectionText departure.direction

    time = @spanForListItem li, 'time', departure.actualTime
    time.addClass 'delayed'  if departure.delay

    line = @spanForListItem li, 'line', departure.line
    line
      .css('color', departure.colors[0])
      .css('background-color', departure.colors[1])  if departure.colors

    li

  spanForListItem: (li, className, text) ->
    $('<span/>')
      .addClass(className)
      .text(text)
      .appendTo(li)

  filterDirectionText: (text) ->
    text.replace @filteredDirectionText, ''

new UI
