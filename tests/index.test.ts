import {
  isoDateTime,
  LogOptions,
  StampHeaderKey,
  startLog,
} from "../src/index";

describe("testing logger", () => {
  test("create a logger", () => {
    const headers = new Map<StampHeaderKey, string>();
    const fields: string[] = [];
    const log = startLog({ headers, fields });
    expect(typeof log).toBe("object");
    expect(log.__fields).toBe("#Fields: ");
    expect(log.__version).toBe("");
    expect(log.event).not.toBe(undefined);
  });

  test("create multiple loggers", () => {
    const headers1 = new Map<StampHeaderKey, string>();
    headers1.set("Software", "One");
    const fields1: string[] = [];
    const log1 = startLog({ headers: headers1, fields: fields1 });
    const headers2 = new Map<StampHeaderKey, string>();
    headers2.set("Software", "Two");
    const fields2: string[] = [];
    const log2 = startLog({ headers: headers2, fields: fields2 });
    expect(log1.__version).not.toBe(log2.__version);
    expect(log1.__version).toBe("#Software: One");
    expect(log2.__version).toBe("#Software: Two");
  });

  test("logger without options", () => {
    const fields: string[] = ["date", "time", "cs-method"];
    const log = startLog({ fields });
    expect(log.__fields).toBe("#Fields: date time cs-method");
    expect(log.header).toBe("#Fields: date time cs-method");
    expect(log.event).not.toBe(undefined);
  });

  test("software Version", () => {
    const dateTime = isoDateTime(new Date());
    const headers = new Map<StampHeaderKey, string>();
    headers.set("Software", "Example Software");
    headers.set("Version", "1.0.0");
    headers.set("Date", dateTime);
    const fields: string[] = [];
    const log = startLog({ headers, fields });
    const versionHeader = log.__version;
    const expectedVersion = [
      `#Software: Example Software`,
      `#Version: 1.0.0`,
      `#Date: ${dateTime}`,
    ].join("\n");
    expect(versionHeader).toBe(expectedVersion);
  });
  test("fields", () => {
    const dateTime = isoDateTime(new Date());
    const headers = new Map<StampHeaderKey, string>();
    headers.set("Software", "Example Software");
    headers.set("Version", "1.0.0");
    headers.set("Date", dateTime);
    const fields = [
      "date",
      "time",
      "cs-method",
      "cs-uri-stem",
      "sc-status",
      "cs-version",
    ];
    const log = startLog({ headers, fields });
    const fieldsHeader = log.__fields;
    const expectedFields = `#Fields: date time cs-method cs-uri-stem sc-status cs-version`;
    expect(fieldsHeader).toBe(expectedFields);
  });
  test("header", () => {
    const dateTime = isoDateTime(new Date());
    const headers = new Map<StampHeaderKey, string>();
    headers.set("Software", "Example Software");
    headers.set("Version", "1.0.0");
    headers.set("Date", dateTime);
    const fields = [
      "date",
      "time",
      "cs-method",
      "cs-uri-stem",
      "sc-status",
      "cs-version",
    ];
    const log = startLog({ headers, fields });
    const header = log.header;
    const expectedHeader = [
      `#Software: Example Software`,
      `#Version: 1.0.0`,
      `#Date: ${dateTime}`,
      `#Fields: date time cs-method cs-uri-stem sc-status cs-version`,
    ].join("\n");
    expect(header).toBe(expectedHeader);
  });
  test("event explicit date", () => {
    const headers = new Map<StampHeaderKey, string>();
    const fields = [
      "date",
      "time",
      "cs-method",
      "cs-uri-stem",
      "sc-status",
      "cs-version",
    ];
    const log = startLog({ headers, fields });
    const dateTime = isoDateTime(new Date());
    const header = log.event({
      date: new Date(),
      "cs-version": "HTTP/1.1",
      "sc-status": 200,
      "cs-method": "GET",
      "cs-uri-stem": "/path/to/url",
    });
    // FIXME: dateTime could be out of sync if the test is performed
    // at exactly midnight during the date roll-over
    // Fix by extracting the log datetime and expecting it to be "recent"
    // and compairing the rest of the fields to the structure.
    const expectedEvent = `${dateTime} GET /path/to/url 200 HTTP/1.1`;
    expect(header).toBe(expectedEvent);
  });
  test("event no date", () => {
    const headers = new Map<StampHeaderKey, string>();
    const fields = [
      "date",
      "time",
      "cs-method",
      "cs-uri-stem",
      "sc-status",
      "cs-version",
    ];
    const log = startLog({ headers, fields });
    const header = log.event({
      "cs-version": "HTTP/1.1",
      "sc-status": 200,
      "cs-method": "GET",
      "cs-uri-stem": "/path/to/url",
    });
    // TODO: dateTime could be out of sync.
    // Fix by extracting the log datetime and expecting it to be "recent"
    // and compairing the rest of the fields to the structure.
    const dateTime = isoDateTime(new Date());
    const expectedEvent = `${dateTime} GET /path/to/url 200 HTTP/1.1`;
    expect(header).toBe(expectedEvent);
  });
  test("no date", () => {
    const dateTime = isoDateTime(new Date());
    const headers = new Map<StampHeaderKey, string>();
    const fields = ["cs-method", "cs-uri-stem", "sc-status", "cs-version"];
    const log = startLog({ headers, fields });
    const header = log.event({
      date: dateTime.substring(0, 11),
      "cs-version": "HTTP/1.1",
      "sc-status": 200,
      "cs-method": "GET",
      "cs-uri-stem": "/path/to/url",
    });
    const expectedEvent = `GET /path/to/url 200 HTTP/1.1`;
    expect(header).toBe(expectedEvent);
  });
  test("custom fields", () => {
    const headers = new Map<StampHeaderKey, string>();
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
    const log = startLog({ headers, fields });
    const event = log.event({
      false: false,
      true: true,
      number: 100,
      string: "string",
      undefined: undefined,
      null: null,
      object: { key: "value" },
    });
    const expectedEvent = `true false 100 string '{"key":"value"}' null undefined undefined`;
    expect(event).toBe(expectedEvent);
  });

  test("redact password", () => {
    const headers = new Map<StampHeaderKey, string>();
    const fields = ["login"];
    const log = startLog({ headers, fields });
    const event = log.event({
      login: { username: "user@example.com", password: "password" },
    });
    const expectedEvent = `'{"username":"user@example.com","password":"<redacted>"}'`;
    expect(event).toBe(expectedEvent);

    const options: LogOptions = { showPasswords: true };
    const log2 = startLog({ headers, fields, options });
    const expectedHeader2 = [
      `#Remark: !!! PASSWORDS ARE EXPOSED IN LOG !!!`,
      `#Fields: login`,
    ].join("\n");
    const expectedEvent2 = `'{"username":"user@example.com","password":"password"}'`;
    const event2 = log2.event({
      login: { username: "user@example.com", password: "password" },
    });
    expect(log2.header).toBe(expectedHeader2);
    expect(event2).toBe(expectedEvent2);
  });
});
