"use client";

function SectionHeader({ label, title, description }) {
  return (
    <div className="w-full my-0 md:my-10 mb-4">
      <div className="relative group">
        <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>
        <div className="pl-4">
          <div className="flex flex-col space-y-1 mb-6">
            <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
              {label}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
              {title}
            </h2>
            <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
          </div>
          <div>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PageSectionHeader({
  isOffersPage,
  isFestivalGifting,
  isWomensday,
  isNewarrivalsPage,
  isCorporateEssentialsPage,
  isMostSavedPage,
  isWellnessPage,
  isReturnGiftsPage,
  isFeaturedPage,
  isCorporatePage,
  isGetTitle9Page,
  isGetTitle10Page,
  isGetTitle11Page,
  isGetTitle12Page,
  isBogo,
  title,
  isEOY,
}) {
  const featuredDescription =
    "Discover our most popular products, loved by thousands of happy customers!";

  if (isOffersPage) {
    return (
      <div className="w-full my-10 mb-4">
        <div className="relative group">
          <div className="absolute -left-4 top-0 h-full w-1 bg-[#a00300] rounded-full"></div>
          <div className="pl-4">
            <div className="flex flex-col space-y-1 mb-6">
              <span className="text-sm uppercase tracking-wider text-[#a00300] font-medium">
                Limited Time
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-950">
                Today's Exclusive Deal
              </h2>
              <div className="w-20 h-1 bg-[#a00300] mt-2"></div>
            </div>
            <div>
              <p className="text-gray-700 leading-relaxed">
                Don't miss our special offers curated just for you. Limited
                quantities available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFestivalGifting) {
    return (
      <SectionHeader
        label="Festive Gifting"
        title="Yuukke Hot Picks"
        description={featuredDescription}
      />
    );
  }

  if (isWomensday) {
    return (
      <SectionHeader
        label="Women's Day"
        title="Yuukke's Best Picks"
        description={featuredDescription}
      />
    );
  }

  if (isEOY) {
    return (
      <SectionHeader
        label="End Of Year Sale"
        title="Yuukke's Best Picks"
        description={featuredDescription}
      />
    );
  }

  if (isBogo) {
    return (
      <SectionHeader
        label="Special Offers"
        title="Buy More, Get More!"
        description="Explore our exciting deals — buy any product and enjoy additional free items. Limited time only!"
      />
    );
  }

  // All "Featured Collection" pages share same structure, just different title
  const featuredPages = [
    isNewarrivalsPage,
    isCorporateEssentialsPage,
    isMostSavedPage,
    isWellnessPage,
    isReturnGiftsPage,
    isFeaturedPage,
    isCorporatePage,
    isGetTitle9Page,
    isGetTitle10Page,
    isGetTitle11Page,
    isGetTitle12Page,
  ];

  if (featuredPages.some(Boolean)) {
    return (
      <SectionHeader
        label="Featured Collection"
        title={title}
        description={featuredDescription}
      />
    );
  }

  return null;
}
