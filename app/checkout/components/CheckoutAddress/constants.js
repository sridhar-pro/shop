// Hot-deal config is shared with OrderSummary / CheckoutForm (single source)
export {
  LIMITED_DEAL_CODE,
  LIMITED_DEAL_DURATION,
} from "../OrderSummary/constants";

// Blank address for the add / edit modal
export const EMPTY_ADDRESS_FORM = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  landmark: "",
  phone: "",
};

export const REQUIRED_ADDRESS_FIELDS = [
  "line1",
  "line2",
  "city",
  "state",
  "postal_code",
  "country",
  "landmark",
  "phone",
];
