export type StampHeaderKey =
  | "Software"
  | "Version"
  | "Date"
  | "Start-Date"
  | "End-Date"
  | "Remark"
  | string;

export type Field =
  | "date"
  | "time"
  | "c-ip"
  | "c-username"
  | "s-sitename"
  | "s-computername"
  | "s-ip"
  | "s-port"
  | "cs-method"
  | "cs-uri-stem"
  | "cs-uri-query"
  | "sc-status"
  | "cs-win32-status"
  | "cs-bytes"
  | "time-taken"
  | "cs-version"
  | "cs-host"
  | "cs(User-Agent)"
  | "cs(Referer)"
  | string;

export type Event =
  | {
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
    }
  | { [key: string]: any };

export type StampDefaults = {
  undefined?: string | undefined;
};

export type LogOptions = {
  showPasswords?: boolean | undefined;
  undefined?: string | undefined;
};

export type StampHeaders = Map<StampHeaderKey, string>;

export const isoDateTime = (date: Date) => {
  return date.toISOString().replace("T", " ").substring(0, 19);
};

const getVersionHeader = (
  headers?: StampHeaders | undefined,
  options?: LogOptions | undefined
) => {
  if (!headers) {
    headers = new Map<StampHeaderKey, string>();
  }
  if (options?.showPasswords === true) {
    let remark = headers.get("Remark");
    const updatedRemark = ["!!! PASSWORDS ARE EXPOSED IN LOG !!!"];
    if (remark) {
      updatedRemark.push(remark);
    }
    headers.set("Remark", updatedRemark.join(" "));
  }
  const keys = Array.from(headers.keys());
  const output: string[] = [];
  for (const key of keys) {
    const value = headers.get(key);
    output.push(`#${key}: ${value}`);
  }
  const softwareVersionHeader = output.join("\n");
  return softwareVersionHeader;
};

const getFieldsHeader = (fields: Field[]) => {
  return `#Fields: ${fields.join(" ")}`;
};

const getEventLog = (
  fields: Field[],
  event: Event,
  options?: LogOptions | undefined
) => {
  const isoDT = isoDateTime(new Date());
  const isoDate = isoDT.substring(0, 10);
  const isoTime = isoDT.substring(11);
  const output = [];
  for (const key of fields) {
    let showPasswords = false;
    if (options?.showPasswords === true) {
      showPasswords = true;
    }
    // @ts-ignore can't index Event using a string
    let value = event[key];
    // TODO: only show time if date not provided, vice versa
    if (key === "date") {
      if (value) {
        if (value instanceof Date) {
          value = isoDateTime(value).substring(0, 10);
        }
        output.push(value);
        continue;
      }
      output.push(isoDate);
      continue;
    }
    if (key === "time") {
      if (value) {
        if (value instanceof Date) {
          value = isoDateTime(value).substring(11);
        }
        output.push(value);
        continue;
      }
      output.push(isoTime);
      continue;
    }
    if (value && typeof value === "object") {
      if ("password" in value && !showPasswords) {
        // copy the object under the same name
        value = { ...value };
        value.password = "<redacted>";
      }
      value = `'${JSON.stringify(value)}'`;
    } else if (value === undefined) {
      value = options?.undefined || "undefined";
    } else if (value === null) {
      value = "null";
    }
    output.push(value);
  }
  return output.join(" ");
};

export type StartLogProps = {
  headers?: StampHeaders | undefined;
  fields: Field[];
  options?: LogOptions;
};
export const startLog = ({ headers, fields, options }: StartLogProps) => {
  const fieldsHeader = getFieldsHeader(fields);
  let version = "";
  let header = fieldsHeader;
  version = getVersionHeader(headers, options);
  if (headers) {
    header = [version, fieldsHeader].join("\n");
  }
  return {
    __headers: headers,
    __options: options,
    __version: version,
    __fields: fieldsHeader,
    header,
    event: (event: Event) => {
      return getEventLog(fields, event, options);
    },
    printHeader: () => console.log(header),
    print: (event: Event) => {
      console.log(getEventLog(fields, event, options));
    },
    error: (event: Event) => {
      console.error(getEventLog(fields, event, options));
    },
  };
};
