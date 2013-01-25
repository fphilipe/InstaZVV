WATCH_REGEX = %r{^src/.+$}

guard :shell do
  watch(WATCH_REGEX) { `rake build` }
end

guard :livereload do
  watch(WATCH_REGEX)
end
