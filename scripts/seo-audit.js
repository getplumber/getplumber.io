#!/usr/bin/env node

/**
 * SEO Audit Tool
 * Scans the website for SEO optimization issues
 * 
 * Usage:
 *   node scripts/seo-audit.js [--url <site-url>] [--output <format>]
 * 
 * Examples:
 *   node scripts/seo-audit.js
 *   node scripts/seo-audit.js --url https://getplumber.io
 *   node scripts/seo-audit.js --output json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const DEFAULT_SITE_URL = 'https://getplumber.io';
const SITE_URL = process.argv.includes('--url') 
  ? process.argv[process.argv.indexOf('--url') + 1] 
  : DEFAULT_SITE_URL;

const OUTPUT_FORMAT = process.argv.includes('--output')
  ? process.argv[process.argv.indexOf('--output') + 1]
  : 'console';

// Results storage
const results = {
  timestamp: new Date().toISOString(),
  siteUrl: SITE_URL,
  checks: {
    robots: { status: 'pending', issues: [], warnings: [], passed: [] },
    sitemap: { status: 'pending', issues: [], warnings: [], passed: [] },
    metaTags: { status: 'pending', issues: [], warnings: [], passed: [] },
    structuredData: { status: 'pending', issues: [], warnings: [], passed: [] },
    performance: { status: 'pending', issues: [], warnings: [], passed: [] },
    accessibility: { status: 'pending', issues: [], warnings: [], passed: [] },
  },
  score: 0,
  totalIssues: 0,
  totalWarnings: 0,
};

// Utility functions
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    }).on('error', reject);
  });
}

function parseRobotsTxt(content) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
  const rules = { userAgents: [], sitemaps: [], disallows: [], allows: [] };
  let currentUA = '*';
  
  for (const line of lines) {
    if (line.toLowerCase().startsWith('user-agent:')) {
      currentUA = line.substring(11).trim();
      if (!rules.userAgents.includes(currentUA)) {
        rules.userAgents.push(currentUA);
      }
    } else if (line.toLowerCase().startsWith('sitemap:')) {
      rules.sitemaps.push(line.substring(8).trim());
    } else if (line.toLowerCase().startsWith('disallow:')) {
      rules.disallows.push({ ua: currentUA, path: line.substring(9).trim() });
    } else if (line.toLowerCase().startsWith('allow:')) {
      rules.allows.push({ ua: currentUA, path: line.substring(6).trim() });
    }
  }
  
  return rules;
}

function extractMetaTags(html) {
  const meta = {
    title: null,
    description: null,
    keywords: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    ogType: null,
    twitterCard: null,
    canonical: null,
    robots: null,
    viewport: null,
    charset: null,
  };
  
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();
  
  // Extract meta tags (support both quoted and minified unquoted attributes)
  const metaRegex = /<meta\s+([^>]+)>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    const nameMatch = attrs.match(/name=["']([^"']+)["']/i) || attrs.match(/\bname=([^\s>]+)/i);
    const propertyMatch = attrs.match(/property=["']([^"']+)["']/i) || attrs.match(/\bproperty=([^\s>]+)/i);
    const contentMatch = attrs.match(/content=["']([^"']*)["']/i) || attrs.match(/\bcontent=([^\s>]+)/i);
    const charsetMatch = attrs.match(/charset=["']?([^"'\s>]+)/i);
    
    if (charsetMatch) {
      meta.charset = charsetMatch[1];
    }
    
    if (contentMatch) {
      const content = contentMatch[1].trim();
      const name = nameMatch ? nameMatch[1].toLowerCase().replace(/^["']|["']$/g, '') : null;
      const property = propertyMatch ? propertyMatch[1].toLowerCase().replace(/^["']|["']$/g, '') : null;
      
      if (name === 'description') meta.description = content;
      if (name === 'keywords') meta.keywords = content;
      if (name === 'robots') meta.robots = content;
      if (name === 'viewport') meta.viewport = content;
      
      if (property === 'og:title') meta.ogTitle = content;
      if (property === 'og:description') meta.ogDescription = content;
      if (property === 'og:image') meta.ogImage = content;
      if (property === 'og:type') meta.ogType = content;
      
      if (name === 'twitter:card') meta.twitterCard = content;
    }
  }
  
  // Extract canonical (support quoted and unquoted href/rel)
  const canonicalMatch = html.match(/<link[^>]+rel=["']?canonical["']?[^>]+href=["']?([^\s"'>]+)["']?/i)
    || html.match(/<link[^>]+href=["']?([^\s"'>]+)["']?[^>]+rel=["']?canonical["']?/i);
  if (canonicalMatch) meta.canonical = canonicalMatch[1];
  
  return meta;
}

function extractStructuredData(html) {
  const scripts = [];
  // Support both quoted and unquoted type (minified HTML)
  const scriptRegex = /<script[^>]*type=["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      scripts.push(JSON.parse(match[1]));
    } catch (e) {
      // Invalid JSON
    }
  }
  return scripts;
}

// Check functions
async function checkRobotsTxt() {
  try {
    const url = `${SITE_URL}/robots.txt`;
    const response = await fetchUrl(url);
    
    if (response.statusCode !== 200) {
      results.checks.robots.issues.push(`robots.txt not found or not accessible (Status: ${response.statusCode})`);
      results.checks.robots.status = 'failed';
      return;
    }
    
    results.checks.robots.passed.push('robots.txt is accessible');
    
    const rules = parseRobotsTxt(response.body);
    
    // Check for sitemap reference
    if (rules.sitemaps.length === 0) {
      results.checks.robots.warnings.push('No sitemap reference found in robots.txt');
    } else {
      results.checks.robots.passed.push(`Found ${rules.sitemaps.length} sitemap reference(s)`);
    }
    
    // Check if all crawlers are blocked
    if (rules.disallows.some(d => d.path === '/' && d.ua === '*')) {
      results.checks.robots.issues.push('All crawlers are blocked (Disallow: /)');
      results.checks.robots.status = 'failed';
    } else {
      results.checks.robots.status = 'passed';
    }
    
  } catch (error) {
    results.checks.robots.issues.push(`Error checking robots.txt: ${error.message}`);
    results.checks.robots.status = 'error';
  }
}

async function checkSitemap() {
  try {
    // Try common sitemap locations
    const sitemapUrls = [
      `${SITE_URL}/sitemap-index.xml`,
      `${SITE_URL}/sitemap.xml`,
      `${SITE_URL}/sitemap-0.xml`,
    ];
    
    let found = false;
    for (const url of sitemapUrls) {
      try {
        const response = await fetchUrl(url);
        if (response.statusCode === 200) {
          found = true;
          results.checks.sitemap.passed.push(`Sitemap found at ${url}`);
          
          // Basic validation
          if (response.body.includes('<urlset') || response.body.includes('<sitemapindex')) {
            results.checks.sitemap.passed.push('Sitemap appears to be valid XML');
            
            // Count URLs
            const urlMatches = response.body.match(/<url>/g);
            const urlCount = urlMatches ? urlMatches.length : 0;
            if (urlCount > 0) {
              results.checks.sitemap.passed.push(`Found ${urlCount} URL(s) in sitemap`);
            } else {
              results.checks.sitemap.warnings.push('Sitemap exists but contains no URLs');
            }
          } else {
            results.checks.sitemap.issues.push('Sitemap does not appear to be valid XML');
          }
          break;
        }
      } catch (e) {
        // Continue to next URL
      }
    }
    
    if (!found) {
      results.checks.sitemap.issues.push('No sitemap found at common locations');
      results.checks.sitemap.status = 'failed';
    } else {
      results.checks.sitemap.status = 'passed';
    }
    
  } catch (error) {
    results.checks.sitemap.issues.push(`Error checking sitemap: ${error.message}`);
    results.checks.sitemap.status = 'error';
  }
}

async function checkMetaTags() {
  try {
    const response = await fetchUrl(SITE_URL);
    
    if (response.statusCode !== 200) {
      results.checks.metaTags.issues.push(`Homepage not accessible (Status: ${response.statusCode})`);
      results.checks.metaTags.status = 'failed';
      return;
    }
    
    const meta = extractMetaTags(response.body);
    
    // Check title
    if (!meta.title) {
      results.checks.metaTags.issues.push('Missing <title> tag');
    } else {
      results.checks.metaTags.passed.push('Title tag found');
      if (meta.title.length < 30) {
        results.checks.metaTags.warnings.push(`Title is too short (${meta.title.length} chars, recommended: 50-60)`);
      } else if (meta.title.length > 60) {
        results.checks.metaTags.warnings.push(`Title is too long (${meta.title.length} chars, recommended: 50-60)`);
      }
    }
    
    // Check description
    if (!meta.description) {
      results.checks.metaTags.issues.push('Missing meta description');
    } else {
      results.checks.metaTags.passed.push('Meta description found');
      if (meta.description.length < 120) {
        results.checks.metaTags.warnings.push(`Description is too short (${meta.description.length} chars, recommended: 150-160)`);
      } else if (meta.description.length > 160) {
        results.checks.metaTags.warnings.push(`Description is too long (${meta.description.length} chars, recommended: 150-160)`);
      }
    }
    
    // Check Open Graph
    if (!meta.ogTitle) {
      results.checks.metaTags.warnings.push('Missing Open Graph title (og:title)');
    } else {
      results.checks.metaTags.passed.push('Open Graph title found');
    }
    
    if (!meta.ogDescription) {
      results.checks.metaTags.warnings.push('Missing Open Graph description (og:description)');
    } else {
      results.checks.metaTags.passed.push('Open Graph description found');
    }
    
    if (!meta.ogImage) {
      results.checks.metaTags.warnings.push('Missing Open Graph image (og:image)');
    } else {
      results.checks.metaTags.passed.push('Open Graph image found');
    }
    
    // Check Twitter Card
    if (!meta.twitterCard) {
      results.checks.metaTags.warnings.push('Missing Twitter Card (twitter:card)');
    } else {
      results.checks.metaTags.passed.push('Twitter Card found');
    }
    
    // Check canonical
    if (!meta.canonical) {
      results.checks.metaTags.warnings.push('Missing canonical URL');
    } else {
      results.checks.metaTags.passed.push('Canonical URL found');
    }
    
    // Check viewport
    if (!meta.viewport) {
      results.checks.metaTags.issues.push('Missing viewport meta tag (mobile optimization)');
    } else {
      results.checks.metaTags.passed.push('Viewport meta tag found');
    }
    
    // Check charset
    if (!meta.charset) {
      results.checks.metaTags.warnings.push('Missing charset declaration');
    } else {
      results.checks.metaTags.passed.push('Charset declaration found');
    }
    
    results.checks.metaTags.status = results.checks.metaTags.issues.length > 0 ? 'failed' : 'passed';
    
  } catch (error) {
    results.checks.metaTags.issues.push(`Error checking meta tags: ${error.message}`);
    results.checks.metaTags.status = 'error';
  }
}

async function checkStructuredData() {
  try {
    const response = await fetchUrl(SITE_URL);
    
    if (response.statusCode !== 200) {
      results.checks.structuredData.issues.push(`Homepage not accessible (Status: ${response.statusCode})`);
      results.checks.structuredData.status = 'failed';
      return;
    }
    
    const structuredData = extractStructuredData(response.body);
    
    if (structuredData.length === 0) {
      results.checks.structuredData.warnings.push('No structured data (JSON-LD) found');
      results.checks.structuredData.status = 'warning';
    } else {
      results.checks.structuredData.passed.push(`Found ${structuredData.length} structured data block(s)`);
      
      // Collect types from top-level and from @graph (JSON-LD graph format)
      const types = [];
      for (const sd of structuredData) {
        if (Array.isArray(sd['@graph'])) {
          sd['@graph'].forEach((node) => {
            const t = node['@type'] || node.type;
            if (t) types.push(t);
          });
        } else {
          const t = sd['@type'] || sd.type;
          if (t) types.push(t);
        }
      }
      if (types.length > 0) {
        results.checks.structuredData.passed.push(`Schema types found: ${[...new Set(types)].join(', ')}`);
      }
      
      // Check for Organization schema
      if (types.some(t => t === 'Organization' || t === 'https://schema.org/Organization')) {
        results.checks.structuredData.passed.push('Organization schema found');
      } else {
        results.checks.structuredData.warnings.push('Organization schema not found (recommended for SEO)');
      }
      
      results.checks.structuredData.status = 'passed';
    }
    
  } catch (error) {
    results.checks.structuredData.issues.push(`Error checking structured data: ${error.message}`);
    results.checks.structuredData.status = 'error';
  }
}

async function checkPerformance() {
  try {
    const response = await fetchUrl(SITE_URL);
    
    if (response.statusCode !== 200) {
      results.checks.performance.issues.push(`Homepage not accessible (Status: ${response.statusCode})`);
      results.checks.performance.status = 'failed';
      return;
    }
    
    // Check for compression headers
    const contentEncoding = response.headers['content-encoding'];
    if (contentEncoding) {
      results.checks.performance.passed.push(`Content compression enabled (${contentEncoding})`);
    } else {
      results.checks.performance.warnings.push('Content compression not detected (gzip/brotli recommended)');
    }
    
    // Check content length
    const contentLength = parseInt(response.headers['content-length'] || '0');
    if (contentLength > 0) {
      const sizeKB = (contentLength / 1024).toFixed(2);
      results.checks.performance.passed.push(`HTML size: ${sizeKB} KB`);
      if (contentLength > 256 * 1024) {
        results.checks.performance.warnings.push(`HTML size is large (${sizeKB} KB, recommended: <256 KB)`);
      }
    }
    
    // Check for security headers
    const securityHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY or SAMEORIGIN',
      'x-xss-protection': '1; mode=block',
      'strict-transport-security': 'HSTS',
    };
    
    for (const [header, expected] of Object.entries(securityHeaders)) {
      if (response.headers[header.toLowerCase()]) {
        results.checks.performance.passed.push(`Security header found: ${header}`);
      } else {
        results.checks.performance.warnings.push(`Security header missing: ${header}`);
      }
    }
    
    results.checks.performance.status = 'passed';
    
  } catch (error) {
    results.checks.performance.issues.push(`Error checking performance: ${error.message}`);
    results.checks.performance.status = 'error';
  }
}

async function checkAccessibility() {
  try {
    const response = await fetchUrl(SITE_URL);
    
    if (response.statusCode !== 200) {
      results.checks.accessibility.issues.push(`Homepage not accessible (Status: ${response.statusCode})`);
      results.checks.accessibility.status = 'failed';
      return;
    }
    
    const html = response.body;
    
    // Check for lang attribute
    if (html.match(/<html[^>]*\blang=["']/i) || html.match(/<html[^>]*\blang=[^\s>]+/i)) {
      results.checks.accessibility.passed.push('HTML lang attribute found');
    } else {
      results.checks.accessibility.warnings.push('Missing HTML lang attribute');
    }
    
    // Check for alt attributes on images (basic check)
    const imgTags = html.match(/<img[^>]+>/gi) || [];
    const imgsWithoutAlt = imgTags.filter(img => !img.match(/alt=["']/i));
    if (imgsWithoutAlt.length > 0) {
      results.checks.accessibility.warnings.push(`Found ${imgsWithoutAlt.length} image(s) without alt attribute`);
    } else if (imgTags.length > 0) {
      results.checks.accessibility.passed.push(`All ${imgTags.length} image(s) have alt attributes`);
    }
    
    // Check for heading hierarchy (basic check)
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
      results.checks.accessibility.warnings.push('No H1 heading found');
    } else if (h1Count > 1) {
      results.checks.accessibility.warnings.push(`Multiple H1 headings found (${h1Count}, recommended: 1)`);
    } else {
      results.checks.accessibility.passed.push('Single H1 heading found');
    }
    
    results.checks.accessibility.status = 'passed';
    
  } catch (error) {
    results.checks.accessibility.issues.push(`Error checking accessibility: ${error.message}`);
    results.checks.accessibility.status = 'error';
  }
}

// Calculate score
function calculateScore() {
  let totalChecks = 0;
  let passedChecks = 0;
  
  for (const check of Object.values(results.checks)) {
    if (check.status === 'passed') {
      passedChecks++;
      totalChecks++;
    } else if (check.status === 'failed' || check.status === 'error') {
      totalChecks++;
    } else if (check.status === 'warning') {
      totalChecks++;
      passedChecks += 0.5; // Warnings count as half
    }
  }
  
  results.score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  results.totalIssues = Object.values(results.checks).reduce((sum, check) => sum + check.issues.length, 0);
  results.totalWarnings = Object.values(results.checks).reduce((sum, check) => sum + check.warnings.length, 0);
}

// Output functions
function outputConsole() {
  console.log('\n' + '='.repeat(60));
  console.log('SEO AUDIT REPORT');
  console.log('='.repeat(60));
  console.log(`Site URL: ${results.siteUrl}`);
  console.log(`Timestamp: ${results.timestamp}`);
  console.log(`Overall Score: ${results.score}/100`);
  console.log(`Total Issues: ${results.totalIssues}`);
  console.log(`Total Warnings: ${results.totalWarnings}`);
  console.log('='.repeat(60) + '\n');
  
  for (const [checkName, check] of Object.entries(results.checks)) {
    const statusIcon = check.status === 'passed' ? '✅' : check.status === 'failed' ? '❌' : '⚠️';
    console.log(`\n${statusIcon} ${checkName.toUpperCase()}`);
    console.log('-'.repeat(60));
    
    if (check.passed.length > 0) {
      console.log('\n✓ Passed:');
      check.passed.forEach(item => console.log(`  • ${item}`));
    }
    
    if (check.warnings.length > 0) {
      console.log('\n⚠ Warnings:');
      check.warnings.forEach(item => console.log(`  • ${item}`));
    }
    
    if (check.issues.length > 0) {
      console.log('\n✗ Issues:');
      check.issues.forEach(item => console.log(`  • ${item}`));
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(60));
  console.log('1. Fix all critical issues listed above');
  console.log('2. Address warnings to improve SEO score');
  console.log('3. Use external tools for deeper analysis:');
  console.log('   - Google Search Console');
  console.log('   - Screaming Frog SEO Spider');
  console.log('   - Ahrefs Site Audit');
  console.log('   - Google PageSpeed Insights');
  console.log('='.repeat(60) + '\n');
}

function outputJSON() {
  console.log(JSON.stringify(results, null, 2));
}

// Main execution
async function main() {
  console.log('Starting SEO audit...\n');
  
  await Promise.all([
    checkRobotsTxt(),
    checkSitemap(),
    checkMetaTags(),
    checkStructuredData(),
    checkPerformance(),
    checkAccessibility(),
  ]);
  
  calculateScore();
  
  if (OUTPUT_FORMAT === 'json') {
    outputJSON();
  } else {
    outputConsole();
  }
  
  // Exit with error code if there are critical issues
  process.exit(results.totalIssues > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
