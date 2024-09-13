import { setValueInCookie } from "helpers";

if (typeof window !== "undefined") {
  const paramNames = [
    "utm_source",
    "utm_campaign",
    "utm_medium",
    "utm_keyword",
    "utm_content",
  ];

  const utmData = window.location.search
    .substr(1)
    .split("&")
    .filter((param) =>
      paramNames.some((name) => {
        const values = param.split("=");
        return values[0] === name && values[1];
      })
    )
    .join("&");

  if (utmData) {
    setValueInCookie({
      key: "utm_data",
      value: encodeURIComponent(utmData),
      expires: "Thu, 01 Jan 2029 00:00:00 GMT",
    });
  }
}
