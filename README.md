# W3C Extended Log Formatter

This module produces standardized event logs based on the W3C [Extended Log File Format](https://www.w3.org/TR/WD-logfile.html).

It is meant for producing HTTP-style logs, which can be routed to STDOUT, a log file (with optional log rotation), and/or a network log analyzer.

By using a standard log format, your log data can be processed through standard tools.

An example log event for a HTTP request might look like this:

```
2023-01-16 13:03:56 POST /graphql 201 HTTP/1.1
```

This library can create that entry using this line:

```typescript
log.print({
  "cs-method": "POST",
  "cs-uri-stem": "/graphql",
  "sc-status": 201,
  "cs-version": "HTTP/2",
});
```

Or you can capture the log and print it yourself or save it directly to a file:

```typescript
// print to stdout
console.log(
  log.event({
    "cs-method": "POST",
    "cs-uri-stem": "/graphql",
    "sc-status": 201,
    "cs-version": "HTTP/2",
  })
);

// append to a file
fs.appendFileSync(
  "/var/log/myprogram.log",
  log.event({
    "cs-method": "POST",
    "cs-uri-stem": "/graphql",
    "sc-status": 201,
    "cs-version": "HTTP/2",
  }) + "\n"
);
```

## Installation

**NPM:**

```bash
npm install --save w3c-log
```

**Yarn**

```bash
yarn add w3c-log
```

**Browser**

Browser file can be found in `dist/index.js`

```html
<script src="/path/to/index.js"></script>
```

## Usage

```
npm install w3c-log
```

Let's see how to build a standard HTTP log for an "Example v1.0.0" software:

```log
#Software: Example
#Version 1.0.0
#Date 2023-01-16 13:03:34
#Fields date time cs-method cs-uri-stem sc-status cs-version
2023-01-16 13:03:45 GET /path/to/file 200 HTTP/1.1
2023-01-16 13:03:56 POST /path/to/file 201 HTTP/1.1
```

## Importing the module:

Typescript:

```typescript
// import startLog and types if necessary
import { startLog } from "w3c-log";
```

Javascript:

```javascript
import { startLog } from "w3c-log";
// or
const startLog = require("w3c-log").startLog;
```

## Define the Log Format and Metadata

Start by initializing the logger. You will need to define the log format

```typescript
// Define the log fields. This represents an ordered list
// of fields that each log entry will contain.
const fields = [
  "date",
  "time",
  "cs-method",
  "cs-uri-stem",
  "sc-status",
  "cs-version",
];

// Create the log. The log lets you
const log = startLog({ fields });

// print the log header to the console.
// This is typically done each time the software loads
console.log(log.header);
```

Console output:

```log
#Fields date time cs-method cs-uri-stem sc-status cs-version
```

It is even better to describe the software version and other information which relates to the log as the logging software starts logging.

```typescript
// Define the header data.  The order matters, so we use a Map();
const headers = new Map<StampHeaderKey, string>();
// or in javascript: const headers = new Map();
headers.set("Software", "Example Software");
headers.set("Version", "1.0.0");
headers.set("Date", isoDateTime(new Date()));

const log = startLog({ headers, fields });

console.log(log.header);
// or
log.printHeader();
```

Console output:

```log
#Software: Example
#Version 1.0.0
#Date 2023-01-16 13:03:34
#Fields date time cs-method cs-uri-stem sc-status cs-version
```

## Log Events

Now you can log events.

Because we specifed "date" and "time" fields in the header, the current date and time will be included in the log event, or you can insert the `date` and `time` fields manually.

Here is how we might log a GET request to the `/index.html` endpoint over HTTP 1.1:

```typescript
const getEvent = log.event({
  // "date": new Date(), // date and time will be included by default
  // "time": new Time(), // if the 'date' and 'time' fields were defined.
  "cs-method": "GET",
  "cs-uri-stem": "/index.html",
  "sc-status": 200,
  "cs-version": "HTTP/1.1",
});

console.log(getEvent);
// or
log.print(event);
```

Console Output:

```log
2023-01-16 13:03:45 GET /index.html 200 HTTP/1.1
```

Here is how we might log a POST request to the `/graphql endpoitn over HTTP 1.1

```typescript
const postEvent = log.event({
  "cs-method": "POST",
  "cs-uri-stem": "/graphql",
  "sc-status": 201,
  "cs-version": "HTTP/1.1",
});

console.log(postEvent);
```

Console output:

```
2023-01-16 13:03:56 POST /graphql 201 HTTP/2
```

You can even create custom headers and pass objects. You can put in JSON objects, booleans, null, and undefined values

```typescript
const fields = [
  "true",
  "false",
  "number",
  "string",
  "object",
  "null",
  "undefined",
  "unreferenced",
];
const mixedLog = startLog({ fields });

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
```

Console output:

```log
true false 100 string '{"key":"value"}' null undefined undefined
```

### Password Redaction

Passwords are redacted by default, but can be exposed

```typescript
const fields = ["login"];

const log = createLog({ fields, options });
console.log(log.headers);
// Output:
// #Fields: login
console.log(
  log.event({
    login: { username: "john", password: "insecure" },
  })
);
// Output:
// '{"username":"john","password":"<redacted>"}'

const options = {
  redactPasswords: false,
};
const unsafeLog = createLog({ fields, options });
console.log(unsafeLog.headers);
// Output:
// #Remark: !!! PASSWORDS ARE EXPOSED IN LOG !!!
// #Fields: login
console.log(
  unsafeLog.event({
    login: { username: "john", password: "insecure" },
  })
);
// Output:
// '{"username":"john","password":"insecure"}'
```

## Using with other software

### Logging to file

```bash
$ touch /var/log/yourproject.log
$ node yourproject.js >> /var/log/yourproject.log
```

### Logging to file and console

```bash
$ touch /var/log/yourproject.log
$ node yourproject.js 2>&1 | tee /var/log/yourproject.log
```

### Logging stderr to one file and stdout to another:

```bash
$ touch /var/log/yourproject.access.log
$ touch /var/log/yourproject.error.log
$ node yourproject.js | tee /var/log/yourproject.access.log > /var/log/yourproject.error.log
```

## Building Locally

### Setup

```
npm install
```

### Test

```
npm# run test
```

### Build

```
npm run build
```
