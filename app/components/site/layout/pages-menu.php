<?php

/**
 * The compact Pages mega menu from the HTML design.
 */

$route = RouteManager::resolveRoute();

$items = [
    ['path' => 'gallery', 'icon' => 'fa-images', 'label' => 'Gallery', 'note' => 'Photos &amp; moments'],
    ['path' => 'facilities', 'icon' => 'fa-hospital', 'label' => 'Facilities', 'note' => 'Wards, theatres &amp; ICU'],
    ['path' => 'blog', 'icon' => 'fa-newspaper', 'label' => 'Blogs', 'note' => 'News &amp; health tips'],
    ['path' => 'departments', 'icon' => 'fa-layer-group', 'label' => 'Departments', 'note' => 'Overview &amp; directory'],
];
?>
                <div class="nav-mega nav-mega--pages">
<?php foreach ($items as $item): ?>
<?php $path = (string) $item['path']; ?>
                    <a href="<?= e(base_url($path)) ?>" class="nav-mega-item<?= $path !== '' && ($route === $path || str_starts_with($route, $path . '/')) ? ' is-current' : '' ?>">
                        <?= e($item['label']) ?> <span><?= $item['note'] ?></span>
                    </a>
<?php endforeach; ?>
                </div>
