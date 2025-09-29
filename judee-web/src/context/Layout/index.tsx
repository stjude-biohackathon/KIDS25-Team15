import { createContext, type JSXElementConstructor, type ReactElement, type ReactNode, type ReactPortal, useContext, useReducer } from 'react';

const initialLayoutData = {}
// 1. Create a context to hold the state
const LayoutContext = createContext<{ data: any; dispatch: React.Dispatch<{ type: any, payload: any }> }>({
    data: initialLayoutData,
    dispatch: () => { },
});

// 2. Define the initial state
const initialState = {
    data: initialLayoutData,
};

// 3. Define the reducer function to handle state transitions
const reducer = (state: { data: any; }, action: { type: any; payload: any }) => {
    const { type, payload } = action;
    switch (type) {
        case 'MENU.UPDATE':
            return { ...state, data: { ...state.data, ...payload } };
        default:
            throw new Error();
    }
}

// 4. Create a provider component
export const LayoutContextProvider = (props: { children: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return (
        <LayoutContext.Provider value={{ ...state, dispatch }}>
            {props.children}
        </LayoutContext.Provider>
    );
}

// Create a function that invokes the context 
export const useLayoutContext = () => {
    return useContext(LayoutContext)
}