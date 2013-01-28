HashUtil =
  encode: (string) ->
    encodeURI(string.replace(' ', '+'))

  decode: (string) ->
    decodeURI(string.replace('+', ' '))
