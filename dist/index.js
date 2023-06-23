"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startLog = exports.isoDateTime = void 0;
const isoDateTime = (date) => {
    return date.toISOString().replace("T", " ").substring(0, 19);
};
exports.isoDateTime = isoDateTime;
const getVersionHeader = (headers, options) => {
    if (!headers) {
        headers = new Map();
    }
    if ((options === null || options === void 0 ? void 0 : options.showPasswords) === true) {
        let remark = headers.get("Remark");
        const updatedRemark = ["!!! PASSWORDS ARE EXPOSED IN LOG !!!"];
        if (remark) {
            updatedRemark.push(remark);
        }
        headers.set("Remark", updatedRemark.join(" "));
    }
    const keys = Array.from(headers.keys());
    const output = [];
    for (const key of keys) {
        const value = headers.get(key);
        output.push(`#${key}: ${value}`);
    }
    const softwareVersionHeader = output.join("\n");
    return softwareVersionHeader;
};
const getFieldsHeader = (fields) => {
    return `#Fields: ${fields.join(" ")}`;
};
const getEventLog = (fields, event, options) => {
    const isoDT = (0, exports.isoDateTime)(new Date());
    const isoDate = isoDT.substring(0, 10);
    const isoTime = isoDT.substring(11);
    const output = [];
    for (const key of fields) {
        let showPasswords = false;
        if ((options === null || options === void 0 ? void 0 : options.showPasswords) === true) {
            showPasswords = true;
        }
        // @ts-ignore can't index Event using a string
        let value = event[key];
        // TODO: only show time if date not provided, vice versa
        if (key === "date") {
            if (value) {
                if (value instanceof Date) {
                    value = (0, exports.isoDateTime)(value).substring(0, 10);
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
                    value = (0, exports.isoDateTime)(value).substring(11);
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
                value = Object.assign({}, value);
                value.password = "<redacted>";
            }
            value = `'${JSON.stringify(value)}'`;
        }
        else if (value === undefined) {
            value = (options === null || options === void 0 ? void 0 : options.undefined) || "undefined";
        }
        else if (value === null) {
            value = "null";
        }
        output.push(value);
    }
    return output.join(" ");
};
const startLog = ({ headers, fields, options }) => {
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
        event: (event) => {
            return getEventLog(fields, event, options);
        },
        printHeader: () => console.log(header),
        print: (event) => {
            console.log(getEventLog(fields, event, options));
        },
        error: (event) => {
            console.error(getEventLog(fields, event, options));
        },
    };
};
exports.startLog = startLog;
