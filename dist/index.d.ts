export type StampHeaderKey = "Software" | "Version" | "Date" | "Start-Date" | "End-Date" | "Remark" | string;
export type Field = "date" | "time" | "c-ip" | "c-username" | "s-sitename" | "s-computername" | "s-ip" | "s-port" | "cs-method" | "cs-uri-stem" | "cs-uri-query" | "sc-status" | "cs-win32-status" | "cs-bytes" | "time-taken" | "cs-version" | "cs-host" | "cs(User-Agent)" | "cs(Referer)" | string;
export type Event = {
    date?: string | null | undefined;
    time?: string | null | undefined;
    "c-ip"?: string | null | undefined;
    "c-username"?: string | null | undefined;
    "s-sitename"?: string | null | undefined;
    "s-computername"?: string | null | undefined;
    "s-ip"?: string | null | undefined;
    "s-port"?: string | null | undefined;
    "cs-method"?: string | null | undefined;
    "cs-uri-stem"?: string | null | undefined;
    "cs-uri-query"?: string | null | undefined;
    "sc-status"?: string | number | boolean | null | undefined;
    "cs-win32-status"?: string | null | undefined;
    "cs-bytes"?: string | number | null | undefined;
    "time-taken"?: string | null | undefined;
    "cs-version"?: string | null | undefined;
    "cs-host"?: string | null | undefined;
    "cs(User-Agent)"?: string | null | undefined;
    "cs(Referer)"?: string | null | undefined;
} | {
    [key: string]: any;
};
export type StampDefaults = {
    undefined?: string | undefined;
};
export type LogOptions = {
    showPasswords?: boolean | undefined;
    undefined?: string | undefined;
};
export type StampHeaders = Map<StampHeaderKey, string>;
export declare const isoDateTime: (date: Date) => string;
export type StartLogProps = {
    headers?: StampHeaders | undefined;
    fields: Field[];
    options?: LogOptions;
};
export declare const startLog: ({ headers, fields, options }: StartLogProps) => {
    __headers: StampHeaders | undefined;
    __options: LogOptions | undefined;
    __version: string;
    __fields: string;
    header: string;
    event: (event: Event) => string;
    printHeader: () => void;
    print: (event: Event) => void;
    error: (event: Event) => void;
};
