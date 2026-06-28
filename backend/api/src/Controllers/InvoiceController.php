<?php
namespace App\Controllers;

class InvoiceController
{
    public static function index(array $user): void
    {
        $db = \App\DB::instance();
        $invoices = $db->query(
            "SELECT * FROM invoices WHERE client_id = ? ORDER BY created_at DESC",
            [$user['id']]
        )->fetchAll();

        respond(200, ['invoices' => $invoices]);
    }

    public static function pay(int $id, array $user): void
    {
        $db = \App\DB::instance();
        $invoice = $db->query(
            "SELECT * FROM invoices WHERE id = ? AND client_id = ? LIMIT 1",
            [$id, $user['id']]
        )->fetch();

        if (!$invoice) respond(404, ['message' => 'Invoice not found']);
        if ($invoice['status'] === 'paid') respond(400, ['message' => 'Already paid']);

        // SSLCommerz payment initiation
        $storeId   = $_ENV['SSLCZ_STORE_ID'] ?? '';
        $storePass = $_ENV['SSLCZ_STORE_PASS'] ?? '';
        $isLive    = ($_ENV['SSLCZ_IS_LIVE'] ?? 'false') === 'true';

        $baseUrl = $isLive
            ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
            : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

        $siteUrl = 'https://portal.sigroup.com.bd';
        $data = [
            'store_id'    => $storeId,
            'store_passwd'=> $storePass,
            'total_amount'=> $invoice['amount'],
            'currency'    => 'BDT',
            'tran_id'     => 'INV-' . $id . '-' . time(),
            'success_url' => "$siteUrl/invoices?paid=$id",
            'fail_url'    => "$siteUrl/invoices?fail=$id",
            'cancel_url'  => "$siteUrl/invoices",
            'cus_name'    => $user['name'],
            'cus_email'   => $user['email'],
            'cus_add1'    => 'Dhaka',
            'cus_country' => 'Bangladesh',
            'cus_phone'   => '01700000000',
            'shipping_method' => 'NO',
            'product_name' => 'Invoice #' . $id,
            'product_category' => 'Service',
            'product_profile'  => 'general',
        ];

        $ch = curl_init($baseUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
        curl_close($ch);

        $result = json_decode($response, true);

        if (($result['status'] ?? '') === 'SUCCESS') {
            respond(200, ['payment_url' => $result['GatewayPageURL']]);
        }

        respond(500, ['message' => 'Payment initiation failed']);
    }
}
