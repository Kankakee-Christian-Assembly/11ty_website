module.exports = {
  type: (data) => data.page.type || data.type || 'page',
  meta: {
    site: {
      name: (data) => data.site.title,
      description: (data) => data.site.description,
      url: (data) => data.site.url,
      logo: {
        src: (data) => data.site.url + data.site.image,
      },
    },
    language: (data) => 'en-US',
    url: (data) => data.site.url + data.page.url,
    title: (data) => data.title || data.site.title,
    description: (data) => data.description || data.site.description,
    image: {
      src: (data) => {
        return data.page.image ? data.site.url + data.page.image : null;
      },
    },
    modified: (data) => data.page.date.toISOString(),
    keywords: (data) => data.keywords,
  },
};
