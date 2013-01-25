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

