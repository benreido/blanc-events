"use client";

import { createContext, useContext, useReducer, useCallback, type ReactNode } from "react";

export interface CartItem {
    id: string; // equipmentItemId or packageId
    type: "equipment" | "package";
    name: string;
    dayRate: number;
    quantity: number;
    image?: string;
    contactForPrice?: boolean;
}

interface CartState {
    items: CartItem[];
    startDate: string | null;
    endDate: string | null;
    serviceAddonIds: string[];
}

type CartAction =
    | { type: "ADD_ITEM"; payload: CartItem }
    | { type: "REMOVE_ITEM"; payload: string }
    | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
    | { type: "SET_DATES"; payload: { startDate: string; endDate: string } }
    | { type: "TOGGLE_SERVICE"; payload: string }
    | { type: "CLEAR_CART" };

function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case "ADD_ITEM": {
            const existing = state.items.find((i) => i.id === action.payload.id);
            if (existing) {
                return {
                    ...state,
                    items: state.items.map((i) =>
                        i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
                    ),
                };
            }
            return { ...state, items: [...state.items, action.payload] };
        }
        case "REMOVE_ITEM":
            return { ...state, items: state.items.filter((i) => i.id !== action.payload) };
        case "UPDATE_QUANTITY":
            return {
                ...state,
                items: action.payload.quantity <= 0
                    ? state.items.filter((i) => i.id !== action.payload.id)
                    : state.items.map((i) =>
                        i.id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
                    ),
            };
        case "SET_DATES":
            return { ...state, startDate: action.payload.startDate, endDate: action.payload.endDate };
        case "TOGGLE_SERVICE": {
            const sid = action.payload;
            return {
                ...state,
                serviceAddonIds: state.serviceAddonIds.includes(sid)
                    ? state.serviceAddonIds.filter((s) => s !== sid)
                    : [...state.serviceAddonIds, sid],
            };
        }
        case "CLEAR_CART":
            return { items: [], startDate: null, endDate: null, serviceAddonIds: [] };
        default:
            return state;
    }
}

interface CartContextType extends CartState {
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    setDates: (startDate: string, endDate: string) => void;
    toggleService: (serviceId: string) => void;
    clearCart: () => void;
    itemCount: number;
    hasContactForPriceItems: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(cartReducer, {
        items: [],
        startDate: null,
        endDate: null,
        serviceAddonIds: [],
    });

    const addItem = useCallback((item: CartItem) => dispatch({ type: "ADD_ITEM", payload: item }), []);
    const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE_ITEM", payload: id }), []);
    const updateQuantity = useCallback((id: string, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } }), []);
    const setDates = useCallback((startDate: string, endDate: string) => dispatch({ type: "SET_DATES", payload: { startDate, endDate } }), []);
    const toggleService = useCallback((serviceId: string) => dispatch({ type: "TOGGLE_SERVICE", payload: serviceId }), []);
    const clearCart = useCallback(() => dispatch({ type: "CLEAR_CART" }), []);

    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
    const hasContactForPriceItems = state.items.some((i) => i.contactForPrice);

    return (
        <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity, setDates, toggleService, clearCart, itemCount, hasContactForPriceItems }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
}
