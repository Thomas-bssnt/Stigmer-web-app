module.exports.getDate = function (id) {
  //date
  let options = {
    hour: "numeric",
    minute: "numeric",
  };
  let d = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(id);
  let m = new Intl.DateTimeFormat("fr", { month: "numeric" }).format(id);
  let y = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(id);
  let hm = new Intl.DateTimeFormat("fr", options).format(id);
  let date = `${d}-${m}-${y}-${hm}`;
  return date;
};

module.exports.getDay = function (id) {
  //date

  let d = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(id);
  let m = new Intl.DateTimeFormat("fr", { month: "numeric" }).format(id);
  let y = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(id);

  let date = `${d}-${m}-${y}`;
  return date;
};

module.exports.getDateHM = function (id) {
  //date

  let d = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(id);
  let m = new Intl.DateTimeFormat("fr", { month: "numeric" }).format(id);
  let y = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(id);
  let h = new Intl.DateTimeFormat("fr", { hour: "numeric" }).format(id);
  let min = new Intl.DateTimeFormat("fr", { minute: "numeric" }).format(id);
  let date = `${d}-${m}-${y}-${h} ${min}`;
  return date;
};

module.exports.getDayISO = function (id) {
  //date

  let d = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(id);
  let m = new Intl.DateTimeFormat("fr", { month: "numeric" }).format(id);
  let y = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(id);

  let date = `${y}-${m}-${d}`;
  return date;
};

module.exports.getDateWithSecond = function (id) {
  //date
  let options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  };
  let d = new Intl.DateTimeFormat("fr", { day: "numeric" }).format(id);
  let m = new Intl.DateTimeFormat("fr", { month: "numeric" }).format(id);
  let y = new Intl.DateTimeFormat("fr", { year: "numeric" }).format(id);
  let hms = new Intl.DateTimeFormat("fr", options).format(id);
  let date = `${d}-${m}-${y}-${hms}`;
  return date;
};
