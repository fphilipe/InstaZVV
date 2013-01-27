class StateController
  constructor: (@callback) ->
    @titleElement = $('title')
    @baseTitle = @titleElement.text()
    window.onhashchange = => @stateChanged()
    @stateChanged()

  state: ->
    HashUtil.decode(location.hash.replace('#', ''))

  setState: (state) ->
    location.hash = HashUtil.encode(state)

  stateChanged: ->
    @titleElement.text("#{@baseTitle} | #{@state()}")
    @callback @state()

