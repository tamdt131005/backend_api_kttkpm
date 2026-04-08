import crypto from "crypto";
import https from "https";

const DEFAULT_MOMO_ENDPOINT_URL = "https://test-payment.momo.vn/v2/gateway/api/create";
const momoEndpoint = new URL(DEFAULT_MOMO_ENDPOINT_URL);

const MOMO_CONFIG = {
    accessKey: "F8BBA842ECF85",
    secretKey: "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    partnerCode: "MOMO",
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestType: "payWithMethod",
    endpointHost: momoEndpoint.hostname,
    endpointPort: Number(momoEndpoint.port || 443),
    endpointPath: `${momoEndpoint.pathname}${momoEndpoint.search}`,
    redirectUrl: "http://localhost:8000/pages/checkout/payment-success.html",
    ipnUrl: "https://charge-recipes-thee-spending.trycloudflare.com/api/orders/momo/ipn",
    lang: "vi",
    autoCapture: true,
    orderGroupId: "",
    paymentExpireMs: 10 * 60 * 1000,
    timeoutMs: 10000
};

function createSignature(rawData) {
    return crypto
        .createHmac("sha256", MOMO_CONFIG.secretKey)
        .update(rawData)
        .digest("hex");
}

function buildCreatePaymentRawData(payload) {
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

function buildIpnRawData(ipnData = {}) {
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
        const request = https.request({
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
    async taoThanhToan({ orderId, amount, orderInfo, extraData = "" }) {
        if (!orderId || !orderInfo) {
            throw { status: 400, message: "Du lieu tao thanh toan MoMo khong hop le" };
        }

        const normalizedAmount = Math.round(Number(amount));
        if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
            throw { status: 400, message: "So tien thanh toan MoMo khong hop le" };
        }

        const expiredTime = Date.now() + MOMO_CONFIG.paymentExpireMs;
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
            orderGroupId: MOMO_CONFIG.orderGroupId,
            expiredTime
        };

        const rawData = buildCreatePaymentRawData(payload);
        const signature = createSignature(rawData);

        try {
            const momoResponse = await postJson({
                hostname: MOMO_CONFIG.endpointHost,
                port: MOMO_CONFIG.endpointPort,
                path: MOMO_CONFIG.endpointPath
            }, {
                ...payload,
                signature
            });

            return {
                ...momoResponse,
                expiredTime
            };
        } catch (error) {
            throw {
                status: 502,
                message: error.message || "Khong the ket noi MoMo",
                data: error.response || null
            };
        }
    }
}

export default new MomoService();