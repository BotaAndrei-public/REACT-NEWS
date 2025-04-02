import { useState, useEffect } from "react";

function MainContent() {
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

  // API key - va fi înlocuit cu variabilă de mediu
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || "demo";

  // Lista țărilor disponibile
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

  // Funcții pentru manipularea cookie-urilor
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

  useEffect(() => {
    // Încărcăm istoricul și interesele din cookies la pornirea aplicației
    const savedHistory = getCookie("searchHistory");
    const savedInterests = getCookie("userInterests");

    console.log("Loading saved interests from cookies:", savedInterests);
    console.log("Loading saved history from cookies:", savedHistory);

    let parsedInterests = {};
    if (savedHistory) {
      console.log("Parsed history:", savedHistory);
      setSearchHistory(savedHistory);
    }
    if (savedInterests) {
      parsedInterests = savedInterests;
      console.log("Parsed interests:", parsedInterests);
      setUserInterests(parsedInterests);
    }

    // Încărcăm direct știrile mixate la pornire folosind interesele parsate direct
    console.log("Fetching mixed news on startup");
    fetchMixedNewsWithInterests(parsedInterests);
  }, []);

  const saveToHistory = (keyword, shouldReload = false) => {
    console.log("Saving keyword to history:", keyword);
    const updatedHistory = [
      { keyword, timestamp: new Date().toISOString() },
      ...searchHistory,
    ].slice(0, 10);

    console.log("Updated history:", updatedHistory);
    setSearchHistory(updatedHistory);
    setCookie("searchHistory", updatedHistory);

    // Actualizăm și interesele utilizatorului
    const updatedInterests = {
      ...userInterests,
      [keyword]: (userInterests[keyword] || 0) + 1,
    };
    console.log("Updated interests:", updatedInterests);
    setUserInterests(updatedInterests);
    setCookie("userInterests", updatedInterests);

    // Reîncărcăm știrile mixate doar dacă se specifică
    if (shouldReload) {
      fetchMixedNewsWithInterests(updatedInterests);
    }
  };

  // Funcție nouă care folosește interesele pasate direct
  const fetchMixedNewsWithInterests = async (interests) => {
    setLoading(true);
    setError(null);
    try {
      // Obținem top 3 interese din obiectul primit
      const topInterests = Object.entries(interests)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([keyword]) => keyword);

      console.log("Direct interests used:", interests);
      console.log("Top interests:", topInterests);

      // Verificăm dacă avem interese suficiente
      if (topInterests.length === 0) {
        console.log("No interests found, fetching default news");
        await fetchNews();
        return;
      }

      // Îmbogățim interesele cu sinonime
      const termsWithSynonyms = [];
      for (const interest of topInterests) {
        // Adăugăm interesul original
        termsWithSynonyms.push(interest);

        // Adăugăm sinonime
        const synonyms = generateSynonyms([interest]);
        if (synonyms.length > 0) {
          // Limităm numărul de sinonime pentru a nu avea query-uri prea lungi
          termsWithSynonyms.push(...synonyms.slice(0, 3));
        }
      }

      // Eliminăm duplicate
      const uniqueTerms = [...new Set(termsWithSynonyms)];
      console.log("Terms with synonyms:", uniqueTerms);

      // Construim query-ul pentru API
      const query = uniqueTerms.join(" OR ");

      // Construim URL-ul API cu parametrii de căutare
      let apiUrl = `https://newsapi.org/v2/everything?q=${query}&sortBy=publishedAt&pageSize=100`;

      // Adăugăm filtrul de țară dacă este selectat
      if (selectedCountry !== "toate") {
        apiUrl += `&country=${selectedCountry}`;
      }

      // Adăugăm API key
      apiUrl += `&apiKey=${NEWS_API_KEY}`;

      console.log(
        "Fetching mixed news based on interests and synonyms:",
        query
      );
      const response = await fetch(
        `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Mixed news data received:", data);

      if (data.articles && data.articles.length > 0) {
        // Notăm articolele bazat pe relevanță față de interesele principale
        const scoredArticles = data.articles.map((article) => {
          // Normalizăm textul articolului
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
          const normalizedContent = `${normalizedTitle} ${normalizedDesc}`;

          // Calculăm scorul articolului pentru fiecare interes
          let score = 0;

          // Scor pentru potriviri cu interesele principale (mai important)
          topInterests.forEach((interest) => {
            const interestNorm = interest
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase();
            if (normalizedTitle.includes(interestNorm)) {
              score += 10;
            }
            if (normalizedDesc.includes(interestNorm)) {
              score += 5;
            }
          });

          // Scor pentru potriviri cu sinonime (mai puțin important)
          uniqueTerms.forEach((term) => {
            if (!topInterests.includes(term)) {
              // Dacă nu e un interes principal
              const termNorm = term
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();
              if (normalizedTitle.includes(termNorm)) {
                score += 3;
              }
              if (normalizedDesc.includes(termNorm)) {
                score += 1;
              }
            }
          });

          return { ...article, score };
        });

        // Amestecăm articolele pentru a avea un mix mai bun, dar favorizăm articolele cu scor mai mare
        // Împărțim în grupuri de articole bazate pe scor
        const highRelevance = scoredArticles.filter((a) => a.score > 8);
        const mediumRelevance = scoredArticles.filter(
          (a) => a.score > 3 && a.score <= 8
        );
        const lowRelevance = scoredArticles.filter((a) => a.score <= 3);

        // Amestecăm fiecare grup separat
        const shuffledHigh = [...highRelevance].sort(() => Math.random() - 0.5);
        const shuffledMedium = [...mediumRelevance].sort(
          () => Math.random() - 0.5
        );
        const shuffledLow = [...lowRelevance].sort(() => Math.random() - 0.5);

        // Combinăm grupurile, cu prioritate pentru articolele mai relevante
        const finalArticles = [
          ...shuffledHigh,
          ...shuffledMedium,
          ...shuffledLow,
        ];

        setNews(finalArticles);
        setFilteredNews(finalArticles);
      } else {
        console.log("No articles found for interests, fetching default news");
        await fetchNews();
      }
    } catch (error) {
      console.error("Error fetching mixed news:", error);
      // În caz de eroare, încărcăm știri despre România
      await fetchNews();
    } finally {
      setLoading(false);
    }
  };

  const fetchNews = async (searchQuery = "romania") => {
    setLoading(true);
    setError(null);
    try {
      console.log("Original search query:", searchQuery);

      // Common typos and keyboard-adjacent replacements
      const typoCorrections = {
        strup: "trump",
        srump: "trump",
        trupm: "trump",
      };

      // Check for common typos in the search query
      const lowerQuery = searchQuery.toLowerCase();
      Object.keys(typoCorrections).forEach((typo) => {
        if (lowerQuery.includes(typo)) {
          const corrected = lowerQuery.replace(typo, typoCorrections[typo]);
          console.log(`Typo correction: ${typo} -> ${typoCorrections[typo]}`);
          searchQuery = corrected;
        }
      });

      // Special case handling for specific search combinations
      if (
        searchQuery.toLowerCase().includes("miki") &&
        searchQuery.toLowerCase().includes("injura")
      ) {
        console.log("Special case detected: miki injura -> mihail injurii");
        searchQuery = "mihail injurii";
      }

      // Special case for mihai injura
      if (
        searchQuery.toLowerCase().includes("mihai") &&
        searchQuery.toLowerCase().includes("injura")
      ) {
        console.log(
          "Special case detected: mihai injura -> Mihail Neamțu injurii"
        );
        searchQuery = "Mihail Neamțu injurii";
      }

      // Normalizăm termenii de căutare - eliminăm diacriticele
      const normalizedQuery = searchQuery
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      console.log("Normalized query:", normalizedQuery);

      // Extragem cuvintele cheie din query
      const searchTerms = normalizedQuery
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 2)
        .map((term) => {
          // Eliminăm terminațiile comune românești pentru a obține rădăcina
          const simplifiedTerm = term.replace(
            /ului$|ilor$|elor$|iilor$|ile$|ii$|ul$|uri$|ati$|iti$|ează$|esc$|ește$|ind$|ând$/,
            ""
          );
          return simplifiedTerm.length > 2 ? simplifiedTerm : term;
        });

      console.log("Search terms (simplified):", searchTerms);

      // Generăm sinonime pentru termenii de căutare
      const sinonime = generateSynonyms(searchTerms);
      console.log("Synonyms:", sinonime);

      // Adăugăm variante pentru fuzzy search - pentru fiecare termen
      const fuzzyTerms = searchTerms.flatMap((term) => {
        // Generate variants with 1 character tolerance
        const fuzzyVariants = [];
        // Add partial matches (prefixes)
        if (term.length > 3) {
          fuzzyVariants.push(term.substring(0, term.length - 1));
          fuzzyVariants.push(term.substring(0, term.length - 2));
        }

        // Add keyboard-adjacent character replacements for common letters
        if (term.length > 3) {
          // Map of nearby keys on keyboard
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

          // For specific terms like Trump, add more variations
          if (term.includes("trump") || term.includes("strup")) {
            fuzzyVariants.push("trump");
            fuzzyVariants.push("donald");
          }

          // Add common typo variations by replacing one character with adjacent keyboard characters
          for (let i = 0; i < term.length; i++) {
            const char = term[i].toLowerCase();
            if (keyboardAdjacent[char]) {
              keyboardAdjacent[char].forEach((adjacentChar) => {
                const variant =
                  term.substring(0, i) + adjacentChar + term.substring(i + 1);
                fuzzyVariants.push(variant);
              });
            }
          }
        }

        return fuzzyVariants;
      });

      console.log("Fuzzy terms:", fuzzyTerms);

      // Combinăm termenii originali cu sinonimele și termenii fuzzy
      const extendedTerms = [
        ...new Set([...searchTerms, ...sinonime, ...fuzzyTerms]),
      ];
      console.log("Extended search terms:", extendedTerms);

      // Construim query-ul pentru API utilizând termenii extindși
      const apiQueryTerms = extendedTerms.join(" OR ");

      let apiUrl;
      let encodedUrl;

      // Verificăm dacă trebuie să folosim filtrul de țară
      if (selectedCountry !== "toate") {
        // Folosim endpoint-ul 'top-headlines' care acceptă parametrul 'country'
        apiUrl = `https://newsapi.org/v2/top-headlines?country=${selectedCountry}&pageSize=100&apiKey=${NEWS_API_KEY}`;

        // Dacă avem și un termen de căutare, îl adăugăm
        if (apiQueryTerms) {
          apiUrl += `&q=${apiQueryTerms}`;
        }
      } else {
        // Folosim endpoint-ul 'everything' pentru căutări complete
        apiUrl = `https://newsapi.org/v2/everything?q=${apiQueryTerms}&sortBy=publishedAt&pageSize=100&apiKey=${NEWS_API_KEY}`;
      }

      console.log("Fetching news with URL:", apiUrl);
      encodedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        apiUrl
      )}`;

      const response = await fetch(encodedUrl);
      console.log("Response received:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data received:", data);

      if (data.articles && data.articles.length > 0) {
        // Notăm fiecare articol în funcție de cât de bine se potrivește cu termenii căutați
        const scoredArticles = data.articles.map((article) => {
          // Normalizăm textul articolului
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
          const normalizedContent = `${normalizedTitle} ${normalizedDesc}`;

          // Calculăm scorul articolului pentru fiecare termen de căutare
          let score = 0;

          // Scor pentru potriviri exacte ale termenilor de căutare
          searchTerms.forEach((term) => {
            // Potrivire exactă în titlu (cel mai important)
            if (normalizedTitle.includes(term)) {
              score += 10;
            }

            // Potrivire exactă în descriere
            if (normalizedDesc.includes(term)) {
              score += 5;
            }

            // Fuzzy matching: Calculează un scor Levenshtein simplificat
            // Verificăm distanța de la cuvintele din articol la termenul căutat
            normalizedTitle.split(/\s+/).forEach((word) => {
              if (word.length > 2) {
                // Dacă termenul e inclus parțial în cuvânt sau cuvântul în termen
                if (word.includes(term) || term.includes(word)) {
                  // Cu cât diferența de lungime e mai mică, cu atât e mai bun match-ul
                  const lengthDiff = Math.abs(word.length - term.length);
                  if (lengthDiff <= 2) {
                    score += 4 - lengthDiff;
                  }
                }
                // Calculăm similaritatea pentru termeni apropiați
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

            // Verificăm și pentru forme derivate ale cuvintelor
            searchQuery
              .toLowerCase()
              .split(" ")
              .forEach((origTerm) => {
                const origTermNorm = origTerm
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "");
                if (normalizedContent.includes(origTermNorm)) {
                  score += 3;
                }
              });
          });

          // Adăugăm scor pentru potriviri cu sinonime
          sinonime.forEach((synonym) => {
            if (normalizedTitle.includes(synonym)) {
              score += 5; // Scor mai mic pentru sinonime
            }
            if (normalizedDesc.includes(synonym)) {
              score += 2;
            }
          });

          // Adăugăm scor pentru fuzzy terms
          fuzzyTerms.forEach((fuzzyTerm) => {
            if (normalizedTitle.includes(fuzzyTerm)) {
              score += 3;
            }
            if (normalizedDesc.includes(fuzzyTerm)) {
              score += 1;
            }
          });

          return { ...article, score };
        });

        // Sortăm articolele după scor (descrescător)
        const sortedArticles = scoredArticles.sort((a, b) => b.score - a.score);

        console.log(
          "Sorted articles by relevance:",
          sortedArticles.map((a) => ({ title: a.title, score: a.score }))
        );

        if (sortedArticles.length > 0) {
          setNews(sortedArticles);
          setFilteredNews(sortedArticles);
        } else if (data.articles.length > 0) {
          // Dacă nu avem potriviri cu scor, revenim la rezultatele originale
          setNews(data.articles);
          setFilteredNews(data.articles);
        } else {
          throw new Error("No results found");
        }

        if (searchQuery !== "romania") {
          // Salvăm căutarea în istoric, dar nu reîncărcăm știrile mixate
          const updatedHistory = [
            { keyword: searchQuery, timestamp: new Date().toISOString() },
            ...searchHistory,
          ].slice(0, 10);

          console.log("Updated history:", updatedHistory);
          setSearchHistory(updatedHistory);
          setCookie("searchHistory", updatedHistory);

          // Actualizăm și interesele utilizatorului
          const updatedInterests = {
            ...userInterests,
            [searchQuery]: (userInterests[searchQuery] || 0) + 1,
          };
          console.log("Updated interests:", updatedInterests);
          setUserInterests(updatedInterests);
          setCookie("userInterests", updatedInterests);
        }
      } else {
        // Dacă nu avem articole, încercăm o căutare de rezervă cu termeni mai generali
        console.log(
          "No results found with specific search, trying fallback..."
        );

        // Încercăm să căutăm știri generale pentru țara selectată sau știri populare
        if (selectedCountry !== "toate") {
          // Căutare generală pentru țara selectată
          const fallbackUrl = `https://newsapi.org/v2/top-headlines?country=${selectedCountry}&pageSize=30&apiKey=${NEWS_API_KEY}`;
          const fallbackEncodedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
            fallbackUrl
          )}`;

          console.log("Fallback search with URL:", fallbackUrl);
          const fallbackResponse = await fetch(fallbackEncodedUrl);

          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.articles && fallbackData.articles.length > 0) {
              console.log("Fallback search successful, found general news");
              setNews(fallbackData.articles);
              setFilteredNews(fallbackData.articles);
              setError(
                `Nu am găsit știri specifice pentru "${searchQuery}" în ${
                  countries.find((c) => c.code === selectedCountry).name
                }. Vă prezentăm știri generale recente din această țară.`
              );
              return;
            }
          }
        }

        // Dacă tot nu am găsit, încercăm să căutăm știri populare din toate sursele
        const globalFallbackUrl = `https://newsapi.org/v2/everything?q=news&sortBy=popularity&pageSize=40&apiKey=${NEWS_API_KEY}`;
        const globalFallbackEncodedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
          globalFallbackUrl
        )}`;

        console.log("Global fallback search with URL:", globalFallbackUrl);
        const globalFallbackResponse = await fetch(globalFallbackEncodedUrl);

        if (globalFallbackResponse.ok) {
          const globalFallbackData = await globalFallbackResponse.json();
          if (
            globalFallbackData.articles &&
            globalFallbackData.articles.length > 0
          ) {
            console.log(
              "Global fallback search successful, found popular news"
            );
            setNews(globalFallbackData.articles);
            setFilteredNews(globalFallbackData.articles);
            setError(
              `Nu am găsit știri pentru "${searchQuery}" în ${
                selectedCountry !== "toate"
                  ? countries.find((c) => c.code === selectedCountry).name
                  : "nicio țară"
              }. Vă prezentăm știri populare recente.`
            );
            return;
          }
        }

        // Dacă ajungem aici, înseamnă că nu am găsit nimic nici cu fallback
        setNews([]);
        setFilteredNews([]);
        setError(
          `Nu s-au găsit știri pentru "${searchQuery}" în ${
            selectedCountry !== "toate"
              ? countries.find((c) => c.code === selectedCountry).name
              : "nicio țară"
          }. Încercați alți termeni de căutare sau altă țară.`
        );
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setError(
        "A apărut o eroare la încărcarea știrilor. Vă rugăm să încercați din nou sau să schimbați filtrele de căutare."
      );
    } finally {
      setLoading(false);
    }
  };

  // Funcție îmbunătățită pentru generarea sinonimelor
  const generateSynonyms = (terms) => {
    // Mini dicționar de sinonime
    const synonymsDict = {
      // Română
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
      sport: [
        "fotbal",
        "tenis",
        "olimpiada",
        "campionat",
        "meci",
        "competitie",
      ],
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
      razboi: [
        "conflict",
        "armata",
        "lupta",
        "militar",
        "atac",
        "arme",
        "nato",
      ],
      clima: ["vremea", "temperatura", "caldura", "frig", "meteo", "vreme"],
      tehnologie: [
        "computer",
        "internet",
        "telefon",
        "digital",
        "inteligenta",
        "software",
      ],

      // English
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
      war: [
        "conflict",
        "army",
        "military",
        "attack",
        "weapon",
        "battle",
        "nato",
      ],
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

      // Persoane celebre
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

      // Sinonime pentru termeni comuni
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

    // Termeni populari în știri - vor fi adăugați la căutări fără rezultate
    const popularTerms = ["actualitate", "stiri", "evenimente", "news"];

    // Pentru fiecare termen, adăugăm sinonimele
    let allSynonyms = [];

    // Verificăm dacă avem o combinație de termeni (ex: "miki injura")
    const fullQuery = terms.join(" ").toLowerCase();
    console.log("Checking for compound term:", fullQuery);

    // Direct handling of specific use cases
    if (
      terms.some((t) => t.includes("miki")) &&
      terms.some((t) => t.includes("injur"))
    ) {
      console.log("Found miki+injur pattern, adding mihail injurii variants");
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
      console.log(
        "Found mihai+injur pattern, adding Mihail Neamțu injurii variants"
      );
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

    if (synonymsDict[fullQuery]) {
      console.log("Found compound term match:", fullQuery);
      allSynonyms = [...allSynonyms, ...synonymsDict[fullQuery]];
    }

    terms.forEach((term) => {
      // Verificăm dacă termenul există în dicționar
      if (synonymsDict[term]) {
        allSynonyms = [...allSynonyms, ...synonymsDict[term]];
      }

      // Verificăm și termeni asemănători (pentru a prinde variante apropiate)
      Object.keys(synonymsDict).forEach((dictTerm) => {
        // Verificare exactă
        if (dictTerm.includes(term) || term.includes(dictTerm)) {
          allSynonyms = [...allSynonyms, ...synonymsDict[dictTerm]];
        }

        // Verificare fuzzy pentru nume proprii și termeni importanți
        // Calculăm un scor de similaritate simplu
        if (term.length > 2 && dictTerm.length > 2) {
          // Verificăm câte caractere comune au la început
          let commonPrefix = 0;
          for (let i = 0; i < Math.min(term.length, dictTerm.length); i++) {
            if (term[i] === dictTerm[i]) commonPrefix++;
            else break;
          }

          // Dacă au un prefix comun semnificativ, adăugăm sinonimele
          if (commonPrefix >= Math.min(term.length, dictTerm.length) * 0.7) {
            allSynonyms = [...allSynonyms, ...synonymsDict[dictTerm]];
          }
        }
      });
    });

    // Adăugăm termeni populari doar dacă lista de sinonime e scurtă
    // pentru a evita căutări prea generice când avem deja termeni specifici
    if (allSynonyms.length < 5) {
      allSynonyms = [...allSynonyms, ...popularTerms];
    }

    // Eliminăm duplicatele
    return [...new Set(allSynonyms)];
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchMixedNewsWithInterests(userInterests); // În loc de fetchNews("romania")
      return;
    }

    await fetchNews(searchTerm);
  };

  const handleArticleClick = (title) => {
    console.log("Article clicked:", title);
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

    console.log("Extracted keywords:", keywords);
    keywords.forEach((keyword) => {
      console.log("Saving keyword:", keyword);
      saveToHistory(keyword, false); // Nu reîncărcăm știri la click pe articol
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setUserInterests({});
    deleteCookie("searchHistory");
    deleteCookie("userInterests");
    fetchMixedNewsWithInterests({}); // În loc de fetchNews()
  };

  // Funcția originală pentru compatibilitate
  const fetchMixedNews = async () => {
    // Folosim funcția nouă cu interesele din stare
    await fetchMixedNewsWithInterests(userInterests);
  };

  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    // Reîncărcăm știrile când se schimbă țara
    if (news.length > 0) {
      if (searchTerm.trim()) {
        fetchNews(searchTerm);
      } else {
        fetchMixedNewsWithInterests(userInterests);
      }
    }
  };

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
          <p>Nu s-au găsit rezultate pentru "{searchTerm}"</p>
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
