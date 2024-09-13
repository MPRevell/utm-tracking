import { getValueInCookie } from "helpers";
import {
  ORIGINAL_LOCATION_COOKIE_KEY,
  UTM_COOKIE_KEY,
} from "constants/storage";

const MUNCHKIN_COOKIE_KEY = "_mkto_trk";

/**
 * Add values to the hidden fields of the form. Passes information on UTMs, Google Analytics, and A/B tests.
 * @param fields The form object
 */
export const addHiddenFormFields = (fields) => {
  const formFields = Object.keys(fields);
  const newFields = { ...fields };

  const cookieUtms = getValueInCookie(UTM_COOKIE_KEY);
  const jsonCookie = JSON.parse(decodeURIComponent(cookieUtms || "{}"));
  const gaCookie = getValueInCookie("_ga");
  const clientId = gaCookie.split(".").slice(2).join(".");
  const gclidValue = getValueInCookie("gclid");
  const originalLocation = getValueInCookie(ORIGINAL_LOCATION_COOKIE_KEY);
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

/**
 * Creates the form request body
 * @param {object} data The form data
 * @param {number} formId The form ID
 * @param {number} [programId] The program ID
 */
export const createFormRequestBody = ({ data, formId, programId }) => {
  const dataWithHiddenFields = addHiddenFormFields(data);
  const url = new URL(window.location.href);
  const queryString = url.search;
  const pageURL = url.href;
  const cookie = getValueInCookie(MUNCHKIN_COOKIE_KEY);

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

/**
 * Reducer function to handle form submission state
 * @param {object} state The current form state
 * @param {object} action The action that determines the state
 */
export const formReducer = (state, action) => {
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

/**
 * Determines whether a form field should be full width
 * @param {object} params The parameters to check full width
 * @returns {boolean} True if full width, false otherwise
 */
export const isFullWidth = ({ fullWidthRows, index, field }) =>
  fullWidthRows === "all" ||
  fullWidthRows?.includes(index + 1) ||
  field.dataType === "htmltext" ||
  field.dataType === "checkbox";

/**
 * Determines the color for error messages based on form state
 * @param {boolean} isCard Whether the form is in card view
 * @param {string} theme The current theme
 * @returns {string} The error message color
 */
export const getErrorMessageColor = (isCard, theme) => {
  if (isCard) return "grey-900";
  return theme === "white" ? "grey-900" : "white";
};
