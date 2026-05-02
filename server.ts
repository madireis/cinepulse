import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // TMDB API Proxy
  // Use user-provided key if env is missing
  const TMDB_API_KEY = process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== "YOUR_TMDB_API_KEY" 
    ? process.env.TMDB_API_KEY 
    : "b911e74a3d17f8b87b908346ee2881ab";
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  // Mock data for fallback (Demo Mode)
  const FALLBACK_MOVIES = [
    {
      id: 1,
      title: "Interstellar",
      poster_path: "/gEU2QvYBfw7fg7SLS3PZ6oSAQo6.jpg",
      backdrop_path: "/rAiY_pUm9vsvplFWyoffm0p3nm2.jpg",
      overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
      vote_average: 8.4,
      release_date: "2014-11-05",
      genre_ids: [12, 18, 878]
    },
    {
      id: 2,
      title: "The Dark Knight",
      poster_path: "/qJ2tW6WMUDp9QmSbmM949O9vBTm.jpg",
      backdrop_path: "/dqK76PZ3P9P8AR8B8pX79S6iTry.jpg",
      overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
      vote_average: 8.5,
      release_date: "2008-07-16",
      genre_ids: [18, 28, 80, 53]
    },
    {
      id: 3,
      title: "Inception",
      poster_path: "/9gk7Fn9sVAsOX79statusPZ6oSAQo6.jpg",
      backdrop_path: "/8ZTPjSypS86em6ZInls9pS86em6.jpg",
      overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: \"inception\".",
      vote_average: 8.3,
      release_date: "2010-07-15",
      genre_ids: [28, 878, 12]
    },
    {
      id: 4,
      title: "Pulp Fiction",
      poster_path: "/d5iIl9h9btztm9tgvCOOROfp06j.jpg",
      backdrop_path: "/suaEOKoBvPI4p7StatusPZ6oSAQo6.jpg",
      overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.",
      vote_average: 8.5,
      release_date: "1994-09-10",
      genre_ids: [53, 80]
    },
    {
      id: 5,
      title: "The Matrix",
      poster_path: "/f89U3Y9statusPZ6oSAQo6.jpg",
      backdrop_path: "/o3n9statusPZ6oSAQo6.jpg",
      overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents who fight the vast and powerful computers who now rule the earth.",
      vote_average: 8.2,
      release_date: "1999-03-30",
      genre_ids: [28, 878]
    }
  ];

  app.get("/api/movies/*", async (req, res) => {
    const endpoint = (req.params as any)[0];
    const queryParams = req.query;

    if (!TMDB_API_KEY || TMDB_API_KEY === "YOUR_TMDB_API_KEY") {
      console.warn("TMDB_API_KEY is missing. Using fallback demo data.");
      
      // Basic fallback logic for common endpoints
      if (endpoint.includes("trending") || endpoint.includes("popular") || endpoint.includes("top_rated") || endpoint.includes("discover")) {
        return res.json({
          page: 1,
          results: FALLBACK_MOVIES,
          total_pages: 1,
          total_results: FALLBACK_MOVIES.length,
          _demo_mode: true
        });
      }

      if (endpoint.includes("movie/")) {
        const idMatch = endpoint.match(/movie\/(\d+)/);
        if (idMatch) {
          const movieId = parseInt(idMatch[1]);
          const movie = FALLBACK_MOVIES.find(m => m.id === movieId) || FALLBACK_MOVIES[0];
          return res.json({
            ...movie,
            budget: 100000000,
            revenue: 500000000,
            runtime: 148,
            status: "Released",
            tagline: "The demo must go on.",
            genres: [{ id: 12, name: "Adventure" }, { id: 878, name: "Sci-Fi" }],
            videos: { results: [] },
            credits: { cast: [] },
            similar: { results: FALLBACK_MOVIES },
            _demo_mode: true
          });
        }
      }

      if (endpoint.includes("genre/movie/list")) {
        return res.json({
          genres: [
            { id: 28, name: "Action" },
            { id: 12, name: "Adventure" },
            { id: 878, name: "Sci-Fi" },
            { id: 18, name: "Drama" }
          ],
          _demo_mode: true
        });
      }

      return res.status(401).json({
        error: "TMDB_API_KEY is missing.",
        message: "Please add your TMDB_API_KEY to the Secrets panel in AI Studio.",
        _demo_mode: true
      });
    }

    try {
      const response = await axios.get(`${TMDB_BASE_URL}/${endpoint}`, {
        params: {
          api_key: TMDB_API_KEY,
          ...queryParams,
        },
      });
      
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Proxy Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({
        error: "Failed to fetch from TMDB",
        details: error.response?.data || error.message,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const os = await import('os');
  
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running locally at:  http://localhost:${PORT}`);
    
    // Print network interfaces
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        if (iface.family === 'IPv4' && !iface.internal) {
          console.log(`Server running on network: http://${iface.address}:${PORT}`);
        }
      }
    }
  });
}

startServer();
