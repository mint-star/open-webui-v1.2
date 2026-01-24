<script>
  import { onMount } from 'svelte';
  import { dev, browser } from '$app/environment';
  import { page } from '$app/stores';
  import { PUBLIC_GA_ID } from '$env/static/public';

  onMount(() => {
    if (!browser || dev || !PUBLIC_GA_ID) return;

    // 1. Inject the external Google Script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // 2. Initialize the gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());

    // 3. Initial config
    window.gtag('config', PUBLIC_GA_ID);
  });

  // 4. Track page changes reactively
  $: if (browser && !dev && PUBLIC_GA_ID && $page.url.pathname && window.gtag) {
    window.gtag('config', PUBLIC_GA_ID, {
      page_path: $page.url.pathname
    });
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://www.googletagmanager.com">
  <link rel="preconnect" href="https://www.google-analytics.com">
</svelte:head>