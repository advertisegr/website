// Campaign Detail Page
(function () {
  'use strict';

  // ─── Helpers ───

  function sanitizeText(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function sanitizeUrl(url) {
    if (!url) return '';
    try {
      var parsed = new URL(url);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return parsed.href;
      }
    } catch (e) {}
    return '';
  }

  // Validate UUID format
  function isValidUUID(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  }

  // ─── DOM Refs ───

  var loadingEl = document.getElementById('campaign-loading');
  var contentEl = document.getElementById('campaign-content');
  var errorEl = document.getElementById('campaign-error');
  var heroEl = document.getElementById('campaign-hero');
  var heroImg = document.getElementById('campaign-hero-img');
  var titleEl = document.getElementById('campaign-title');
  var dateEl = document.getElementById('campaign-date');
  var bodyEl = document.getElementById('campaign-body');
  var gallerySection = document.getElementById('campaign-gallery');
  var galleryGrid = document.getElementById('campaign-gallery-grid');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  // ─── Get campaign ID from URL ───

  var params = new URLSearchParams(window.location.search);
  var campaignId = params.get('id');

  if (!campaignId || !isValidUUID(campaignId)) {
    showError();
    return;
  }

  // ─── Fetch Data ───

  Promise.all([
    db.from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('status', 'published')
      .single(),
    db.from('campaign_images')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('sort_order', { ascending: true })
  ]).then(function (results) {
    var campaignResult = results[0];
    var imagesResult = results[1];

    loadingEl.style.display = 'none';

    if (campaignResult.error || !campaignResult.data) {
      showError();
      return;
    }

    var campaign = campaignResult.data;
    var images = (imagesResult.data || []);

    renderCampaign(campaign, images);
  }).catch(function () {
    showError();
  });

  // ─── Render ───

  function renderCampaign(campaign, images) {
    // Update page title
    document.title = (campaign.title || 'Campaign') + ' | advertisegr';

    // Hero image
    var safeHeroUrl = sanitizeUrl(campaign.image_url);
    if (safeHeroUrl) {
      heroImg.src = safeHeroUrl;
      heroImg.alt = sanitizeText(campaign.title);
      heroEl.style.display = 'block';
    }

    // Title
    titleEl.textContent = campaign.title || '';

    // Date
    if (campaign.created_at) {
      dateEl.textContent = new Date(campaign.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
    }

    // Markdown content
    if (campaign.content && campaign.content.trim()) {
      var rawHTML = marked.parse(campaign.content);
      var cleanHTML = DOMPurify.sanitize(rawHTML, {
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'p', 'br', 'hr',
          'strong', 'em', 'b', 'i', 'u', 's', 'del',
          'a', 'img',
          'ul', 'ol', 'li',
          'blockquote', 'pre', 'code',
          'table', 'thead', 'tbody', 'tr', 'th', 'td',
          'sup', 'sub', 'mark'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel'],
        FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'textarea', 'select', 'button', 'object', 'embed'],
        ALLOW_DATA_ATTR: false
      });
      bodyEl.innerHTML = cleanHTML;

      // Add rel="noopener noreferrer" to external links
      var links = bodyEl.querySelectorAll('a');
      links.forEach(function (link) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    }

    // Secondary images gallery
    if (images.length > 0) {
      images.forEach(function (img) {
        var safeUrl = sanitizeUrl(img.image_url);
        if (!safeUrl) return;

        var item = document.createElement('div');
        item.className = 'campaign-gallery__item';

        var imgEl = document.createElement('img');
        imgEl.src = safeUrl;
        imgEl.alt = '';
        imgEl.loading = 'lazy';
        item.appendChild(imgEl);

        item.addEventListener('click', function () {
          lightboxImg.src = safeUrl;
          lightboxImg.alt = '';
          lightbox.classList.add('active');
        });

        galleryGrid.appendChild(item);
      });

      gallerySection.style.display = 'block';
    }

    contentEl.style.display = 'block';
  }

  function showError() {
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
  }

  // ─── Lightbox ───

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox__close')) {
      lightbox.classList.remove('active');
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') lightbox.classList.remove('active');
  });
})();
