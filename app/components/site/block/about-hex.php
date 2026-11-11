<?php

/**
 * The about-page intro as a hexagon photo collage beside the copy: a faint
 * honeycomb backdrop, three interlocking pointy-top hexagons with a play
 * affordance, then an eyebrow, heading, ECG rule, two paragraphs, a signature
 * and a call to action. Styling lives in pages.css (.pg-about …).
 *
 * Props
 *   section   string  The [data-section] label the scroll-spy rail picks up
 *   eyebrow   string
 *   title     string  Markup (may carry <strong> / a .pg-about__faint span)
 *   body      array   Paragraph strings (first two are shown)
 *   images    array   {lead, sub, doc} photo URLs; each has a fallback
 *   tourHref  string  The play button target
 *   moreHref  string
 *   moreLabel string
 */

$body = array_values(array_filter($body ?? [], static fn ($p) => trim((string) (is_array($p) ? ($p['paragraph'] ?? $p['text'] ?? '') : $p)) !== ''));
$para = static fn ($p) => is_array($p) ? ($p['paragraph'] ?? $p['text'] ?? '') : $p;

$images = $images ?? [];
$lead = $images['lead'] ?? ($img ?? '') ?: 'https://images.unsplash.com/photo-1581093588401-fbb62a02f120?q=80&w=900&auto=format&fit=crop';
$sub = $images['sub'] ?? 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?q=80&w=800&auto=format&fit=crop';
$doc = $images['doc'] ?? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop';

$tourHref = $tourHref ?? base_url('facilities');
$moreHref = $moreHref ?? base_url('about') . '#leadership';
$moreLabel = $moreLabel ?? 'More About';
?>
        <section class="pg-section" data-section="<?= e($section ?? '') ?>">
            <div class="pg-wrap">
                <div class="pg-about">
                    <!-- ---- hexagon collage ---- -->
                    <div class="pg-about__media">
                        <!-- faint honeycomb backdrop; masked to fade at the edges -->
                        <svg class="pg-about__grid" viewBox="0 0 207.84 240" aria-hidden="true">
                            <defs>
                                <pattern id="abHex" width="34.64" height="60" patternUnits="userSpaceOnUse">
                                    <g fill="none" stroke="currentColor" stroke-width="1">
                                        <path d="M0 10V30M34.64 10V30M0 10L17.32 0M34.64 10L17.32 0M0 30L17.32 40M34.64 30L17.32 40M17.32 40V60" />
                                    </g>
                                    <g fill="currentColor">
                                        <circle cx="17.32" cy="0" r="1.5" />
                                        <circle cx="0" cy="10" r="1.5" />
                                        <circle cx="34.64" cy="10" r="1.5" />
                                        <circle cx="0" cy="30" r="1.5" />
                                        <circle cx="34.64" cy="30" r="1.5" />
                                        <circle cx="17.32" cy="40" r="1.5" />
                                    </g>
                                </pattern>
                            </defs>
                            <rect width="207.84" height="240" fill="url(#abHex)" />
                        </svg>

                        <div class="pg-about__hexes">
                            <figure class="hx hx--lead">
                                <img src="<?= e($lead) ?>" alt="Inside the hospital" loading="lazy">
                            </figure>
                            <figure class="hx hx--sub">
                                <img src="<?= e($sub) ?>" alt="A clinician examining a patient" loading="lazy">
                            </figure>
                            <figure class="hx hx--doc">
                                <img src="<?= e($doc) ?>" alt="A consultant at the hospital" loading="lazy">
                            </figure>

                            <a href="<?= e($tourHref) ?>" class="hx__play" aria-label="Take a tour of the hospital">
                                <i class="fa-solid fa-play"></i>
                            </a>
                        </div>
                    </div>

                    <!-- ---- copy ---- -->
                    <div class="pg-about__copy">
                        <span class="eyebrow"><?= e($eyebrow ?? '') ?></span>
                        <!-- raw: the heading carries <strong> / a ghosted trailing span -->
                        <h2><?= $title ?? '' ?></h2>

                        <svg class="pg-about__ecg" viewBox="0 0 120 28" preserveAspectRatio="none" aria-hidden="true">
                            <path d="M0 14H34l5-10 6 20 5-14 4 7h12l6-11 7 16 5-11h25" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

<?php foreach (array_slice($body, 0, 2) as $paragraph): ?>
                        <p><?= e($para($paragraph)) ?></p>
<?php endforeach; ?>

                        <div class="pg-about__foot">
                            <svg class="pg-about__sign" viewBox="0 0 180 60" aria-hidden="true">
                                <path d="M8 44c14-2 22-30 18-34-5-4-12 16-10 30 1 7 7 9 13 3 5-5 7-16 11-16 3 0 2 10 6 10 5 0 7-14 12-14 4 0 3 11 7 11 6 0 10-14 18-16"
                                    fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M96 46c12-4 24-10 40-12" fill="none" stroke="currentColor" stroke-width="2.4"
                                    stroke-linecap="round" />
                            </svg>
                            <a href="<?= e($moreHref) ?>" class="btn-primary"><i class="fa-solid fa-circle-arrow-right"></i> <?= e($moreLabel) ?></a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
