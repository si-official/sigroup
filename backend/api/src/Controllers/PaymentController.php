<?php
namespace App\Controllers;

class PaymentController
{
    public static function init(string $app): void
    {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];

        $storeId   = $_ENV['SSLCZ_STORE_ID']   ?? '';
        $storePass = $_ENV['SSLCZ_STORE_PASS']  ?? '';
        $isLive    = ($_ENV['SSLCZ_IS_LIVE'] ?? 'false') === 'true';
        $baseUrl   = $isLive ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
        $apiBase   = $_ENV['APP_URL'] ?? 'https://api.sigroup.com.bd';

        $orderId = 'SI-' . time() . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

        $postData = http_build_query([
            'store_id'        => $storeId,
            'store_passwd'    => $storePass,
            'total_amount'    => $body['total'] ?? 0,
            'currency'        => 'BDT',
            'tran_id'         => $orderId,
            'success_url'     => "{$apiBase}/payment/{$app}/success",
            'fail_url'        => "{$apiBase}/payment/{$app}/fail",
            'cancel_url'      => "{$apiBase}/payment/{$app}/cancel",
            'ipn_url'         => "{$apiBase}/payment/{$app}/success",
            'cus_name'        => $body['name']    ?? 'Customer',
            'cus_email'       => $body['email']   ?? '',
            'cus_add1'        => $body['address'] ?? 'Dhaka',
            'cus_city'        => 'Dhaka',
            'cus_country'     => 'Bangladesh',
            'cus_phone'       => $body['phone']   ?? '',
            'product_name'    => $body['productName'] ?? 'Order',
            'product_category'=> 'Digital',
            'product_profile' => 'general',
            'shipping_method' => 'NO',
            'num_of_item'     => count($body['items'] ?? [1]),
            'weight_of_items' => 0.1,
            'product_amount'  => $body['total'] ?? 0,
            'vat'             => 0,
            'discount_amount' => 0,
            'convenience_fee' => 0,
        ]);

        $ch = curl_init("{$baseUrl}/gwprocess/v4/api.php");
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $postData,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT        => 30,
        ]);
        $res  = curl_exec($ch);
        $err  = curl_error($ch);
        curl_close($ch);

        if ($err) respond(500, ['error' => $err]);

        $data = json_decode($res, true);
        if (($data['status'] ?? '') === 'SUCCESS') {
            respond(200, ['payment_url' => $data['GatewayPageURL']]);
        } else {
            respond(400, ['error' => $data['failedreason'] ?? 'Payment init failed']);
        }
    }

    public static function success(string $app): void
    {
        $status  = $_POST['status']  ?? $_GET['status']  ?? '';
        $tranId  = $_POST['tran_id'] ?? $_GET['tran_id'] ?? '';
        $valId   = $_POST['val_id']  ?? $_GET['val_id']  ?? '';

        $frontendUrl = self::frontendUrl($app);

        if (in_array($status, ['VALID', 'VALIDATED'])) {
            $token = bin2hex(random_bytes(16));
            // TODO: persist order paid status and token in DB
            header("Location: {$frontendUrl}/payment/success?token={$token}&tran_id={$tranId}");
        } else {
            header("Location: {$frontendUrl}/payment/fail");
        }
        exit;
    }

    public static function fail(string $app): void
    {
        $frontendUrl = self::frontendUrl($app);
        header("Location: {$frontendUrl}/payment/fail");
        exit;
    }

    public static function cancel(string $app): void
    {
        $frontendUrl = self::frontendUrl($app);
        header("Location: {$frontendUrl}/payment/cancel");
        exit;
    }

    public static function download(string $orderId): void
    {
        $token = $_GET['token'] ?? '';
        if (!$token || !$orderId) {
            respond(403, ['error' => 'Invalid download link']);
        }
        // TODO: validate token in DB and stream real file
        // For now return a placeholder response
        respond(200, ['order_id' => $orderId, 'status' => 'Download ready', 'message' => 'File delivery coming soon']);
    }

    private static function frontendUrl(string $app): string
    {
        return match($app) {
            'shop'   => 'https://shop.sigroup.com.bd',
            'school' => 'https://school.sigroup.com.bd',
            default  => 'https://sigroup.com.bd',
        };
    }
}
