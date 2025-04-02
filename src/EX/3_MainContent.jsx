import { useState, useEffect } from "react";

function MainContent() {
  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [userInterests, setUserInterests] = useState({});
  const [selectedCountry, setSelectedCountry] = useState("toate");
  const [showCountryFilter, setShowCountryFilter] = useState(false);

  // Constants
  const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const countries = [
    { code: "toate", name: "Toate Țările" },
    { code: "ro", name: "România" },
    { code: "us", name: "SUA" },
    { code: "gb", name: "Marea Britanie" },
    { code: "de", name: "Germania" },
    { code: "fr", name: "Franța" },
    { code: "it", name: "Italia" },
    { code: "es", name: "Spania" },
    { code: "ru", name: "Rusia" },
    { code: "cn", name: "China" },
  ];

  // Dictionaries
  const synonymsDict = {
    // Romanian terms
    politica: [
      "guvern",
      "parlament",
      "ministru",
      "premier",
      "presedinte",
      "alegeri",
      "partid",
    ],
    romania: ["bucuresti", "roman", "tara", "carpati", "dacia"],
    sport: ["fotbal", "tenis", "olimpiada", "campionat", "meci", "competitie"],
    economie: [
      "bani",
      "finante",
      "bursa",
      "inflatie",
      "banca",
      "credit",
      "afaceri",
    ],
    sanatate: [
      "medic",
      "spital",
      "boala",
      "tratament",
      "pandemie",
      "coronavirus",
      "covid",
    ],
    educatie: [
      "scoala",
      "elevi",
      "student",
      "universitate",
      "profesor",
      "invatamant",
    ],
    crima: [
      "infractiune",
      "politie",
      "judecator",
      "proces",
      "inchisoare",
      "arest",
    ],
    razboi: ["conflict", "armata", "lupta", "militar", "atac", "arme", "nato"],
    clima: ["vremea", "temperatura", "caldura", "frig", "meteo", "vreme"],
    tehnologie: [
      "computer",
      "internet",
      "telefon",
      "digital",
      "inteligenta",
      "software",
    ],

    // English terms
    politics: [
      "government",
      "parliament",
      "minister",
      "president",
      "election",
      "party",
    ],
    economy: ["money", "finance", "stock", "inflation", "bank", "business"],
    health: [
      "doctor",
      "hospital",
      "disease",
      "treatment",
      "pandemic",
      "medicine",
    ],
    education: ["school", "student", "university", "teacher", "learning"],
    crime: ["police", "judge", "trial", "prison", "arrest", "law"],
    war: ["conflict", "army", "military", "attack", "weapon", "battle", "nato"],
    climate: ["weather", "temperature", "heat", "cold", "environment"],
    technology: [
      "computer",
      "internet",
      "phone",
      "digital",
      "intelligence",
      "software",
      "ai",
    ],

    // Famous people
    elon: ["musk", "tesla", "spacex", "twitter", "x"],
    mihail: [
      "miki",
      "mihaiescu",
      "mihai",
      "mike",
      "miki injura",
      "mihai injura",
      "Neamțu",
      "Neamtu",
    ],
    miki: [
      "mihail",
      "mihai",
      "mike",
      "mickey",
      "mihaiescu",
      "miki injura",
      "mihai injura",
      "mihail injura",
      "Neamțu",
      "Neamtu",
    ],
    mihai: [
      "mihail",
      "miki",
      "mike",
      "mihaita",
      "mihai injura",
      "miki injura",
      "mihail injura",
      "Neamțu",
      "Neamtu",
    ],
    neamtu: ["Neamțu", "mihail", "mihai"],
    neamțu: ["Neamtu", "mihail", "mihai"],

    trump: [
      "donald",
      "president",
      "republican",
      "election",
      "usa",
      "strup",
      "srump",
      "trupm",
    ],
    biden: ["joe", "president", "democrat", "usa", "america"],
    putin: ["vladimir", "russia", "kremlin", "moscow", "ucraina"],
    zelensky: ["volodymyr", "ukraine", "kiev", "ucraina"],

    // Common terms
    "a spus": ["declarat", "afirmat", "anuntat", "comunicat", "mentionat"],
    mare: ["important", "semnificativ", "major", "crucial", "esential"],
    nou: ["recent", "actual", "modern", "inovativ"],
    bani: ["finante", "fonduri", "investitii", "banca", "economii"],
    injura: [
      "insulta",
      "critica",
      "injurii",
      "injurie",
      "insulte",
      "critici",
      "critice",
      "injura pe",
    ],
    injurii: [
      "insulte",
      "critici",
      "critice",
      "injura",
      "insulta",
      "critica",
      "injurie",
    ],
    "miki injura": [
      "mihail injurii",
      "mihai injurii",
      "miki injurii",
      "mihail injura",
      "mihai injura",
      "mihail critici",
      "mihai critici",
      "Mihail Neamțu injurii",
    ],
    "mihail injurii": [
      "miki injura",
      "mihai injura",
      "miki injurii",
      "mihail injura",
      "mihai injurii",
      "miki critici",
      "mihai critici",
      "Mihail Neamțu injurii",
    ],
    "mihai injurii": [
      "miki injura",
      "mihail injura",
      "miki injurii",
      "mihail injurii",
      "mihai injura",
      "miki critici",
      "mihail critici",
      "Mihail Neamțu injurii",
    ],
    "miki injurii": [
      "mihail injura",
      "mihai injura",
      "miki injura",
      "mihail injurii",
      "mihai injurii",
      "mihail critici",
      "mihai critici",
      "Mihail Neamțu injurii",
    ],
    "mihai injura": [
      "mihail injurii",
      "miki injurii",
      "mihail injura",
      "miki injura",
      "Mihail Neamțu injurii",
      "Mihail Neamțu",
      "Neamțu injurii",
    ],
    "Mihail Neamțu": [
      "mihai injura",
      "miki injura",
      "mihail injurii",
      "mihai injurii",
    ],
    "Neamțu injurii": [
      "mihai injura",
      "miki injura",
      "mihail injurii",
      "Mihail Neamțu",
    ],
  };

  const typoCorrections = {
    strup: "trump",
    srump: "trump",
    trupm: "trump",
  };

  // Initial loading
  useEffect(() => {
    loadUserData();
    fetchInitialNews();
  }, []);

  // Cookie management
  const setCookie = (name, value, days = 30) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "; expires=" + date.toUTCString();
    document.cookie =
      name +
      "=" +
      encodeURIComponent(JSON.stringify(value)) +
      expires +
      "; path=/";
  };

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        try {
          return JSON.parse(
            decodeURIComponent(c.substring(nameEQ.length, c.length))
          );
        } catch (e) {
          console.error("Error parsing cookie:", e);
          return null;
        }
      }
    }
    return null;
  };

  const deleteCookie = (name) => {
    document.cookie = name + "=; Max-Age=-99999999; path=/";
  };

  // Load user data from cookies
  const loadUserData = () => {
    const savedHistory = getCookie("searchHistory");
    const savedInterests = getCookie("userInterests");

    if (savedHistory) {
      setSearchHistory(savedHistory);
    }

    if (savedInterests) {
      setUserInterests(savedInterests);
    }
  };

  // Fetch initial news
  const fetchInitialNews = async () => {
    const interests = getCookie("userInterests") || {};
    await fetchMixedNewsWithInterests(interests);
  };

  // Update search history and interests
  const updateSearchHistory = (keyword) => {
    if (!keyword || keyword.trim() === "") return;

    // Update history
    const updatedHistory = [
      { keyword, timestamp: new Date().toISOString() },
      ...searchHistory,
    ].slice(0, 10);

    setSearchHistory(updatedHistory);
    setCookie("searchHistory", updatedHistory);

    // Update interests
    const updatedInterests = {
      ...userInterests,
      [keyword]: (userInterests[keyword] || 0) + 1,
    };

    setUserInterests(updatedInterests);
    setCookie("userInterests", updatedInterests);
  };

  // Clear history and interests
  const clearHistory = () => {
    setSearchHistory([]);
    setUserInterests({});
    deleteCookie("searchHistory");
    deleteCookie("userInterests");
    fetchMixedNewsWithInterests({});
  };

  // Main search functionality
  const fetchNews = async (searchQuery = "romania") => {
    setLoading(true);
    setError(null);

    try {
      // Process query for special cases and typos
      const processedQuery = processSearchQuery(searchQuery);

      // Get search terms, synonyms, and fuzzy terms
      const searchTerms = extractSearchTerms(processedQuery);
      const synonyms = generateSynonyms(searchTerms);
      const fuzzyTerms = generateFuzzyTerms(searchTerms);

      // Combine all terms for search
      const allTerms = [
        ...new Set([...searchTerms, ...synonyms, ...fuzzyTerms]),
      ];
      const apiQueryTerms = allTerms.join(" OR ");

      // Get the articles
      const articles = await fetchArticlesFromApi(apiQueryTerms);

      if (articles && articles.length > 0) {
        // Score and rank articles by relevance
        const scoredArticles = scoreArticles(
          articles,
          searchTerms,
          synonyms,
          fuzzyTerms,
          processedQuery
        );

        setNews(scoredArticles);
        setFilteredNews(scoredArticles);

        // Update search history for non-default searches
        if (searchQuery !== "romania") {
          updateSearchHistory(searchQuery);
        }
      } else {
        // Try fallback search
        const fallbackArticles = await tryFallbackSearch();

        if (fallbackArticles && fallbackArticles.length > 0) {
          setNews(fallbackArticles);
          setFilteredNews(fallbackArticles);
        } else {
          setNews([]);
          setFilteredNews([]);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setError("A apărut o eroare. Încercați din nou.");
    } finally {
      setLoading(false);
    }
  };

  // Process query for special cases and typos
  const processSearchQuery = (query) => {
    let processedQuery = query;
    const lowerQuery = query.toLowerCase();

    // Fix common typos
    Object.keys(typoCorrections).forEach((typo) => {
      if (lowerQuery.includes(typo)) {
        processedQuery = processedQuery.replace(
          new RegExp(typo, "gi"),
          typoCorrections[typo]
        );
      }
    });

    // Handle special cases
    if (lowerQuery.includes("miki") && lowerQuery.includes("injura")) {
      processedQuery = "mihail injurii";
    } else if (lowerQuery.includes("mihai") && lowerQuery.includes("injura")) {
      processedQuery = "Mihail Neamțu injurii";
    }

    return processedQuery;
  };

  // Extract meaningful search terms
  const extractSearchTerms = (query) => {
    // Remove diacritics
    const normalized = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return normalized
      .toLowerCase()
      .split(" ")
      .filter((term) => term.length > 2)
      .map((term) => {
        // Remove common Romanian word endings
        return term.replace(
          /ului$|ilor$|elor$|iilor$|ile$|ii$|ul$|uri$|ati$|iti$|ează$|esc$|ește$|ind$|ând$/,
          ""
        );
      })
      .filter((term) => term.length > 2);
  };

  // Generate synonyms for search terms
  const generateSynonyms = (terms) => {
    let allSynonyms = [];

    // Check for combined terms (e.g., "miki injura")
    const fullQuery = terms.join(" ").toLowerCase();

    // Check special patterns
    if (
      terms.some((t) => t.includes("miki")) &&
      terms.some((t) => t.includes("injur"))
    ) {
      allSynonyms.push(
        "mihail",
        "injurii",
        "mihai",
        "injurie",
        "critici",
        "critica",
        "Neamțu",
        "Neamtu"
      );
    }

    if (
      terms.some((t) => t.includes("mihai")) &&
      terms.some((t) => t.includes("injur"))
    ) {
      allSynonyms.push(
        "mihail",
        "Neamțu",
        "Neamtu",
        "injurii",
        "injurie",
        "critici",
        "critica"
      );
    }

    // Check compound terms
    if (synonymsDict[fullQuery]) {
      allSynonyms = [...allSynonyms, ...synonymsDict[fullQuery]];
    }

    // Check individual terms
    terms.forEach((term) => {
      if (synonymsDict[term]) {
        allSynonyms = [...allSynonyms, ...synonymsDict[term]];
      }

      // Check similar terms
      Object.keys(synonymsDict).forEach((dictTerm) => {
        if (dictTerm.includes(term) || term.includes(dictTerm)) {
          allSynonyms = [...allSynonyms, ...synonymsDict[dictTerm]];
        }
      });
    });

    // Add popular terms if synonym list is short
    if (allSynonyms.length < 5) {
      allSynonyms = [
        ...allSynonyms,
        "actualitate",
        "stiri",
        "evenimente",
        "news",
      ];
    }

    // Remove duplicates
    return [...new Set(allSynonyms)];
  };

  // Generate fuzzy matching terms
  const generateFuzzyTerms = (terms) => {
    return terms.flatMap((term) => {
      const variants = [];

      // Add partial matches for longer terms
      if (term.length > 3) {
        variants.push(term.substring(0, term.length - 1));
        variants.push(term.substring(0, term.length - 2));
      }

      // Add keyboard-adjacent character replacements
      if (term.length > 3) {
        // Map of keyboard-adjacent keys
        const keyboardAdjacent = {
          a: ["q", "w", "s", "z"],
          s: ["a", "w", "d", "z", "x"],
          d: ["s", "e", "f", "c", "x"],
          f: ["d", "r", "g", "v", "c"],
          g: ["f", "t", "h", "b", "v"],
          h: ["g", "y", "j", "n", "b"],
          j: ["h", "u", "k", "m", "n"],
          k: ["j", "i", "l", "m"],
          l: ["k", "o", "p"],
          q: ["w", "a"],
          w: ["q", "e", "s", "a"],
          e: ["w", "r", "d", "s"],
          r: ["e", "t", "f", "d"],
          t: ["r", "y", "g", "f"],
          y: ["t", "u", "h", "g"],
          u: ["y", "i", "j", "h"],
          i: ["u", "o", "k", "j"],
          o: ["i", "p", "l", "k"],
          p: ["o", "l"],
          z: ["a", "s", "x"],
          x: ["z", "s", "d", "c"],
          c: ["x", "d", "f", "v"],
          v: ["c", "f", "g", "b"],
          b: ["v", "g", "h", "n"],
          n: ["b", "h", "j", "m"],
          m: ["n", "j", "k"],
        };

        // Special case for Trump
        if (term.includes("trump")) {
          variants.push("trump");
          variants.push("donald");
        }

        // Generate keyboard typo variations
        for (let i = 0; i < term.length; i++) {
          const char = term[i].toLowerCase();
          if (keyboardAdjacent[char]) {
            keyboardAdjacent[char].forEach((adjacent) => {
              variants.push(
                term.substring(0, i) + adjacent + term.substring(i + 1)
              );
            });
          }
        }
      }

      return variants;
    });
  };

  // Fetch articles from API
  const fetchArticlesFromApi = async (queryTerms) => {
    let apiUrl;

    if (selectedCountry !== "toate") {
      // Use top-headlines for country filtering
      apiUrl = `https://newsapi.org/v2/top-headlines?country=${selectedCountry}&pageSize=100&apiKey=${API_KEY}`;

      if (queryTerms) {
        apiUrl += `&q=${encodeURIComponent(queryTerms)}`;
      }
    } else {
      // Use everything endpoint for general search
      apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        queryTerms
      )}&sortBy=publishedAt&pageSize=100&apiKey=${API_KEY}`;
    }

    try {
      // Try multiple CORS proxies in sequence if one fails
      const corsProxies = [
        (url) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url) =>
          `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url) => `https://cors-anywhere.herokuapp.com/${url}`,
      ];

      let response = null;
      let error = null;

      // Try each proxy until one works
      for (const proxyFormatter of corsProxies) {
        try {
          const proxiedUrl = proxyFormatter(apiUrl);
          console.log("Trying proxy:", proxiedUrl.split("?")[0]);

          response = await fetch(proxiedUrl, {
            headers: { Origin: window.location.origin },
          });

          if (response.ok) {
            break; // Success! Stop trying other proxies
          }
        } catch (e) {
          error = e;
          console.log("Proxy attempt failed, trying next...");
          continue; // Try the next proxy
        }
      }

      // If no proxy worked
      if (!response || !response.ok) {
        throw error || new Error("All proxy attempts failed");
      }

      const data = await response.json();
      return data.articles || [];
    } catch (error) {
      console.error("API fetch error:", error);

      // For development only: fallback to local mock data when all proxies fail
      console.log("Using mock data as fallback");
      return getMockArticles();
    }
  };

  // Mock data function for development fallback
  const getMockArticles = () => {
    return [
      {
        title: "Trump anunță noi politici economice pentru SUA",
        description:
          "Fostul președinte a prezentat un plan economic controversat care a stârnit dezbateri aprinse.",
        urlToImage:
          "https://via.placeholder.com/600x400?text=Trump+Economic+Plan",
        publishedAt: new Date().toISOString(),
        source: { name: "Mock News Service" },
        url: "#",
      },
      {
        title: "Mihail Neamțu lansează o nouă carte despre cultura românească",
        description:
          "Autorul prezintă o analiză detaliată a evoluției culturale din România ultimilor ani.",
        urlToImage:
          "https://via.placeholder.com/600x400?text=Mihail+Neamtu+Book",
        publishedAt: new Date(Date.now() - 86400000).toISOString(),
        source: { name: "Mock News Service" },
        url: "#",
      },
      {
        title:
          "Probleme economice în Europa de Est după ultimele decizii ale UE",
        description:
          "Analiștii prevăd dificultăți pentru mai multe țări din regiune, inclusiv România.",
        urlToImage: "https://via.placeholder.com/600x400?text=Economic+News",
        publishedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        source: { name: "Mock News Service" },
        url: "#",
      },
      {
        title: "Alegeri prezidențiale: Ultimele sondaje arată o cursă strânsă",
        description:
          "Candidații sunt la egalitate în cele mai recente sondaje, cu doar câteva săptămâni înainte de ziua votului.",
        urlToImage: "https://via.placeholder.com/600x400?text=Election+News",
        publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        source: { name: "Mock News Service" },
        url: "#",
      },
      {
        title:
          "Schimbări climatice: Noi date arată încălzirea accelerată a planetei",
        description:
          "Oamenii de știință avertizează asupra efectelor pe termen lung și necesitatea unor măsuri imediate.",
        urlToImage: "https://via.placeholder.com/600x400?text=Climate+News",
        publishedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        source: { name: "Mock News Service" },
        url: "#",
      },
    ];
  };

  // Score articles by relevance
  const scoreArticles = (
    articles,
    searchTerms,
    synonyms,
    fuzzyTerms,
    originalQuery
  ) => {
    return articles
      .map((article) => {
        // Normalize text for matching
        const normalizedTitle =
          article.title
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";
        const normalizedDesc =
          article.description
            ?.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") || "";

        let score = 0;

        // Score for search terms
        searchTerms.forEach((term) => {
          // Title matches (highest priority)
          if (normalizedTitle.includes(term)) score += 10;

          // Description matches
          if (normalizedDesc.includes(term)) score += 5;

          // Word-level fuzzy matching in title
          normalizedTitle.split(/\s+/).forEach((word) => {
            if (word.length > 2) {
              // Partial inclusion
              if (word.includes(term) || term.includes(word)) {
                const lengthDiff = Math.abs(word.length - term.length);
                if (lengthDiff <= 2) score += 4 - lengthDiff;
              }
              // Character similarity
              else if (Math.abs(word.length - term.length) <= 2) {
                let commonChars = 0;
                for (let i = 0; i < Math.min(word.length, term.length); i++) {
                  if (word[i] === term[i]) commonChars++;
                }
                if (commonChars >= Math.min(word.length, term.length) * 0.7) {
                  score += 2;
                }
              }
            }
          });
        });

        // Score for original query terms
        originalQuery
          .toLowerCase()
          .split(" ")
          .forEach((term) => {
            const normalizedTerm = term
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "");
            if (
              normalizedTitle.includes(normalizedTerm) ||
              normalizedDesc.includes(normalizedTerm)
            ) {
              score += 3;
            }
          });

        // Score for synonyms
        synonyms.forEach((synonym) => {
          if (normalizedTitle.includes(synonym)) score += 5;
          if (normalizedDesc.includes(synonym)) score += 2;
        });

        // Score for fuzzy terms
        fuzzyTerms.forEach((fuzzyTerm) => {
          if (normalizedTitle.includes(fuzzyTerm)) score += 3;
          if (normalizedDesc.includes(fuzzyTerm)) score += 1;
        });

        return { ...article, score };
      })
      .sort((a, b) => b.score - a.score); // Sort by score (descending)
  };

  // Try fallback search for no results
  const tryFallbackSearch = async () => {
    // Try country-specific fallback first
    if (selectedCountry !== "toate") {
      const countryUrl = `https://newsapi.org/v2/top-headlines?country=${selectedCountry}&pageSize=30&apiKey=${API_KEY}`;
      const articles = await fetchArticlesFromApi(countryUrl);

      if (articles && articles.length > 0) {
        return articles;
      }
    }

    // Try general popular news
    const globalUrl = `https://newsapi.org/v2/everything?q=news&sortBy=popularity&pageSize=40&apiKey=${API_KEY}`;
    return await fetchArticlesFromApi(globalUrl);
  };

  // Fetch mixed news based on user interests
  const fetchMixedNewsWithInterests = async (interests) => {
    setLoading(true);
    setError(null);

    try {
      // Get top interests
      const topInterests = Object.entries(interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([keyword]) => keyword);

      // If no interests, fetch default news
      if (topInterests.length === 0) {
        await fetchNews();
        return;
      }

      // Add synonyms to interests
      const termsWithSynonyms = [];

      for (const interest of topInterests) {
        termsWithSynonyms.push(interest);

        const synonyms = generateSynonyms([interest]);
        if (synonyms.length > 0) {
          termsWithSynonyms.push(...synonyms.slice(0, 3));
        }
      }

      // Remove duplicates
      const uniqueTerms = [...new Set(termsWithSynonyms)];
      const query = uniqueTerms.join(" OR ");

      // Fetch and process articles
      const articles = await fetchArticlesFromApi(query);

      if (articles && articles.length > 0) {
        // Score and sort articles
        const scoredArticles = articles.map((article) => {
          const normalizedTitle = article.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          const normalizedDesc = article.description
            ? article.description
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
            : "";

          let score = 0;

          // Score for main interests
          topInterests.forEach((interest) => {
            const normalized = interest
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
            if (normalizedTitle.includes(normalized)) score += 10;
            if (normalizedDesc.includes(normalized)) score += 5;
          });

          // Score for synonyms
          uniqueTerms.forEach((term) => {
            if (!topInterests.includes(term)) {
              const normalized = term
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
              if (normalizedTitle.includes(normalized)) score += 3;
              if (normalizedDesc.includes(normalized)) score += 1;
            }
          });

          return { ...article, score };
        });

        // Group by relevance
        const highRelevance = scoredArticles.filter((a) => a.score > 8);
        const mediumRelevance = scoredArticles.filter(
          (a) => a.score > 3 && a.score <= 8
        );
        const lowRelevance = scoredArticles.filter((a) => a.score <= 3);

        // Shuffle each group
        const shuffleArray = (arr) => [...arr].sort(() => Math.random() - 0.5);

        // Combine with priority for relevant articles
        const finalArticles = [
          ...shuffleArray(highRelevance),
          ...shuffleArray(mediumRelevance),
          ...shuffleArray(lowRelevance),
        ];

        setNews(finalArticles);
        setFilteredNews(finalArticles);
      } else {
        await fetchNews();
      }
    } catch (error) {
      console.error("Mixed news error:", error);
      await fetchNews();
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchMixedNewsWithInterests(userInterests);
      return;
    }

    await fetchNews(searchTerm);
  };

  const handleArticleClick = (title) => {
    // Extract keywords from title
    const keywords = title
      .toLowerCase()
      .split(" ")
      .filter(
        (word) =>
          word.length > 3 &&
          !["și", "că", "din", "pentru", "care", "sau", "dar", "dacă"].includes(
            word
          )
      );

    // Save each keyword to history
    keywords.forEach((keyword) => {
      updateSearchHistory(keyword);
    });
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);

    // Refresh news with new country
    if (searchTerm.trim()) {
      fetchNews(searchTerm);
    } else {
      fetchMixedNewsWithInterests(userInterests);
    }
  };

  // Render component
  return (
    <div className="main-content">
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Caută știri..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            Caută
          </button>
        </form>
        <div className="filter-buttons">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="history-button"
          >
            {showHistory ? "Ascunde Istoric" : "Arată Istoric"}
          </button>
          <button
            onClick={() => setShowCountryFilter(!showCountryFilter)}
            className="country-filter-button"
          >
            {showCountryFilter ? "Ascunde Filtru Țări" : "Filtrează după Țară"}
          </button>
        </div>

        {showCountryFilter && (
          <div className="country-filter">
            <h3>Filtrează știri după țară</h3>
            <div className="country-buttons">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountryChange(country.code)}
                  className={`country-button ${
                    selectedCountry === country.code ? "selected" : ""
                  }`}
                >
                  {country.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <div className="history-container">
          <h3>Istoric Căutări și Interese</h3>
          {searchHistory.length === 0 ? (
            <p>Nu există istoric de căutări</p>
          ) : (
            <>
              <div className="history-list">
                {Object.entries(userInterests)
                  .sort(([, a], [, b]) => b - a)
                  .map(([keyword, count], index) => (
                    <div key={index} className="history-item">
                      <span className="keyword">{keyword}</span>
                      <span className="interest-count">Interes: {count}</span>
                      <span className="timestamp">
                        {new Date(
                          searchHistory.find(
                            (h) => h.keyword === keyword
                          )?.timestamp
                        ).toLocaleString("ro-RO")}
                      </span>
                    </div>
                  ))}
              </div>
              <button onClick={clearHistory} className="clear-history-button">
                Șterge Istoric
              </button>
            </>
          )}
        </div>
      )}

      <div className="results-container">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Se încarcă...</p>
        ) : filteredNews.length === 0 ? (
          <p>Nu s-au găsit rezultate</p>
        ) : (
          filteredNews.map((article, index) => (
            <div
              key={index}
              className="post-card"
              onClick={() => handleArticleClick(article.title)}
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="news-image"
                />
              )}
              <h3>{article.title}</h3>
              <p>{article.description}</p>
              <div className="news-meta">
                <span className="news-source">{article.source.name}</span>
                <span className="news-date">
                  {new Date(article.publishedAt).toLocaleDateString("ro-RO")}
                </span>
              </div>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="read-more"
                onClick={(e) => e.stopPropagation()}
              >
                Citește mai mult
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MainContent;
