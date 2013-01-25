class UI
  constructor: ->
    @form = $('form')
    @input = $('input')
    @list = $('ul')
    @filteredDirectionText = 'Zürich, '

    @form.submit (event) =>
      event.preventDefault()
      @performQuery @input.val()

    @list.on 'click', =>
      @list.toggleClass('countdown')

    @input.on 'keydown', =>
      @input.removeClass 'error'

  performQuery: (query) ->
    if @activeQuery?
      @activeQuery.stop()

    @activeQuery = new Query \
      query,
      error: (=> @queryFailed()),
      success: (=> @queryLoaded())
    @activeQuery.start (departures) => @listDepartures(departures)

  queryFailed: ->
    @activeQuery = null
    @input.select()
    @input.addClass 'error'

  queryLoaded: ->
    @input.val @activeQuery.station
    @input.select()

  listDepartures: (departures) ->
    @list.empty()
    if departures.length > 0
      @list.removeClass 'empty'
      @list.append @listItemForDeparture departure for departure in departures
    else
      @list.addClass 'empty'

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

