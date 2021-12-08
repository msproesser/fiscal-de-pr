function flatten(array) {
  if(array.length == 0)
      return array;
  else if(Array.isArray(array[0]))
      return flatten(array[0]).concat(flatten(array.slice(1)));
  else
      return [array[0]].concat(flatten(array.slice(1)));
}

function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function joinLists(sum, item) { return sum.concat(item) }

function unique(list) {
  return [...new Set(list)]
}

module.exports = {
  flatten, joinLists, mergeDeep, unique
}