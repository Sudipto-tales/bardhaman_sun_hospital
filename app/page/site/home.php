<?php

/**
 * The front page.
 *
 * The enabled bands come from `page_sections`, so the panel can switch them
 * on or off. Their visual order follows website.html, independent of the
 * panel's stored row order.
 *
 * Each section's `title` is the panel's "Heading" field and is echoed raw:
 * every heading in this design carries <strong> on its emphasised half. It is
 * staff-entered, never a visitor's.
 *
 * The `contact` section is the site footer, which SiteController::page()
 * renders as chrome — the switch below has no arm for it.
 *
 * $sections     [key => row] in render order
 * $hero         the hero section's own data
 * $departments  every published department
 * $doctors      already sliced to the doctors section's limit
 * $labTests     featured tests, sliced
 * $testimonials published quotes — website.js swaps them in the quote card
 * $counters     the numbers band
 * $faqs         the accordion's questions
 * $posts        the latest articles, sliced
 * $postTotal    every published post, for the "we have N more" line
 * $doctorTabs   [slug => label] for the carousel filter
 * $phone        ['number', 'digits']
 */

$heading = static function (array $section, string $fallback): string {
    $title = trim((string) ($section['data']['title'] ?? ''));

    return $title === '' ? $fallback : $title;
};
?>
<?php foreach ($sections as $key => $section): ?>
<?php switch ($key):
    /* ============ HERO ============ */
    case 'hero': ?>
    <section class="hero" id="hero" data-section="Home">
        <span class="hero__watermark" aria-hidden="true" translate="no">CARE</span>
        <div class="hero__card">
            <div class="hero__media" aria-hidden="true">
                <video class="hero__photo" autoplay muted loop playsinline preload="auto"
                    poster="<?= e($hero['image'] ?? 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?q=80&w=1600&auto=format&fit=crop') ?>">
                    <source src="https://videos.pexels.com/video-files/3191572/3191572-hd_1920_1080_25fps.mp4" type="video/mp4">
                </video>
            </div>
            <div class="hero__scrim" aria-hidden="true"></div>
            <div class="hero__content">
                <div class="hero__lead">
                    <span class="hero__eyebrow"><span class="hero__eyebrow-dot"></span>
                        <?= e($hero['eyebrow'] ?? (setting('general', 'name', 'The Sun Hospital') . ' · Bardhaman')) ?>
                    </span>
                    <h1 class="hero__title"><?= e(str_replace(' ', "\u{00a0}", $hero['title'] ?? 'Compassionate Care')) ?><br><?= e($hero['titleStrong'] ?? 'Every Single Day') ?></h1>
                    <p class="hero__text"><?= e($hero['lead'] ?? '') ?></p>
                    <div class="hero__actions">
                        <a href="<?= e(site_url($hero['primaryHref'] ?? '', base_url('contact') . '#book')) ?>" class="hero__cta">
                            <?= e($hero['primaryLabel'] ?? 'Book an Appointment') ?>
                            <span class="hero__cta-ico"><i class="fa-solid fa-arrow-right"></i></span>
                        </a>
                    </div>
                    <a href="#testimonials" class="hero__review">
                        <span class="hero__review-thumb"><img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&amp;w=240&amp;auto=format&amp;fit=crop" alt="" loading="lazy"></span>
                        <span class="hero__review-body">
                            <span class="hero__review-text">Trusted multi-speciality care, close to home.</span>
                            <span class="hero__review-foot"><i class="fa-solid fa-star"></i> 4.9 <span>Rating</span>
                                <i class="fa-solid fa-arrow-up-right-from-square hero__review-go"></i></span>
                        </span>
                    </a>
                </div>
            </div>
            <div class="hero__pills" aria-hidden="true">
                <span class="hero__pill is-active">24/7 Emergency</span>
<?php foreach (array_slice($departments, 0, 4) as $department): ?>
                <span class="hero__pill"><?= e($department['name'] ?? '') ?></span>
<?php endforeach; ?>
            </div>
            <div class="hero__strip" aria-hidden="true">
                <span class="hero__strip-cell">Your Health, Our Science</span>
                <span class="hero__strip-cell hero__strip-mid"><span class="hero__strip-count"><strong>24</strong> / 7 care</span></span>
                <span class="hero__strip-cell hero__strip-end">Scroll for More <i class="fa-solid fa-arrow-down"></i></span>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ SERVICES OVERVIEW ============
       Four signposts, not four records: they point at the pages a first-time
       visitor asks for. The panel edits the heading and the standfirst; the
       tiles themselves are navigation and belong to the design. */
    case 'services': ?>
    <?php /* The current HTML design has no separate four-tile Services band;
             department services are rendered in the matching Care section. */ ?>
<?php break; ?>

<?php
    /* ============ ABOUT ============ */
    case 'about': ?>
    <section class="about" id="about" data-section="About" data-floaters="3">
        <div class="about__content">
            <span class="eyebrow">About <?= e(setting('general', 'shortName', 'The Sun')) ?></span>
            <h2 class="about__title" data-reveal-copy><?= $heading($section, 'We deliver personalised patient care with <em>compassion</em> and advanced technology.') ?></h2>
            <p class="about__desc" data-reveal-copy><?= e($section['data']['body'] ?? 'Embrace a world of comprehensive healthcare where your well-being takes centre stage. We are dedicated to providing personalised, compassionate medical services — the shortest possible distance between a patient and the right specialist.') ?></p>

            <ul class="about__features">
                <li><i class="fa-solid fa-check"></i> 24/7 Emergency &amp; Trauma Care</li>
                <li><i class="fa-solid fa-check"></i> Advanced Diagnostic Labs</li>
                <li><i class="fa-solid fa-check"></i> 50+ Visiting Specialists</li>
                <li><i class="fa-solid fa-check"></i> Transparent, Fair Pricing</li>
            </ul>

            <div class="about__cta-row">
                <a href="<?= e(base_url('about')) ?>" class="hero__cta">Read Our Story <span class="hero__cta-ico"><i class="fa-solid fa-arrow-right"></i></span></a>
                <div class="about__trust">
                    <div class="about__avatars">
                        <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&amp;w=120&amp;auto=format&amp;fit=crop" alt="" loading="lazy">
                        <img src="https://images.unsplash.com/photo-1594824436998-d40d9b4b0870?q=80&amp;w=120&amp;auto=format&amp;fit=crop" alt="" loading="lazy">
                        <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&amp;w=120&amp;auto=format&amp;fit=crop" alt="" loading="lazy">
                    </div>
                    <p>Trusted by Thousands<br>of Happy Patients</p>
                </div>
            </div>
        </div>

        <div class="about__visuals">
            <div class="about__frame">
                <div class="img-stretch about__media">
                    <img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&amp;w=1000&amp;auto=format&amp;fit=crop"
                        alt="Surgical team at The Sun Hospital" class="about__img" loading="lazy">
                </div>
                <a href="#care" class="about__play" aria-label="Watch our care in action"><i class="fa-solid fa-play"></i></a>
            </div>
        </div>
    </section>
<?php if ($counters): ?>
    <section class="stats" aria-label="Our track record">
        <div class="stats__row">
<?php foreach ($counters as $counter): ?>
            <div class="stats__item">
                <span class="stats__ico"><i class="fa-solid <?= e($counter['icon'] ?? 'fa-hospital') ?>"></i></span>
                <div><h3><?= e(($counter['value'] ?? '') . ($counter['suffix'] ?? '')) ?></h3><p><?= e($counter['label'] ?? '') ?></p></div>
            </div>
<?php endforeach; ?>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php
    /* ============ SPECIALITIES ============
       The menu, the featured card and the conditions list are all one
       department row. initSpecialities() in website.js swaps them on click,
       reading window.TMH_SPECIALITIES — which the block below prints. The
       first department is painted server-side so the panel is not empty
       before the script runs. */
    case 'specialities':
        $spec = [];

        foreach ($departments as $department) {
            $slug = (string) ($department['id'] ?? '');

            if ($slug === '') {
                continue;
            }

            $spec[$slug] = [
                'title' => (string) ($department['name'] ?? ''),
                'img' => (string) ($department['banner'] ?? ''),
                'desc' => trim(strip_tags((string) ($department['lead'] ?? ''))),
                'href' => base_url($slug),
                'icon' => (string) ($department['icon'] ?? 'fa-hospital'),
                'procedures' => array_values(array_filter(array_map(
                    static fn (array $row): string => trim((string) ($row['title'] ?? '')),
                    (array) ($department['procedures'] ?? [])
                ))),
                'conditions' => array_values(array_filter(array_map(
                    static fn ($row): string => trim((string) (is_array($row) ? ($row['text'] ?? '') : $row)),
                    (array) ($department['conditions'] ?? [])
                ))),
            ];
        }

        $firstKey = array_key_first($spec);
        $first = $firstKey === null ? null : $spec[$firstKey];
?>
<?php if ($first !== null): ?>
    <section class="spec" id="specialities" data-section="Specialities" data-floaters="4">
        <script>window.TMH_SPECIALITIES = <?= json_encode($spec, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;</script>

        <div class="spec__header">
            <div>
                <span class="eyebrow">Centres of Excellence</span>
                <h2><?= $heading($section, 'Discover Our Top<br><strong>Specialities</strong>') ?></h2>
            </div>
            <p>Experience world-class healthcare at our specialised centres of medical excellence, where innovation
                and expert care set new standards in clinical outcomes.</p>
        </div>

        <div class="spec__console">
            <div class="spec__index" data-lenis-prevent>
                <ul class="spec__list" id="specialtyList" role="tablist" aria-label="Specialities">
                    <span class="spec__hl" aria-hidden="true"></span>
<?php foreach ($spec as $slug => $row): $isFirst = $slug === $firstKey; ?>
                    <li<?= $isFirst ? ' class="is-active"' : '' ?> data-target="<?= e($slug) ?>" role="tab"
                        tabindex="<?= $isFirst ? '0' : '-1' ?>" aria-selected="<?= $isFirst ? 'true' : 'false' ?>">
                        <i class="fa-solid <?= e($row['icon']) ?>"></i> <?= e($row['title']) ?>
                        <i class="fa-solid fa-arrow-right-long arrow"></i>
                    </li>
<?php endforeach; ?>
                </ul>
            </div>

            <div class="spec__stage">
                <div class="spec__card">
                    <img id="featImage" src="<?= e($first['img']) ?>" alt="<?= e($first['title']) ?>" class="spec__stage-img" loading="lazy">
                    <div class="spec__stage-scrim" aria-hidden="true"></div>
                    <div class="spec__panel">
                        <h3 id="featTitle"><?= e($first['title']) ?></h3>
                        <p id="featDesc"><?= e($first['desc']) ?></p>
                        <span class="spec__proc-label">Our Procedures</span>
                        <div class="spec__proc-tags" id="featProcedures">
<?php foreach ($first['procedures'] as $procedure): ?>
                            <span class="spec__proc-tag"><?= e($procedure) ?></span>
<?php endforeach; ?>
                        </div>
                        <a href="<?= e($first['href']) ?>" class="spec__btn" id="featBtn">
                            Meet Our <?= e($first['title']) ?> Experts <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                </div>

            <div class="spec__conditions">
                <span class="spec__cond-title"><i class="fa-solid fa-notes-medical"></i> Conditions We Treat</span>
                <ul class="spec__cond-list" id="conditionsList" aria-label="Conditions we treat" data-lenis-prevent>
<?php foreach ($first['conditions'] as $condition): ?>
                    <li><?= e($condition) ?></li>
<?php endforeach; ?>
                </ul>
            </div>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php
    /* ============ SERVICES REVEAL (sticky video) ============
       One box per department, so a twelfth department appears here without
       anybody editing a template. */
    case 'care': ?>
    <div class="reveal-wrap" id="care" data-section="Care">
        <div class="reveal__video">
            <div class="reveal__overlay"></div>
            <!-- Swap this source for your own hospital footage when you have it.
                 If it fails to load, the poster and the section background show instead. -->
            <video autoplay muted loop playsinline class="reveal__vid"
                poster="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1600&auto=format&fit=crop">
                <source src="https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4"
                    type="video/mp4">
            </video>
        </div>

        <section class="reveal__content" data-floaters="4" data-floaters-dark>
            <div class="section-head section-head--center">
                <span class="eyebrow eyebrow--onDark">Our Services</span>
                <h2><?= $heading($section, 'We Serve in Different <strong>Areas for<br>Our Patients</strong>') ?></h2>
            </div>

            <div class="reveal__strip" data-lenis-prevent>
<?php foreach (array_slice($departments, 0, 8) as $i => $department): ?>
                <div class="reveal__card">
                    <span class="reveal__card-num"><?= e(str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <i class="fa-solid <?= e($department['icon'] ?? 'fa-hospital') ?> reveal__card-icon"></i>
                    <h4><?= e($department['name'] ?? '') ?></h4>
                    <p><?= e($department['menu_note'] ?? $department['menuNote'] ?? '') ?></p>
                    <a href="<?= e(base_url((string) ($department['id'] ?? ''))) ?>" class="reveal__more">Read More <i class="fa-solid fa-arrow-right"></i></a>
                </div>
<?php endforeach; ?>
            </div>

<?php $rest = max(0, count($departments) - 8); ?>
            <div class="reveal__foot">
                <p><?= $rest > 0
                        ? 'We have ' . e($rest) . '+ more care services including our Emergency Department.'
                        : 'Every department, and our round-the-clock Emergency.' ?></p>
                <a href="<?= e(base_url('departments')) ?>" class="reveal__foot-btn">View All Services <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </section>
    </div>
<?php break; ?>

<?php
    /* ============ TRACK RECORD ============
       The quote card is swapped by initTestimonials(); the block prints the
       first slide so the card is never blank, and hands the rest over on
       window.TMH_TESTIMONIALS. */
    case 'testimonials':
        $quotes = array_values(array_map(static fn (array $row): array => [
            'quote' => (string) ($row['text'] ?? ''),
            'name' => mb_strtoupper((string) ($row['name'] ?? '')),
            'role' => (string) ($row['role'] ?? ''),
            'img' => (string) ($row['photo'] ?? ''),
        ], $testimonials));
        $lead = $quotes[0] ?? null;
?>
    <section class="track" id="testimonials" data-section="Testimonials" data-floaters="3">
<?php if ($quotes): ?>
        <script>window.TMH_TESTIMONIALS = <?= json_encode($quotes, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>;</script>
<?php endif; ?>

        <div class="track__spring">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                <path d="M20 80 C 10 50, 90 50, 80 20" stroke="currentColor" stroke-width="8" stroke-linecap="round"
                    stroke-dasharray="10 15" />
                <path d="M30 90 C 20 60, 100 60, 90 30" stroke="currentColor" stroke-width="6" stroke-linecap="round"
                    stroke-dasharray="8 12" opacity=".55" />
            </svg>
        </div>

        <div class="track__header">
            <span class="eyebrow">Your Health Is Our Top Priority</span>
            <h2><?= $heading($section, 'Our track record speaks for itself. Many individuals have chosen
                <span class="track__faded">our medical centre and have had positive, transformative
                    experiences.</span>') ?></h2>
        </div>

        <div class="track__stage">
            <div class="track__badges">
                <div class="track__item track__rating">
<?= App::component('site/widget/google-rating', [
    'label' => 'AVERAGE GOOGLE RATING',
    'variant' => 'track',
    'fallback' => '4.9',
]) ?>
                </div>
                <div class="track__item track__award">
                    <div class="track__award-icon"><i class="fa-solid fa-staff-snake"></i></div>
                    <div>
                        <span class="track__award-label">NABH ACCREDITED</span>
                        <h4>Award-winning quality care, independently verified</h4>
                        <a href="<?= e(base_url('about')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
                    </div>
                </div>
            </div>

            <div class="track__item track__quote" id="testimonialCard" aria-live="polite">
                <i class="fa-solid fa-quote-left track__quote-mark"></i>
                <p class="track__quote-text" id="tQuote"><?= e($lead['quote'] ?? '') ?></p>
                <div class="track__quote-foot">
                    <div class="track__author">
                        <img id="tAvatar" src="<?= e($lead['img'] ?? '') ?>" alt="<?= e($lead['name'] ?? '') ?>" loading="lazy"<?= ($lead['img'] ?? '') === '' ? ' hidden' : '' ?> onerror="this.hidden=true">
                        <div><h4 id="tName"><?= e($lead['name'] ?? '') ?></h4><span id="tRole"><?= e($lead['role'] ?? '') ?></span></div>
                    </div>
                    <div class="track__nav">
                        <div class="track__dots" id="tDots" role="tablist" aria-label="Choose testimonial"></div>
                        <button class="track__nav-btn" id="tPrev" aria-label="Previous testimonial"><i class="fa-solid fa-arrow-left"></i></button>
                        <button class="track__nav-btn" id="tNext" aria-label="Next testimonial"><i class="fa-solid fa-arrow-right"></i></button>
                    </div>
                </div>
            </div>

            <div class="track__moments">
                <div class="track__item track__img img-stretch"><img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&amp;w=800&amp;auto=format&amp;fit=crop" alt="Doctor consulting a patient" loading="lazy"></div>
                <div class="track__item track__img img-stretch"><img src="https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&amp;w=800&amp;auto=format&amp;fit=crop" alt="Surgical team operating" loading="lazy"></div>
            </div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ WHY CHOOSE ============ */
    case 'why-us': ?>
    <section class="why" id="why" data-section="Why Us" data-floaters="3">
        <div class="why__header section-head">
            <span class="eyebrow">Why Choose <?= e(setting('general', 'shortName', 'The Sun')) ?></span>
            <h2><?= $heading($section, 'We Are Different To <strong>Protect<br>Your Health</strong>') ?></h2>
        </div>

        <div class="why__rows">
            <article class="why__row">
                <span class="why__num" aria-hidden="true">01</span>
                <div class="why__media"><div class="why__star">
                    <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=300&auto=format&fit=crop"
                        alt="Doctor portrait" loading="lazy">
                </div></div>
                <div class="why__body"><h3>Not Just Better Care, But a Better Experience</h3>
                <p>We believe in providing not just better care but a better experience overall. We understand that
                    your journey to health matters as much as the destination.</p>
                <a href="<?= e(base_url('about')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
                </div>
            </article>

            <article class="why__row">
                <span class="why__num" aria-hidden="true">02</span>
                <div class="why__media"><div class="why__star">
                    <img src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=300&auto=format&fit=crop"
                        alt="Medical team" loading="lazy">
                </div></div>
                <div class="why__body"><h3>Serving All People Through Exemplary Care</h3>
                <p>Every patient is treated with the same standard of clinical rigour and human warmth, regardless of
                    where they have come from.</p>
                <a href="<?= e(base_url('about')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
                </div>
            </article>

            <article class="why__row">
                <span class="why__num" aria-hidden="true">03</span>
                <div class="why__media"><div class="why__star">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop"
                        alt="Doctor examining a patient" loading="lazy">
                </div></div>
                <div class="why__body"><h3>Specialty Medicine with Compassion and Care</h3>
                <p>Sub-speciality expertise backed by multidisciplinary review, so complex cases get more than one
                    expert opinion by default.</p>
                <a href="<?= e(base_url('departments')) ?>" class="arrow-link"><i class="fa-solid fa-arrow-right"></i> Learn More</a>
                </div>
            </article>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ LAB FACILITIES ============ */
    case 'lab-tests': ?>
    <section class="lab" id="lab" data-section="Lab Tests" data-floaters="3">
        <div class="lab__top">
            <div class="lab__intro">
                <span class="eyebrow">Lab Test</span>
                <h2><?= $heading($section, 'We Have Lab Test Facilities<br><strong>Book Yours Today</strong>') ?></h2>
            </div>
            <div class="lab__visual">
                <div class="lab__img-wrap img-stretch">
                    <img src="<?= e(media_url('lab.jpg', 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop')) ?>"
                        alt="Lab technician at work" class="lab__img" loading="lazy">
                </div>

                <div class="lab__pill">
                    <div class="lab__pill-icon">
                        <i class="fa-solid fa-award"></i>
                    </div>
                    <div class="lab__pill-text">
                        <h4>PRECISION PROFICIENCY AWARD</h4>
                        <p>Awarded to our lab for consistently achieving unparalleled precision in test results.</p>
                    </div>
                    <button class="lab__pill-btn" aria-label="Read more"><i
                            class="fa-solid fa-arrow-right"></i></button>
                </div>
            </div>

        </div>
        <div class="lab__rail">
<?php if (($section['data']['lead'] ?? '') !== ''): ?>
            <p><?= e($section['data']['lead']) ?></p>
<?php endif; ?>
            <div class="lab__viewport">
                <div class="lab__track" id="labSlider">
<?php
/* The reference cycles four accents down the row; card/lab-test takes the
   custom property name rather than choosing one itself. */
$accents = ['crimson', 'magenta', 'blue', 'navy'];
?>
<?php foreach ($labTests as $i => $test): ?>
                        <?php App::render('site/card/lab-test', [
                            'test' => $test,
                            'colour' => $accents[$i % count($accents)],
                            /* No figures on the home page — see card/lab-test */
                            'showPrice' => false,
                        ]); ?>
<?php endforeach; ?>
            </div>
            </div>
            <div class="lab__progress"><div class="lab__progress-bar" id="labProgressBar"></div></div>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ DOCTORS ============
       The tabs filter on data-specialty, which card/doctor reads off the row.
       The doctors here carry departments, not a single speciality slug, so the
       card is given the one its tab matches. */
    case 'doctors': ?>
    <section class="doc" id="doctors" data-section="Doctors" data-floaters="3">
        <div class="doc__header section-head">
            <span class="eyebrow">Doctors</span>
            <h2><?= $heading($section, 'Our Expert Doctors <strong>For<br>The Patients</strong>') ?></h2>
        </div>

<?php if ($doctorTabs): ?>
        <div class="doc__tabs">
            <button class="doc__tab is-active" data-filter="all">ALL</button>
<?php foreach ($doctorTabs as $slug => $label): ?>
            <button class="doc__tab" data-filter="<?= e($slug) ?>"><?= e(mb_strtoupper($label)) ?></button>
<?php endforeach; ?>
        </div>
<?php endif; ?>

        <div class="doc__carousel">
            <button class="doc__nav" id="docPrev" aria-label="Previous doctors"><i
                    class="fa-solid fa-arrow-left"></i></button>

            <div class="doc__viewport">
                <div class="doc__track" id="docTrack">
<?php foreach ($doctors as $doctor): ?>
                    <?php App::render('site/card/doctor', [
                        'variant' => 'carousel',
                        /* data-specialty is one value and a doctor can sit in
                           several departments; the first is the one the row is
                           ordered under, which is the tab a visitor expects. */
                        'doctor' => $doctor + ['specialty' => (string) (($doctor['departments'] ?? [''])[0] ?? '')],
                    ]); ?>
<?php endforeach; ?>
                </div>
            </div>

            <button class="doc__nav" id="docNext" aria-label="Next doctors"><i
                    class="fa-solid fa-arrow-right"></i></button>
        </div>
    </section>
<?php break; ?>

<?php
    /* ============ FAQ ============ */
    case 'faq': ?>
<?php if ($faqs): ?>
    <section class="faq" id="faq" data-section="FAQ" data-floaters="3">
        <div class="faq__head section-head section-head--center">
            <span class="eyebrow">FAQ</span>
            <h2><?= $heading($section, 'We Are Here <strong>To Answer Your Questions</strong>') ?></h2>
        </div>
        <div class="faq__grid">
            <div class="faq__aside img-stretch">
                <img src="<?= e(media_url('team.jpg', 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop')) ?>"
                    alt="Medical team smiling" class="faq__img" loading="lazy">
            </div>
            <?php App::render('site/widget/faq-accordion', ['faqs' => $faqs]); ?>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php
    /* ============ BLOG ============ */
    case 'articles': ?>
<?php if ($posts): ?>
    <section class="blog" id="blog" data-section="Articles" data-floaters="3">
        <div class="blog__header section-head">
            <span class="eyebrow">Blog &amp; Articles</span>
            <h2><?= $heading($section, 'Read Top Articles From<br><strong>Expert Doctors</strong>') ?></h2>
        </div>

        <div class="blog__grid">
            <?php App::render('site/card/blog', ['post' => $posts[0], 'variant' => 'feature']); ?>
            <div class="blog__list">
<?php foreach (array_slice($posts, 1) as $post): ?>
                <?php App::render('site/card/blog', ['post' => $post, 'variant' => 'row']); ?>
<?php endforeach; ?>
            </div>
        </div>

<?php $more = max(0, $postTotal - count($posts)); ?>
        <div class="blog__footer">
            <a href="<?= e(base_url('blog')) ?>" class="blog__viewall">
                <?= $more > 0 ? 'We have ' . e($more) . ' more articles.' : 'Every article we have published.' ?>
                <span>View All <i class="fa-solid fa-arrow-right"></i></span>
            </a>
        </div>
    </section>
<?php endif; ?>
<?php break; ?>

<?php endswitch; ?>
<?php endforeach; ?>
