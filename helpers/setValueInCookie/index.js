const setValueInCookie = ({
  key,
  value,
  path = "/",
  domain = ".algolia.com",
  sameSite = "Strict",
  expires,
  maxAge,
}) => {
  const cookieData = [
    [key, value],
    ["Path", path],
    ["Domain", domain],
    ["SameSite", sameSite],
  ];

  if (expires) {
    cookieData.push(["Expires", expires]);
  }

  if (maxAge) {
    cookieData.push(["Max-age", maxAge]);
  }

  const serializedCookieData = cookieData
    .map((values) => values.join("="))
    .join("; ");

  document.cookie = serializedCookieData;
};

export default setValueInCookie;
