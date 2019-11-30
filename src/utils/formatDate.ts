const formatDate = (date: Date | string): string | null => {
  if (
    (typeof date === "string" || date instanceof String) &&
    date.length < 12
  ) {
    if (isNaN(Date.parse(`${date}`)) === false) {
      return `${date}`;
    }
    return null;
  } else {
    if (isNaN(Date.parse(`${date}`)) === false) {
      return `${new Date(date)
        .toString()
        .split(" ")
        .slice(1, 4)
        .join(" ")}`;
    }
    return null;
  }
};

export default formatDate;
