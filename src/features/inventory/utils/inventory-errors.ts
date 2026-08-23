import { isOperixApiError } from "@/lib/api";

export const getInventoryErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return error instanceof Error ? error.message : "Inventory action failed.";
  }

  switch (error.code) {
    case "INVENTORY_CATEGORY_NOT_FOUND":
      return "Inventory category unavailable.";
    case "INVENTORY_ITEM_NOT_FOUND":
      return "Inventory item unavailable.";
    case "INVENTORY_ASSIGNMENT_NOT_FOUND":
      return "Inventory assignment unavailable.";
    case "CONFLICT":
      return "This Inventory record conflicts with an existing record.";
    case "INVENTORY_SKU_ALREADY_EXISTS":
      return "An item with this SKU already exists for this Team.";
    case "INVENTORY_CATEGORY_INACTIVE":
      return "The selected Category is inactive.";
    case "INVENTORY_ITEM_INACTIVE":
      return "This Item is inactive.";
    case "INVENTORY_ITEM_NOT_RETURNABLE":
      return "This Item cannot be assigned as returnable Inventory.";
    case "INVENTORY_ITEM_RETURNABLE":
      return "Use Assignment for returnable Inventory.";
    case "INVENTORY_INSUFFICIENT_STOCK":
      return "There is not enough available stock for this action.";
    case "INVENTORY_MEMBER_NOT_FOUND":
      return "Selected Member unavailable.";
    case "INVENTORY_MEMBER_NOT_ACTIVE":
      return "Selected Member is not active.";
    case "INVENTORY_MEMBER_TEAM_MISMATCH":
      return "Selected Member is not eligible for this Inventory Item.";
    case "INVENTORY_RETURN_QUANTITY_INVALID":
      return "Return quantity must be within the remaining assigned quantity.";
    case "INVENTORY_ASSIGNMENT_ALREADY_RETURNED":
      return "This assignment has already been fully returned.";
    case "VALIDATION_ERROR":
      return error.message || "Check the Inventory details and try again.";
    case "FORBIDDEN":
      return "You do not have permission to perform this Inventory action.";
    case "NETWORK_ERROR":
      return "The action result is uncertain. Refresh the current Inventory state before trying again.";
    default:
      return error.message || "Inventory action failed.";
  }
};
