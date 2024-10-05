// noImplicitAny
function add(a, b: number | string) {
  return a + b
}

add(4, '5')
