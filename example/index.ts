import {
  isoDateTime,
  LogOptions,
  StampHeaderKey,
  startLog,
} from "../src/index";

// The log consists of two parts:
// 1. A one time "stamp" which provides the software version and log format
// 2. a line-by-line event log

// Step 1:
// create the Stamp by defining the software version information
// and stamp date. Note that the convention is to use title-case keys
// for this step
const headers = new Map<StampHeaderKey, string>();
headers.set("Software", "Example Software");
headers.set("Version", "1.0.0");
headers.set("Date", isoDateTime(new Date()));

// Then define the order of the fields to explain the log format
const fields = [
  "date",
  "time",
  "cs-method",
  "cs-uri-stem",
  "sc-status",
  "cs-version",
];

// Step 2: create a log
console.log("--- Displaying log header on application startup ---");
const log = startLog({ headers, fields });
console.log(log.header);
// output:
// #Software: Example #Version 1.0.0 #Date 2023-01-16 13:03:45
// #Fields date time cs-method cs-uri-stem sc-status cs-version

// Step 3: log an event. Note that the date and time will be automatically
// included if they were defined in the eventHeaders
console.log("");
console.log("--- Displaying an Apache-style HTTP log event ---");
console.log(
  log.event({
    "cs-method": "GET",
    "cs-uri-stem": "/path/to/file",
    "sc-status": 200,
    "cs-version": "HTTP/1.1",
  })
);
// output:
// 2023-01-16 13:03:45 GET /path/to/file 200 HTTP/1.1

// you can put in JSON objets
const mixedFields = [
  "true",
  "false",
  "number",
  "string",
  "object",
  "null",
  "undefined",
  "unreferenced",
];
const mixedLog = startLog({ headers, fields: mixedFields });

console.log("");
console.log("--- Displaying mixed data including JSON from a new logger ---");
console.log(
  mixedLog.event({
    false: false,
    true: true,
    number: 100,
    string: "string",
    undefined: undefined,
    null: null,
    object: { key: "value" },
  })
);
// output
// true false 100 string '{"key":"value"}' null undefined undefined

const loginData = { username: "john", password: "insecure" };

const loginFields = ["login"];
const redactedLog = startLog({ fields: loginFields });
console.log("");
console.log("--- Example showing redacted password (default) ---");
console.log(redactedLog.header);
console.log(
  redactedLog.event({
    login: loginData,
  })
);

const options: LogOptions = { showPasswords: true };
const unredactedLog = startLog({
  fields: loginFields,
  options,
});
console.log("");
console.log("--- Example showing unredacted password ---");
console.log(unredactedLog.header);
console.log(
  unredactedLog.event({
    login: loginData,
  })
);

// Default values can be set also (no demo or tests yet)

// Using console.log() or console.error() allows you to
// stream the events directly to STOUT or STERR, but
// You could also direct them into a file or to a network log parser
