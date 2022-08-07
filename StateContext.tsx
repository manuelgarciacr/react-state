import React from 'react'

const DataContext = React.createContext<object | undefined>(undefined);
const UpdaterContext = React.createContext<React.Dispatch<React.SetStateAction<object>> | undefined>(undefined);

interface Props<T extends object> {
    state: T
    children: JSX.Element | JSX.Element[]
}

const DataProvider = <T extends object>(props: Props<T>) => {
    const [data, setData] = React.useState<T>(props.state);
    return (
        <DataContext.Provider value={data}>
            {/* TODO create type and use T for object */}
            <UpdaterContext.Provider value={setData as React.Dispatch<React.SetStateAction<object>>}>
                {props.children}
            </UpdaterContext.Provider>
        </DataContext.Provider>
    );
}

const useData = () => {
    const data = React.useContext(DataContext);

    if (typeof data === 'undefined') 
        throw new Error('useData must be used within a DataProvider');
    
    return data;
}

const useUpdater = <T extends object>() => {
    const updater = React.useContext(UpdaterContext)

    if (typeof updater === 'undefined') 
        throw new Error('useUpdater must be used within a DataProvider');
    
    // return React.useCallback((n: T) => updater((d) => ({...d, ...n})), [updater])

    // const fn = (partialData: Partial<T>) => {
    const fn = (n: T) => {
        const keys: Array<keyof T> = Object.keys(n) as (keyof T)[];
        // let newData: Partial<T> = {}
        let newData: T = {} as T

        keys.forEach((k) => {
            if ((k as string).charAt(0) === '_')
                return;
            newData[k] = n[k]
        })

        updater(data => ({ ...data, ...newData }))
    }
    return React.useCallback(fn, [updater])
}

const useAppState = () => [useData, useUpdater]

export {DataProvider, useData, useUpdater, useAppState}

/* export class State<T> {
    
    Provider = (props: {state: T, children: JSX.Element | JSX.Element[]}): JSX.Element => {
        const [data, setData] = React.useState<T>(props.state)
        const updater = (partialData: Partial<T>) => {
            const keys: Array<keyof T> = Object.keys(partialData) as (keyof T)[];
            let newData: Partial<T> = {}
    
            keys.forEach((k) => {
                if ((k as string).charAt(0) === '_')
                    return;
                newData[k] = partialData[k];
            })
    
            setData({ ...data, ...newData })
        }

        return (
            <this.DataContext.Provider value={data}>
                <this.UpdaterContext.Provider value={updater}>
                    {props.children}
                </this.UpdaterContext.Provider>
            </this.DataContext.Provider>
        );
    }
    
    useData = () => {
        const data = React.useContext(this.DataContext)
    
        if (typeof data === 'undefined')
            throw new Error('useData must be used within a StateProvider');
    
        return data
    }

    useUpdater = () => {
        const updater = React.useContext(this.UpdaterContext)

        if (typeof updater === 'undefined')
            throw new Error('useUpdater must be used within a StateProvider');
        
        return React.useCallback((v: Partial<T>) => updater(v), [updater]);
    }
    
    useAppState = () => [this.useData(), this.useUpdater()]
} */
