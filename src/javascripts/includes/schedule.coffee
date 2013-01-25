class Schedule
  constructor: (data) ->
    @station = data.stationName
    @departures = (new Departure data for data in (data.journey || []))

