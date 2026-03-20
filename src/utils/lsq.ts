import logger from "./logger";

export type LeadAttribute = { Attribute: string; Value: string };
export type LeadRecord = Record<string, string | null>;

type QueueTask<T> = () => Promise<T>;

const getQueueSettings = () => ({
    concurrency: Number(process.env.LSQ_CONCURRENCY || 5),
    maxQueue: Number(process.env.LSQ_MAX_QUEUE || 5000),
    retries: Number(process.env.LSQ_RETRIES || 2),
    baseDelayMs: Number(process.env.LSQ_RETRY_DELAY_MS || 500)
});

const getEnv = () => ({
    host: process.env.LSQ_HOST,
    accessKey: process.env.LSQ_ACCESS_KEY,
    secretKey: process.env.LSQ_SECRET_KEY,
});

class TaskQueue {
    private active = 0;
    private queue: Array<{
        task: QueueTask<unknown>;
        resolve: (value: unknown) => void;
        reject: (reason?: unknown) => void;
    }> = [];
    private concurrency: number;
    private maxQueue: number;

    constructor(concurrency: number, maxQueue: number) {
        this.concurrency = Math.max(1, concurrency);
        this.maxQueue = Math.max(100, maxQueue);
    }

    enqueue<T>(task: QueueTask<T>) {
        return new Promise<T>((resolve, reject) => {
            if (this.queue.length >= this.maxQueue) {
                reject(new Error("LeadSquared queue is full"));
                return;
            }
            this.queue.push({
                task: task as QueueTask<unknown>,
                resolve: resolve as (value: unknown) => void,
                reject: reject as (reason?: unknown) => void
            });
            this.runNext();
        });
    }

    private runNext() {
        if (this.active >= this.concurrency) return;
        const next = this.queue.shift();
        if (!next) return;
        this.active += 1;
        next.task()
            .then((value) => next.resolve(value))
            .catch((err) => next.reject(err))
            .finally(() => {
                this.active -= 1;
                this.runNext();
            });
    }
}

const queueSettings = getQueueSettings();
const leadSquaredQueue = new TaskQueue(queueSettings.concurrency, queueSettings.maxQueue);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withRetries = async <T,>(task: QueueTask<T>) => {
    const { retries, baseDelayMs } = getQueueSettings();
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt += 1) {
        try {
            return await task();
        } catch (err) {
            lastError = err;
            const delay = baseDelayMs * Math.pow(2, attempt);
            await sleep(delay);
        }
    }
    throw lastError;
};

const enqueueLeadSquaredTask = async <T,>(task: QueueTask<T>) => {
    return leadSquaredQueue.enqueue(() => withRetries(task));
};

const normalizePhoneForLsq = (value?: string | null) => {
    if (!value) return null;
    const digits = String(value).replace(/\D/g, "");
    if (!digits) return null;
    if (digits.length > 10) {
        return digits.slice(-10);
    }
    return digits;
};

const normalizeHost = (host: string) => {
    const trimmed = host.trim();
    const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const withoutTrailing = withScheme.replace(/\/+$/, "");
    return withoutTrailing.replace(/\/v2$/i, "");
};

const buildLeadCaptureUrl = (host: string) => {
    const base = normalizeHost(host);
    const params = new URLSearchParams({
        LeadUpdateBehavior: "UpdateOnlyEmptyFields"
    });
    return `${base}/v2/LeadManagement.svc/Lead.Capture?${params.toString()}`;
};

export const sendLeadSquaredCapture = async (
    attributes: LeadAttribute[],
    searchBy: "Phone" | "EmailAddress" = "Phone"
) => {
    const { host, accessKey, secretKey } = getEnv();
    if (process.env.ENABLE_LSQ_SYNC !== "true" || !host || !accessKey || !secretKey) {
        if (process.env.ENABLE_LSQ_SYNC === "true") {
            logger.warn("LeadSquared not configured. Skipping lead capture.");
        }
        return;
    }

    const url = buildLeadCaptureUrl(host);
    const payload = [...attributes, { Attribute: "SearchBy", Value: searchBy }];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-LSQ-AccessKey": accessKey,
            "x-LSQ-SecretKey": secretKey
        },
        body: JSON.stringify(payload),
        signal: controller.signal
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LeadSquared capture failed (${res.status}): ${text}`);
    }
};

const fetchLeadByPhone = async (phone: string): Promise<LeadRecord | null> => {
    const { host, accessKey, secretKey } = getEnv();
    if (process.env.ENABLE_LSQ_SYNC !== "true" || !host || !accessKey || !secretKey) return null;

    const base = normalizeHost(host);
    const url = new URL(`${base}/v2/LeadManagement.svc/RetrieveLeadByPhoneNumber`);
    url.searchParams.set("accessKey", accessKey || "");
    url.searchParams.set("secretKey", secretKey || "");
    url.searchParams.set("phone", phone);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
        signal: controller.signal
    }).finally(() => clearTimeout(timeout));

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`LeadSquared retrieve failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as LeadRecord[];
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0] || null;
};

const buildActivityUrl = (host: string, accessKey: string, secretKey: string) => {
    const base = normalizeHost(host);
    const url = new URL(`${base}/v2/ProspectActivity.svc/Create`);
    url.searchParams.set("accessKey", accessKey);
    url.searchParams.set("secretKey", secretKey);
    return url.toString();
};

const formatUtcDateTime = (value: Date) => {
    const pad = (num: number) => String(num).padStart(2, "0");
    return [
        value.getUTCFullYear(),
        pad(value.getUTCMonth() + 1),
        pad(value.getUTCDate())
    ].join("-") + ` ${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}`;
};

const pickLeadValue = (lead: LeadRecord, keys: string[]) => {
    for (const key of keys) {
        const val = lead[key];
        if (val && val.trim()) return val.trim();
    }
    return null;
};

const formatLeadSquaredDateTime = (value?: string | null) => {
    if (!value) return null;
    const dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return null;

    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).formatToParts(dt);

    const get = (type: string) =>
        parts.find((p) => p.type === type)?.value || "00";

    return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
};

export const buildLeadSquaredAttributes = (params: {
    name?: string | null;
    email?: string | null;
    mobile?: string | null;
    eduQualificationName?: string | null;
    workExperience?: string | null;
    examCenterName?: string | null;
    source?: string | null;
    attendedScholarship?: boolean | null;
    lapSignInDate?: string | null;
}) => {
    const phone = normalizePhoneForLsq(params.mobile);
    if (!phone) return null;

    const name = (params.name || "").trim();
    const [firstName, ...rest] = name.split(/\s+/);
    const lastName = rest.join(" ").trim();

    const lapSignInDate = formatLeadSquaredDateTime(params.lapSignInDate);

    const attrs: LeadAttribute[] = [
        { Attribute: "FirstName", Value: firstName || "" },
        { Attribute: "LastName", Value: lastName || "" },
        { Attribute: "Phone", Value: phone },
        { Attribute: "EmailAddress", Value: params.email || "" },
        { Attribute: "mx_Highest_Education_Qualification", Value: params.eduQualificationName || "" },
        { Attribute: "mx_Work_Experience", Value: params.workExperience || "" },
        { Attribute: "mx_Branch", Value: params.examCenterName || "" },
        { Attribute: "Source", Value: params.source || "Lakshya Assesment portal" },
        ...(params.attendedScholarship ? [{ Attribute: "mx_Attended_Scholarship", Value: "Yes" }] : []),
        ...(lapSignInDate ? [{ Attribute: "mx_LAP_SignIn_Date", Value: lapSignInDate }] : [])
    ];

    return attrs.filter((a) => a.Value !== "");
};

export const sendLeadSquaredCaptureIfNeeded = async (attributes: LeadAttribute[]) => {
    if (process.env.ENABLE_LSQ_SYNC !== "true") {
        return;
    }
    return enqueueLeadSquaredTask(async () => {
        const phoneAttr = attributes.find((attr) => attr.Attribute === "Phone");
        const phone = phoneAttr?.Value;
        if (!phone) return;

        try {
            const lead = await fetchLeadByPhone(phone);
            if (lead) {
                const pending = attributes.filter((attr) => {
                    if (attr.Attribute === "Phone") return true;
                    const current = lead[attr.Attribute];
                    if (current === null || current === undefined) return true;
                    if (typeof current === "string" && current.trim() === "") return true;
                    return false;
                });

                if (pending.length <= 1) {
                    return;
                }

                await sendLeadSquaredCapture(pending, "Phone");
                return;
            }
        } catch (err: any) {
            logger.error(err, "LeadSquared retrieve failed");
        }

        await sendLeadSquaredCapture(attributes, "Phone");
    });
};

export const sendLeadSquaredExamAttemptActivity = async (params: {
    leadAttributes?: LeadAttribute[] | null;
    productName: string;
    markObtained: number;
    totalMarks: number;
    reportPdfUrl?: string | null;
    contactCategory?: string | null;
    activityEventCode?: number;
    activityName?: string | null;
}) => {
    if (process.env.ENABLE_LSQ_SYNC !== "true") {
        return;
    }
    return enqueueLeadSquaredTask(async () => {
        const { host, accessKey, secretKey } = getEnv();
        if (!host || !accessKey || !secretKey) {
            logger.warn("LeadSquared not configured. Skipping exam activity.");
            return;
        }

        const activityEventCode = params.activityEventCode ?? 238;
        const activityName = params.activityName || "Scholarship Exam 2025-2026";
        const leadAttributes = params.leadAttributes || [];
        const phone = leadAttributes.find((attr) => attr.Attribute === "Phone")?.Value;
        if (!phone) return;

        let lead = await fetchLeadByPhone(phone);
        if (!lead && leadAttributes.length > 0) {
            await sendLeadSquaredCaptureIfNeeded(leadAttributes);
            lead = await fetchLeadByPhone(phone);
        }
        if (!lead) return;

        const leadId = pickLeadValue(lead, ["ProspectID", "ProspectId", "LeadId", "LeadID"]);
        if (!leadId) return;

        const contactCategory =
            (params.contactCategory && params.contactCategory.trim()) ||
            pickLeadValue(lead, ["mx_Custom_3", "Contact Category", "ContactCategory"]);

        const fields = [
            { SchemaName: "mx_Custom_5", Value: params.productName },
            { SchemaName: "mx_Custom_2", Value: String(params.markObtained) },
            ...(contactCategory ? [{ SchemaName: "mx_Custom_3", Value: contactCategory }] : []),
            { SchemaName: "mx_Custom_4", Value: String(params.totalMarks) },
            ...(params.reportPdfUrl ? [{ SchemaName: "mx_Custom_7", Value: params.reportPdfUrl }] : [])
        ];

        const payload = {
            RelatedProspectId: leadId,
            ActivityEvent: activityEventCode,
            ActivityNote: `${activityName} - ${params.productName}`,
            ActivityDateTime: formatUtcDateTime(new Date()),
            ValidateDropDownOptions: true,
            Fields: fields
        };
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(buildActivityUrl(host, accessKey, secretKey), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
        }).finally(() => clearTimeout(timeout));

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`LeadSquared activity failed (${res.status}): ${text}`);
        }
    });
};
