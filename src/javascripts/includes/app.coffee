class App
  constructor: ->
    @form = $('form')
    @input = $('input')
    @list = $('#departures-list')
    @filteredDirectionText = 'Zürich, '
    @stationsList = new StationsList
    @stationsSuggester =
      new StationsSuggester stationsList: @stationsList, searchField: @input
    @stateController = new StateController (state) => @stateChanged(state)

    @form.submit (event) =>
      event.preventDefault()
      @stateController.setState @input.val()

    @list.on 'click', =>
      @list.toggleClass('countdown')

    @input.on 'keydown', =>
      @input.removeClass 'error'

  stateChanged: (state) ->
    if state
      @performQuery state
    else
      @reset()

  performQuery: (query) ->
    if @activeQuery and @activeQuery.station == query
      console.log 'abort'
      return

    if @activeQuery
      @activeQuery.stop()

    @activeQuery = new Query \
      query,
      error: (=> @queryFailed()),
      success: (=> @queryLoaded())
    @activeQuery.start (departures) => @listDepartures(departures)

  queryFailed: ->
    @stateController.setState ''
    @input.addClass 'error'

  queryLoaded: ->
    @input.val @activeQuery.station
    @input.select()
    @stateController.setState @activeQuery.station
    @stationsList.hide()

  reset: ->
    @activeQuery = null
    @input.select()
    @list.empty()

  listDepartures: (departures) ->
    @list.empty()
    if departures.length > 0
      @list.removeClass 'empty'
      @list.append @listItemForDeparture departure for departure in departures
    else
      @list.addClass 'empty'

  listItemForDeparture: (departure) ->
    li = $('<li/>').addClass('departure')

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

