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

