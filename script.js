function search(event) {
  event.preventDefault();

  var input = $('input').val()
  var url = 'http://online.fahrplan.zvv.ch/bin/stboard.exe/dn?L=vs_widgets&boardType=dep&maxJourneys=20&start=yes&monitor=0&requestType=0&timeFormat=cd&input=' + input
  $.getScript(url, function() {
    var data = journeysObj
    if (data && data.stationName)
      handleData(data)
  })
}

function handleData(data) {
  $('h1').text(data.stationName)

  var journeys = data.journeys
}

$('form').submit(search)
$('input').focus()
