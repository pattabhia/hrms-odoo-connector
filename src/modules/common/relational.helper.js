function unpackRelational(field) {
  if (Array.isArray(field)) {
    return { id: field[0], name: field[1] };
  }

  return { id: field || null, name: null };
}

module.exports = {
  unpackRelational
};
