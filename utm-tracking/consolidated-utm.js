// Helper function to check if we are in a browser environment
const isBrowser = typeof window !== "undefined";

// Function to set a value in a cookie
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

// Function to retrieve a value from a cookie
const getValueInCookie = (key) => {
  if (!isBrowser || !window.document || !key) return "";

  const split = document.cookie.split("; ");

  if (!split.length) return "";

  const cookieForKey = split.find((e) => e.startsWith(key));

  if (!cookieForKey) return "";

  const cookieData = cookieForKey.split(/[=](.*)/);

  if (cookieData.length !== 3) return "";

  return cookieData[1];
};

// Function to collect UTM parameters and store them in a cookie
const collectUTMParams = () => {
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
};

// Function to add hidden UTM and analytics fields to a form
const addHiddenFormFields = (fields) => {
  const formFields = Object.keys(fields);
  const newFields = { ...fields };

  const cookieUtms = getValueInCookie("utm_data");
  const jsonCookie = JSON.parse(decodeURIComponent(cookieUtms || "{}"));
  const gaCookie = getValueInCookie("_ga");
  const clientId = gaCookie.split(".").slice(2).join(".");
  const gclidValue = getValueInCookie("gclid");
  const originalLocation = getValueInCookie("original_location_key");
  const siteSpectDataLayer = window.dataLayer.find(
    (item) => item.event === "sitespect_watts_counted"
  );

  const isAlgoliaDomain = window.location.hostname.endsWith("algolia.com");
  const urlParams = new URLSearchParams(window.location.search);

  for (const field of formFields) {
    const key = field.split("__c")[0].toLowerCase();
    if (key.startsWith("utm_")) {
      let value = "";

      if (isAlgoliaDomain && jsonCookie) {
        value = jsonCookie[key];
      } else {
        value = urlParams.get(key) || "";
      }

      if (value) {
        newFields[field] = value;
      }
    }
    if (key === "ga_gclid" && gclidValue) {
      newFields[field] = gclidValue;
    }
    if (key === "ga_client_id" && clientId) {
      newFields[field] = clientId;
    }
    if (key === "landing_page_url" && originalLocation) {
      newFields[field] = originalLocation;
    }
    if (siteSpectDataLayer) {
      if (key === "mutiny_experience") {
        newFields[field] = siteSpectDataLayer.campaign_name || "";
      }
      if (key === "mutiny_variation_name") {
        newFields[field] = siteSpectDataLayer.variation_name || "";
      }
    }
  }

  return {
    ...newFields,
  };
};

// Function to create the form request body for submission
const createFormRequestBody = ({ data, formId, programId }) => {
  const dataWithHiddenFields = addHiddenFormFields(data);
  const url = new URL(window.location.href);
  const queryString = url.search;
  const pageURL = url.href;
  const cookie = getValueInCookie("_mkto_trk");

  const requestBody = {
    input: [
      {
        leadFormFields: dataWithHiddenFields,
        visitorData: {
          pageURL,
          queryString,
          userAgentString: navigator.userAgent,
        },
        cookie,
      },
    ],
    formId,
    programId,
  };

  return JSON.stringify(requestBody);
};

// Form state reducer to manage submission states
const formReducer = (state, action) => {
  switch (action.type) {
    case "submitted":
      return {
        ...state,
        isSubmitted: true,
        error: false,
      };
    case "error":
      return {
        ...state,
        error: true,
        isSubmitted: false,
      };
    default:
      return state;
  }
};

// Function to determine if a form field should be full width
const isFullWidth = ({ fullWidthRows, index, field }) =>
  fullWidthRows === "all" ||
  fullWidthRows?.includes(index + 1) ||
  field.dataType === "htmltext" ||
  field.dataType === "checkbox";

// Function to get error message color based on the form state
const getErrorMessageColor = (isCard, theme) => {
  if (isCard) return "grey-900";
  return theme === "white" ? "grey-900" : "white";
};

// Exporting relevant functions for external use if needed
export {
  isBrowser,
  setValueInCookie,
  getValueInCookie,
  collectUTMParams,
  addHiddenFormFields,
  createFormRequestBody,
  formReducer,
  isFullWidth,
  getErrorMessageColor,
};
