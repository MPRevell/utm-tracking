//I've added these in case these are required as we used them in the original script/code
// You can add these to the original location and where I have written "utm_data" you can replace it with the key you want to use

const ORIGINAL_LOCATION_COOKIE_KEY = "algolia_website_original_location";
const UTM_COOKIE_KEY = "algolia_website_utm_params";

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

  debugger;
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
    "Marketing_Opt_ln__c",
    "UTM_Source__c",
    "UTM_Medium__c",
    "UTM_Content__c",
    "UTM_Term__c",
    "UTM Goal__c",
    "UTM_Language__c",
    "UTM_Model__c",
    "UTM_Persona__c",
    "UTM_Region__c",
    "Landing_Page_URL",
    "UTM_Camp_Parent",
  ];

  debugger;
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

// Exporting relevant functions for external use if needed
window.isBrowser = isBrowser;
window.setValueInCookie = setValueInCookie;
window.getValueInCookie = getValueInCookie;
window.collectUTMParams = collectUTMParams;
window.addHiddenFormFields = addHiddenFormFields;
window.createFormRequestBody = createFormRequestBody;
