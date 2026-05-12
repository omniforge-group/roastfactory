-- Kortingscodes toegankelijk maken voor tier2 gebruikers
UPDATE page_permissions SET tier2 = true WHERE page_key = 'kortingscodes';
