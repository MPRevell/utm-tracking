import isBrowser from "helpers/isBrowser";

const getValueInCookie = (key) => {
  if (!isBrowser || !window.document || !key) return "";

  // Each cookie is separated from the next one by "; "
  const split = document.cookie.split("; ");

  if (!split.length) return "";

  const cookieForKey = split.find((e) => e.startsWith(key));

  if (!cookieForKey) return "";

  // Format of a cookie: bar=foo, but `foo` can contain '=' as well, we only split at the 1st occurrence
  const cookieData = cookieForKey.split(/[=](.*)/);

  // There will be an empty element at index 2 due to the regex
  if (cookieData.length !== 3) return "";

  // Key is at index 0, value at index 1
  return cookieData[1];
};

export default getValueInCookie;
