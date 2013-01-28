class StateController
  constructor: (@callback) ->
    @titleElement = $('title')
    @baseTitle = @titleElement.text()
    window.onhashchange = => @stateChanged()
    @stateChanged()

  state: ->
    state = HashUtil.decode(location.hash.replace('#', ''))

    if state.length > 0
      state

  setState: (state) ->
    location.hash = HashUtil.encode(state)

  stateChanged: ->
    @updateTitle()
    @callback @state()

  updateTitle: ->
    @titleElement.text [@baseTitle, @state()].filter((i) -> !!i).join(' | ')

