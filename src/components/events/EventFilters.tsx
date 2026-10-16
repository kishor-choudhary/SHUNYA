import Link from "next/link";

interface EventFiltersProps {
  categories: string[];
  cities: string[];
  activeCategory: string;
  activeCity: string;
  activeWhen: string;
  total: number;
}

/**
 * URL-driven event filters rendered as real links: every filtered view is
 * shareable, crawlable and fully functional without JavaScript.
 */
export default function EventFilters({
  categories,
  cities,
  activeCategory,
  activeCity,
  activeWhen,
  total,
}: EventFiltersProps) {
  const href = (key: string, value: string) => {
    const params = new URLSearchParams();
    const current: Record<string, string> = {
      when: activeWhen,
      category: activeCategory,
      city: activeCity,
    };
    if (value && value !== "all") current[key] = value;
    else delete current[key];

    for (const [k, v] of Object.entries(current)) {
      if (v && !(k === "when" && v === "upcoming")) params.set(k, v);
    }
    const query = params.toString();
    return query ? `/events?${query}` : "/events";
  };

  const chip = (active: boolean) =>
    `inline-flex items-center rounded-sm border px-3.5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] transition-colors duration-300 ${
      active
        ? "border-ember bg-ember/15 text-bone"
        : "border-bone/15 text-fog hover:border-bone/40 hover:text-bone"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
          When
        </span>
        {[
          { id: "upcoming", label: "Upcoming" },
          { id: "past", label: "Past" },
          { id: "all", label: "All" },
        ].map((option) => (
          <Link
            key={option.id}
            href={href("when", option.id)}
            aria-current={activeWhen === option.id ? "true" : undefined}
            className={chip(activeWhen === option.id)}
          >
            {option.label}
          </Link>
        ))}
      </div>

      {categories.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
            Category
          </span>
          <Link href={href("category", "all")} aria-current={!activeCategory ? "true" : undefined} className={chip(!activeCategory)}>
            All
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={href("category", category)}
              aria-current={activeCategory === category ? "true" : undefined}
              className={chip(activeCategory === category)}
            >
              {category}
            </Link>
          ))}
        </div>
      ) : null}

      {cities.length > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 font-mono text-[0.58rem] uppercase tracking-[0.24em] text-ash">
            City
          </span>
          <Link href={href("city", "all")} aria-current={!activeCity ? "true" : undefined} className={chip(!activeCity)}>
            All
          </Link>
          {cities.map((city) => (
            <Link
              key={city}
              href={href("city", city)}
              aria-current={activeCity === city ? "true" : undefined}
              className={chip(activeCity === city)}
            >
              {city}
            </Link>
          ))}
        </div>
      ) : null}

      <p className="font-mono text-[0.58rem] uppercase tracking-[0.22em] text-ash">
        {total} {total === 1 ? "event" : "events"} shown
      </p>
    </div>
  );
}
