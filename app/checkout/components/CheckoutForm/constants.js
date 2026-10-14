// Hot-deal config is shared with OrderSummary (same values, single source)
export {
  LIMITED_DEAL_CODE,
  LIMITED_DEAL_DURATION,
} from "../../components/OrderSummary/constants";

export const FORM_STORAGE_KEY = "checkout_form_v1";

export const emptyForm = {
  name: "",
  lastName: "",
  email: "",
  country: "",
  contact: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pin: "",
};

// Order the fields appear in the form (top → bottom); used to find which
// invalid field to scroll to first.
export const FIELD_ORDER = [
  "email",
  "country",
  "name",
  "lastName",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "pin",
  "contact",
];

export const STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Lakshadweep",
  "Puducherry",
  "Ladakh",
  "Jammu and Kashmir",
];
