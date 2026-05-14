/**
 * AI Service for SakharPuda ChatBot
 * Handles free-text queries using AI model integration with tool calling for database access.
 */

import { supabase } from '../config/supabaseClient';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

/**
 * Database Tool Functions
 */
const appTools = {
  async get_app_stats() {
    try {
      const { count: totalUsers, error: err1 } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      const { count: verifiedUsers, error: err2 } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('admin_verified', true);

      if (err1 || err2) throw err1 || err2;

      return {
        total_registered_users: totalUsers || 0,
        verified_profiles: verifiedUsers || 0,
        platform_status: "Active & 100% Free",
        success_stories_count: "Many (Growing daily)"
      };
    } catch (error) {
      return { error: "Could not fetch stats: " + error.message };
    }
  },

  async get_profile_counts(args) {
    try {
      let query = supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      if (args.city) query = query.ilike('city', `%${args.city}%`);
      if (args.religion) query = query.ilike('religion', `%${args.religion}%`);
      if (args.caste) query = query.ilike('caste', `%${args.caste}%`);
      if (args.gender) query = query.eq('gender', args.gender.toLowerCase());

      const { count, error } = await query;
      if (error) throw error;

      return {
        matching_profiles_count: count || 0,
        criteria: args
      };
    } catch (error) {
      return { error: "Search failed: " + error.message };
    }
  }
};

export const aiService = {
  /**
   * Gets a response from the AI model or falls back to local knowledge base
   */
  async getChatResponse(query) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
      return this.getLocalResponse(query);
    }

    try {
      const systemPrompt = `You are the official AI assistant for SakharPuda.com, a premium and 100% free matrimony platform. 
      Context about SakharPuda:
      - Pricing: 100% free for standard features (no hidden charges, no expiration).
      - Photo Limit: Exactly 3 photos (1 primary, 2 additional). Photos are manually approved by admins.
      - 10-Step Registration Process: 1.Profile For, 2.Name, 3.Religion/Caste, 4.DOB (18+), 5.Location, 6.Marital Status, 7.Education, 8.Profession, 9.Photos, 10.Contact/Security.
      - Manual Verification: Every profile is manually screened by SakharPuda admins.
      - Exclusive Service: Personalized matchmaking with a Relationship Manager.
      - You can fetch real-time stats and profile counts from our database using tools.
      
      Respond professionally. If the user asks for numbers or statistics, ALWAYS use the provided tools.`;

      const contents = [
        {
          role: "user",
          parts: [{ text: systemPrompt + "\n\nUser question: " + query }]
        }
      ];

      const tools = [{
        function_declarations: [
          {
            name: "get_app_stats",
            description: "Get general statistics about the application like total registered users and verified profiles count.",
          },
          {
            name: "get_profile_counts",
            description: "Get counts of profiles matching specific criteria like city, religion, caste, or gender.",
            parameters: {
              type: "OBJECT",
              properties: {
                city: { type: "STRING", description: "The city to search in (e.g. Pune, Mumbai, Nashik)" },
                religion: { type: "STRING", description: "The religion (e.g. Hindu, Muslim, Buddhist)" },
                caste: { type: "STRING", description: "The caste (e.g. Maratha, Brahmin, Mali)" },
                gender: { type: "STRING", enum: ["male", "female"], description: "The gender" }
              }
            }
          }
        ]
      }];

      // 1. Initial Call to AI
      let response = await this.callGeminiAPI(contents, tools);
      let data = await response.json();

      // 2. Check for Tool Call
      const candidate = data.candidates?.[0];
      const part = candidate?.content?.parts?.[0];

      if (part?.functionCall) {
        const { name, args } = part.functionCall;
        const toolResult = await appTools[name](args);

        // 3. Send tool result back to AI
        contents.push(candidate.content); // Add model's tool call message
        contents.push({
          role: "function",
          parts: [{
            functionResponse: {
              name: name,
              response: toolResult
            }
          }]
        });

        response = await this.callGeminiAPI(contents, tools);
        data = await response.json();
      }

      const finalContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (finalContent) return finalContent;
      
      throw new Error('Invalid AI response');
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getLocalResponse(query);
    }
  },

  async callGeminiAPI(contents, tools) {
    return fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, tools })
      }
    );
  },

  getLocalResponse(query) {
    const q = query.toLowerCase();
    return new Promise((resolve) => {
      setTimeout(() => {
        if (q.includes('sakharpuda') || q.includes('what is this')) {
          resolve("SakharPuda is a premium, 100% free matrimony platform designed for modern match-seekers in India.");
        } else if (q.includes('free') || q.includes('cost') || q.includes('charge')) {
          resolve("SakharPuda.com is completely free! All features have no charges and never expire.");
        } else if (q.includes('registration') || q.includes('steps') || q.includes('how it works')) {
          resolve("Registration is a detailed 10-step process. After signup, our admins manually verify your profile for safety.");
        } else if (q.includes('how many') || q.includes('count') || q.includes('stats')) {
          resolve("I'm having trouble accessing my database brain right now, but we have thousands of active, verified profiles. You can search them in the 'Search' tab!");
        } else if (q.includes('photo') || q.includes('upload')) {
          resolve("You can upload a maximum of 3 photos (1 primary and 2 additional) to your profile.");
        } else if (q.includes('hi') || q.includes('hello')) {
          resolve("Hello! I'm your SakharPuda Assistant. How can I help you find your perfect life partner today?");
        } else {
          resolve("I'm still learning! While I can't check the database right now, I can help with registration, safety, or searching for matches. You can also contact our support at +91 91589 98226.");
        }
      }, 800);
    });
  }
};
