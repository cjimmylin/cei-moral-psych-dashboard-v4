/* app.js — The Triple Bind: Moral Psychology Benchmarks Dashboard v4
 *
 * Rendering and interactivity layer. Reads from DATA (global const from data.js),
 * populates the DOM, and delegates chart creation to charts.js functions.
 * Vanilla JS only — no frameworks.
 */

(function () {
  'use strict';

  // Active chart instances keyed by tab pane id
  var activeCharts = {};

  // =========================================================================
  // 1. Theme Toggle
  // =========================================================================

  var ThemeManager = {
    _key: 'cei-mp-v4-theme',
    _version: 0,
    _paneVersions: {},

    init: function () {
      var saved = localStorage.getItem(this._key);
      if (saved) document.documentElement.setAttribute('data-theme', saved);
      this._updateIcon();
      var self = this;
      var btn = document.getElementById('theme-toggle');
      if (btn) btn.addEventListener('click', function () { self.toggle(); });
    },

    toggle: function () {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(this._key, next);
      this._version++;
      this._updateIcon();
      this._refreshCharts();
    },

    _updateIcon: function () {
      var icon = document.getElementById('theme-icon');
      var isLight = document.documentElement.getAttribute('data-theme') === 'light';
      if (icon) icon.textContent = isLight ? '\u2600' : '\u263D';
    },

    _refreshCharts: function () {
      var self = this;
      if (typeof _syncThemeConstants === 'function') _syncThemeConstants();
      Object.keys(activeCharts).forEach(function (paneId) {
        if (activeCharts[paneId]) {
          activeCharts[paneId].forEach(function (c) {
            if (c && !c.isDisposed()) c.dispose();
          });
          delete activeCharts[paneId];
        }
        if (tabCharts[paneId]) {
          activeCharts[paneId] = tabCharts[paneId]();
          self._paneVersions[paneId] = self._version;
        }
      });
    }
  };

  // =========================================================================
  // 2. Tab Chart Lifecycle (Lazy Init)
  // =========================================================================

  var tabCharts = {
    'pane-overview': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-triple-bind');
      if (el) charts.push(chartTripleBind(el));
      el = document.getElementById('chart-tier-donut');
      if (el) charts.push(chartTierDonut(el));
      el = document.getElementById('chart-claim-sparks');
      if (el) charts.push(chartClaimSparks(el));
      el = document.getElementById('chart-convergence-mini');
      if (el) charts.push(chartConvergenceCV(el));
      el = document.getElementById('chart-cultural-mini');
      if (el) charts.push(chartCulturalCliff(el));
      return charts;
    },

    'pane-methodology': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-tier-histogram');
      if (el) charts.push(chartTierHistogram(el));
      el = document.getElementById('chart-scoring-formula');
      if (el) charts.push(chartScoringFormula(el));
      el = document.getElementById('chart-model-inventory');
      if (el) charts.push(chartModelInventory(el));
      el = document.getElementById('chart-feature-weights');
      if (el) charts.push(chartScoringFormula(el));
      return charts;
    },

    'pane-claims-1-3': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-theory-tier-heatmap');
      if (el) charts.push(chartTheoryTierHeatmap(el));
      el = document.getElementById('chart-theory-quality-rate');
      if (el) charts.push(chartTheoryQualityRate(el));
      el = document.getElementById('chart-validity-dist');
      if (el) charts.push(chartValidityDist(el));
      el = document.getElementById('chart-validity-theory');
      if (el) charts.push(chartTheoryCoverage(el));
      el = document.getElementById('chart-theory-absence');
      if (el) charts.push(chartTheoryAbsence(el));
      el = document.getElementById('chart-theory-heatmap');
      if (el) charts.push(chartTheoryTierHeatmap(el));
      return charts;
    },

    'pane-claims-4-6': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-cultural-cliff');
      if (el) charts.push(chartCulturalCliff(el));
      el = document.getElementById('chart-cultural-breakdown');
      if (el) charts.push(chartTheoryCoverage(el));
      el = document.getElementById('chart-baseline-by-tier');
      if (el) charts.push(chartBaselineByTier(el));
      el = document.getElementById('chart-temporal-quality');
      if (el) charts.push(chartTemporalQuality(el));
      return charts;
    },

    'pane-rlhf-fingerprint': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-convergence-cv');
      if (el) charts.push(chartConvergenceCV(el));
      el = document.getElementById('chart-rlhf-radar');
      if (el) charts.push(chartRLHFRadar(el));
      el = document.getElementById('chart-dit-pscore');
      if (el) charts.push(chartDITPScore(el));
      el = document.getElementById('chart-cot-effect');
      if (el) charts.push(chartCoTEffect(el));
      el = document.getElementById('chart-mft-profiles');
      if (el) charts.push(chartMFTProfiles(el));
      el = document.getElementById('chart-cultural-persona');
      if (el) charts.push(chartCulturalPersona(el));
      el = document.getElementById('chart-ceiling-instruments');
      if (el) charts.push(chartCeilingInstruments(el));
      el = document.getElementById('chart-discriminating-instruments');
      if (el) charts.push(chartDiscriminatingInstruments(el));
      return charts;
    },

    'pane-integrated': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-tier-discrimination');
      if (el) charts.push(chartTierDiscrimination(el));
      el = document.getElementById('chart-pipeline-diagram');
      if (el) charts.push(chartPipelineDiagram(el));
      el = document.getElementById('chart-infrastructure-bar');
      if (el) charts.push(chartInfrastructureBar(el));
      el = document.getElementById('chart-feedback-loop');
      if (el) charts.push(chartFeedbackLoop(el));
      return charts;
    },

    'pane-discussion': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-triple-bind-summary');
      if (el) charts.push(chartTripleBindSummary(el));
      return charts;
    },

    'pane-ranking': function () {
      // No ECharts — table only
      return [];
    },

    'pane-features': function () {
      // No ECharts — table only
      return [];
    },

    'pane-explorer': function () {
      var charts = [];
      var el;
      el = document.getElementById('chart-umap');
      if (el) charts.push(chartUMAP(el));
      el = document.getElementById('chart-scree');
      if (el) charts.push(chartScree(el));
      el = document.getElementById('chart-feature-importance');
      if (el) charts.push(chartFeatureImportance(el));
      el = document.getElementById('chart-treemap');
      if (el) charts.push(chartTreemap(el));
      el = document.getElementById('chart-health-scorecard');
      if (el) charts.push(chartHealthScorecard(el));
      return charts;
    }
  };

  function disposeCharts(paneId) {
    if (activeCharts[paneId]) {
      activeCharts[paneId].forEach(function (c) {
        if (c && !c.isDisposed()) c.dispose();
      });
      delete activeCharts[paneId];
    }
  }

  function initCharts(paneId) {
    disposeCharts(paneId);
    if (ThemeManager._paneVersions[paneId] !== ThemeManager._version) {
      if (typeof _syncThemeConstants === 'function') _syncThemeConstants();
    }
    if (tabCharts[paneId]) {
      activeCharts[paneId] = tabCharts[paneId]();
      ThemeManager._paneVersions[paneId] = ThemeManager._version;
    }
  }

  // =========================================================================
  // 3. Annotation Rendering System
  // =========================================================================

  // Domain-to-CSS-class mapping for annotation border colors
  var MEMBER_DOMAIN_MAP = {
    'Psychometric': 'psychometrics',
    'Moral philosophy': 'philosophy',
    'Normative': 'philosophy',
    'Philosophy of science': 'science',
    'Philosophy of mind': 'mind',
    'AI safety': 'safety',
    'Alignment': 'safety',
    'AI governance': 'governance',
    'Cross-cultural': 'cultural',
    'Computational linguistics': 'linguistics',
    'NLP': 'linguistics',
    'Cognitive science': 'cognitive',
    'Dual-Process': 'cognitive',
    'Religious': 'religious',
    'Statistical': 'statistics',
    'Measurement theory': 'measurement',
    'AI Industry': 'industry',
    'Vendor': 'industry',
    'Policy': 'policy',
    'Governance': 'governance',
    'Developmental': 'developmental'
  };

  function _getDomainClass(memberStr) {
    if (!memberStr) return '';
    var keys = Object.keys(MEMBER_DOMAIN_MAP);
    for (var i = 0; i < keys.length; i++) {
      if (memberStr.indexOf(keys[i]) !== -1) {
        return 'ann-border-' + MEMBER_DOMAIN_MAP[keys[i]];
      }
    }
    return '';
  }

  function _addCrossRefLinks(textNode) {
    var text = textNode.textContent;
    var tabMap = {
      'Tab 1': 'tab-overview', 'Tab 2': 'tab-methodology',
      'Tab 3': 'tab-claims-1-3', 'Tab 4': 'tab-claims-4-6',
      'Tab 5': 'tab-rlhf-fingerprint', 'Tab 6': 'tab-integrated',
      'Tab 7': 'tab-discussion', 'Tab 8': 'tab-ranking',
      'Tab 9': 'tab-features', 'Tab 10': 'tab-explorer'
    };
    var pattern = /Tab (\d{1,2})(?:\s*\([^)]+\))?/g;
    var match;
    var parts = [];
    var lastIdx = 0;
    while ((match = pattern.exec(text)) !== null) {
      var tabRef = 'Tab ' + match[1];
      var tabId = tabMap[tabRef];
      if (!tabId) continue;
      if (match.index > lastIdx) {
        parts.push({ type: 'text', value: text.slice(lastIdx, match.index) });
      }
      parts.push({ type: 'link', tabId: tabId, label: match[0] });
      lastIdx = match.index + match[0].length;
    }
    if (parts.length === 0) return;
    if (lastIdx < text.length) {
      parts.push({ type: 'text', value: text.slice(lastIdx) });
    }
    textNode.textContent = '';
    parts.forEach(function (part) {
      if (part.type === 'text') {
        textNode.appendChild(document.createTextNode(part.value));
      } else {
        var badge = document.createElement('a');
        badge.className = 'cross-ref-badge';
        badge.href = '#';
        badge.textContent = part.label;
        badge.setAttribute('data-tab-id', part.tabId);
        badge.addEventListener('click', function (e) {
          e.preventDefault();
          var tid = this.getAttribute('data-tab-id');
          var tabBtn = document.getElementById(tid);
          if (tabBtn) {
            new bootstrap.Tab(tabBtn).show();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        });
        textNode.appendChild(badge);
      }
    });
  }

  // Pattern 1: Summary + Expandable Detail (new in v4)
  function renderAnnotationWithDetail(containerId, annotation) {
    var el = document.getElementById(containerId);
    if (!el || !annotation) return;

    var block = document.createElement('div');
    block.className = 'ann-block ' + _getDomainClass(annotation.member);

    var summP = document.createElement('div');
    summP.className = 'ann-summary';
    summP.textContent = annotation.summary;
    block.appendChild(summP);

    if (annotation.detail) {
      var detailId = containerId + '-detail';
      var toggle = document.createElement('a');
      toggle.className = 'ann-toggle';
      toggle.setAttribute('data-bs-toggle', 'collapse');
      toggle.href = '#' + detailId;
      toggle.textContent = 'Read more \u25B8';
      toggle.addEventListener('click', function () {
        var isExpanded = toggle.textContent.indexOf('\u25BE') !== -1;
        toggle.textContent = isExpanded ? 'Read more \u25B8' : 'Read less \u25BE';
      });
      block.appendChild(toggle);

      var detailDiv = document.createElement('div');
      detailDiv.className = 'collapse ann-detail';
      detailDiv.id = detailId;
      detailDiv.textContent = annotation.detail;
      _addCrossRefLinks(detailDiv);
      block.appendChild(detailDiv);
    }

    if (annotation.member) {
      var memberP = document.createElement('div');
      memberP.className = 'ann-member';
      memberP.textContent = '\u2014 ' + annotation.member;
      block.appendChild(memberP);
    }

    el.textContent = '';
    el.appendChild(block);
  }

  // Pattern 2: Chart Annotation (what/finding/interpretation/member)
  function renderChartAnnotation(containerId, annotation) {
    var el = document.getElementById(containerId);
    if (!el || !annotation) return;

    var block = document.createElement('div');
    block.className = 'ann-block ' + _getDomainClass(annotation.member);

    var whatP = document.createElement('p');
    whatP.className = 'ann-what mb-1';
    whatP.textContent = annotation.what;
    block.appendChild(whatP);

    var findP = document.createElement('p');
    findP.className = 'ann-finding mb-1';
    var strong = document.createElement('strong');
    strong.textContent = annotation.finding;
    findP.appendChild(strong);
    block.appendChild(findP);

    var interpP = document.createElement('p');
    interpP.className = 'ann-interpretation mb-1';
    interpP.textContent = annotation.interpretation;
    _addCrossRefLinks(interpP);
    block.appendChild(interpP);

    var memberP = document.createElement('p');
    memberP.className = 'ann-member mb-0';
    memberP.textContent = annotation.member;
    block.appendChild(memberP);

    el.textContent = '';
    el.appendChild(block);
  }

  // Pattern 3: Intro Block (title + summary)
  function renderIntroAnnotation(containerId, annotation) {
    var el = document.getElementById(containerId);
    if (!el || !annotation) return;

    var h5 = document.createElement('h5');
    h5.className = 'mb-2';
    h5.textContent = annotation.title;

    var p = document.createElement('p');
    p.className = 'text-muted small mb-0';
    p.textContent = annotation.summary;

    el.textContent = '';
    el.appendChild(h5);
    el.appendChild(p);
  }

  // Generic dispatcher: detect pattern from fields present
  function renderAllAnnotations() {
    var ann = DATA.tabAnnotations;
    if (!ann) return;

    Object.keys(ann).forEach(function (tabKey) {
      var tabAnn = ann[tabKey];
      Object.keys(tabAnn).forEach(function (elKey) {
        var elId = tabKey + '-ann-' + elKey;
        var a = tabAnn[elKey];

        if (a.title && a.summary && !a.detail) {
          // Intro block
          renderIntroAnnotation(elId, a);
        } else if (a.what && a.finding && a.interpretation) {
          // Chart annotation (4-field)
          renderChartAnnotation(elId, a);
        } else if (a.summary) {
          // Summary + expandable detail
          renderAnnotationWithDetail(elId, a);
        } else if (a.description) {
          // Simple description paragraph
          var el = document.getElementById(elId);
          if (el) {
            var dp = document.createElement('p');
            dp.className = 'text-muted small mb-0';
            dp.textContent = a.description;
            el.textContent = '';
            el.appendChild(dp);
          }
        }
      });
    });
  }

  // =========================================================================
  // 4. Executive Summary
  // =========================================================================

  function renderExecutiveSummary() {
    var container = document.getElementById('exec-summary');
    if (!container) return;
    var es = DATA.executiveSummary;
    if (!es) return;

    var iconChars = {
      'target': '\u25CE', 'brain': '\u2699', 'globe': '\u2641',
      'alert-triangle': '\u26A0', 'layers': '\u2630'
    };

    var frag = document.createDocumentFragment();
    var card = document.createElement('div');
    card.className = 'exec-summary';

    var headline = document.createElement('div');
    headline.className = 'exec-headline';
    headline.textContent = es.headline;
    card.appendChild(headline);

    (es.findings || []).forEach(function (f) {
      var row = document.createElement('div');
      row.className = 'exec-finding';

      var icon = document.createElement('div');
      icon.className = 'exec-finding-icon';
      icon.textContent = iconChars[f.icon] || '\u2022';
      row.appendChild(icon);

      var content = document.createElement('div');
      var title = document.createElement('div');
      title.className = 'exec-finding-title';
      title.textContent = f.title;
      content.appendChild(title);

      var text = document.createElement('div');
      text.className = 'exec-finding-text';
      text.textContent = f.text;
      content.appendChild(text);

      row.appendChild(content);
      card.appendChild(row);
    });

    if (es.aiDisclosure) {
      var disc = document.createElement('p');
      disc.className = 'text-muted mt-3';
      disc.style.cssText = 'font-size:0.8rem;border-top:1px solid rgba(200,208,232,0.12);padding-top:8px;';
      var em = document.createElement('em');
      em.textContent = es.aiDisclosure;
      disc.appendChild(em);
      card.appendChild(disc);
    }

    frag.appendChild(card);
    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 5. KPI Cards
  // =========================================================================

  function renderKPICards() {
    var kpi = DATA.kpi;
    if (!kpi) return;
    var container = document.getElementById('kpi-cards');
    if (!container) return;

    var cards = [
      { label: 'Total Candidates', value: kpi.totalCandidates || 292, color: '#E69F00', icon: 'search' },
      { label: 'Assessed', value: kpi.assessed || 292, color: '#56B4E9', icon: 'grid' },
      { label: 'Top Tier', value: kpi.tierCounts ? kpi.tierCounts.top : 0, color: '#009E73', icon: 'award' },
      { label: 'Theories Covered', value: kpi.theories, color: '#0072B2', icon: 'layers' },
      { label: 'Trials Completed', value: kpi.trials, color: '#D55E00', icon: 'activity' },
      { label: 'Features Scored', value: kpi.features || 17, color: '#CC79A7', icon: 'bar-chart' }
    ];

    var html = '';
    cards.forEach(function (c) {
      html += '<div class="col-sm-6 col-lg">' +
        '<div class="card card-dark kpi-card" style="border-top: 3px solid ' + c.color + '">' +
        '<div class="card-body text-center">' +
        '<div class="kpi-value" style="color:' + c.color + '">' + c.value + '</div>' +
        '<div class="kpi-label">' + c.label + '</div>' +
        '</div></div></div>';
    });
    container.innerHTML = html;
  }

  // =========================================================================
  // 6. Narrative Tour
  // =========================================================================

  function renderNarrativeTour() {
    var container = document.getElementById('narrative-tour');
    if (!container || !DATA.narrativeTour) return;

    var bindLabels = { narrow: 'Narrow Bind', undiscrim: 'Undiscriminating Bind', cultural: 'Cultural Bind' };
    var frag = document.createDocumentFragment();

    DATA.narrativeTour.forEach(function (step) {
      var card = document.createElement('div');
      card.className = 'card card-dark tour-step mb-3';
      card.style.borderLeft = '4px solid ' + (step.color || '#666');

      var body = document.createElement('div');
      body.className = 'card-body';

      // Header row: step number + headline
      var header = document.createElement('div');
      header.className = 'd-flex align-items-center mb-2';

      var stepBadge = document.createElement('span');
      stepBadge.className = 'badge me-2';
      stepBadge.style.background = step.color || '#666';
      stepBadge.textContent = step.step;
      header.appendChild(stepBadge);

      var headlineEl = document.createElement('span');
      headlineEl.className = 'tour-headline';
      headlineEl.style.color = step.color || '#fff';
      headlineEl.style.fontSize = '1.4rem';
      headlineEl.style.fontWeight = '700';
      headlineEl.textContent = step.headline;
      header.appendChild(headlineEl);

      if (step.bind) {
        var bindBadge = document.createElement('span');
        bindBadge.className = 'badge ms-auto';
        bindBadge.style.cssText = 'background:rgba(255,255,255,0.1);font-size:0.7rem;';
        bindBadge.textContent = bindLabels[step.bind] || step.bind;
        header.appendChild(bindBadge);
      }

      body.appendChild(header);

      // Description
      var descP = document.createElement('p');
      descP.className = 'text-muted small mb-0';
      descP.textContent = step.description;
      body.appendChild(descP);

      card.appendChild(body);
      frag.appendChild(card);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 7. Claim Cards
  // =========================================================================

  function renderClaimCards() {
    var container = document.getElementById('claim-cards-container');
    if (!container || !DATA.claimCards) return;

    var bindLabels = { narrow: 'Narrow', undiscrim: 'Undiscrim.', cultural: 'Cultural' };
    var frag = document.createDocumentFragment();

    DATA.claimCards.forEach(function (claim) {
      var col = document.createElement('div');
      col.className = 'col-md-4 col-lg-3';

      var card = document.createElement('div');
      card.className = 'card card-dark claim-card h-100';
      card.style.borderTop = '3px solid ' + claim.color;
      card.style.cursor = 'pointer';

      var body = document.createElement('div');
      body.className = 'card-body';

      var badgeRow = document.createElement('div');
      badgeRow.className = 'd-flex align-items-center mb-2';

      var numBadge = document.createElement('span');
      numBadge.className = 'bind-badge';
      numBadge.style.background = claim.color;
      numBadge.textContent = 'C' + claim.number;
      badgeRow.appendChild(numBadge);

      if (claim.bind) {
        var bindBadge = document.createElement('span');
        bindBadge.className = 'badge ms-2';
        bindBadge.style.cssText = 'background:rgba(255,255,255,0.08);font-size:0.65rem;';
        bindBadge.textContent = bindLabels[claim.bind] || claim.bind;
        badgeRow.appendChild(bindBadge);
      }

      body.appendChild(badgeRow);

      var titleEl = document.createElement('h6');
      titleEl.className = 'mt-1';
      titleEl.textContent = claim.title;
      body.appendChild(titleEl);

      var findingP = document.createElement('p');
      findingP.className = 'small text-muted mb-0';
      findingP.textContent = claim.finding;
      body.appendChild(findingP);

      card.appendChild(body);

      // Click to navigate to relevant tab
      (function (tabLink) {
        card.addEventListener('click', function () {
          var tabBtn = document.getElementById(tabLink);
          if (tabBtn) new bootstrap.Tab(tabBtn).show();
        });
      })(claim.tab_link);

      col.appendChild(card);
      frag.appendChild(col);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 8. Recommendation Cards
  // =========================================================================

  function renderRecommendationCards() {
    var container = document.getElementById('recommendation-cards-container');
    if (!container || !DATA.recommendationCards) return;

    var priorityColors = { Critical: '#e94560', High: '#E69F00', Medium: '#F0E442' };
    var frag = document.createDocumentFragment();

    DATA.recommendationCards.forEach(function (rec) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';

      var card = document.createElement('div');
      card.className = 'card card-dark h-100';
      card.style.borderLeft = '3px solid ' + (priorityColors[rec.priority] || '#666');

      var body = document.createElement('div');
      body.className = 'card-body';

      // Number + title
      var header = document.createElement('div');
      header.className = 'd-flex align-items-start mb-2';
      var numBadge = document.createElement('span');
      numBadge.className = 'badge me-2';
      numBadge.style.background = priorityColors[rec.priority] || '#666';
      numBadge.style.minWidth = '28px';
      numBadge.textContent = 'R' + rec.number;
      header.appendChild(numBadge);
      var titleEl = document.createElement('strong');
      titleEl.textContent = rec.title;
      header.appendChild(titleEl);
      body.appendChild(header);

      // Badges row
      var badges = document.createElement('div');
      badges.className = 'mb-2';

      var prBadge = document.createElement('span');
      prBadge.className = 'badge me-1';
      prBadge.style.background = priorityColors[rec.priority] || '#666';
      prBadge.textContent = rec.priority;
      badges.appendChild(prBadge);

      var efBadge = document.createElement('span');
      efBadge.className = 'badge bg-secondary bg-opacity-25 text-muted me-1';
      efBadge.textContent = 'Effort: ' + rec.effort;
      badges.appendChild(efBadge);

      var tlBadge = document.createElement('span');
      tlBadge.className = 'badge bg-secondary bg-opacity-25 text-muted me-1';
      tlBadge.textContent = rec.timeline;
      badges.appendChild(tlBadge);

      if (rec.addresses_claim) {
        var claimBadge = document.createElement('span');
        claimBadge.className = 'badge bg-secondary bg-opacity-25 text-muted';
        claimBadge.textContent = 'C' + rec.addresses_claim;
        badges.appendChild(claimBadge);
      }

      body.appendChild(badges);

      // Rationale
      var ratP = document.createElement('p');
      ratP.className = 'small text-muted mb-0';
      ratP.textContent = rec.rationale;
      body.appendChild(ratP);

      card.appendChild(body);
      col.appendChild(card);
      frag.appendChild(col);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 9. Tier Definitions
  // =========================================================================

  function renderTierDefinitions() {
    var container = document.getElementById('tier-definitions');
    if (!container || !DATA.kpi) return;

    var tc = DATA.kpi.tierCounts;
    var jb = DATA.kpi.jenksBreaks || [];
    var tiers = [
      { name: 'Top', key: 'top', count: tc.top, range: '\u2265 ' + (jb[2] || 56.65), color: '#009E73', desc: 'Publication-ready benchmarks with strong psychometric grounding, human baselines, and construct validity.' },
      { name: 'High', key: 'high', count: tc.high, range: (jb[1] || 43.05) + ' \u2013 ' + (jb[2] || 56.65), color: '#56B4E9', desc: 'Valuable instruments narrowly below top tier, typically strong in one dimension.' },
      { name: 'Medium', key: 'med', count: tc.med, range: (jb[0] || 27.80) + ' \u2013 ' + (jb[1] || 43.05), color: '#E69F00', desc: 'Pilot-quality instruments lacking psychometric validation or human baselines.' },
      { name: 'Low', key: 'low', count: tc.low, range: '< ' + (jb[0] || 27.80), color: '#D55E00', desc: 'Underdeveloped candidates documenting gaps in the landscape.' }
    ];

    var frag = document.createDocumentFragment();
    tiers.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'd-flex align-items-start mb-3';

      var badge = document.createElement('span');
      badge.className = 'badge me-3';
      badge.style.cssText = 'background:' + t.color + ';min-width:60px;font-size:0.85rem;padding:6px 10px;';
      badge.textContent = t.name;
      row.appendChild(badge);

      var detail = document.createElement('div');
      var nameRow = document.createElement('div');
      nameRow.className = 'fw-bold';
      nameRow.textContent = t.name + ' Tier (n=' + t.count + ', composite ' + t.range + ')';
      detail.appendChild(nameRow);

      var descP = document.createElement('div');
      descP.className = 'text-muted small';
      descP.textContent = t.desc;
      detail.appendChild(descP);

      row.appendChild(detail);
      frag.appendChild(row);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 10. Discussion Themes
  // =========================================================================

  function renderDiscussionThemes() {
    var container = document.getElementById('discussion-themes');
    if (!container || !DATA.discussionThemes) return;

    var accordion = document.createElement('div');
    accordion.className = 'accordion accordion-flush';
    accordion.id = 'discussion-accordion';

    DATA.discussionThemes.forEach(function (theme, idx) {
      var collapseId = 'disc-theme-' + idx;
      var item = document.createElement('div');
      item.className = 'accordion-item';
      item.style.background = 'transparent';
      item.style.borderColor = 'var(--border-color)';

      var header = document.createElement('h2');
      header.className = 'accordion-header';

      var btn = document.createElement('button');
      btn.className = 'accordion-button collapsed';
      btn.type = 'button';
      btn.setAttribute('data-bs-toggle', 'collapse');
      btn.setAttribute('data-bs-target', '#' + collapseId);
      btn.style.cssText = 'background:var(--bg-card);color:var(--text-primary);font-size:0.9rem;padding:0.7rem 1rem;';

      var numBadge = document.createElement('span');
      numBadge.className = 'badge me-2';
      numBadge.style.background = '#7C3AED';
      numBadge.style.minWidth = '28px';
      numBadge.textContent = idx + 1;
      btn.appendChild(numBadge);

      var titleEl = document.createElement('strong');
      titleEl.textContent = theme.title;
      btn.appendChild(titleEl);

      header.appendChild(btn);
      item.appendChild(header);

      var collapseDiv = document.createElement('div');
      collapseDiv.id = collapseId;
      collapseDiv.className = 'accordion-collapse collapse';
      collapseDiv.setAttribute('data-bs-parent', '#discussion-accordion');

      var bodyDiv = document.createElement('div');
      bodyDiv.className = 'accordion-body';
      bodyDiv.style.cssText = 'background:var(--bg-card);color:var(--text-muted);font-size:0.85rem;border-top:1px solid var(--border-color);';

      var summP = document.createElement('p');
      summP.className = 'mb-2';
      summP.textContent = theme.summary;
      bodyDiv.appendChild(summP);

      if (theme.detail_preview) {
        var detailP = document.createElement('p');
        detailP.className = 'text-muted small fst-italic mb-0';
        detailP.textContent = theme.detail_preview;
        bodyDiv.appendChild(detailP);
      }

      collapseDiv.appendChild(bodyDiv);
      item.appendChild(collapseDiv);
      accordion.appendChild(item);
    });

    container.textContent = '';
    container.appendChild(accordion);
  }

  // =========================================================================
  // 10b. Discussion Recommendations
  // =========================================================================

  function renderDiscussionRecs() {
    var container = document.getElementById('discussion-recs-container');
    if (!container || !DATA.recommendationCards) return;

    var priorityColors = { Critical: '#e94560', High: '#E69F00', Medium: '#F0E442' };
    var frag = document.createDocumentFragment();

    DATA.recommendationCards.forEach(function (rec) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';

      var card = document.createElement('div');
      card.className = 'card card-dark h-100';
      card.style.borderLeft = '3px solid ' + (priorityColors[rec.priority] || '#666');

      var body = document.createElement('div');
      body.className = 'card-body';

      var header = document.createElement('div');
      header.className = 'd-flex align-items-start mb-2';
      var numBadge = document.createElement('span');
      numBadge.className = 'badge me-2';
      numBadge.style.background = priorityColors[rec.priority] || '#666';
      numBadge.textContent = 'R' + rec.number;
      header.appendChild(numBadge);
      var titleEl = document.createElement('strong');
      titleEl.textContent = rec.title;
      header.appendChild(titleEl);
      body.appendChild(header);

      var desc = document.createElement('p');
      desc.className = 'small text-muted mb-0';
      desc.textContent = rec.description || '';
      body.appendChild(desc);

      card.appendChild(body);
      col.appendChild(card);
      frag.appendChild(col);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 11. Hidden Gems
  // =========================================================================

  function renderHiddenGems() {
    var container = document.getElementById('hidden-gems-container');
    if (!container || !DATA.hiddenGems) return;

    var gems = DATA.hiddenGems.gems || DATA.hiddenGems;
    if (!gems || !gems.length) return;

    // Compact list layout (fits narrow sidebar)
    var frag = document.createDocumentFragment();
    var list = document.createElement('div');
    list.className = 'gem-list';
    gems.forEach(function (gem, i) {
      var item = document.createElement('div');
      item.className = 'gem-item d-flex align-items-start gap-2 mb-2 pb-2';
      if (i < gems.length - 1) item.style.borderBottom = '1px solid var(--border-color, #2a2a4a)';

      var score = document.createElement('span');
      score.className = 'badge badge-top fw-bold';
      score.style.fontSize = '0.85rem';
      score.style.minWidth = '48px';
      score.textContent = gem.composite;
      item.appendChild(score);

      var info = document.createElement('div');
      info.className = 'small';
      var shortTitle = gem.title.length > 50 ? gem.title.substring(0, 47) + '...' : gem.title;
      var titleSpan = document.createElement('strong');
      titleSpan.textContent = shortTitle;
      titleSpan.title = gem.title;
      info.appendChild(titleSpan);

      var meta = document.createElement('div');
      meta.className = 'text-muted';
      meta.style.fontSize = '0.75rem';
      var theories = Array.isArray(gem.theories) ? gem.theories.join(', ') : (gem.theories || '');
      meta.textContent = gem.year + ' \u00B7 ' + theories;
      info.appendChild(meta);

      item.appendChild(info);
      list.appendChild(item);
    });
    frag.appendChild(list);

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 12. RLHF Signatures
  // =========================================================================

  function renderRLHFSignatures() {
    var container = document.getElementById('rlhf-signatures-container');
    if (!container || !DATA.rlhfSignatures) return;

    var frag = document.createDocumentFragment();
    DATA.rlhfSignatures.forEach(function (sig, idx) {
      var card = document.createElement('div');
      card.className = 'col-md-6 col-lg-4';

      var inner = document.createElement('div');
      inner.className = 'card card-dark h-100';
      inner.style.borderLeft = '3px solid ' + (DATA.bindColors ? DATA.bindColors.undiscrim : '#0072B2');

      var body = document.createElement('div');
      body.className = 'card-body';

      var numBadge = document.createElement('span');
      numBadge.className = 'badge mb-2';
      numBadge.style.background = '#0072B2';
      numBadge.textContent = idx + 1;
      body.appendChild(numBadge);

      var nameEl = document.createElement('h6');
      nameEl.className = 'card-title';
      nameEl.textContent = sig.name;
      body.appendChild(nameEl);

      var descP = document.createElement('p');
      descP.className = 'small text-muted mb-2';
      descP.textContent = sig.description;
      body.appendChild(descP);

      if (sig.evidence) {
        var evP = document.createElement('p');
        evP.className = 'small mb-1';
        evP.style.color = '#56B4E9';
        evP.textContent = sig.evidence;
        body.appendChild(evP);
      }

      if (sig.human_comparison) {
        var hcP = document.createElement('p');
        hcP.className = 'small text-muted fst-italic mb-0';
        hcP.textContent = sig.human_comparison;
        body.appendChild(hcP);
      }

      inner.appendChild(body);
      card.appendChild(inner);
      frag.appendChild(card);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 13. Feedback Loop
  // =========================================================================

  function renderFeedbackLoop() {
    var container = document.getElementById('feedback-loop-cards');
    if (!container || !DATA.feedbackLoop) return;

    var bindColors = DATA.bindColors || { narrow: '#D55E00', undiscrim: '#0072B2', cultural: '#CC79A7' };
    var frag = document.createDocumentFragment();

    DATA.feedbackLoop.forEach(function (pathway) {
      var col = document.createElement('div');
      col.className = 'col-md-6';

      var card = document.createElement('div');
      card.className = 'card card-dark h-100';

      var body = document.createElement('div');
      body.className = 'card-body';

      var titleEl = document.createElement('h6');
      titleEl.className = 'card-title';
      titleEl.textContent = pathway.title;
      body.appendChild(titleEl);

      var descP = document.createElement('p');
      descP.className = 'small text-muted mb-2';
      descP.textContent = pathway.description;
      body.appendChild(descP);

      var flow = document.createElement('div');
      flow.className = 'small';
      var fromBadge = document.createElement('span');
      fromBadge.className = 'badge me-1';
      fromBadge.style.background = bindColors[pathway.from_bind] || '#666';
      fromBadge.textContent = pathway.from_bind;
      flow.appendChild(fromBadge);
      flow.appendChild(document.createTextNode(' \u2192 '));
      var toBadge = document.createElement('span');
      toBadge.className = 'badge';
      toBadge.style.background = bindColors[pathway.to_bind] || '#666';
      toBadge.textContent = pathway.to_bind;
      flow.appendChild(toBadge);
      body.appendChild(flow);

      card.appendChild(body);
      col.appendChild(card);
      frag.appendChild(col);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 14. Scoring Formula
  // =========================================================================

  function renderScoringFormula() {
    var el = document.getElementById('methods-formula');
    if (!el || !DATA.scoringFormula) return;
    var sf = DATA.scoringFormula;

    var frag = document.createDocumentFragment();
    var items = [
      { label: 'Composite', value: sf.COMPOSITE },
      { label: 'PD', value: sf.PD },
      { label: 'PE', value: sf.PE },
      { label: 'CI', value: sf.CI }
    ];

    items.forEach(function (item) {
      if (!item.value) return;
      var div = document.createElement('div');
      div.className = 'mb-1';
      var code = document.createElement('code');
      code.textContent = item.label;
      div.appendChild(code);
      div.appendChild(document.createTextNode(' = ' + item.value));
      frag.appendChild(div);
    });

    if (sf.jenks) {
      var jDiv = document.createElement('div');
      jDiv.className = 'mt-2 text-muted small';
      jDiv.textContent = 'Jenks GVF: ' + (sf.jenks.gvf || 'N/A') + ' | Breaks: ' + (sf.jenks.breaks || []).join(', ');
      frag.appendChild(jDiv);
    }

    el.textContent = '';
    el.appendChild(frag);
  }

  // =========================================================================
  // 15. Model Inventory
  // =========================================================================

  function renderModelInventory() {
    var container = document.getElementById('model-inventory-cards');
    if (!container || !DATA.modelInventory) return;

    var models = DATA.modelInventory;
    if (!Array.isArray(models) || models.length === 0) return;

    var frag = document.createDocumentFragment();
    models.forEach(function (m) {
      var col = document.createElement('div');
      col.className = 'col-sm-6 col-md-4 col-lg-3';

      var card = document.createElement('div');
      card.className = 'card card-dark h-100';

      var body = document.createElement('div');
      body.className = 'card-body text-center';

      var nameEl = document.createElement('div');
      nameEl.className = 'fw-bold';
      nameEl.textContent = m.display || m.name || m;
      body.appendChild(nameEl);

      if (m.vendor) {
        var vendorEl = document.createElement('div');
        vendorEl.className = 'text-muted small';
        vendorEl.textContent = m.vendor;
        body.appendChild(vendorEl);
      }

      card.appendChild(body);
      col.appendChild(card);
      frag.appendChild(col);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 16. Paper Ranking Table
  // =========================================================================

  var rankingState = {
    allRows: [],
    filteredRows: [],
    sortKey: 'displayRank',
    sortDir: 'asc',
    initialized: false
  };

  function scoreClass(val) {
    if (val >= 65) return 'score-high';
    if (val >= 40) return 'score-mid';
    if (val > 0) return 'score-low';
    return 'score-zero';
  }

  function renderRankingKPI() {
    var container = document.getElementById('ranking-kpi');
    if (!container || !DATA.paperRanking) return;
    var pr = DATA.paperRanking;
    var tc = pr.tierCounts || DATA.kpi.tierCounts || {};

    var cards = [
      { label: 'Total Candidates', value: pr.totalCandidates || DATA.kpi.totalCandidates, color: '#E69F00' },
      { label: 'Top Tier', value: tc.top || 0, color: '#009E73' },
      { label: 'High Tier', value: tc.high || 0, color: '#56B4E9' },
      { label: 'Year Range', value: (pr.yearRange ? pr.yearRange.min + '\u2013' + pr.yearRange.max : ''), color: '#0072B2' }
    ];

    var frag = document.createDocumentFragment();
    cards.forEach(function (c) {
      var col = document.createElement('div');
      col.className = 'col-sm-6 col-lg-3';
      var card = document.createElement('div');
      card.className = 'card card-dark kpi-card';
      card.style.borderTop = '3px solid ' + c.color;
      var body = document.createElement('div');
      body.className = 'card-body text-center';
      var valDiv = document.createElement('div');
      valDiv.className = 'kpi-value';
      valDiv.style.color = c.color;
      valDiv.style.fontSize = '1.8rem';
      valDiv.textContent = c.value;
      var lblDiv = document.createElement('div');
      lblDiv.className = 'kpi-label';
      lblDiv.textContent = c.label;
      body.appendChild(valDiv);
      body.appendChild(lblDiv);
      card.appendChild(body);
      col.appendChild(card);
      frag.appendChild(col);
    });
    container.textContent = '';
    container.appendChild(frag);
  }

  function initRankingFilters() {
    if (!DATA.paperRanking) return;
    var pr = DATA.paperRanking;

    // Populate theory filter
    var theorySelect = document.getElementById('ranking-theory-filter');
    if (theorySelect && pr.theoryOptions) {
      pr.theoryOptions.forEach(function (t) {
        var opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        theorySelect.appendChild(opt);
      });
    }

    // Wire event listeners
    var searchEl = document.getElementById('ranking-search');
    var tierSelect = document.getElementById('ranking-tier-filter');

    function onFilterChange() { applyRankingFilters(); }

    if (searchEl) searchEl.addEventListener('input', onFilterChange);
    if (theorySelect) theorySelect.addEventListener('change', onFilterChange);
    if (tierSelect) tierSelect.addEventListener('change', onFilterChange);

    // Sortable headers
    var headers = document.querySelectorAll('#ranking-table thead th.sortable');
    headers.forEach(function (th) {
      th.addEventListener('click', function () {
        var key = th.getAttribute('data-sort');
        if (rankingState.sortKey === key) {
          rankingState.sortDir = rankingState.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          rankingState.sortKey = key;
          rankingState.sortDir = (key === 'displayRank' || key === 'year') ? 'asc' : 'desc';
        }
        headers.forEach(function (h) { h.classList.remove('sort-asc', 'sort-desc'); });
        th.classList.add(rankingState.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
        applyRankingSort();
        renderRankingRows();
      });
    });

    // Close button for detail panel
    var closeBtn = document.getElementById('ranking-detail-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        var panel = document.getElementById('ranking-detail-panel');
        if (panel) panel.classList.add('d-none');
      });
    }
  }

  function applyRankingFilters() {
    if (!DATA.paperRanking) return;
    var rows = DATA.paperRanking.rows;

    var searchEl = document.getElementById('ranking-search');
    var theoryEl = document.getElementById('ranking-theory-filter');
    var tierEl = document.getElementById('ranking-tier-filter');

    var searchVal = (searchEl ? searchEl.value : '').toLowerCase();
    var theoryVal = theoryEl ? theoryEl.value : '';
    var tierVal = tierEl ? tierEl.value : '';

    rankingState.filteredRows = rows.filter(function (r) {
      if (searchVal && r.title.toLowerCase().indexOf(searchVal) === -1) return false;
      if (theoryVal && r.theories.indexOf(theoryVal) === -1) return false;
      if (tierVal && tierVal !== 'all' && r.tier !== tierVal) return false;
      return true;
    });

    applyRankingSort();
    renderRankingRows();
  }

  function applyRankingSort() {
    var key = rankingState.sortKey;
    var dir = rankingState.sortDir === 'asc' ? 1 : -1;

    rankingState.filteredRows.sort(function (a, b) {
      var av = a[key];
      var bv = b[key];
      if (typeof av === 'string') return dir * av.localeCompare(bv);
      return dir * ((av || 0) - (bv || 0));
    });
  }

  function renderRankingRows() {
    var tbody = document.getElementById('ranking-table-body');
    if (!tbody) return;

    var rows = rankingState.filteredRows;
    var countEl = document.getElementById('ranking-count');
    if (countEl) {
      var total = DATA.paperRanking.totalCandidates || DATA.paperRanking.rows.length;
      countEl.textContent = rows.length + ' of ' + total + ' shown';
    }

    var frag = document.createDocumentFragment();

    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.classList.add('row-' + (r.tier || 'low'));
      if (r.theoryColor) tr.style.borderLeftColor = r.theoryColor;

      // Rank
      var tdRank = document.createElement('td');
      tdRank.textContent = r.displayRank;
      tr.appendChild(tdRank);

      // Title + tier badge
      var tdTitle = document.createElement('td');
      tdTitle.className = 'text-nowrap';
      var titleText = r.title;
      if (titleText.length > 50) titleText = titleText.substring(0, 47) + '...';
      tdTitle.appendChild(document.createTextNode(titleText));
      if (r.tier) {
        var tierBadge = document.createElement('span');
        tierBadge.className = 'badge-' + r.tier;
        tierBadge.textContent = r.tier.charAt(0).toUpperCase() + r.tier.slice(1);
        tdTitle.appendChild(document.createTextNode(' '));
        tdTitle.appendChild(tierBadge);
      }
      tr.appendChild(tdTitle);

      // Year
      var tdYear = document.createElement('td');
      tdYear.textContent = r.year;
      tr.appendChild(tdYear);

      // Authors
      var tdAuth = document.createElement('td');
      tdAuth.className = 'text-nowrap';
      tdAuth.textContent = r.authors || '';
      tr.appendChild(tdAuth);

      // Theories
      var tdTheory = document.createElement('td');
      tdTheory.textContent = r.theories;
      tr.appendChild(tdTheory);

      // Score columns: composite, PD, PE, CI
      var scoreFields = ['composite', 'PD', 'PE', 'CI'];
      scoreFields.forEach(function (sf) {
        var td = document.createElement('td');
        var val = r[sf];
        if (!r.assessed) {
          td.className = 'score-zero';
          td.textContent = '-';
        } else {
          td.className = scoreClass(val);
          td.textContent = typeof val === 'number' ? val.toFixed(1) : (val || '-');
          if (sf === 'composite') td.style.fontWeight = '700';
        }
        tr.appendChild(td);
      });

      // Data available
      var tdData = document.createElement('td');
      tdData.textContent = r.hasData ? 'Y' : '-';
      tdData.style.color = r.hasData ? '#a0f0d0' : 'rgba(200,208,232,0.2)';
      tr.appendChild(tdData);

      // Click for detail
      if (r.featureProfile) {
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', function () { showRankingDetail(r); });
      }

      frag.appendChild(tr);
    });

    tbody.textContent = '';
    tbody.appendChild(frag);
  }

  function showRankingDetail(row) {
    var panel = document.getElementById('ranking-detail-panel');
    var titleEl = document.getElementById('ranking-detail-title');
    var bodyEl = document.getElementById('ranking-detail-body');
    if (!panel || !titleEl || !bodyEl || !row.featureProfile) return;

    panel.classList.remove('d-none');
    titleEl.textContent = row.title + ' (' + row.year + ') \u2014 Feature Profile';

    var profile = row.featureProfile;
    var frag = document.createDocumentFragment();

    var keys = Object.keys(profile).sort();
    keys.forEach(function (key) {
      var entry = profile[key];
      var cell = document.createElement('div');
      cell.className = 'profile-cell d-inline-block me-2 mb-2 p-2';
      cell.style.cssText = 'border:1px solid var(--border-color);border-radius:4px;min-width:80px;text-align:center;';

      var keyDiv = document.createElement('div');
      keyDiv.className = 'dim-key small fw-bold';
      keyDiv.textContent = key;
      cell.appendChild(keyDiv);

      var scoreDiv = document.createElement('div');
      scoreDiv.className = 'dim-score ' + scoreClass(entry.score);
      scoreDiv.textContent = entry.score;
      cell.appendChild(scoreDiv);

      if (entry.evidence) {
        var evDiv = document.createElement('div');
        evDiv.className = 'dim-evidence text-muted';
        evDiv.style.fontSize = '0.7rem';
        evDiv.textContent = entry.evidence;
        cell.appendChild(evDiv);
      }

      frag.appendChild(cell);
    });

    bodyEl.textContent = '';
    bodyEl.appendChild(frag);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function initPaperRanking() {
    if (rankingState.initialized) return;
    if (!DATA.paperRanking) return;

    rankingState.allRows = DATA.paperRanking.rows;
    rankingState.filteredRows = rankingState.allRows.slice();
    rankingState.initialized = true;

    renderRankingKPI();
    initRankingFilters();
    renderRankingRows();
  }

  // =========================================================================
  // 17. Feature Matrix Table
  // =========================================================================

  var featureTableTierFilter = 'top';

  function scoreColorClass(val) {
    if (val >= 75) return 'cell-high';
    if (val >= 50) return 'cell-mid';
    return 'cell-low';
  }

  function renderFeatureTable(filterTier) {
    var tbody = document.getElementById('feature-table-body');
    if (!tbody || !DATA.featureTable) return;

    var tier = filterTier || featureTableTierFilter;
    var allRows = DATA.featureTable;
    var rows = tier === 'all' ? allRows : allRows.filter(function (r) { return r.tier === tier; });

    var frag = document.createDocumentFragment();

    // Determine feature columns from first row
    var featureCols = [];
    if (allRows.length > 0) {
      var skip = { rank: 1, short_title: 1, year: 1, theories: 1, tier: 1, PD: 1, PE: 1, CI: 1, composite: 1 };
      Object.keys(allRows[0]).forEach(function (k) {
        if (!skip[k]) featureCols.push(k);
      });
      featureCols.sort();
    }

    rows.forEach(function (r) {
      var tr = document.createElement('tr');

      // Rank
      var tdRank = document.createElement('td');
      tdRank.textContent = r.rank;
      tr.appendChild(tdRank);

      // Tier badge
      var tdTier = document.createElement('td');
      var tierBadge = document.createElement('span');
      tierBadge.className = 'badge-' + r.tier;
      tierBadge.textContent = r.tier.charAt(0).toUpperCase() + r.tier.slice(1);
      tdTier.appendChild(tierBadge);
      tr.appendChild(tdTier);

      // Title
      var tdTitle = document.createElement('td');
      tdTitle.className = 'text-nowrap';
      var titleText = r.short_title;
      if (titleText && titleText.length > 40) titleText = titleText.substring(0, 37) + '...';
      tdTitle.textContent = titleText || '';
      tr.appendChild(tdTitle);

      // Year
      var tdYear = document.createElement('td');
      tdYear.textContent = r.year;
      tr.appendChild(tdYear);

      // Theories
      var tdTheories = document.createElement('td');
      tdTheories.textContent = r.theories;
      tr.appendChild(tdTheories);

      // Feature score columns
      featureCols.forEach(function (f) {
        var td = document.createElement('td');
        var val = r[f];
        if (val != null) {
          td.className = scoreColorClass(val);
          td.textContent = val;
        } else {
          td.textContent = '-';
        }
        tr.appendChild(td);
      });

      // PD, PE, CI
      ['PD', 'PE', 'CI'].forEach(function (f) {
        var td = document.createElement('td');
        td.textContent = r[f] != null ? r[f] : '-';
        tr.appendChild(td);
      });

      // Composite (bold)
      var tdComp = document.createElement('td');
      tdComp.style.fontWeight = '700';
      tdComp.textContent = r.composite;
      tr.appendChild(tdComp);

      frag.appendChild(tr);
    });

    tbody.textContent = '';
    tbody.appendChild(frag);

    // Update count
    var countEl = document.getElementById('feature-table-count');
    if (countEl) {
      countEl.textContent = rows.length + ' of ' + allRows.length + ' benchmarks' + (tier !== 'all' ? ' (' + tier + ' tier)' : '');
    }
  }

  function setupFeatureTierFilter() {
    var filterEl = document.getElementById('feature-tier-filter');
    if (filterEl) {
      filterEl.addEventListener('change', function () {
        featureTableTierFilter = this.value;
        renderFeatureTable(this.value);
      });
    }
  }

  // =========================================================================
  // 18. Health Scorecard
  // =========================================================================

  function renderHealthScorecard() {
    var el = document.getElementById('health-scorecard');
    if (!el || !DATA.healthScorecard) return;
    var hs = DATA.healthScorecard;

    function gradeClass(g) {
      if (!g) return 'grade-F';
      var letter = g.charAt(0);
      if (letter === 'A') return 'grade-A';
      if (letter === 'B') return 'grade-B';
      if (letter === 'C') return 'grade-C';
      if (letter === 'D') return 'grade-D';
      return 'grade-F';
    }

    var frag = document.createDocumentFragment();

    if (hs.overallGrade) {
      var center = document.createElement('div');
      center.className = 'text-center mb-3';
      var badge = document.createElement('span');
      badge.className = 'grade-badge ' + gradeClass(hs.overallGrade);
      badge.style.fontSize = '2rem';
      badge.style.padding = '0.4rem 1rem';
      badge.textContent = hs.overallGrade;
      center.appendChild(badge);
      if (hs.overallScore != null) {
        var scoreNote = document.createElement('div');
        scoreNote.className = 'text-muted small mt-1';
        scoreNote.textContent = 'Overall Score: ' + hs.overallScore + ' / 100';
        center.appendChild(scoreNote);
      }
      frag.appendChild(center);
    }

    if (hs.dimensions) {
      var dimBox = document.createElement('div');
      dimBox.className = 'mt-3';
      hs.dimensions.forEach(function (d) {
        var row = document.createElement('div');
        row.className = 'd-flex justify-content-between align-items-center mb-2';
        var nameSpan = document.createElement('span');
        nameSpan.className = 'small';
        nameSpan.textContent = d.name;
        var rightSpan = document.createElement('span');
        var gBadge = document.createElement('span');
        gBadge.className = 'grade-badge ' + gradeClass(d.grade);
        gBadge.textContent = d.grade;
        var sSpan = document.createElement('span');
        sSpan.className = 'small text-muted ms-1';
        sSpan.textContent = d.score + '/100';
        rightSpan.appendChild(gBadge);
        rightSpan.appendChild(sSpan);
        row.appendChild(nameSpan);
        row.appendChild(rightSpan);
        dimBox.appendChild(row);
      });
      frag.appendChild(dimBox);
    }

    el.textContent = '';
    el.appendChild(frag);
  }

  // =========================================================================
  // 19. Infrastructure Pipeline (static cards)
  // =========================================================================

  function renderInfrastructurePipeline() {
    var container = document.getElementById('infrastructure-pipeline-cards');
    if (!container || !DATA.infrastructurePipeline) return;

    var theories = DATA.infrastructurePipeline.theories || DATA.infrastructurePipeline;
    if (!Array.isArray(theories)) return;

    var frag = document.createDocumentFragment();
    theories.forEach(function (t) {
      var col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';

      var card = document.createElement('div');
      card.className = 'card card-dark h-100';

      var body = document.createElement('div');
      body.className = 'card-body';

      var nameEl = document.createElement('h6');
      nameEl.className = 'card-title';
      nameEl.textContent = t.theory || t.name || '';
      body.appendChild(nameEl);

      // Assets
      if (t.hasInstrument != null || t.hasCorpus != null || t.hasBaselines != null) {
        var assets = document.createElement('div');
        assets.className = 'small mb-2';
        var checks = [
          { label: 'Instrument', val: t.hasInstrument },
          { label: 'Corpus', val: t.hasCorpus },
          { label: 'Baselines', val: t.hasBaselines }
        ];
        checks.forEach(function (c) {
          var span = document.createElement('span');
          span.className = 'me-2';
          span.style.color = c.val ? '#009E73' : '#D55E00';
          span.textContent = (c.val ? '\u2713' : '\u2717') + ' ' + c.label;
          assets.appendChild(span);
        });
        body.appendChild(assets);
      }

      if (t.qualityRate != null) {
        var qr = document.createElement('div');
        qr.className = 'text-muted small';
        qr.textContent = 'Quality rate: ' + t.qualityRate + '%';
        body.appendChild(qr);
      }

      card.appendChild(body);
      col.appendChild(card);
      frag.appendChild(col);
    });

    container.textContent = '';
    container.appendChild(frag);
  }

  // =========================================================================
  // 20. Cross-Vendor Static Renders
  // =========================================================================

  function renderCVTrialTable() {
    var cv = DATA.crossVendor;
    if (!cv || !cv.available || !cv.trialTable) return;

    // Build dynamic header
    var thead = document.getElementById('cv-trial-table-head');
    if (thead) {
      var headTr = document.createElement('tr');
      ['Trial', 'Benchmark', 'Metric'].forEach(function (h) {
        var th = document.createElement('th');
        th.textContent = h;
        headTr.appendChild(th);
      });
      cv.models.forEach(function (name, i) {
        var th = document.createElement('th');
        th.textContent = name;
        th.style.color = cv.modelColors[i];
        th.className = 'text-nowrap';
        headTr.appendChild(th);
      });
      var thCat = document.createElement('th');
      thCat.textContent = 'Category';
      headTr.appendChild(thCat);
      thead.textContent = '';
      thead.appendChild(headTr);
    }

    var tbody = document.getElementById('cv-trial-table-body');
    if (!tbody) return;

    var frag = document.createDocumentFragment();
    cv.trialTable.forEach(function (t) {
      var tr = document.createElement('tr');
      if (t.provenance === 'cloned') tr.className = 'provenance-cloned';

      var tdId = document.createElement('td');
      tdId.className = 'text-nowrap fw-bold';
      tdId.textContent = t.id;
      tr.appendChild(tdId);

      var tdBench = document.createElement('td');
      tdBench.textContent = t.benchmark;
      if (t.provenance === 'cloned') {
        var cloneBadge = document.createElement('span');
        cloneBadge.className = 'badge bg-warning text-dark ms-1';
        cloneBadge.title = 'Data cloned from Opus \u2014 not independently tested';
        cloneBadge.textContent = 'Cloned';
        tdBench.appendChild(cloneBadge);
      }
      tr.appendChild(tdBench);

      var tdMetric = document.createElement('td');
      tdMetric.className = 'small text-muted';
      tdMetric.textContent = t.metric;
      tr.appendChild(tdMetric);

      // Model value columns with conditional formatting
      var numVals = [];
      var valCells = [];
      for (var mi = 0; mi < cv.modelKeys.length; mi++) {
        var td = document.createElement('td');
        td.style.color = cv.modelColors[mi];
        td.className = 'text-nowrap';
        var raw = t.values ? (t.values[cv.modelKeys[mi]] != null ? t.values[cv.modelKeys[mi]] : '\u2014') : '\u2014';
        td.textContent = raw;
        tr.appendChild(td);
        valCells.push(td);
        var n = parseFloat(raw);
        numVals.push(isNaN(n) ? null : n);
      }

      // Detect ceiling rows
      var validNums = numVals.filter(function (v) { return v !== null; });
      var uniqueVals = [];
      validNums.forEach(function (v) {
        var rounded = Math.round(v * 1000) / 1000;
        if (uniqueVals.indexOf(rounded) === -1) uniqueVals.push(rounded);
      });
      if (uniqueVals.length === 1 && validNums.length >= 5) {
        tr.className += (tr.className ? ' ' : '') + 'cv-ceiling-row';
      } else if (validNums.length >= 3) {
        var maxV = Math.max.apply(null, validNums);
        var minV = Math.min.apply(null, validNums);
        if (maxV !== minV) {
          for (var ci = 0; ci < numVals.length; ci++) {
            if (numVals[ci] === maxV) valCells[ci].className += ' cv-max-val';
            if (numVals[ci] === minV) valCells[ci].className += ' cv-min-val';
          }
        }
      }

      var tdCat = document.createElement('td');
      var catBadge = document.createElement('span');
      catBadge.className = 'badge bg-secondary bg-opacity-25 text-muted';
      catBadge.textContent = t.category;
      tdCat.appendChild(catBadge);
      tr.appendChild(tdCat);

      frag.appendChild(tr);
    });

    tbody.textContent = '';
    tbody.appendChild(frag);
  }

  // =========================================================================
  // 21. Redundancy Cards (Explorer Tab)
  // =========================================================================

  function renderRedundancyCards() {
    var el = document.getElementById('redundancy-cards');
    if (!el || !DATA.redundancySummary) return;
    var rs = DATA.redundancySummary;

    var frag = document.createDocumentFragment();

    function makeBlock(val, color, label) {
      var block = document.createElement('div');
      block.className = 'metric-block';
      var valDiv = document.createElement('div');
      valDiv.className = 'metric-val';
      valDiv.style.color = color;
      valDiv.textContent = val;
      var lblDiv = document.createElement('div');
      lblDiv.className = 'metric-lbl';
      lblDiv.textContent = label;
      block.appendChild(valDiv);
      block.appendChild(lblDiv);
      return block;
    }

    frag.appendChild(makeBlock(rs.redundantPairs, '#E69F00', 'Redundant Pairs (r > 0.85)'));
    frag.appendChild(makeBlock(rs.collapsibleFeatures, '#56B4E9', 'Collapsible Features'));
    frag.appendChild(makeBlock(rs.deadFeatures, '#D55E00', 'Dead Features (zero variance)'));

    if (rs.clusters != null) {
      var note = document.createElement('div');
      note.className = 'text-muted small mt-2';
      note.textContent = rs.clusters + ' redundancy clusters found. Largest cluster: ' + rs.largestCluster + ' features.';
      frag.appendChild(note);
    }

    el.textContent = '';
    el.appendChild(frag);
  }

  // =========================================================================
  // 22. Archetype Cards (Explorer Tab)
  // =========================================================================

  function renderArchetypeCards() {
    var el = document.getElementById('archetype-cards');
    if (!el || !DATA.archetypeData) return;
    var archetypes = DATA.archetypeData;
    var colors = ['#E69F00', '#56B4E9', '#009E73', '#D55E00', '#CC79A7'];

    var frag = document.createDocumentFragment();
    archetypes.forEach(function (a, i) {
      var block = document.createElement('div');
      block.className = 'metric-block';
      block.style.borderLeft = '3px solid ' + colors[i % colors.length];

      var header = document.createElement('div');
      header.className = 'd-flex justify-content-between align-items-center mb-1';
      var nameEl = document.createElement('strong');
      nameEl.style.color = colors[i % colors.length];
      nameEl.textContent = a.label;
      var sizeEl = document.createElement('span');
      sizeEl.className = 'text-muted small';
      sizeEl.textContent = 'n=' + a.size;
      header.appendChild(nameEl);
      header.appendChild(sizeEl);
      block.appendChild(header);

      var compDiv = document.createElement('div');
      compDiv.className = 'small';
      compDiv.textContent = 'Composite: ' + a.meanComposite;
      block.appendChild(compDiv);

      if (a.tierMeans) {
        var tierDiv = document.createElement('div');
        tierDiv.className = 'text-muted small mt-1';
        var parts = [];
        Object.keys(a.tierMeans).forEach(function (k) {
          parts.push(k + '=' + a.tierMeans[k]);
        });
        tierDiv.textContent = parts.join(' ');
        block.appendChild(tierDiv);
      }

      frag.appendChild(block);
    });

    el.textContent = '';
    el.appendChild(frag);
  }

  // =========================================================================
  // 23. Gap Table (Explorer Tab)
  // =========================================================================

  function renderGapTable() {
    var tbody = document.getElementById('gap-table-body');
    if (!tbody || !DATA.gapTable) return;

    var frag = document.createDocumentFragment();
    DATA.gapTable.forEach(function (g) {
      var tr = document.createElement('tr');
      var cells = [g.rank, g.theory, g.gap, g.tiersMissing];
      cells.forEach(function (text, ci) {
        var td = document.createElement('td');
        if (ci === 1) td.className = 'text-nowrap';
        if (ci === 3) td.className = 'small';
        td.textContent = text;
        tr.appendChild(td);
      });
      if (g.priority != null) {
        var tdP = document.createElement('td');
        var bar = document.createElement('span');
        bar.className = 'priority-bar';
        bar.style.width = Math.round(g.priority / 100 * 80) + 'px';
        tdP.appendChild(bar);
        tdP.appendChild(document.createTextNode(g.priority));
        tr.appendChild(tdP);
      }
      frag.appendChild(tr);
    });

    tbody.textContent = '';
    tbody.appendChild(frag);
  }

  // =========================================================================
  // 24. Data Export
  // =========================================================================

  function downloadBlob(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function csvRow(cells) {
    return cells.map(function (c) {
      return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"';
    }).join(',');
  }

  function exportFeatureCSV() {
    if (!DATA.featureTable) return;
    var allRows = DATA.featureTable;
    var featureCols = [];
    if (allRows.length > 0) {
      var skip = { rank: 1, short_title: 1, year: 1, theories: 1, tier: 1, PD: 1, PE: 1, CI: 1, composite: 1 };
      Object.keys(allRows[0]).forEach(function (k) { if (!skip[k]) featureCols.push(k); });
      featureCols.sort();
    }
    var headers = ['#', 'Tier', 'Benchmark', 'Year', 'Theories'].concat(featureCols).concat(['PD', 'PE', 'CI', 'Composite']);
    var rows = [csvRow(headers)];
    allRows.forEach(function (r) {
      var vals = [r.rank, r.tier, r.short_title, r.year, r.theories];
      featureCols.forEach(function (f) { vals.push(r[f]); });
      vals.push(r.PD, r.PE, r.CI, r.composite);
      rows.push(csvRow(vals));
    });
    downloadBlob(rows.join('\n'), 'moral-psych-feature-matrix-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv;charset=utf-8;');
  }

  function exportTrialsCSV() {
    var cv = DATA.crossVendor;
    if (!cv || !cv.trialTable) return;
    var headers = ['Trial', 'Benchmark', 'Metric'].concat(cv.models).concat(['Category', 'Provenance']);
    var rows = [csvRow(headers)];
    cv.trialTable.forEach(function (t) {
      var vals = cv.modelKeys.map(function (mk) { return t.values ? t.values[mk] : ''; });
      rows.push(csvRow([t.id, t.benchmark, t.metric].concat(vals).concat([t.category || '', t.provenance || ''])));
    });
    downloadBlob(rows.join('\n'), 'moral-psych-trial-results-' + new Date().toISOString().slice(0, 10) + '.csv', 'text/csv;charset=utf-8;');
  }

  function exportDataJSON() {
    var json = JSON.stringify(DATA, null, 2);
    downloadBlob(json, 'moral-psych-data-' + new Date().toISOString().slice(0, 10) + '.json', 'application/json');
  }

  function setupExport() {
    var btn1 = document.getElementById('export-feature-csv');
    var btn2 = document.getElementById('export-trials-csv');
    var btn3 = document.getElementById('export-data-json');
    if (btn1) btn1.addEventListener('click', function (e) { e.preventDefault(); exportFeatureCSV(); });
    if (btn2) btn2.addEventListener('click', function (e) { e.preventDefault(); exportTrialsCSV(); });
    if (btn3) btn3.addEventListener('click', function (e) { e.preventDefault(); exportDataJSON(); });
  }

  // =========================================================================
  // 25. Print
  // =========================================================================

  function setupPrint() {
    var btnCurrent = document.getElementById('print-current');
    var btnAll = document.getElementById('print-all');

    function printCleanup() {
      document.body.removeAttribute('data-print-mode');
      var target = document.querySelector('.tab-pane.print-target');
      if (target) target.classList.remove('print-target');
    }

    if (btnCurrent) {
      btnCurrent.addEventListener('click', function (e) {
        e.preventDefault();
        var activePane = document.querySelector('.tab-pane.active');
        if (activePane) activePane.classList.add('print-target');
        document.body.dataset.printMode = 'current';
        document.body.dataset.printDate = new Date().toLocaleDateString();
        window.print();
      });
    }

    if (btnAll) {
      btnAll.addEventListener('click', function (e) {
        e.preventDefault();
        document.body.dataset.printMode = 'all';
        document.body.dataset.printDate = new Date().toLocaleDateString();
        window.print();
      });
    }

    window.addEventListener('afterprint', printCleanup);
  }

  // =========================================================================
  // 26. Tab Events
  // =========================================================================

  function setupTabs() {
    var tabEls = document.querySelectorAll('[data-bs-toggle="tab"], [data-bs-toggle="pill"]');
    tabEls.forEach(function (tabEl) {
      tabEl.addEventListener('hidden.bs.tab', function (e) {
        var oldPane = e.target.getAttribute('data-bs-target');
        if (oldPane) disposeCharts(oldPane.replace('#', ''));
      });
      tabEl.addEventListener('shown.bs.tab', function (e) {
        var newPane = e.target.getAttribute('data-bs-target');
        if (!newPane) return;
        var paneId = newPane.replace('#', '');
        initCharts(paneId);

        // Lazy-init ranking table when first shown
        if (paneId === 'pane-ranking') initPaperRanking();

        // Update URL hash
        history.replaceState(null, '', '#tab=' + paneId);
      });
    });
  }

  // =========================================================================
  // 27. Resize Handler
  // =========================================================================

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      Object.keys(activeCharts).forEach(function (paneId) {
        if (activeCharts[paneId]) {
          activeCharts[paneId].forEach(function (c) {
            if (c && !c.isDisposed()) c.resize();
          });
        }
      });
    }, 200);
  });

  // =========================================================================
  // 28. Glossary Tooltips
  // =========================================================================

  function applyGlossary() {
    if (!DATA.glossary) return;
    var blocks = document.querySelectorAll('.ann-block p, .ann-block div, .exec-summary p, .exec-summary div, .tab-pane > p, .tab-pane .mb-4 p');
    var applied = {};
    blocks.forEach(function (el) {
      Object.keys(DATA.glossary).forEach(function (term) {
        if (applied[term]) return;
        var regex = new RegExp('\\b(' + term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')\\b');
        if (regex.test(el.innerHTML) && el.innerHTML.indexOf('glossary-term') === -1) {
          el.innerHTML = el.innerHTML.replace(regex,
            '<span class="glossary-term" tabindex="0" title="' + DATA.glossary[term].replace(/"/g, '&quot;') + '">$1</span>');
          applied[term] = true;
        }
      });
    });
  }

  // =========================================================================
  // 29. Hash Routing
  // =========================================================================

  function initHashRouting() {
    var hash = location.hash.replace('#', '');
    if (!hash) return;
    var parts = hash.split('=');
    if (parts[0] === 'tab' && parts[1]) {
      var paneId = parts[1];
      var tabBtn = document.querySelector('[data-bs-target="#' + paneId + '"]');
      if (tabBtn) {
        new bootstrap.Tab(tabBtn).show();
      }
    }
  }

  // =========================================================================
  // 30. AI Disclosure
  // =========================================================================

  function renderAIDisclosure() {
    var el = document.getElementById('ai-disclosure');
    if (!el) return;
    var text = (DATA.executiveSummary && DATA.executiveSummary.aiDisclosure) ||
      'Analytical perspectives are AI-generated interpretations structured around disciplinary lenses. ' +
      'No human review panel was convened. All quantitative data and statistical analyses are computationally derived from the source benchmarks.';
    el.textContent = text;
  }

  // =========================================================================
  // 31. Initialization
  // =========================================================================

  function init() {
    try {
    ThemeManager.init();

    // Executive summary & KPI
    renderExecutiveSummary();
    renderKPICards();

    // Narrative tour
    renderNarrativeTour();

    // Claim & recommendation cards
    renderClaimCards();
    renderRecommendationCards();

    // Tier definitions
    renderTierDefinitions();

    // Methodology tab static renders
    renderScoringFormula();
    renderModelInventory();

    // Claims 4-6 static renders
    renderHiddenGems();

    // RLHF fingerprint tab
    renderRLHFSignatures();

    // Integrated analysis tab
    renderFeedbackLoop();
    renderInfrastructurePipeline();

    // Discussion tab
    renderDiscussionThemes();
    renderDiscussionRecs();

    // Feature table
    renderFeatureTable();
    setupFeatureTierFilter();

    // Cross-vendor trial table
    renderCVTrialTable();

    // Explorer tab static renders
    renderRedundancyCards();
    renderArchetypeCards();
    renderGapTable();
    renderHealthScorecard();

    // Annotations (all tabs)
    renderAllAnnotations();

    // AI disclosure in footer
    renderAIDisclosure();

    // Tab lifecycle
    setupTabs();

    // Export buttons
    setupExport();

    // Print buttons
    setupPrint();

    // Init overview charts (default active tab)
    initCharts('pane-overview');

    // Hash routing
    initHashRouting();

    // Glossary (must run after all rendering)
    applyGlossary();

    } catch (e) {
      console.error('[MPBench v4] Init error:', e);
    }
    // Hide loading splash (always, even on error)
    var splash = document.getElementById('loading-splash');
    if (splash) splash.classList.add('hidden');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
