<?php
const JWT_SECRET = 'secret123';

function base64url_encode($data) {
    return rtrim(strtr(base64_encode(json_encode($data)), '+/', '-_'), '=');
}
function base64url_decode($data) {
    return json_decode(base64_decode(strtr($data, '-_', '+/')), true);
}

function generate_jwt($payload) {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $header_b64 = base64url_encode($header);
    $payload_b64 = base64url_encode($payload);
    $signature = hash_hmac('sha256', "$header_b64.$payload_b64", JWT_SECRET, true);
    $signature_b64 = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    return "$header_b64.$payload_b64.$signature_b64";
}

function verify_jwt($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    list($header_b64, $payload_b64, $signature_b64) = $parts;
    $expected_sig = rtrim(strtr(base64_encode(hash_hmac('sha256', "$header_b64.$payload_b64", JWT_SECRET, true)), '+/', '-_'), '=');
    if (!hash_equals($signature_b64, $expected_sig)) return false;
    $payload = base64url_decode($payload_b64);
    if (isset($payload['exp']) && $payload['exp'] < time()) return false;
    return $payload;
}
