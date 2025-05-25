export function formatdate(value) {
  var month = value.substring(5, 7);
  var day = value.substring(8, 10);
  var year = value.substring(0, 4);
  var hours = value.substring(11, 13);
  var minutes = value.substring(14, 16);
  return `${month}/${day}/${year} ${hours}:${minutes}`;
}
