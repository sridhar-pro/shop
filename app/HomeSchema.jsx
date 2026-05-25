export default function HomeSchema() {
  const schema = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "FAQPage",

        "@id": "https://shop.yuukke.com/#faq",

        mainEntity: [
          {
            "@type": "Question",

            name: "What is Yuukke?",

            acceptedAnswer: {
              "@type": "Answer",

              text: "Yuukke is India’s women-powered marketplace featuring handmade, artisan, sustainable, and premium products from women-led brands.",
            },
          },

          {
            "@type": "Question",

            name: "What products can I buy on Yuukke?",

            acceptedAnswer: {
              "@type": "Answer",

              text: "You can shop handmade gifts, home decor, pantry essentials, millet snacks, artisan collections, and sustainable lifestyle products on Yuukke.",
            },
          },

          {
            "@type": "Question",

            name: "Does Yuukke support women entrepreneurs?",

            acceptedAnswer: {
              "@type": "Answer",

              text: "Yes. Yuukke is built to support women entrepreneurs and women-led brands across India.",
            },
          },
        ],
      },

      {
        "@type": "ItemList",

        "@id": "https://shop.yuukke.com/#featured-products",

        name: "Featured Products",

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: "https://shop.yuukke.com/products/kundan-designer-mobile-phone-case-handcrafted-ethnic-pr",
          },
        ],
      },
    ],
  };

  return (
    <script
      id="homepage-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}
