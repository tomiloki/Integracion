export const CART_UPDATED_EVENT = 'autoparts:cart-updated';

export function emitCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}
