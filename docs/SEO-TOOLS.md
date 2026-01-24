# SEO Tools & Resources

This document provides information about tools and resources for SEO (Search Engine Optimization) and referencing analysis.

## Built-in SEO Audit Script

We have a custom SEO audit script that checks your site for common SEO issues:

```bash
# Run the audit (uses default site URL from astro.config.mjs)
node scripts/seo-audit.js

# Specify a custom URL
node scripts/seo-audit.js --url https://your-site.com

# Output as JSON
node scripts/seo-audit.js --output json
```

### What It Checks

The script analyzes:

1. **robots.txt**
   - Accessibility and validity
   - Sitemap references
   - Blocking rules

2. **Sitemap**
   - Existence and location
   - XML validity
   - URL count

3. **Meta Tags**
   - Title tag (length, presence)
   - Meta description (length, presence)
   - Open Graph tags (og:title, og:description, og:image)
   - Twitter Card tags
   - Canonical URLs
   - Viewport meta tag
   - Charset declaration

4. **Structured Data**
   - JSON-LD presence
   - Schema.org types
   - Organization schema

5. **Performance**
   - Content compression
   - HTML size
   - Security headers

6. **Accessibility**
   - HTML lang attribute
   - Image alt attributes
   - Heading hierarchy (H1)

## External SEO Tools

### Free Tools

#### 1. **Google Search Console**
- **URL**: https://search.google.com/search-console
- **Features**:
  - Monitor search performance
  - Submit sitemaps
  - Check indexing status
  - Identify crawl errors
  - View search analytics
- **Best for**: Ongoing monitoring and Google-specific issues

#### 2. **Google PageSpeed Insights**
- **URL**: https://pagespeed.web.dev/
- **Features**:
  - Performance scoring
  - Core Web Vitals
  - Mobile optimization
  - Real-world performance data
- **Best for**: Performance optimization and mobile SEO

#### 3. **Google Rich Results Test**
- **URL**: https://search.google.com/test/rich-results
- **Features**:
  - Validate structured data
  - Check rich snippet eligibility
  - Test JSON-LD, Microdata, RDFa
- **Best for**: Structured data validation

#### 4. **Bing Webmaster Tools**
- **URL**: https://www.bing.com/webmasters
- **Features**:
  - Similar to Google Search Console
  - Bing-specific indexing
  - Sitemap submission
- **Best for**: Bing search optimization

#### 5. **Ahrefs Free SEO Tools**
- **URL**: https://ahrefs.com/free-seo-tools
- **Features**:
  - Site audit (limited)
  - Backlink checker
  - Keyword research
  - SERP checker
- **Best for**: Quick audits and backlink analysis

#### 6. **Screaming Frog SEO Spider (Free Version)**
- **URL**: https://www.screamingfrog.co.uk/seo-spider/
- **Features**:
  - Crawl up to 500 URLs (free)
  - Analyze meta tags, headings, links
  - Check robots.txt and sitemaps
  - Export data to CSV/Excel
- **Best for**: Comprehensive on-page SEO analysis
- **Note**: Free version limited to 500 URLs

#### 7. **W3C Markup Validator**
- **URL**: https://validator.w3.org/
- **Features**:
  - HTML validation
  - Check for markup errors
  - Accessibility hints
- **Best for**: Code quality and standards compliance

#### 8. **Schema.org Validator**
- **URL**: https://validator.schema.org/
- **Features**:
  - Validate structured data
  - Test JSON-LD, Microdata
  - Check schema compliance
- **Best for**: Structured data validation

### Paid Tools (Professional)

#### 1. **Screaming Frog SEO Spider (Paid)**
- **Price**: £199/year
- **Features**:
  - Unlimited URL crawling
  - JavaScript rendering
  - API integration
  - Advanced filtering
  - Custom extraction
- **Best for**: Large sites and professional SEO audits

#### 2. **Ahrefs Site Audit**
- **Price**: From $99/month
- **Features**:
  - 170+ SEO checks
  - JavaScript rendering
  - Historical tracking
  - Custom reports
  - API access
- **Best for**: Comprehensive technical SEO

#### 3. **SEMrush Site Audit**
- **Price**: From $119.95/month
- **Features**  :
  - 130+ checks
  - Competitor analysis
  - Backlink analysis
  - Keyword tracking
- **Best for**: Competitive SEO analysis

#### 4. **Sitebulb**
- **Price**: From $149/month
- **Features**:
  - Visual site mapping
  - Comprehensive reports
  - Custom rules
  - Team collaboration
- **Best for**: Visual SEO analysis and reporting

#### 5. **DeepCrawl**
- **Price**: Custom pricing
- **Features**:
  - Enterprise-scale crawling
  - JavaScript rendering
  - API integration
  - Custom rules
- **Best for**: Large enterprise sites

## Automated SEO Monitoring

### CI/CD Integration

You can integrate SEO checks into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
name: SEO Audit
on:
  schedule:
    - cron: '0 0 * * 0' # Weekly
  workflow_dispatch:

jobs:
  seo-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: node scripts/seo-audit.js --url ${{ secrets.SITE_URL }} --output json > seo-report.json
      - uses: actions/upload-artifact@v3
        with:
          name: seo-report
          path: seo-report.json
```

## SEO Checklist

### Technical SEO

- [ ] robots.txt is accessible and properly configured
- [ ] XML sitemap exists and is submitted to search engines
- [ ] All pages have unique, descriptive title tags (50-60 chars)
- [ ] All pages have unique meta descriptions (150-160 chars)
- [ ] Canonical URLs are set correctly
- [ ] Open Graph tags are present for social sharing
- [ ] Twitter Card tags are present
- [ ] Structured data (JSON-LD) is implemented
- [ ] HTTPS is enabled
- [ ] Mobile-responsive design
- [ ] Fast page load times (<3 seconds)
- [ ] No broken links (404 errors)

### On-Page SEO

- [ ] H1 tag on every page (one per page)
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Alt text on all images
- [ ] Internal linking structure
- [ ] URL structure is clean and descriptive
- [ ] Content is unique and valuable
- [ ] Keywords are naturally integrated

### Performance

- [ ] Core Web Vitals are optimized
  - [ ] Largest Contentful Paint (LCP) < 2.5s
  - [ ] First Input Delay (FID) < 100ms
  - [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Images are optimized (WebP, proper sizing)
- [ ] CSS and JavaScript are minified
- [ ] Gzip/Brotli compression enabled
- [ ] Browser caching configured

### Accessibility

- [ ] HTML lang attribute is set
- [ ] Semantic HTML is used
- [ ] ARIA labels where needed
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader compatibility

## Resources

- [Google Search Central](https://developers.google.com/search) - Official Google SEO documentation
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a) - Bing SEO guidelines
- [Schema.org](https://schema.org/) - Structured data vocabulary
- [Web.dev](https://web.dev/) - Web performance and SEO best practices
- [Moz SEO Learning Center](https://moz.com/learn/seo) - SEO education
- [Ahrefs Blog](https://ahrefs.com/blog/) - SEO guides and tutorials

## Current Site Configuration

Based on your Astro configuration:

- **Site URL**: `https://getplumber.io`
- **Sitemap**: Generated automatically via `@astrojs/sitemap`
- **SEO Package**: `astro-seo` for meta tag management
- **Robots.txt**: Located at `/public/robots.txt`

## Next Steps

1. Run the built-in SEO audit script: `node scripts/seo-audit.js`
2. Submit your sitemap to Google Search Console
3. Set up Google Search Console and Bing Webmaster Tools
4. Run a comprehensive audit with Screaming Frog (free version)
5. Check Core Web Vitals with Google PageSpeed Insights
6. Validate structured data with Google Rich Results Test
7. Set up automated monitoring in your CI/CD pipeline
