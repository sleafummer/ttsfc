const getAge = id => {
  var myDate = new Date();
  var month = myDate.getMonth() + 1;
  var day = myDate.getDate();
  var age = myDate.getFullYear() - id.substring(6, 10) - 1;
  if (id.substring(10, 12) < month || id.substring(10, 12) == month && id.substring(12, 14) <= day) {
    age++;
  }
  return age;
}

module.exports = {
  getAge
}
