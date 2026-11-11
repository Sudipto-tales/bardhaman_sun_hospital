<?php

/**
 * The four claim cards above the footer.
 *
 * Props
 *   cards  array of {text, href, label} — `label` is the arrow's aria-label,
 *          because the arrow itself has no text to read out.
 */

$cards = $cards ?? [
    ['text' => 'Access safe, quality health care services and information to support your health.', 'href' => base_url('departments'), 'label' => 'Explore our services'],
    ['text' => 'The Sun operates more than 20 units, including specialist day-care centres.', 'href' => base_url('departments'), 'label' => 'See our departments'],
    ['text' => 'Delivering an exceptional care experience for every kind of patient.', 'href' => base_url('about'), 'label' => 'About the hospital'],
    ['text' => 'It is our privilege to care for more than a million people across the district.', 'href' => base_url('about'), 'label' => 'Our reach'],
    ['text' => 'Driven by a desire to help, we collaborate and support one another.', 'href' => base_url('doctors'), 'label' => 'Meet the team'],
];
?>
    <!-- ============ PRE-FOOTER ============
         The cards live inside .prefooter__track, which the CSS marquee slides
         by -50%. For that to loop seamlessly the set is rendered twice; the
         second pass is aria-hidden and non-focusable (and hidden on mobile,
         where the ribbon is swipeable instead of animated). -->
    <div class="prefooter" id="prefooter">
        <div class="prefooter__track">
<?php for ($pass = 0; $pass < 2; $pass++): $clone = $pass === 1; ?>
<?php foreach ($cards as $card): ?>
            <div class="prefooter__card<?= $clone ? ' prefooter__card--clone' : '' ?>"<?= $clone ? ' aria-hidden="true"' : '' ?>>
                <p><?= e($card['text'] ?? '') ?></p>
                <a class="prefooter__btn" href="<?= e($card['href'] ?? '#') ?>" aria-label="<?= e($card['label'] ?? '') ?>"<?= $clone ? ' tabindex="-1"' : '' ?>><i class="fa-solid fa-arrow-right"></i></a>
            </div>
<?php endforeach; ?>
<?php endfor; ?>
        </div>
    </div>
