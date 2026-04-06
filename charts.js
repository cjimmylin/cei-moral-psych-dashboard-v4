/* ============================================================
   charts.js — Moral Psychology Benchmarks v4: "The Triple Bind"
   All ECharts chart initialization functions.
   Reads from global DATA object (defined in data.js).
   ============================================================ */

/* ---------- colour constants ---------- */
var TIER_COLORS = { top: '#009E73', high: '#56B4E9', med: '#E69F00', low: '#999999' };
var BIND_COLORS = { narrow: '#D55E00', undiscrim: '#0072B2', cultural: '#CC79A7' };
var OI_PALETTE = ['#E69F00', '#56B4E9', '#009E73', '#F0E442', '#0072B2', '#D55E00', '#CC79A7', '#999999', '#332288', '#44AA99', '#882255'];
var VENDOR_COLORS = { Anthropic: '#7C3AED', Gemini: '#E69F00', OpenAI: '#56B4E9' };
var VALIDITY_GRADIENT = ['#D55E00', '#E69F00', '#F0E442', '#56B4E9', '#009E73'];
var DISC_TIER_COLORS = { zero: '#D55E00', low: '#E69F00', moderate: '#56B4E9', high: '#009E73' };
var BASELINE_COLORS = { 'Population norms': '#009E73', 'Paper-specific': '#56B4E9', 'Partial': '#E69F00', 'None': '#D55E00' };

var TEXT_COLOR   = '#e8e8e8';
var TEXT_MUTED   = '#a0a0b0';
var GRID_COLOR   = 'rgba(255,255,255,0.08)';

/* ---------- helper ---------- */
function initChart(el) {
  if (typeof el === 'string') el = document.getElementById(el);
  if (!el) return null;
  var chart = echarts.init(el);
  window.addEventListener('resize', function () { chart.resize(); });
  return chart;
}

function tierOf(score) {
  var b = (DATA.tierDistribution && DATA.tierDistribution.breaks) || [27.8, 43.05, 56.65];
  if (score >= b[2]) return 'top';
  if (score >= b[1]) return 'high';
  if (score >= b[0]) return 'med';
  return 'low';
}

function vendorOf(key) {
  if (!key) return 'Anthropic';
  if (key.indexOf('anthropic') === 0) return 'Anthropic';
  if (key.indexOf('gemini') === 0) return 'Gemini';
  if (key.indexOf('openai') === 0) return 'OpenAI';
  return 'Anthropic';
}

function fmt(v, d) { return (typeof v === 'number') ? v.toFixed(d === undefined ? 1 : d) : v; }

/* ============================================================
   TAB 1 — OVERVIEW
   ============================================================ */

/** Venn-style triple-bind diagram using ECharts graphic component */
function chartTripleBind(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var w, h;
  try { w = chart.getWidth(); h = chart.getHeight(); } catch (_) { w = 600; h = 450; }
  var cx = w / 2, cy = h / 2 - 10;
  var r = Math.min(w, h) * 0.22;
  var off = r * 0.55;

  chart.setOption({
    graphic: {
      elements: [
        { type: 'circle', shape: { cx: cx - off, cy: cy - off * 0.4, r: r },
          style: { fill: BIND_COLORS.narrow, opacity: 0.25, stroke: BIND_COLORS.narrow, lineWidth: 2 } },
        { type: 'circle', shape: { cx: cx + off, cy: cy - off * 0.4, r: r },
          style: { fill: BIND_COLORS.undiscrim, opacity: 0.25, stroke: BIND_COLORS.undiscrim, lineWidth: 2 } },
        { type: 'circle', shape: { cx: cx, cy: cy + off * 0.7, r: r },
          style: { fill: BIND_COLORS.cultural, opacity: 0.25, stroke: BIND_COLORS.cultural, lineWidth: 2 } },
        { type: 'text', style: { x: cx - off - r * 0.1, y: cy - off * 0.4 - r - 18,
          text: 'Theoretically\nNarrow', fill: BIND_COLORS.narrow, fontSize: 13, fontWeight: 'bold', textAlign: 'center' } },
        { type: 'text', style: { x: cx + off + r * 0.1, y: cy - off * 0.4 - r - 18,
          text: 'Empirically\nUndiscriminating', fill: BIND_COLORS.undiscrim, fontSize: 13, fontWeight: 'bold', textAlign: 'center' } },
        { type: 'text', style: { x: cx, y: cy + off * 0.7 + r + 14,
          text: 'Culturally\nBlind', fill: BIND_COLORS.cultural, fontSize: 13, fontWeight: 'bold', textAlign: 'center' } },
        { type: 'text', style: { x: cx, y: cy,
          text: 'The\nTriple\nBind', fill: '#ffffff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', textVerticalAlign: 'middle' } }
      ]
    }
  });
  return chart;
}

/** Donut chart of tier distribution */
function chartTierDonut(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tc = (DATA.kpi && DATA.kpi.tierCounts) || (DATA.tierDistribution && DATA.tierDistribution.tierDonut);
  if (!tc) return null;
  var total = (tc.top || 0) + (tc.high || 0) + (tc.med || 0) + (tc.low || 0);

  chart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0, textStyle: { color: TEXT_COLOR, fontSize: 12 } },
    series: [{
      type: 'pie', radius: ['42%', '72%'], center: ['50%', '45%'],
      label: { show: true, formatter: '{b}\n{c}', color: TEXT_COLOR, fontSize: 12 },
      data: [
        { value: tc.top,  name: 'Top',  itemStyle: { color: TIER_COLORS.top  } },
        { value: tc.high, name: 'High', itemStyle: { color: TIER_COLORS.high } },
        { value: tc.med,  name: 'Med',  itemStyle: { color: TIER_COLORS.med  } },
        { value: tc.low,  name: 'Low',  itemStyle: { color: TIER_COLORS.low  } }
      ],
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' } }
    }, {
      type: 'pie', radius: [0, 0], center: ['50%', '45%'], silent: true,
      label: { position: 'center', formatter: total.toString(), fontSize: 28, fontWeight: 'bold', color: TEXT_COLOR },
      data: [{ value: 1, itemStyle: { color: 'transparent' } }]
    }]
  });
  return chart;
}

/** Horizontal bar chart — 7 claims with primary statistics */
function chartClaimSparks(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var claims = [
    { label: 'C1: Quality rate',       value: 73,  bind: 'narrow'   },
    { label: 'C2: Low validity',        value: 58,  bind: 'narrow'   },
    { label: 'C3: Process gap',         value: 0,   bind: 'narrow'   },
    { label: 'C4: Non-Western quality', value: 0,   bind: 'cultural' },
    { label: 'C5: No baselines',        value: 34,  bind: 'undiscrim'},
    { label: 'C6: Quality 2023-26',     value: 46,  bind: 'narrow'   },
    { label: 'C7: Zero variation',      value: 43,  bind: 'undiscrim'}
  ];
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 160, right: 50, top: 10, bottom: 30 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED, formatter: '{value}%' },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: claims.map(function (c) { return c.label; }).reverse(),
             axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    series: [{
      type: 'bar', barWidth: 16,
      data: claims.map(function (c) {
        return { value: c.value, itemStyle: { color: BIND_COLORS[c.bind] } };
      }).reverse(),
      label: { show: true, position: 'right', formatter: '{c}%', color: TEXT_COLOR, fontSize: 11 }
    }]
  });
  return chart;
}

/* ============================================================
   TAB 2 — METHODOLOGY
   ============================================================ */

/** Histogram of 292 composite scores with Jenks break lines */
function chartTierHistogram(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var td = DATA.tierDistribution;
  if (!td || !td.histogram) return null;
  var breaks = td.breaks || [27.8, 43.05, 56.65];
  var stats  = td.stats  || {};

  var xData = [], yData = [], colors = [];
  td.histogram.forEach(function (bin) {
    var mid = (bin.start + bin.end) / 2;
    var label = bin.start + '-' + bin.end;
    xData.push(label);
    yData.push(bin.count);
    colors.push(TIER_COLORS[tierOf(mid)]);
  });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        if (!p[0]) return '';
        return p[0].name + '<br/>Count: ' + p[0].value;
      }
    },
    grid: { left: 55, right: 30, top: 30, bottom: 80 },
    xAxis: { type: 'category', data: xData, axisLabel: { color: TEXT_MUTED, rotate: 45, fontSize: 10 },
             name: 'Composite Score', nameLocation: 'middle', nameGap: 60, nameTextStyle: { color: TEXT_MUTED } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } },
             name: 'Count', nameTextStyle: { color: TEXT_MUTED } },
    series: [{
      type: 'bar',
      data: yData.map(function (v, i) { return { value: v, itemStyle: { color: colors[i] } }; }),
      markLine: {
        silent: true,
        lineStyle: { type: 'dashed', color: '#D55E00', width: 2 },
        symbol: 'none',
        data: [
          { xAxis: breaks[0].toString(), label: { formatter: 'Low|Med', color: TEXT_COLOR, fontSize: 10 } },
          { xAxis: breaks[1].toString(), label: { formatter: 'Med|High', color: TEXT_COLOR, fontSize: 10 } },
          { xAxis: breaks[2].toString(), label: { formatter: 'High|Top', color: TEXT_COLOR, fontSize: 10 } }
        ].map(function (ml) {
          // find the closest category index
          var idx = 0;
          var target = parseFloat(ml.xAxis);
          for (var i = 0; i < xData.length; i++) {
            var parts = xData[i].split('-');
            if (parseFloat(parts[0]) <= target && parseFloat(parts[1]) >= target) { idx = i; break; }
          }
          ml.xAxis = idx;
          return ml;
        })
      },
      markArea: {
        silent: true,
        itemStyle: { color: 'rgba(255,255,255,0.03)' },
        data: []
      }
    }],
    graphic: [{
      type: 'text', right: 16, top: 10,
      style: {
        text: 'Mean: ' + fmt(stats.mean) + '  Median: ' + fmt(stats.median) +
              '\nMin: ' + fmt(stats.min) + '  Max: ' + fmt(stats.max),
        fill: TEXT_MUTED, fontSize: 11, textAlign: 'right'
      }
    }]
  });
  return chart;
}

/** Stacked horizontal bar showing PD/PE/CI weights */
function chartScoringFormula(el) {
  var chart = initChart(el);
  if (!chart) return null;

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 10, right: 30, top: 30, bottom: 30 },
    xAxis: { type: 'value', max: 100, show: false },
    yAxis: { type: 'category', data: ['Composite'], show: false },
    series: [
      { name: 'PD (50%)', type: 'bar', stack: 'w', barWidth: 50,
        data: [50], itemStyle: { color: TIER_COLORS.top },
        label: { show: true, position: 'inside', formatter: 'PD\n50%', fontSize: 14, fontWeight: 'bold', color: '#fff' } },
      { name: 'PE (30%)', type: 'bar', stack: 'w',
        data: [30], itemStyle: { color: TIER_COLORS.high },
        label: { show: true, position: 'inside', formatter: 'PE\n30%', fontSize: 14, fontWeight: 'bold', color: '#fff' } },
      { name: 'CI (20%)', type: 'bar', stack: 'w',
        data: [20], itemStyle: { color: TIER_COLORS.med },
        label: { show: true, position: 'inside', formatter: 'CI\n20%', fontSize: 14, fontWeight: 'bold', color: '#fff' } }
    ]
  });
  return chart;
}

/** Model inventory scatter grid */
function chartModelInventory(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var inv = DATA.modelInventory;
  if (!inv || !inv.length) return null;

  var vendors = [];
  inv.forEach(function (m) { if (vendors.indexOf(m.vendor) === -1) vendors.push(m.vendor); });
  var names = inv.map(function (m) { return m.display; });

  chart.setOption({
    tooltip: { trigger: 'item', formatter: function (p) {
      var m = inv[p.dataIndex];
      return m.display + '<br/>Vendor: ' + m.vendor + '<br/>Trials: ' + m.fileCount;
    }},
    grid: { left: 140, right: 40, top: 20, bottom: 30 },
    xAxis: { type: 'value', name: 'Trial files', nameTextStyle: { color: TEXT_MUTED },
             axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: names.reverse(), axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    series: [{
      type: 'bar', barWidth: 18,
      data: inv.map(function (m) {
        return { value: m.fileCount, itemStyle: { color: VENDOR_COLORS[m.vendor] || OI_PALETTE[0] } };
      }).reverse(),
      label: { show: true, position: 'right', formatter: '{c}', color: TEXT_COLOR, fontSize: 11 }
    }]
  });
  return chart;
}

/* ============================================================
   TAB 3 — CLAIMS 1-3
   ============================================================ */

/** Heatmap: 13 theories x 4 tiers */
function chartTheoryTierHeatmap(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var th = DATA.theoryHeatmap;
  if (!th || !th.data) return null;

  var maxVal = th.maxVal || 31;

  chart.setOption({
    tooltip: { formatter: function (p) {
      return th.theories[p.value[1]] + ' / ' + th.tiers[p.value[0]] + ': ' + p.value[2];
    }},
    grid: { left: 185, right: 60, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: th.tiers, position: 'bottom',
             axisLabel: { color: TEXT_COLOR, fontSize: 12 }, axisTick: { show: false } },
    yAxis: { type: 'category', data: th.theories,
             axisLabel: { color: TEXT_COLOR, fontSize: 11, width: 170, overflow: 'truncate' } },
    visualMap: { min: 0, max: maxVal, calculable: false, orient: 'horizontal', right: 0, bottom: 0,
                 inRange: { color: ['#1c2128', '#0d3b66', '#0072B2', '#56B4E9'] },
                 textStyle: { color: TEXT_MUTED }, show: true, itemWidth: 12, itemHeight: 80 },
    series: [{
      type: 'heatmap', data: th.data,
      label: { show: true, formatter: function (p) { return p.value[2] > 0 ? p.value[2] : ''; },
               color: TEXT_COLOR, fontSize: 11 },
      emphasis: { itemStyle: { shadowBlur: 6, shadowColor: 'rgba(0,0,0,0.4)' } }
    }]
  });
  return chart;
}

/** Horizontal bar chart of quality rates by theory */
function chartTheoryQualityRate(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tqr = DATA.theoryQualityRate;
  if (!tqr || !tqr.rates) return null;

  var sorted = tqr.rates.slice().sort(function (a, b) { return a.rate - b.rate; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = sorted[p[0].dataIndex];
        return d.theory + '<br/>Quality rate: ' + fmt(d.rate) + '%<br/>Top+High: ' + (d.top + d.high) + '/' + d.total;
      }},
    grid: { left: 185, right: 60, top: 10, bottom: 30 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED, formatter: '{value}%' },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: sorted.map(function (d) { return d.theory; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 11, width: 170, overflow: 'truncate' } },
    series: [{
      type: 'bar', barWidth: 16,
      data: sorted.map(function (d) {
        var c = d.rate >= 50 ? TIER_COLORS.top : d.rate >= 25 ? TIER_COLORS.high : d.rate > 0 ? TIER_COLORS.med : '#D55E00';
        return { value: d.rate, itemStyle: { color: c } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value) + '%'; },
               color: TEXT_COLOR, fontSize: 11 }
    }]
  });
  return chart;
}

/** Bar chart of 5 validity levels */
function chartValidityDist(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var vd = DATA.validityDistribution;
  if (!vd || !vd.levels) return null;

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 20, right: 20, top: 30, bottom: 80 },
    xAxis: { type: 'category', data: vd.levels.map(function (l) { return l.level; }),
             axisLabel: { color: TEXT_MUTED, fontSize: 10, rotate: 25, width: 140, overflow: 'break' } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'Count', nameTextStyle: { color: TEXT_MUTED } },
    series: [{
      type: 'bar', barWidth: 40,
      data: vd.levels.map(function (l, i) {
        return { value: l.count, itemStyle: { color: VALIDITY_GRADIENT[i] } };
      }),
      label: { show: true, position: 'top', formatter: function (p) {
        return vd.levels[p.dataIndex].pct + '%';
      }, color: TEXT_COLOR, fontSize: 11 },
      markLine: {
        silent: true, symbol: 'none',
        lineStyle: { type: 'dashed', color: '#E69F00' },
        data: [{ yAxis: vd.levels[1].count,
                 label: { formatter: 'Median: ' + vd.medianLevel, color: TEXT_COLOR, fontSize: 10 } }]
      }
    }]
  });
  return chart;
}

/** Theoretical absence grouped bar */
function chartTheoryAbsence(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var ta = DATA.theoreticalAbsence;
  if (!ta || !ta.theories) return null;

  var cats = ta.theories.map(function (t) { return t.theory; });
  var vals = ta.theories.map(function (t) { return t.qualityRate; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = ta.theories[p[0].dataIndex];
        return d.theory + '<br/>Quality rate: ' + fmt(d.qualityRate) + '%<br/>' + d.insight;
      }},
    grid: { left: 140, right: 30, top: 10, bottom: 30 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED, formatter: '{value}%' },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: cats, axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    series: [{
      type: 'bar', barWidth: 24,
      data: vals.map(function (v, i) {
        var t = ta.theories[i];
        var c = t.reversal ? '#009E73' : (v > 0 ? '#E69F00' : '#D55E00');
        return { value: v, itemStyle: { color: c,
          borderColor: t.reversal ? '#ffffff' : 'transparent', borderWidth: t.reversal ? 2 : 0 } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value) + '%'; },
               color: TEXT_COLOR, fontSize: 12 },
      markPoint: {
        data: ta.theories.filter(function (t) { return t.reversal; }).map(function (t, i) {
          var idx = cats.indexOf(t.theory);
          return { coord: [t.qualityRate, idx], symbol: 'pin', symbolSize: 30,
                   itemStyle: { color: '#009E73' }, label: { formatter: 'Reversal!', color: '#fff', fontSize: 9 } };
        })
      }
    }]
  });
  return chart;
}

/* ============================================================
   TAB 4 — CLAIMS 4-6
   ============================================================ */

/** Cultural cliff grouped bar chart */
function chartCulturalCliff(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var cc = DATA.culturalCliff;
  if (!cc || !cc.groups) return null;

  var sorted = cc.groups.slice().sort(function (a, b) { return b.rate - a.rate; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = sorted[p[0].dataIndex];
        return d.theory + ' (' + d.group + ')<br/>Quality rate: ' + fmt(d.rate) + '%<br/>Top+High: ' + d.topHigh + '/' + d.total;
      }},
    grid: { left: 160, right: 60, top: 10, bottom: 30 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED, formatter: '{value}%' },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: sorted.map(function (d) { return d.theory; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 18,
      data: sorted.map(function (d) {
        var c;
        if (d.isZero) c = '#D55E00';
        else if (d.group === 'Western') c = TIER_COLORS.top;
        else c = '#E69F00';
        return { value: d.rate, itemStyle: { color: c } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value) + '%'; },
               color: TEXT_COLOR, fontSize: 11 },
      markLine: { silent: true, symbol: 'none',
        lineStyle: { type: 'dashed', color: TEXT_MUTED },
        data: [{ xAxis: 0, label: { formatter: '0% quality cliff', color: '#D55E00', fontSize: 10 } }] }
    }]
  });
  return chart;
}

/** Stacked bar: baseline availability by tier */
function chartBaselineByTier(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var bd = DATA.baselineDeficit;
  if (!bd || !bd.byTier) return null;

  var tiers = ['top', 'high', 'med', 'low'];
  var tierLabels = ['Top', 'High', 'Med', 'Low'];
  var categories = ['Population norms', 'Paper-specific', 'Partial', 'None'];

  var seriesData = categories.map(function (cat) {
    return {
      name: cat, type: 'bar', stack: 'baseline', barWidth: 36,
      itemStyle: { color: BASELINE_COLORS[cat] },
      data: tiers.map(function (t) { return bd.byTier[t][cat] || 0; }),
      label: { show: false }
    };
  });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: categories, bottom: 0, textStyle: { color: TEXT_COLOR, fontSize: 11 } },
    grid: { left: 50, right: 20, top: 10, bottom: 50 },
    xAxis: { type: 'category', data: tierLabels, axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'Count', nameTextStyle: { color: TEXT_MUTED } },
    series: seriesData
  });
  return chart;
}

/** Dual-axis chart: quality rate line + volume bars */
function chartTemporalQuality(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tq = DATA.temporalQuality;
  if (!tq || !tq.periods) return null;

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Volume', 'Quality Rate'], top: 0, textStyle: { color: TEXT_COLOR } },
    grid: { left: 55, right: 55, top: 40, bottom: 30 },
    xAxis: { type: 'category', data: tq.periods.map(function (p) { return p.period; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    yAxis: [
      { type: 'value', name: 'Quality %', nameTextStyle: { color: TEXT_MUTED }, position: 'left',
        axisLabel: { color: TEXT_MUTED, formatter: '{value}%' }, splitLine: { lineStyle: { color: GRID_COLOR } },
        max: 100 },
      { type: 'value', name: 'Volume', nameTextStyle: { color: TEXT_MUTED }, position: 'right',
        axisLabel: { color: TEXT_MUTED }, splitLine: { show: false } }
    ],
    series: [
      { name: 'Volume', type: 'bar', yAxisIndex: 1, barWidth: 40,
        itemStyle: { color: 'rgba(86,180,233,0.35)' },
        data: tq.periods.map(function (p) { return p.total; }) },
      { name: 'Quality Rate', type: 'line', yAxisIndex: 0,
        lineStyle: { color: TIER_COLORS.top, width: 3 },
        itemStyle: { color: TIER_COLORS.top }, symbol: 'circle', symbolSize: 10,
        data: tq.periods.map(function (p) { return p.rate; }),
        label: { show: true, formatter: function (p) { return fmt(p.value) + '%'; },
                 color: TEXT_COLOR, fontSize: 11 } }
    ]
  });
  return chart;
}

/* ============================================================
   TAB 5 — RLHF FINGERPRINT
   ============================================================ */

/** Horizontal bar chart of CV by benchmark */
function chartConvergenceCV(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var cv = DATA.convergenceCV;
  if (!cv || !cv.sortedBenchmarks) return null;

  // Sort by CV descending so highest is at top
  var sorted = cv.sortedBenchmarks.slice().sort(function (a, b) { return a.cv - b.cv; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = sorted[p[0].dataIndex];
        return d.short + ' (' + d.category + ')<br/>CV: ' + fmt(d.cv, 4) +
               '<br/>Mean: ' + fmt(d.mean, 3) + '<br/>n: ' + d.n;
      }},
    grid: { left: 130, right: 60, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'CV', nameTextStyle: { color: TEXT_MUTED } },
    yAxis: { type: 'category', data: sorted.map(function (d) { return d.short; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 14,
      data: sorted.map(function (d) {
        var tier = 'low';
        if (d.cv === 0) tier = 'zero';
        else if (d.cv < 0.05) tier = 'low';
        else if (d.cv < 0.10) tier = 'moderate';
        else tier = 'high';
        return { value: d.cv, itemStyle: { color: DISC_TIER_COLORS[tier] } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value, 3); },
               color: TEXT_COLOR, fontSize: 10 },
      markLine: { silent: true, symbol: 'none',
        lineStyle: { type: 'dashed', color: '#D55E00', width: 1.5 },
        data: [{ xAxis: 0, label: { formatter: 'Zero variation', color: '#D55E00', fontSize: 10 } }] }
    }]
  });
  return chart;
}

/** Radar chart with 6 RLHF signatures across 3 vendors */
function chartRLHFRadar(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tp = DATA.theoryProfiles;
  if (!tp || !tp.radarDimensions || !tp.radarData) return null;

  var dims = tp.radarDimensions;
  var indicators = dims.map(function (d) { return { name: d, max: 100 }; });
  var vendorKeys = {
    Anthropic: ['anthropic_opus', 'anthropic_sonnet', 'anthropic_haiku'],
    Gemini: ['gemini_2_5_flash', 'gemini_2_5_pro', 'gemini_3_1_pro'],
    OpenAI: ['openai_gpt_codex', 'openai_gpt_mini']
  };

  // Average per vendor
  var seriesData = [];
  ['Anthropic', 'Gemini', 'OpenAI'].forEach(function (vendor) {
    var keys = vendorKeys[vendor];
    var avg = dims.map(function (_, di) {
      var sum = 0, n = 0;
      keys.forEach(function (k) {
        if (tp.radarData[k]) { sum += tp.radarData[k][di]; n++; }
      });
      return n > 0 ? sum / n : 0;
    });
    seriesData.push({
      name: vendor, value: avg, symbol: 'circle', symbolSize: 4,
      lineStyle: { width: 2 },
      areaStyle: { opacity: 0.15 }
    });
  });

  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { data: ['Anthropic', 'Gemini', 'OpenAI'], bottom: 0,
              textStyle: { color: TEXT_COLOR } },
    color: [VENDOR_COLORS.Anthropic, VENDOR_COLORS.Gemini, VENDOR_COLORS.OpenAI],
    radar: { indicator: indicators, radius: '65%',
             name: { textStyle: { color: TEXT_COLOR, fontSize: 11 } },
             splitArea: { areaStyle: { color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)'] } },
             splitLine: { lineStyle: { color: GRID_COLOR } },
             axisLine: { lineStyle: { color: GRID_COLOR } } },
    series: [{ type: 'radar', data: seriesData }]
  });
  return chart;
}

/** Grouped bar: DIT P-scores across models */
function chartDITPScore(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var se = DATA.scaleEffects;
  if (!se || !se.ditScores) return null;

  var models = Object.keys(se.ditScores);
  var scores = models.map(function (m) { return se.ditScores[m]; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 30, bottom: 60 },
    xAxis: { type: 'category', data: models, axisLabel: { color: TEXT_COLOR, fontSize: 10, rotate: 30 } },
    yAxis: { type: 'value', min: 0, max: 100, axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'P-score', nameTextStyle: { color: TEXT_MUTED } },
    series: [{
      type: 'bar', barWidth: 28,
      data: scores.map(function (s, i) {
        var m = models[i];
        var c = TEXT_MUTED;
        if (m === 'Haiku') c = '#059669';
        else if (m === 'Sonnet') c = '#2563EB';
        else if (m === 'Opus') c = '#7C3AED';
        else if (m.indexOf('Gem') === 0) c = VENDOR_COLORS.Gemini;
        else c = VENDOR_COLORS.OpenAI;
        return { value: s, itemStyle: { color: c } };
      }),
      label: { show: true, position: 'top', formatter: '{c}', color: TEXT_COLOR, fontSize: 11 },
      markLine: { silent: true, symbol: 'none',
        lineStyle: { type: 'dashed', color: TEXT_MUTED },
        data: [
          { yAxis: 40, label: { formatter: 'Human mean ~40', color: TEXT_MUTED, fontSize: 10 } },
          { yAxis: 65, label: { formatter: 'PhDs ~65', color: TEXT_MUTED, fontSize: 10 } }
        ] }
    }]
  });
  return chart;
}

/** Bar chart of CoT effect by model */
function chartCoTEffect(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var se = DATA.scaleEffects;
  if (!se || !se.cotEffects) return null;

  var models = Object.keys(se.cotEffects);
  var effects = models.map(function (m) { return se.cotEffects[m]; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 20, bottom: 60 },
    xAxis: { type: 'category', data: models, axisLabel: { color: TEXT_COLOR, fontSize: 10, rotate: 30 } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'CoT Effect', nameTextStyle: { color: TEXT_MUTED } },
    series: [{
      type: 'bar', barWidth: 28,
      data: effects.map(function (e, i) {
        var isHaiku = models[i] === 'Haiku';
        return { value: e, itemStyle: { color: isHaiku ? '#D55E00' : 'rgba(153,153,153,0.5)' },
                 emphasis: { itemStyle: { color: isHaiku ? '#D55E00' : '#999' } } };
      }),
      label: { show: true, position: 'top', formatter: function (p) { return fmt(p.value, 3); },
               color: TEXT_COLOR, fontSize: 11 }
    }],
    graphic: effects.some(function (e) { return e > 0; }) ? [{
      type: 'text', right: 10, top: 10,
      style: { text: 'Haiku: +25pp on\ndual-process dilemmas', fill: '#D55E00', fontSize: 11, textAlign: 'right' }
    }] : []
  });
  return chart;
}

/** MFT foundation profiles: grouped bar across 9 models */
function chartMFTProfiles(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tp = DATA.theoryProfiles;
  if (!tp || !tp.mftRadar) return null;

  var foundations = tp.mftRadar.foundations;
  var modelKeys = tp.modelKeys || Object.keys(tp.mftRadar.data);
  var modelLabels = tp.models || modelKeys;

  var series = modelKeys.map(function (k, mi) {
    return {
      name: modelLabels[mi], type: 'bar', barGap: '5%',
      itemStyle: { color: (tp.modelColors && tp.modelColors[mi]) || OI_PALETTE[mi % OI_PALETTE.length] },
      data: tp.mftRadar.data[k] || []
    };
  });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: modelLabels, bottom: 0, textStyle: { color: TEXT_COLOR, fontSize: 10 },
              type: 'scroll', pageTextStyle: { color: TEXT_COLOR } },
    grid: { left: 55, right: 20, top: 10, bottom: 60 },
    xAxis: { type: 'category', data: foundations, axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'Score', nameTextStyle: { color: TEXT_MUTED } },
    series: series
  });
  return chart;
}

/** Cultural persona shift: Ind/Bind under persona conditions */
function chartCulturalPersona(el) {
  var chart = initChart(el);
  if (!chart) return null;
  // Use the annotation data to build a simplified chart
  // DATA does not have a dedicated culturalPersona array, so use theoryProfiles
  var tp = DATA.theoryProfiles;
  if (!tp) return null;

  // Synthesize from known data: default vs persona conditions
  var conditions = ['Default', 'East Asian\nPersona', 'Liberal\nPersona'];
  var ratios = [2.53, 0.74, 5.96]; // approximate midpoints from annotation data

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 30, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: conditions, axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } },
             name: 'Ind/Bind Ratio', nameTextStyle: { color: TEXT_MUTED } },
    series: [{
      type: 'bar', barWidth: 50,
      data: [
        { value: ratios[0], itemStyle: { color: TIER_COLORS.high } },
        { value: ratios[1], itemStyle: { color: BIND_COLORS.cultural } },
        { value: ratios[2], itemStyle: { color: BIND_COLORS.narrow } }
      ],
      label: { show: true, position: 'top', formatter: function (p) { return fmt(p.value, 2); },
               color: TEXT_COLOR, fontSize: 13, fontWeight: 'bold' },
      markLine: { silent: true, symbol: 'none',
        lineStyle: { type: 'dashed', color: TEXT_MUTED },
        data: [{ yAxis: 1.83, label: { formatter: 'US liberals ~1.83', color: TEXT_MUTED, fontSize: 10 } }] }
    }]
  });
  return chart;
}

/** Ceiling instruments: benchmarks with zero discrimination */
function chartCeilingInstruments(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var cv = DATA.convergenceCV;
  if (!cv || !cv.categories || !cv.categories.zero) return null;

  var items = cv.categories.zero;

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = items[p[0].dataIndex];
        return d.short + ' (' + d.category + ')<br/>CV: ' + d.cv + '<br/>Mean: ' + fmt(d.mean, 2);
      }},
    grid: { left: 120, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'value', max: function (v) { return Math.max(v.max * 1.2, 1); },
             axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } },
             name: 'Mean Score', nameTextStyle: { color: TEXT_MUTED } },
    yAxis: { type: 'category', data: items.map(function (d) { return d.short; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 16,
      data: items.map(function (d) {
        return { value: d.mean, itemStyle: { color: '#D55E00' } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value, 1); },
               color: TEXT_COLOR, fontSize: 10 }
    }]
  });
  return chart;
}

/** Discriminating instruments: benchmarks with high CV */
function chartDiscriminatingInstruments(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var cv = DATA.convergenceCV;
  if (!cv || !cv.categories) return null;

  var items = (cv.categories.high || []).concat(cv.categories.moderate || []);
  items.sort(function (a, b) { return a.cv - b.cv; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = items[p[0].dataIndex];
        return d.short + ' (' + d.category + ')<br/>CV: ' + fmt(d.cv, 4) + '<br/>Mean: ' + fmt(d.mean, 3);
      }},
    grid: { left: 140, right: 50, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } }, name: 'CV', nameTextStyle: { color: TEXT_MUTED } },
    yAxis: { type: 'category', data: items.map(function (d) { return d.short; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 18,
      data: items.map(function (d) {
        var c = d.discriminationTier === 'high' ? '#009E73' : '#56B4E9';
        return { value: d.cv, itemStyle: { color: c } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value, 3); },
               color: TEXT_COLOR, fontSize: 11 }
    }]
  });
  return chart;
}

/* ============================================================
   TAB 6 — INTEGRATED FINDINGS
   ============================================================ */

/** THE KEY CHART: scatter of composite vs CV with regression */
function chartTierDiscrimination(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var td = DATA.tierDiscrimination;
  if (!td || !td.scatter) return null;

  var points = td.scatter.filter(function (p) { return p.composite !== null && p.cv !== null; });
  var rVal = td.rValue || -0.18;

  chart.setOption({
    tooltip: { trigger: 'item',
      formatter: function (p) {
        var d = points[p.dataIndex];
        return d.short + '<br/>Composite: ' + fmt(d.composite) + '<br/>CV: ' + fmt(d.cv, 4) +
               '<br/>Tier: ' + (d.tier || 'N/A');
      }},
    grid: { left: 60, right: 30, top: 40, bottom: 50 },
    xAxis: { type: 'value', name: 'Composite Score', nameLocation: 'middle', nameGap: 35,
             nameTextStyle: { color: TEXT_MUTED }, axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'value', name: 'CV (Discrimination)', nameTextStyle: { color: TEXT_MUTED },
             axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } } },
    series: [{
      type: 'scatter', symbolSize: 14,
      data: points.map(function (p) {
        var tierColor = p.tier ? TIER_COLORS[p.tier] : TEXT_MUTED;
        return { value: [p.composite, p.cv], itemStyle: { color: tierColor } };
      }),
      label: { show: true, position: 'top', formatter: function (p) {
        var d = points[p.dataIndex];
        return d.short;
      }, color: TEXT_MUTED, fontSize: 9 }
    }],
    graphic: [{
      type: 'text', left: 'center', top: 8,
      style: {
        text: 'r = ' + fmt(rVal, 2) + ': Higher quality \u2192 Less variation',
        fill: '#D55E00', fontSize: 14, fontWeight: 'bold', textAlign: 'center'
      }
    }]
  });
  return chart;
}

/** Pipeline diagram: Theory Infrastructure -> Quality -> Discrimination */
function chartPipelineDiagram(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var w, h;
  try { w = chart.getWidth(); h = chart.getHeight(); } catch (_) { w = 700; h = 350; }

  var boxW = w * 0.22, boxH = 70;
  var y1 = h * 0.2, y2 = h * 0.55;
  var x1 = w * 0.1, x2 = w * 0.4, x3 = w * 0.7;

  chart.setOption({
    graphic: {
      elements: [
        // Three boxes
        { type: 'rect', shape: { x: x1, y: y1, width: boxW, height: boxH, r: 8 },
          style: { fill: 'rgba(214,94,0,0.2)', stroke: BIND_COLORS.narrow, lineWidth: 2 } },
        { type: 'text', style: { x: x1 + boxW / 2, y: y1 + boxH / 2,
          text: 'Theory\nInfrastructure', fill: BIND_COLORS.narrow, fontSize: 13, fontWeight: 'bold',
          textAlign: 'center', textVerticalAlign: 'middle' } },

        { type: 'rect', shape: { x: x2, y: y1, width: boxW, height: boxH, r: 8 },
          style: { fill: 'rgba(0,114,178,0.2)', stroke: BIND_COLORS.undiscrim, lineWidth: 2 } },
        { type: 'text', style: { x: x2 + boxW / 2, y: y1 + boxH / 2,
          text: 'Benchmark\nQuality', fill: BIND_COLORS.undiscrim, fontSize: 13, fontWeight: 'bold',
          textAlign: 'center', textVerticalAlign: 'middle' } },

        { type: 'rect', shape: { x: x3, y: y1, width: boxW, height: boxH, r: 8 },
          style: { fill: 'rgba(204,121,167,0.2)', stroke: BIND_COLORS.cultural, lineWidth: 2 } },
        { type: 'text', style: { x: x3 + boxW / 2, y: y1 + boxH / 2,
          text: 'Discrimination\nPower', fill: BIND_COLORS.cultural, fontSize: 13, fontWeight: 'bold',
          textAlign: 'center', textVerticalAlign: 'middle' } },

        // Arrows between boxes
        { type: 'line', shape: { x1: x1 + boxW, y1: y1 + boxH / 2, x2: x2, y2: y1 + boxH / 2 },
          style: { stroke: TEXT_MUTED, lineWidth: 2 } },
        { type: 'polygon', shape: { points: [[x2 - 2, y1 + boxH / 2 - 6], [x2 - 2, y1 + boxH / 2 + 6], [x2 + 6, y1 + boxH / 2]] },
          style: { fill: TEXT_MUTED } },

        { type: 'line', shape: { x1: x2 + boxW, y1: y1 + boxH / 2, x2: x3, y2: y1 + boxH / 2 },
          style: { stroke: TEXT_MUTED, lineWidth: 2 } },
        { type: 'polygon', shape: { points: [[x3 - 2, y1 + boxH / 2 - 6], [x3 - 2, y1 + boxH / 2 + 6], [x3 + 6, y1 + boxH / 2]] },
          style: { fill: TEXT_MUTED } },

        // Example rows below
        { type: 'text', style: { x: x1 + boxW / 2, y: y2,
          text: 'MFT: MFQ-30 + MFTC', fill: TIER_COLORS.top, fontSize: 11, textAlign: 'center' } },
        { type: 'text', style: { x: x2 + boxW / 2, y: y2,
          text: '73% top+high', fill: TIER_COLORS.top, fontSize: 11, textAlign: 'center' } },
        { type: 'text', style: { x: x3 + boxW / 2, y: y2,
          text: 'Low CV (convergence)', fill: TIER_COLORS.top, fontSize: 11, textAlign: 'center' } },

        { type: 'text', style: { x: x1 + boxW / 2, y: y2 + 25,
          text: 'Ubuntu: No instrument', fill: '#D55E00', fontSize: 11, textAlign: 'center' } },
        { type: 'text', style: { x: x2 + boxW / 2, y: y2 + 25,
          text: '0% top+high', fill: '#D55E00', fontSize: 11, textAlign: 'center' } },
        { type: 'text', style: { x: x3 + boxW / 2, y: y2 + 25,
          text: 'Unknown (not testable)', fill: '#D55E00', fontSize: 11, textAlign: 'center' } }
      ]
    }
  });
  return chart;
}

/** Infrastructure bar: validated instrument + corpus + quality rate */
function chartInfrastructureBar(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var ip = DATA.infrastructurePipeline;
  if (!ip || !ip.theories) return null;

  var sorted = ip.theories.slice().sort(function (a, b) { return b.qualityRate - a.qualityRate; });
  var names = sorted.map(function (t) { return t.theory; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = sorted[p[0].dataIndex];
        return d.theory + '<br/>Instrument: ' + (d.hasValidatedInstrument ? 'Yes' : 'No') +
               '<br/>Corpus: ' + (d.hasAnnotatedCorpus ? 'Yes' : 'No') +
               '<br/>Quality: ' + fmt(d.qualityRate) + '%<br/>N: ' + d.total;
      }},
    legend: { data: ['Has Instrument', 'Has Corpus', 'Quality Rate %'], bottom: 0,
              textStyle: { color: TEXT_COLOR, fontSize: 11 } },
    grid: { left: 155, right: 50, top: 10, bottom: 50 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: names.reverse(),
             axisLabel: { color: TEXT_COLOR, fontSize: 11, width: 140, overflow: 'truncate' } },
    series: [
      { name: 'Quality Rate %', type: 'bar', barWidth: 12,
        data: sorted.map(function (t) {
          return { value: t.qualityRate, itemStyle: { color: t.isWestern ? TIER_COLORS.top : BIND_COLORS.cultural } };
        }).reverse(),
        label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value) + '%'; },
                 color: TEXT_COLOR, fontSize: 10 } },
      { name: 'Has Instrument', type: 'bar', barWidth: 8,
        data: sorted.map(function (t) {
          return { value: t.hasValidatedInstrument ? 20 : 0,
                   itemStyle: { color: t.hasValidatedInstrument ? '#009E73' : 'transparent' } };
        }).reverse() },
      { name: 'Has Corpus', type: 'bar', barWidth: 8,
        data: sorted.map(function (t) {
          return { value: t.hasAnnotatedCorpus ? 20 : 0,
                   itemStyle: { color: t.hasAnnotatedCorpus ? '#56B4E9' : 'transparent' } };
        }).reverse() }
    ]
  });
  return chart;
}

/** Feedback loop: circular diagram with 4 causal pathways */
function chartFeedbackLoop(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var fl = DATA.feedbackLoop;
  if (!fl || !fl.length) return null;

  var w, h;
  try { w = chart.getWidth(); h = chart.getHeight(); } catch (_) { w = 600; h = 450; }
  var cx = w / 2, cy = h / 2;
  var rx = w * 0.3, ry = h * 0.28;

  // Three bind nodes at triangle positions
  var nodes = [
    { label: 'Narrow\n(Theory)', x: cx, y: cy - ry, color: BIND_COLORS.narrow },
    { label: 'Undiscriminating\n(Empirical)', x: cx + rx, y: cy + ry * 0.5, color: BIND_COLORS.undiscrim },
    { label: 'Cultural\nBlindness', x: cx - rx, y: cy + ry * 0.5, color: BIND_COLORS.cultural }
  ];

  var elements = [];
  nodes.forEach(function (n) {
    elements.push({ type: 'circle', shape: { cx: n.x, cy: n.y, r: 40 },
                     style: { fill: n.color, opacity: 0.3, stroke: n.color, lineWidth: 2 } });
    elements.push({ type: 'text', style: { x: n.x, y: n.y, text: n.label,
                     fill: '#fff', fontSize: 11, fontWeight: 'bold', textAlign: 'center', textVerticalAlign: 'middle' } });
  });

  // Arrows between nodes (simplified as lines)
  var arrows = [
    { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 0 }, { from: 1, to: 0 }
  ];
  arrows.forEach(function (a, i) {
    var f = nodes[a.from], t = nodes[a.to];
    var mx = (f.x + t.x) / 2, my = (f.y + t.y) / 2;
    // offset arrows slightly to avoid overlap
    var dx = (t.y - f.y) * 0.08, dy = -(t.x - f.x) * 0.08;
    elements.push({ type: 'line',
      shape: { x1: f.x + (t.x - f.x) * 0.25, y1: f.y + (t.y - f.y) * 0.25,
               x2: t.x - (t.x - f.x) * 0.25, y2: t.y - (t.y - f.y) * 0.25 },
      style: { stroke: TEXT_MUTED, lineWidth: 1.5, lineDash: [4, 3] } });
    if (i < fl.length) {
      elements.push({ type: 'text', style: { x: mx + dx, y: my + dy,
        text: (i + 1) + '. ' + fl[i].title, fill: TEXT_MUTED, fontSize: 9,
        textAlign: 'center', textVerticalAlign: 'middle' } });
    }
  });

  elements.push({ type: 'text', style: { x: cx, y: cy,
    text: 'Self-\nReinforcing\nCycle', fill: TEXT_COLOR, fontSize: 13, fontWeight: 'bold',
    textAlign: 'center', textVerticalAlign: 'middle' } });

  chart.setOption({ graphic: { elements: elements } });
  return chart;
}

/* ============================================================
   TAB 7 — DISCUSSION
   ============================================================ */

/** Triple bind summary grid */
function chartTripleBindSummary(el) {
  var chart = initChart(el);
  if (!chart) return null;

  var rows = ['Narrow', 'Undiscriminating', 'Culturally Blind'];
  var cols = ['Evidence', 'Consequence', 'Reinforcement', 'Recommendation'];
  var cellData = [
    // Narrow
    ['MFT 73%\nquality rate', 'Single-theory\nevaluation lens', 'MFT flywheel\ncompounds', 'Invest in\nprocess-level'],
    // Undiscriminating
    ['43% zero\nvariation', 'Cannot distinguish\nmodels', 'Convergence masks\nbias', 'Discriminating\nbattery'],
    // Cultural
    ['0% non-Western\nquality', 'Cannot evaluate\n3B+ people', 'Absence invisible\nto field', 'Fund non-Western\ninstruments']
  ];

  var data = [];
  rows.forEach(function (_, ri) {
    cols.forEach(function (_, ci) {
      data.push([ci, ri, cellData[ri][ci]]);
    });
  });

  var bindColors = [BIND_COLORS.narrow, BIND_COLORS.undiscrim, BIND_COLORS.cultural];

  chart.setOption({
    tooltip: { formatter: function (p) {
      return rows[p.value[1]] + ' / ' + cols[p.value[0]] + ':<br/>' + p.value[2].replace(/\n/g, ' ');
    }},
    grid: { left: 140, right: 20, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: cols, position: 'top',
             axisLabel: { color: TEXT_COLOR, fontSize: 12, fontWeight: 'bold' }, axisTick: { show: false },
             splitLine: { show: true, lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: rows,
             axisLabel: { color: TEXT_COLOR, fontSize: 12, fontWeight: 'bold' },
             splitLine: { show: true, lineStyle: { color: GRID_COLOR } } },
    series: [{
      type: 'heatmap', data: data,
      label: { show: true, formatter: function (p) { return p.value[2]; },
               color: '#fff', fontSize: 10, lineHeight: 14 },
      itemStyle: { borderColor: '#1c2128', borderWidth: 2 },
      emphasis: { itemStyle: { shadowBlur: 6 } }
    }],
    visualMap: { show: false, min: 0, max: 2, seriesIndex: 0,
      inRange: {
        color: [
          'rgba(214,94,0,0.35)',   // narrow
          'rgba(0,114,178,0.35)',  // undiscrim
          'rgba(204,121,167,0.35)' // cultural
        ]
      },
      dimension: 1
    }
  });
  return chart;
}

/* ============================================================
   TAB 10 — DATA EXPLORER
   ============================================================ */

/** UMAP 2D scatter */
function chartUMAP(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var ud = DATA.umapData;
  if (!ud || !ud.points) return null;

  var clusterColors = [OI_PALETTE[0], OI_PALETTE[2], OI_PALETTE[4], OI_PALETTE[5], OI_PALETTE[6]];

  chart.setOption({
    tooltip: { trigger: 'item', formatter: function (p) {
      var pt = ud.points[p.dataIndex];
      return pt[2] + '<br/>Cluster: ' + pt[3] + '<br/>Score: ' + fmt(pt[4]);
    }},
    grid: { left: 50, right: 20, top: 20, bottom: 40 },
    xAxis: { type: 'value', name: 'UMAP-1', nameTextStyle: { color: TEXT_MUTED },
             axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'value', name: 'UMAP-2', nameTextStyle: { color: TEXT_MUTED },
             axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } } },
    series: [{
      type: 'scatter', symbolSize: 10,
      data: ud.points.map(function (pt) {
        return { value: [pt[0], pt[1]], itemStyle: { color: clusterColors[pt[3] % clusterColors.length] } };
      }),
      emphasis: { label: { show: true, formatter: function (p) { return ud.points[p.dataIndex][2]; },
                           color: TEXT_COLOR, fontSize: 9 } }
    }]
  });
  return chart;
}

/** Scree plot with parallel threshold */
function chartScree(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var sd = DATA.screeData;
  if (!sd || !sd.components) return null;

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Eigenvalues', 'Parallel Threshold'], bottom: 0, textStyle: { color: TEXT_COLOR } },
    grid: { left: 55, right: 20, top: 20, bottom: 50 },
    xAxis: { type: 'category', data: sd.components.map(function (c) { return c.toString(); }),
             name: 'Component', nameTextStyle: { color: TEXT_MUTED }, axisLabel: { color: TEXT_MUTED } },
    yAxis: { type: 'value', name: 'Eigenvalue', nameTextStyle: { color: TEXT_MUTED },
             axisLabel: { color: TEXT_MUTED }, splitLine: { lineStyle: { color: GRID_COLOR } } },
    series: [
      { name: 'Eigenvalues', type: 'line', symbol: 'circle', symbolSize: 8,
        lineStyle: { color: TIER_COLORS.top, width: 2 }, itemStyle: { color: TIER_COLORS.top },
        data: sd.eigenvalues },
      { name: 'Parallel Threshold', type: 'line', symbol: 'diamond', symbolSize: 6,
        lineStyle: { color: '#D55E00', type: 'dashed', width: 2 }, itemStyle: { color: '#D55E00' },
        data: sd.parallelThreshold },
    ],
    graphic: [{
      type: 'text', right: 20, top: 10,
      style: { text: 'Suggested factors: ' + sd.suggestedFactors +
                     '\nKaiser criterion: ' + sd.kaiserCount +
                     '\n5-factor variance: ' + sd.variance5 + '%',
               fill: TEXT_MUTED, fontSize: 10, textAlign: 'right' }
    }]
  });
  return chart;
}

/** Feature importance: horizontal bar */
function chartFeatureImportance(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var fi = DATA.featureImportance;
  if (!fi || !fi.features) return null;

  // Take top 20, sorted by variance descending, show ascending for display
  var top = fi.features.slice(0, 20).reverse();
  var tierColors = { D: '#D55E00', E: '#E69F00', F: '#56B4E9', G: '#009E73' };

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = top[p[0].dataIndex];
        return d.name + ' (Tier ' + d.tier + ')<br/>Variance: ' + fmt(d.variance, 1) +
               '<br/>Mean: ' + fmt(d.mean, 1);
      }},
    grid: { left: 60, right: 40, top: 10, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } },
             name: 'Variance', nameTextStyle: { color: TEXT_MUTED } },
    yAxis: { type: 'category', data: top.map(function (f) { return f.name; }),
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: [{
      type: 'bar', barWidth: 14,
      data: top.map(function (f) {
        return { value: f.variance, itemStyle: { color: tierColors[f.tier] || TEXT_MUTED } };
      }),
      label: { show: true, position: 'right', formatter: function (p) { return fmt(p.value, 0); },
               color: TEXT_COLOR, fontSize: 10 }
    }]
  });
  return chart;
}

/** Treemap of theory coverage */
function chartTreemap(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tm = DATA.treemapData;
  if (!tm || !tm.children) return null;

  chart.setOption({
    tooltip: { trigger: 'item', formatter: function (p) {
      return p.name + ': ' + p.value + ' candidates';
    }},
    series: [{
      type: 'treemap', roam: false,
      width: '95%', height: '85%', top: 10,
      label: { show: true, formatter: function (p) {
        return p.name + '\n' + p.value;
      }, color: '#fff', fontSize: 12, fontWeight: 'bold' },
      breadcrumb: { show: false },
      data: tm.children.filter(function (c) { return c.value > 0; }),
      levels: [{
        itemStyle: { borderColor: '#1c2128', borderWidth: 2, gapWidth: 2 }
      }]
    }],
    graphic: [{
      type: 'text', right: 10, bottom: 5,
      style: { text: 'Entropy: ' + fmt(tm.entropy, 2) + '  Evenness: ' + fmt(tm.evenness, 2),
               fill: TEXT_MUTED, fontSize: 10, textAlign: 'right' }
    }]
  });
  return chart;
}

/** Ecosystem health scorecard: gauge + bars */
function chartHealthScorecard(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var hs = DATA.healthScorecard;
  if (!hs) return null;

  var dims = hs.dimensions || [];
  var names = dims.map(function (d) { return d.name; });
  var scores = dims.map(function (d) { return d.score; });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' },
      formatter: function (p) {
        var d = dims[p[0].dataIndex];
        return d.name + '<br/>Score: ' + fmt(d.score, 1) + '<br/>Grade: ' + d.grade;
      }},
    grid: { left: 200, right: 60, top: 40, bottom: 30 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: names.reverse(),
             axisLabel: { color: TEXT_COLOR, fontSize: 11, width: 185, overflow: 'truncate' } },
    series: [{
      type: 'bar', barWidth: 20,
      data: scores.map(function (s) {
        var c = s >= 60 ? TIER_COLORS.top : s >= 40 ? TIER_COLORS.high : s >= 25 ? TIER_COLORS.med : '#D55E00';
        return { value: s, itemStyle: { color: c } };
      }).reverse(),
      label: { show: true, position: 'right',
               formatter: function (p) {
                 var d = dims[dims.length - 1 - p.dataIndex];
                 return d.grade + ' (' + fmt(d.score, 1) + ')';
               }, color: TEXT_COLOR, fontSize: 11 }
    }],
    graphic: [{
      type: 'text', left: 'center', top: 8,
      style: { text: 'Ecosystem Health: ' + hs.overallGrade + ' (' + fmt(hs.overallScore, 1) + '/100)',
               fill: '#D55E00', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
    }]
  });
  return chart;
}

/* ============================================================
   ADDITIONAL CHARTS — Temporal, RLHF Comparison, Theory Evolution
   ============================================================ */

/** Theory evolution stacked area chart */
function chartTheoryEvolution(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var te = DATA.theoryEvolution;
  if (!te || !te.years || !te.theories) return null;

  var series = te.theories.map(function (theory, ti) {
    var data = te.years.map(function (yr) {
      return (te.counts && te.counts[theory] && te.counts[theory][yr]) || 0;
    });
    return {
      name: theory, type: 'line', stack: 'total', areaStyle: { opacity: 0.6 },
      lineStyle: { width: 1 }, symbol: 'none',
      itemStyle: { color: OI_PALETTE[ti % OI_PALETTE.length] },
      data: data
    };
  });

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: te.theories, bottom: 0, textStyle: { color: TEXT_COLOR, fontSize: 10 },
              type: 'scroll', pageTextStyle: { color: TEXT_COLOR } },
    grid: { left: 50, right: 20, top: 10, bottom: 60 },
    xAxis: { type: 'category', data: te.years, axisLabel: { color: TEXT_COLOR } },
    yAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    series: series
  });
  return chart;
}

/** RLHF comparison: pre vs post means across dimension tiers */
function chartRLHFComparison(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var rc = DATA.rlhfComparison;
  if (!rc || !rc.tiers) return null;

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Pre-RLHF (n=' + rc.preCount + ')', 'Post-RLHF (n=' + rc.postCount + ')'],
              top: 0, textStyle: { color: TEXT_COLOR } },
    grid: { left: 130, right: 30, top: 40, bottom: 30 },
    xAxis: { type: 'value', axisLabel: { color: TEXT_MUTED },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: rc.tiers.slice().reverse(),
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: [
      { name: 'Pre-RLHF (n=' + rc.preCount + ')', type: 'bar', barWidth: 12,
        itemStyle: { color: 'rgba(86,180,233,0.7)' },
        data: rc.preMeans.slice().reverse() },
      { name: 'Post-RLHF (n=' + rc.postCount + ')', type: 'bar', barWidth: 12,
        itemStyle: { color: 'rgba(214,94,0,0.7)' },
        data: rc.postMeans.slice().reverse() }
    ]
  });
  return chart;
}

/** Temporal trends: composite mean by year with trend */
function chartTemporalTrend(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var td = DATA.temporalData;
  if (!td || !td.years) return null;

  var years = td.years;
  var means = years.map(function (y) { return td.values[y] ? td.values[y].composite_mean : null; });
  var volumes = years.map(function (y) { return td.values[y] ? td.values[y].n : 0; });

  chart.setOption({
    tooltip: { trigger: 'axis' },
    legend: { data: ['Composite Mean', 'Volume'], bottom: 0, textStyle: { color: TEXT_COLOR } },
    grid: { left: 55, right: 55, top: 20, bottom: 45 },
    xAxis: { type: 'category', data: years, axisLabel: { color: TEXT_COLOR } },
    yAxis: [
      { type: 'value', name: 'Composite', position: 'left',
        nameTextStyle: { color: TEXT_MUTED }, axisLabel: { color: TEXT_MUTED },
        splitLine: { lineStyle: { color: GRID_COLOR } } },
      { type: 'value', name: 'N', position: 'right',
        nameTextStyle: { color: TEXT_MUTED }, axisLabel: { color: TEXT_MUTED },
        splitLine: { show: false } }
    ],
    series: [
      { name: 'Composite Mean', type: 'line', yAxisIndex: 0,
        lineStyle: { color: TIER_COLORS.top, width: 2 }, itemStyle: { color: TIER_COLORS.top },
        symbol: 'circle', symbolSize: 8, data: means,
        label: { show: true, formatter: function (p) { return p.value ? fmt(p.value) : ''; },
                 color: TEXT_COLOR, fontSize: 10 } },
      { name: 'Volume', type: 'bar', yAxisIndex: 1, barWidth: 20,
        itemStyle: { color: 'rgba(86,180,233,0.3)' }, data: volumes }
    ]
  });
  return chart;
}

/** Vendor heatmap: deviation from mean */
function chartVendorHeatmap(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var cv = DATA.crossVendor;
  if (!cv || !cv.vendorHeatmap) return null;

  var vh = cv.vendorHeatmap;

  chart.setOption({
    tooltip: { formatter: function (p) {
      return vh.benchmarkLabels[p.value[1]] + ' / ' + vh.vendorLabels[p.value[0]] +
             '<br/>Deviation: ' + fmt(p.value[2], 1) + '%';
    }},
    grid: { left: 140, right: 60, top: 10, bottom: 40 },
    xAxis: { type: 'category', data: vh.vendorLabels, position: 'top',
             axisLabel: { color: TEXT_COLOR, fontSize: 12 } },
    yAxis: { type: 'category', data: vh.benchmarkLabels,
             axisLabel: { color: TEXT_COLOR, fontSize: 10 } },
    visualMap: { min: -100, max: 200, calculable: false, orient: 'horizontal',
                 right: 0, bottom: 0, itemWidth: 12, itemHeight: 80,
                 inRange: { color: ['#D55E00', '#1c2128', '#009E73'] },
                 textStyle: { color: TEXT_MUTED } },
    series: [{
      type: 'heatmap', data: vh.data, large: true,
      label: { show: false },
      emphasis: { itemStyle: { shadowBlur: 6 } }
    }]
  });
  return chart;
}

/** Theory coverage by vendor: grouped bar */
function chartTheoryCoverage(el) {
  var chart = initChart(el);
  if (!chart) return null;
  var tp = DATA.theoryProfiles;
  if (!tp || !tp.theoryCoverage) return null;

  var tc = tp.theoryCoverage;
  var theories = tc.theories;
  var vendors = ['Anthropic', 'Gemini', 'OpenAI'];

  var series = vendors.map(function (v) {
    return {
      name: v, type: 'bar',
      itemStyle: { color: VENDOR_COLORS[v] },
      data: theories.map(function (t) { return tc.vendorData[t] ? tc.vendorData[t][v] || 0 : 0; })
    };
  });

  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { data: vendors, bottom: 0, textStyle: { color: TEXT_COLOR } },
    grid: { left: 120, right: 20, top: 10, bottom: 50 },
    xAxis: { type: 'value', max: 100, axisLabel: { color: TEXT_MUTED, formatter: '{value}%' },
             splitLine: { lineStyle: { color: GRID_COLOR } } },
    yAxis: { type: 'category', data: theories,
             axisLabel: { color: TEXT_COLOR, fontSize: 11 } },
    series: series
  });
  return chart;
}

/* ============================================================
   EXPORT — all chart functions available globally
   ============================================================ */
