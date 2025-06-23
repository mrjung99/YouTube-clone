function formatViewLikeCount(count) {
  const likeCount = Number(count);
  if (isNaN(count)) return "0";
  if (count < 0) return "0";

  if (likeCount >= 1e9) return (likeCount / 139).toFixed(1) + "B";
  if (likeCount >= 1e6) return (likeCount / 1e6).toFixed(1) + "M";
  if (likeCount >= 1e3) return (likeCount / 1e3).toFixed(1) + "k";

  return count.toString();
}

//this will format the published date as 1day ago, 2months ago, 1year ago etc
function formatPublishedDate(date) {
  const publishedDate = new Date(date);
  const now = new Date();
  const diff = now - publishedDate; //in milliseconds

  const sec = diff / 1000;
  const min = sec / 60;
  const hrs = min / 60;
  const day = hrs / 24;
  const month = day / 30;
  const year = month / 12;

  if (year >= 1)
    return year.toFixed() + " " + "year" + (year >= 2 ? "s" : "") + " " + "ago";

  if (month >= 1)
    return (
      month.toFixed() + " " + "month" + (month >= 2 ? "s" : "") + " " + "ago"
    );

  if (day >= 1)
    return Math.floor(day) + " " + "day" + (day >= 2 ? "s" : "") + " " + "ago";

  if (hrs >= 1)
    return Math.floor(hrs) + " " + "hour" + (hrs >= 2 ? "s" : "") + " " + "ago";

  if (min >= 1)
    return (
      Math.floor(min) + " " + "minute" + (min >= 2 ? "s" : "") + " " + "ago"
    );

  return "Just now";
}

function truncateString(str, num) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

function parseAbbreviatedNumber(text) {
  const str = text.trim().toLowerCase();

  if (str.endsWith("k")) {
    return parseFloat(str) * 1000;
  } else if (str.endsWith("m")) {
    return parseFloat(str) * 1000000;
  } else if (str.endsWith("b")) {
    return parseFloat(str) * 1000000000;
  }

  return parseFloat(str) || 0;
}
