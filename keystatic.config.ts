import { config, fields, collection } from '@keystatic/core';

export default config({
  // Local mode: the Admin UI runs only during `npm run dev` and writes
  // directly to the Markdown files in this repo. Commit + push to publish.
  storage: { kind: 'local' },

  ui: {
    brand: { name: 'KlawAgent CMS' },
  },

  collections: {
    blog: collection({
      label: 'Blog Posts',
      path: 'src/content/blog/*',
      slugField: 'title',
      format: { contentField: 'content' },
      entryLayout: 'content',
      columns: ['title', 'date'],
      schema: {
        title: fields.slug({
          name: { label: 'Title' },
          slug: {
            label: 'URL slug',
            description: 'The post URL is /blog/<slug>. Changing this renames the file.',
          },
        }),
        description: fields.text({
          label: 'Description',
          description: 'Used on blog cards and as the SEO meta description.',
          multiline: true,
          validation: { isRequired: true },
        }),
        date: fields.date({
          label: 'Publish date',
          validation: { isRequired: true },
        }),
        author: fields.text({
          label: 'Author',
          defaultValue: 'KlawAgent Team',
        }),
        image: fields.text({
          label: 'Cover image path',
          description: 'Optional. e.g. /blog-images/roi-calculator.png',
        }),
        draft: fields.checkbox({
          label: 'Draft (hidden from the published site)',
          defaultValue: false,
        }),
        content: fields.markdoc({
          label: 'Content',
          // Keep the .md extension so Astro keeps rendering these as it does today.
          extension: 'md',
        }),
      },
    }),
  },
});
