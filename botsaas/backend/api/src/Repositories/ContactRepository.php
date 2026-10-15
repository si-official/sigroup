<?php
declare(strict_types=1);

namespace App\Repositories;

use App\Core\Db;
use PDOException;

final class ContactRepository extends BaseRepository
{
    protected string $table = 'contacts';

    /**
     * Find-or-create from an inbound webhook. Race-safe: two messages from a
     * brand-new customer arriving together would otherwise create two
     * contacts and split their history across two threads.
     */
    public function upsertFromChannel(int $channelId, string $externalId, array $profile = []): int
    {
        $existing = $this->selectOne(
            'SELECT id FROM contacts WHERE channel_id = :ch AND external_id = :x AND tenant_id = :t',
            ['ch' => $channelId, 'x' => $externalId, 't' => $this->tenantId]
        );

        if ($existing !== null) {
            $id = (int) $existing['id'];

            // Only fill blanks — never overwrite a name the shop owner edited
            // by hand with whatever Meta currently returns.
            $this->execute(
                'UPDATE contacts
                    SET name       = COALESCE(NULLIF(name, ""), :name),
                        avatar_url = COALESCE(:avatar, avatar_url),
                        locale     = COALESCE(:locale, locale),
                        last_seen_at = NOW()
                  WHERE id = :id AND tenant_id = :t',
                [
                    'name'   => $profile['name'] ?? null,
                    'avatar' => $profile['avatar_url'] ?? null,
                    'locale' => $profile['locale'] ?? null,
                    'id'     => $id,
                    't'      => $this->tenantId,
                ]
            );

            return $id;
        }

        try {
            return $this->create([
                'channel_id'    => $channelId,
                'external_id'   => $externalId,
                'name'          => $profile['name'] ?? null,
                'avatar_url'    => $profile['avatar_url'] ?? null,
                'locale'        => $profile['locale'] ?? null,
                'phone'         => $profile['phone'] ?? null,
                'last_seen_at'  => date('Y-m-d H:i:s'),
            ]);
        } catch (PDOException $e) {
            // Lost the race on uq_contact — read the winner's row.
            if ($e->getCode() === '23000') {
                $row = $this->selectOne(
                    'SELECT id FROM contacts WHERE channel_id = :ch AND external_id = :x AND tenant_id = :t',
                    ['ch' => $channelId, 'x' => $externalId, 't' => $this->tenantId]
                );
                if ($row !== null) {
                    return (int) $row['id'];
                }
            }
            throw $e;
        }
    }

    public function findByPhone(string $phone): ?array
    {
        return $this->selectOne(
            'SELECT * FROM contacts WHERE tenant_id = :t AND phone = :p ORDER BY lifetime_value DESC LIMIT 1',
            ['t' => $this->tenantId, 'p' => $phone]
        );
    }

    /** Customer panel: profile plus their order history, 2 queries. */
    public function profile(int $contactId): ?array
    {
        $contact = $this->find($contactId);
        if ($contact === null) {
            return null;
        }

        $contact['orders'] = $this->select(
            'SELECT id, order_no, total, status, created_at
               FROM orders WHERE contact_id = :c AND tenant_id = :t
              ORDER BY id DESC LIMIT 20',
            ['c' => $contactId, 't' => $this->tenantId]
        );

        return $contact;
    }

    public function block(int $contactId, bool $blocked = true): void
    {
        $this->execute(
            'UPDATE contacts SET is_blocked = :b WHERE id = :id AND tenant_id = :t',
            ['b' => $blocked ? 1 : 0, 'id' => $contactId, 't' => $this->tenantId]
        );
    }

    public function isBlocked(int $contactId): bool
    {
        return (int) $this->scalar(
            'SELECT is_blocked FROM contacts WHERE id = :id AND tenant_id = :t',
            ['id' => $contactId, 't' => $this->tenantId]
        ) === 1;
    }
}
