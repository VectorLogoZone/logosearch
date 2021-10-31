# To Do


- [ ] schema: pattern, minItems, examples, enum

- [ ] [Baidu Webmaster Tools](https://www.dragonmetrics.com/how-to-optimize-your-site-with-baidu-webmaster-tools/)


- [ ] logos wider than max-width are getting distorted
- [ ] cancel results display if input doesn't match current query textbox
- [ ] process.on() trapping and logging
- [ ] endpoint for json schema
- [ ] test page for json schema
- [ ] exact matches first in search results
- [ ] preview (a lot of github links are coming up too small to see)

## Content

- [ ] fill out FAQ
- [ ] more pages with meta description
- [ ] tags for sources (country, black/white/blue/color, hexagonal/circle/square, etc)
- [ ] cleanup paging in sources/_logos.hbs
- [ ] use window.location.replace() when paging in sources/_logos.hbs
- [ ] switch back to latest lunr (with stopwords disabled)
- [ ] alternatives/_index.hbs
- [ ] alternatives/index.hbs: remember search value when leaving then returning
- [ ] contact page

## Longer term

- [ ] all text into translations.json
- [ ] translations
- [ ] hbs local variable for robots

Fonts for logo: Bitter, PT Serif, Arya,

https://developer.mozilla.org/en-US/docs/Web/OpenSearch

<link rel="search" type="application/opensearchdescription+xml" title="Tech Interview Handbook" href="/opensearch.xml">

<atom:link rel="search" ... />

<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
<ShortName>Tech Interview Handbook</ShortName>
<Description>Search Tech Interview Handbook</Description>
<InputEncoding>UTF-8</InputEncoding>
<Image width="16" height="16" type="image/x-icon">https://techinterviewhandbook.org/img/favicon.png</Image>
<Url type="text/html" method="get" template="https://techinterviewhandbook.org/search?q={searchTerms}"/>
<Url type="application/opensearchdescription+xml" rel="self" template="https://techinterviewhandbook.org/opensearch.xml"/>
<moz:SearchForm>https://techinterviewhandbook.org/</moz:SearchForm>
</OpenSearchDescription>