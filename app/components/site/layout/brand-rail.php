<?php

/**
 * The fixed wordmark rail. translate="no" throughout the brand and contact
 * chrome: the Google widget would otherwise transliterate the wordmark and,
 * worse, rewrite the digits of the emergency number into Bengali numerals.
 *
 * Props
 *   home      string  Route the mark links to.
 *   logo      string  Image URL; falls back to the CSS wordmark when it 404s.
 *   siteName  string
 */

$siteName = $siteName ?? 'The Sun Hospital';
?>
    <!-- ============ BRAND RAIL (fixed — never scrolls away) ============ -->
    <div class="brand-rail" id="brandRail" translate="no">
        <a href="<?= e($home ?? base_url('/')) ?>" class="brand-rail__link">
            <img src="<?= e($logo ?? base_url('assets/logo-tsh.png')) ?>" alt="" aria-hidden="true" class="brand-rail__icon"
                onerror="this.style.display='none';">
            <span class="brand-rail__word">The&nbsp;Sun<span>Hospital</span></span>
        </a>
    </div>
