<?php

/**
 * Full-width site footer: a brand block, a departments column, a recent-news
 * column and a contact column, over a deep navy with a faint medical backdrop
 * (see .site-footer in website.css). Below it, the legal strip and the
 * back-to-top button.
 *
 * Props
 *   logo, siteName, home
 *   address      array of lines
 *   phone, email string
 *   hours        array of {label, value}
 *   departments  array of {name, slug|id}  — the departments column
 *   posts        array of post rows        — the "Latest News" column
 *   social       array of {icon, url, label}
 *   legal        array of {label, href}
 *   copyright    string
 *   developer    array of {name, url, logo}
 */

$siteName = $siteName ?? 'The Sun Hospital';
$home = $home ?? base_url('/');
$logo = $logo ?? base_url('assets/logo-tsh.png');
$address = $address ?? ['G.T. Road, Bardhaman,', 'West Bengal 713101'];
$phone = trim((string) ($phone ?? ''));
$email = trim((string) ($email ?? ''));

$hours = $hours ?? [['label' => 'Monday – Sunday', 'value' => 'Open 24 hours']];
$hoursLine = $hours[0] ?? ['label' => '', 'value' => ''];

/* Departments column — fall back to the common set when the menu is empty. */
$departments = $departments ?? [];
if (!$departments) {
    $departments = [
        ['name' => 'Cardiology', 'slug' => 'cardiology'],
        ['name' => 'Neuro Surgery', 'slug' => 'neuro-surgery'],
        ['name' => 'Orthopedic Surgery', 'slug' => 'orthopedics'],
        ['name' => 'Prenatal Care', 'slug' => 'prenatal-care'],
        ['name' => 'Ophthalmology', 'slug' => 'ophthalmology'],
        ['name' => 'Lab Diagnostics', 'slug' => 'lab-diagnostics'],
    ];
}
$departments = array_slice($departments, 0, 6);

$posts = array_slice($posts ?? [], 0, 3);

$social = $social ?? [
    ['icon' => 'fa-brands fa-facebook-f', 'url' => '#', 'label' => 'Facebook'],
    ['icon' => 'fa-brands fa-x-twitter', 'url' => '#', 'label' => 'X'],
    ['icon' => 'fa-brands fa-youtube', 'url' => '#', 'label' => 'YouTube'],
    ['icon' => 'fa-brands fa-linkedin-in', 'url' => '#', 'label' => 'LinkedIn'],
];

$legal = $legal ?? [
    ['label' => 'Privacy Policy', 'href' => base_url('privacy')],
    ['label' => 'Terms', 'href' => base_url('terms')],
    ['label' => 'Contact', 'href' => base_url('contact')],
];

$columns = $columns ?? [];
if (!$columns) {
    $columns = [
        ['title' => 'Community', 'links' => [
            ['label' => 'Doctors', 'href' => base_url('doctors')],
            ['label' => 'Testimonials', 'href' => base_url('/') . '#testimonials'],
            ['label' => 'FAQs', 'href' => base_url('/') . '#faq'],
            ['label' => 'Blog', 'href' => base_url('blog')],
            ['label' => 'Site Map', 'href' => base_url('sitemap.xml')],
        ]],
        ['title' => 'About', 'links' => [
            ['label' => 'Careers', 'href' => base_url('careers')],
            ['label' => 'Education', 'href' => base_url('blog')],
            ['label' => 'About Us', 'href' => base_url('about')],
            ['label' => 'Areas of Care', 'href' => base_url('departments')],
        ]],
        ['title' => 'Support', 'links' => [
            ['label' => 'Visitor Information', 'href' => base_url('facilities') . '#visiting'],
            ['label' => 'Emergency Care', 'href' => base_url('contact') . '#emergency'],
            ['label' => 'Online Services', 'href' => base_url('lab-diagnostics')],
        ]],
    ];
}

$developer = $developer ?? ['name' => 'Promix', 'url' => 'https://promix.tech/', 'logo' => base_url('assets/promix-logo.png')];
$tagline = $tagline ?? 'মানুষের সাথে ..... মানুষের পাশে';

/* helper: a post's thumbnail / title / date / link */
$postBits = static function (array $p): array {
    $slug = (string) ($p['slug'] ?? $p['id'] ?? '');
    $img = (string) ($p['image'] ?? $p['coverImage'] ?? $p['cover_image'] ?? '');
    $published = (string) ($p['publishedAt'] ?? $p['published_at'] ?? '');
    $date = (string) ($p['date'] ?? '');
    if ($date === '' && $published !== '') {
        $stamp = strtotime($published);
        $date = $stamp ? date('d M Y', $stamp) : $published;
    }
    return [
        'title' => (string) ($p['title'] ?? ''),
        'img' => $img,
        'date' => $date,
        'href' => $slug !== '' ? base_url('blog/' . rawurlencode($slug)) : base_url('blog'),
    ];
};
?>
    <!-- ============ FOOTER ============ -->
    <footer class="site-footer" id="contact" data-section="Contact">
        <svg class="site-footer__ecg" id="footerEcg" viewBox="0 0 1200 60" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 30 H320 l14 -22 l16 44 l14 -30 l12 14 H700 l16 -26 l18 40 l14 -28 H1200" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <div class="ft__grid">
            <div class="ft__col">
                <a class="ft__logo" href="<?= e($home) ?>" aria-label="<?= e($siteName) ?>"><img src="<?= e($logo) ?>" alt="<?= e($siteName) ?>" loading="lazy"></a>
                <div class="ft__contact">
                    <p><strong>Location:</strong> <?= implode(' ', array_map('e', $address)) ?></p>
                    <p><strong><?= e((string) ($hoursLine['label'] ?? 'Visiting Hours')) ?>:</strong><br><?= e((string) ($hoursLine['value'] ?? 'Open 24 hours')) ?></p>
                </div>
            </div>

<?php foreach (array_slice($columns ?? [], 0, 3) as $column): ?>
            <div class="ft__col">
                <h4><?= e($column['title'] ?? '') ?></h4>
                <ul>
<?php foreach (($column['links'] ?? []) as $item): ?>
                    <li><a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a></li>
<?php endforeach; ?>
                </ul>
            </div>
<?php endforeach; ?>

            <div class="ft__col">
                <h4>Trust &amp; Legal</h4>
                <ul>
<?php foreach ($legal as $item): ?>
                    <li><a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a></li>
<?php endforeach; ?>
                    <li><a href="<?= e(base_url('facilities')) ?>">Hospital Stay</a></li>
                </ul>
                <h4>Social Media</h4>
<?php if ($social): ?>
                <div class="ft__social">
<?php foreach ($social as $item): ?>
                    <a href="<?= e($item['url'] ?? '#') ?>" aria-label="<?= e($item['label'] ?? '') ?>" target="_blank" rel="noopener noreferrer"><i class="<?= e($item['icon'] ?? '') ?>"></i></a>
<?php endforeach; ?>
                </div>
<?php endif; ?>
            </div>
        </div>
    </footer>

    <div class="ft__bottom">
        <p class="ft__bottom-copy"><?= e($copyright ?? '© ' . date('Y') . ' ' . $siteName . '. All rights reserved.') ?></p>
        <p class="ft__bottom-tag" lang="bn" translate="no"><?= e($tagline ?? 'মানুষের সাথে ..... মানুষের পাশে') ?></p>
<?php if ($legal): ?>
        <nav class="ftx-legal" aria-label="Legal">
<?php foreach ($legal as $item): ?>
            <a href="<?= e($item['href'] ?? '#') ?>"><?= e($item['label'] ?? '') ?></a>
<?php endforeach; ?>
        </nav>
<?php endif; ?>
<?php if (!empty($developer['url'])): ?>
        <a class="ft__dev" href="<?= e($developer['url']) ?>" target="_blank" rel="noopener noreferrer" data-tip="<?= e($developer['name'] ?? '') ?>"
            title="Website designed and developed by <?= e($developer['name'] ?? '') ?>">
            <span>Developed by</span>
            <img src="<?= e($developer['logo'] ?? '') ?>"
                alt="<?= e($developer['name'] ?? '') ?> — website design and development" loading="lazy">
        </a>
<?php endif; ?>
    </div>

    <button class="to-top" id="toTop" aria-label="Back to top"><i class="fa-solid fa-arrow-up"></i></button>
