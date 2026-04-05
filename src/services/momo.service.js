import crypto from "crypto";
import https from "https";

const DEFAULT_ENDPOINT_URL = "https://test-payment.momo.vn/v2/gateway/api/create";

function parseBoolean(value, fallback = false) {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
    return fallback;
}

const momoEndpoint = new URL(process.env.MOMO_ENDPOINT_URL || DEFAULT_ENDPOINT_URL);

const MOMO_CONFIG = {
    accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    partnerName: process.env.MOMO_PARTNER_NAME || "Test",
    storeId: process.env.MOMO_STORE_ID || "MomoTestStore",
    requestType: process.env.MOMO_REQUEST_TYPE || "payWithMethod",
    endpointHost: momoEndpoint.hostname,
    endpointPort: Number(momoEndpoint.port || 443),
    endpointPath: `${momoEndpoint.pathname}${momoEndpoint.search}`,
    redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/api/orders/momo/return",
    ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:3000/api/orders/momo/ipn",
    lang: process.env.MOMO_LANG || "vi",
    autoCapture: parseBoolean(process.env.MOMO_AUTO_CAPTURE, true),
    orderGroupId: process.env.MOMO_ORDER_GROUP_ID || "",
    timeoutMs: Number(process.env.MOMO_TIMEOUT_MS || 10000)
};

function signHmac(rawSignature) {
    return crypto
        .createHmac("sha256", MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest("hex");
}

function buildCreatePaymentRawSignature(payload) {
    return [
        `accessKey=${MOMO_CONFIG.accessKey}`,
        `amount=${payload.amount}`,
        `extraData=${payload.extraData}`,
        `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
        `orderId=${payload.orderId}`,
        `orderInfo=${payload.orderInfo}`,
        `partnerCode=${MOMO_CONFIG.partnerCode}`,
        `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
        `requestId=${payload.requestId}`,
        `requestType=${MOMO_CONFIG.requestType}`
    ].join("&");
}

function buildIpnRawSignature(ipnData) {
    return [
        `accessKey=${MOMO_CONFIG.accessKey}`,
        `amount=${ipnData.amount ?? ""}`,
        `extraData=${ipnData.extraData ?? ""}`,
        `message=${ipnData.message ?? ""}`,
        `orderId=${ipnData.orderId ?? ""}`,
        `orderInfo=${ipnData.orderInfo ?? ""}`,
        `orderType=${ipnData.orderType ?? ""}`,
        `partnerCode=${ipnData.partnerCode ?? ""}`,
        `payType=${ipnData.payType ?? ""}`,
        `requestId=${ipnData.requestId ?? ""}`,
        `responseTime=${ipnData.responseTime ?? ""}`,
        `resultCode=${ipnData.resultCode ?? ""}`,
        `transId=${ipnData.transId ?? ""}`
    ].join("&");
}

function postJson(options, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const request = https.request(
            {
                ...options,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body)
                }
            },
            (response) => {
                let rawData = "";
                response.setEncoding("utf8");

                response.on("data", (chunk) => {
                    rawData += chunk;
                });

                response.on("end", () => {
                    let parsedData = {};
                    if (rawData) {
                        try {
                            parsedData = JSON.parse(rawData);
                        } catch (_error) {
                            reject(new Error("MoMo tra ve du lieu JSON khong hop le"));
                            return;
                        }
                    }

                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(parsedData);
                        return;
                    }

                    const error = new Error(parsedData.message || `MoMo request failed with status ${response.statusCode}`);
                    error.response = parsedData;
                    reject(error);
                });
            }
        );

        request.on("error", (error) => {
            reject(error);
        });

        request.setTimeout(MOMO_CONFIG.timeoutMs, () => {
            request.destroy(new Error("MoMo request timeout"));
        });

        request.write(body);
        request.end();
    });
}

class MomoService {
    async createPayment({ orderId, amount, orderInfo, extraData = "" }) {
        if (!orderId || !orderInfo) {
            throw { status: 400, message: "Du lieu tao thanh toan MoMo khong hop le" };
        }

        const normalizedAmount = Math.round(Number(amount));
        if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
            throw { status: 400, message: "So tien thanh toan MoMo khong hop le" };
        }

        const payload = {
            partnerCode: MOMO_CONFIG.partnerCode,
            partnerName: MOMO_CONFIG.partnerName,
            storeId: MOMO_CONFIG.storeId,
            requestId: `${orderId}_${Date.now()}`,
            amount: String(normalizedAmount),
            orderId: String(orderId),
            orderInfo: String(orderInfo),
            redirectUrl: MOMO_CONFIG.redirectUrl,
            ipnUrl: MOMO_CONFIG.ipnUrl,
            lang: MOMO_CONFIG.lang,
            requestType: MOMO_CONFIG.requestType,
            autoCapture: MOMO_CONFIG.autoCapture,
            extraData: String(extraData || ""),
            orderGroupId: MOMO_CONFIG.orderGroupId
        };

        const rawSignature = buildCreatePaymentRawSignature(payload);
        const signature = signHmac(rawSignature);

        try {
            return await postJson(
                {
                    hostname: MOMO_CONFIG.endpointHost,
                    port: MOMO_CONFIG.endpointPort,
                    path: MOMO_CONFIG.endpointPath
                },
                {
                    ...payload,
                    signature
                }
            );
        } catch (error) {
            throw {
                status: 502,
                message: error.message || "Khong the ket noi MoMo",
                data: error.response || null
            };
        }
    }

    verifyIpnSignature(ipnData = {}) {
        const incomingSignature = String(ipnData.signature || "");
        if (!incomingSignature) {
            return false;
        }

        const expectedSignature = signHmac(buildIpnRawSignature(ipnData));
        return incomingSignature === expectedSignature;
    }
}

export default new MomoService();