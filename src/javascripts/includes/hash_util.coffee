HashUtil =
  encode: (string) ->
    string.replace(' ', '+')

  decode: (string) ->
    string.replace('+', ' ')
