<template>
  <div>
    <!-- The same header and footer in both languages. -->
    <SkipLink />
    <SiteHeader />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
