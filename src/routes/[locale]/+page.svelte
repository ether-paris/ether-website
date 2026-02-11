<script lang="ts">
  import SiteHeader from '$lib/components/site-header.svelte';
  import SiteFooter from '$lib/components/footer.svelte';
  import Hero from '$lib/components/hero.svelte';
  import Section from '$lib/components/section.svelte';
  import PartnerMarquee from '$lib/components/partner-marquee.svelte';
  import ContactForm from '$lib/components/contact-form.svelte';
  import Manifesto from '$lib/components/manifesto.svelte';
  import Expertise from '$lib/components/expertise.svelte';
  import CaseStudies from '$lib/components/case-studies.svelte';
  import Approach from '$lib/components/approach.svelte';
  import Studio from '$lib/components/studio.svelte';
  import Testimonials from '$lib/components/testimonials.svelte';

  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
  let { dictionary, locale } = $derived(data);
  let { site, hero, partnerMarquee, sections, contactForm, footer, languageSwitcher } = $derived(dictionary);
  
  let headerNavigation = $derived(site.navigation);
  let socials = $derived(site.socials);
  let year = new Date().getFullYear();
  let rights = $derived(footer.rights.replace('{year}', year.toString()).replace('{name}', site.name));
</script>

<svelte:head>
  <title>{dictionary.metadata.title}</title>
  <meta name="description" content={dictionary.metadata.description} />
  <meta name="keywords" content={dictionary.metadata.keywords.join(', ')} />
  
  <meta property="og:title" content={dictionary.metadata.title} />
  <meta property="og:description" content={dictionary.metadata.description} />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:type" content="website" />
  
  <meta name="twitter:title" content={dictionary.metadata.title} />
  <meta name="twitter:description" content={dictionary.metadata.description} />
</svelte:head>

<SiteHeader
  {locale}
  navigation={headerNavigation}
  collaborateLabel={site.collaborateCta}
  logoAlt={site.logoAlt}
  languageLabel={languageSwitcher.label}
  homeLabel={site.name}
  menuLabel={dictionary.header.menuLabel}
/>

<main class="space-y-24 pb-24 pt-12 md:space-y-32 md:pt-20">
  <div class="container">
    <Hero
      eyebrow={hero.eyebrow}
      heading={hero.heading}
      description={hero.description}
      primaryCta={hero.primaryCta}
      secondaryCta={hero.secondaryCta}
      highlights={hero.highlights}
      imageAlt={hero.imageAlt}
    />
  </div>

  <!-- Tenant Registration CTA -->
  <div class="container">
    <section class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 px-6 py-16 text-center md:px-12 md:py-20">
      <div class="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20"></div>
      <div class="relative z-10">
        <span class="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
          New! Multi-Tenant Platform
        </span>
        <h2 class="mb-4 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
          Launch Your Digital Presence
        </h2>
        <p class="mx-auto mb-8 max-w-2xl text-lg text-blue-100 md:text-xl">
          Get your own domain, professional email service, and website infrastructure in minutes. 
          Powered by Kubernetes and AWS.
        </p>
        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="/admin/tenant-onboarding"
            class="inline-flex items-center justify-center rounded-lg bg-white px-8 py-4 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            Register Your Domain
          </a>
          <a
            href="#contact"
            class="inline-flex items-center justify-center rounded-lg border-2 border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600"
          >
            Learn More
          </a>
        </div>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
          <span class="flex items-center gap-2">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Custom Domain
          </span>
          <span class="flex items-center gap-2">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Professional Email
          </span>
          <span class="flex items-center gap-2">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            Website Template
          </span>
          <span class="flex items-center gap-2">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            GitHub Repository
          </span>
        </div>
      </div>
    </section>
  </div>

  <div class="container">
    <PartnerMarquee partners={partnerMarquee.partners} />
  </div>

  <Section
    id="manifesto"
    eyebrow={sections.manifesto.eyebrow}
    title={sections.manifesto.title}
    description={sections.manifesto.description}
  >
    <Manifesto
      paragraphs={sections.manifesto.paragraphs}
      bullets={sections.manifesto.bullets}
      offer={sections.manifesto.offer}
    />
  </Section>

  <Section
    id="expertise"
    eyebrow={sections.expertise.eyebrow}
    title={sections.expertise.title}
    description={sections.expertise.description}
  >
    <Expertise services={sections.expertise.services} />
  </Section>

  <Section
    id="cases"
    eyebrow={sections.cases.eyebrow}
    title={sections.cases.title}
    description={sections.cases.description}
  >
    <CaseStudies studies={sections.cases.caseStudies} />
  </Section>

  <Section
    id="approach"
    eyebrow={sections.approach.eyebrow}
    title={sections.approach.title}
  >
    <Approach steps={sections.approach.steps} />
  </Section>

  <Section
    id="studio"
    eyebrow={sections.studio.eyebrow}
    title={sections.studio.title}
    description={sections.studio.description}
  >
    <Studio
      locations={sections.studio.studios}
      onsiteLabel={sections.studio.onsiteLabel}
    />
  </Section>

  <Section
    id="testimonials"
    eyebrow={sections.testimonials.eyebrow}
    title={sections.testimonials.title}
    description={sections.testimonials.description}
  >
    <Testimonials testimonials={sections.testimonials.testimonials} />
  </Section>

  <Section
    id="contact"
    eyebrow={sections.contact.eyebrow}
    title={sections.contact.title}
    description={sections.contact.description}
  >
    <ContactForm {locale} copy={contactForm} />
  </Section>
</main>

<SiteFooter
  siteName={site.name}
  motto={site.motto}
  description={footer.description}
  navigation={headerNavigation}
  {socials}
  exploreLabel={footer.exploreLabel}
  socialLabel={footer.socialLabel}
  {rights}
  studiosLine={footer.studiosLine}
/>
