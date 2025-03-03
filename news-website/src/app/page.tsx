"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
}
export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState("general");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const categories = ["general", "business", "entertainment", "health", "science", "sports", "technology"];
  const apiKey = "4f37259a4fb945dfa1d66d8ef0bfe5fa";

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        setError(null);
        const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&q=${query}&page=${page}&pageSize=10&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (page === 1) {
          setArticles(data.articles || []);
        } else {
          setArticles((prev) => [...prev, ...(data.articles || [])]);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to fetch news. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [category, query, page, apiKey]);

  useEffect(() => {
    if (query && !searchHistory.includes(query)) {
      setSearchHistory((prev) => [...prev, query].slice(-5));
    }
  }, [query, searchHistory]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    const timeoutId = setTimeout(() => {
      setQuery(newQuery);
      setPage(1);  // Reset page when search changes
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"} min-h-screen p-6 max-w-5xl mx-auto`}>
      <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">📰 Praveen Today&apos;s News</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md border transition"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
        {/* Category Selector */}
        <select
          className="p-2 border rounded-md bg-transparent"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const queryInput = (document.getElementById("search") as HTMLInputElement).value;
            setQuery(queryInput);
            setPage(1);
          }}
          className="flex items-center border rounded-md overflow-hidden bg-transparent"
        >
          <input
            id="search"
            type="text"
            placeholder="Search news..."
            className="p-2 outline-none w-full bg-transparent"
            onChange={handleSearchChange}
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">🔍</button>
        </form>
      </div>

      {/* Recent Search History */}
      {searchHistory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Recent Searches:</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                className="p-2 border rounded-md text-sm bg-gray-200 dark:bg-gray-700"
                onClick={() => {
                  setQuery(item);
                  setPage(1);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-center mb-6">
          {error}
        </div>
      )}

      {/* News Articles Grid with AnimatePresence */}
      <AnimatePresence>
        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
          {articles.length > 0 ? (
            articles.map((article: Article, index: number) => (
              <motion.div
                key={article.url}
                className="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                {article.urlToImage && (
                  <div className="relative h-40">
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      className="rounded-md w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                      loading="lazy"
                    />
                  </div>
                )}
                <h2 className="text-lg font-semibold mt-2">{article.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">{article.description}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 mt-2 inline-block hover:underline"
                >
                  Read more →
                </a>
              </motion.div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-3">
              {loading ? "Loading..." : "No news found. Try a different search."}
            </p>
          )}
        </div>
      </AnimatePresence>

      {/* Load More Button */}
      {articles.length > 0 && !loading && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Load More
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && <p className="text-center mt-4">🔄 Loading more news...</p>}
    </div>
  );
}
