import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI", e);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  app.post("/api/chat", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { history, message, fileData, mimeType, stream } = req.body;
      
      const formattedHistory = history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        history: formattedHistory,
        config: {
          systemInstruction: "You are an AI Career Mentor. Provide career guidance, study help, resume reviews, interview help, coding help, project suggestions, learning roadmaps, internship advice, and scholarship advice. Format responses using Markdown. Keep it professional, helpful, and structured."
        }
      });

      const parts: any[] = [];
      if (message) {
          parts.push(message);
      }
      if (fileData && mimeType) {
          const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
          parts.push({
              inlineData: {
                  data: base64Data,
                  mimeType
              }
          });
      }
      
      if (stream) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        const responseStream = await chat.sendMessageStream({ message: parts.length > 0 ? parts : "Hello" });
        for await (const chunk of responseStream) {
          res.write(chunk.text);
        }
        res.end();
      } else {
        const response = await chat.sendMessage({ message: parts.length > 0 ? parts : "Hello" });
        res.json({ text: response.text });
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to process chat message" });
      } else {
        res.end();
      }
    }
  });

  app.post("/api/generate-plan", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { subjects, examDates, studyHours, difficulty, priority } = req.body;
      
      const prompt = `You are an AI Study Planner. Create a realistic and highly optimized study plan in strictly JSON format based on the following student inputs.

Subjects to study: ${subjects}
Upcoming Exam Dates: ${examDates}
Available Study Hours per day: ${studyHours}
Self-Rated Difficulty for subjects: ${difficulty}
Priority Goals: ${priority}

Generate a JSON object matching exactly this schema, with realistic suggestions. Provide 3-5 daily schedule items.
{
  "dailySchedule": [
    { "time": "09:00 AM", "task": "Math Revision - Integration", "type": "study", "duration": "1h" },
    { "time": "10:00 AM", "task": "Short Break", "type": "break", "duration": "15m" }
  ],
  "weeklyGoals": ["Complete Calculus Chapter 1-3", "Physics Mock Test"],
  "revisionPlan": "Focus heavily on Math as it was marked high difficulty. Do practice problems.",
  "pomodoro": "Use 4 sessions of 25m focus followed by 5m break. Take a 30m break after 4 sessions."
}

Do not include markdown tags like \`\`\`json. Output ONLY valid JSON.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      let responseText = response.text || "{}";
      
      // Cleanup markdown json block if any
      if (responseText.startsWith("\`\`\`json")) {
        responseText = responseText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      }
      if (responseText.startsWith("\`\`\`")) {
        responseText = responseText.replace(/\`\`\`/g, "").trim();
      }

      const plan = JSON.parse(responseText);
      res.json(plan);
    } catch (error) {
      console.error("AI Error:", error);
      res.status(500).json({ error: "Failed to generate study plan" });
    }
  });

  app.post("/api/summarize", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { fileData, mimeType, type } = req.body;
      
      let systemPrompt = "You are an AI Study Assistant. ";
      if (type === "Summary") systemPrompt += "Summarize the provided notes concisely. Use markdown headers and bullet points.";
      else if (type === "Flashcards") systemPrompt += "Create a set of flashcards from the provided notes. Format them as Q: [Question] \\n A: [Answer].";
      else if (type === "Mind Map") systemPrompt += "Generate a text-based mind map representing the core concepts of the provided notes using markdown lists (nested bullets) to show relationships.";
      else if (type === "Important Questions") systemPrompt += "Extract the most important questions (both short and long answer) a student should study for an exam based on these notes.";
      else if (type === "Revision Notes") systemPrompt += "Create quick revision notes (cheat sheet style) capturing key formulas, definitions, and facts from the notes.";
      else systemPrompt += "Analyze the provided notes.";

      const parts: any[] = [{ text: systemPrompt }];
      
      if (fileData && mimeType) {
          const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
          parts.push({
              inlineData: {
                  data: base64Data,
                  mimeType
              }
          });
      } else {
         return res.status(400).json({ error: "File data is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: parts,
      });

      res.json({ text: response.text });
    } catch (error) {
      console.error("AI Summarizer Error:", error);
      res.status(500).json({ error: "Failed to process notes" });
    }
  });

  app.post("/api/generate-quiz", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { fileData, mimeType, difficulty, questionTypes, questionCount } = req.body;
      
      const systemPrompt = `You are an AI Quiz Generator. Create a quiz based on the provided notes.
Difficulty: ${difficulty}
Question Types to include: ${questionTypes.join(', ')}
Number of questions: ${questionCount}

Return ONLY valid JSON matching this exact schema:
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq", // or "true_false", "fill_blank", "short_answer" depending on requested types
      "question": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"], // Only for mcq and true_false
      "answer": "Correct Option Text or specific short answer text",
      "explanation": "Why this is correct...",
      "topic": "Specific subtopic this question relates to"
    }
  ]
}

Do not include markdown tags like \`\`\`json. Output ONLY raw valid JSON.`;

      const parts: any[] = [{ text: systemPrompt }];
      
      if (fileData && mimeType) {
          const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
          parts.push({
              inlineData: {
                  data: base64Data,
                  mimeType
              }
          });
      } else {
         return res.status(400).json({ error: "File data is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: parts,
      });

      let responseText = response.text || "{}";
      
      // Cleanup markdown json block if any
      if (responseText.startsWith("\`\`\`json")) {
        responseText = responseText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      }
      if (responseText.startsWith("\`\`\`")) {
        responseText = responseText.replace(/\`\`\`/g, "").trim();
      }

      const quiz = JSON.parse(responseText);
      res.json(quiz);
    } catch (error) {
      console.error("AI Quiz Generator Error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  app.post("/api/predict-assignment", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { subject, description, priority, deadline } = req.body;
      
      const systemPrompt = `You are an AI Assignment Predictor. Analyze this assignment and return ONLY valid JSON matching this schema. No markdown formatting.
{
  "completionTime": "e.g. 2 hours",
  "urgency": "High/Medium/Low based on deadline and priority",
  "bestTime": "e.g. Tomorrow morning, This weekend"
}

Assignment details:
Subject: ${subject}
Description: ${description}
Priority: ${priority}
Deadline: ${deadline}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: systemPrompt }],
      });

      let responseText = response.text || "{}";
      if (responseText.startsWith("\`\`\`json")) {
        responseText = responseText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      }
      if (responseText.startsWith("\`\`\`")) {
        responseText = responseText.replace(/\`\`\`/g, "").trim();
      }

      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("AI Predict Error:", error);
      res.status(500).json({ error: "Failed to predict" });
    }
  });

  app.post("/api/exam-plan", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { subject, date, syllabus } = req.body;
      
      const systemPrompt = `You are an AI Exam Assistant. Create a detailed revision plan based on the exam details and syllabus.
Return ONLY valid JSON matching this schema. No markdown formatting.
{
  "highWeightageTopics": ["Topic 1", "Topic 2", "Topic 3"],
  "dailyGoals": [
    { "day": 1, "task": "Study Topic 1" },
    { "day": 2, "task": "Practice questions" }
  ],
  "mockTestTopics": ["Topic 1 and 2 integration", "Full syllabus overview"],
  "confidenceScore": 85
}

Exam details:
Subject: ${subject}
Date: ${date}
Syllabus: ${syllabus}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ text: systemPrompt }],
      });

      let responseText = response.text || "{}";
      if (responseText.startsWith("\`\`\`json")) {
        responseText = responseText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
      }
      if (responseText.startsWith("\`\`\`")) {
        responseText = responseText.replace(/\`\`\`/g, "").trim();
      }

      res.json(JSON.parse(responseText));
    } catch (error) {
      console.error("AI Exam Plan Error:", error);
      res.status(500).json({ error: "Failed to generate exam plan" });
    }
  });

  // AI Resume Enhancement Route
  app.post('/api/resume/enhance', async (req, res) => {
    try {
      const { field, data, id } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      let prompt = '';
      let targetText = '';

      if (field === 'summary') {
        targetText = data.summary;
        prompt = `You are an expert resume writer and career coach. Review the following professional summary and rewrite it to be highly professional, impactful, and ATS-friendly. Make it concise (2-3 sentences), highlighting key skills and career goals. Do NOT invent new skills, but phrase the existing ones powerfully.\n\nOriginal Summary:\n${targetText}\n\nProvide ONLY the rewritten summary text, with no additional commentary, markdown formatting, or introductory phrases.`;
      } else if (field === 'experience') {
        const exp = data.experience.find((e: any) => e.id === id);
        if (!exp) return res.status(404).json({ error: 'Experience not found' });
        targetText = exp.description;
        prompt = `You are an expert resume writer. Transform the following raw job responsibilities into 2-3 powerful, ATS-friendly bullet points using the STAR method (Situation, Task, Action, Result) where possible. Use strong action verbs.\n\nRole: ${exp.role} at ${exp.company}\nOriginal Description:\n${targetText}\n\nProvide ONLY the rewritten bullet points, formatted as a markdown list (using '-' for bullets). Do not include introductory text.`;
      } else if (field === 'projects') {
        const proj = data.projects.find((p: any) => p.id === id);
        if (!proj) return res.status(404).json({ error: 'Project not found' });
        targetText = proj.description;
        prompt = `You are an expert resume writer. Transform the following project description into 1-2 powerful, ATS-friendly bullet points. Highlight the technologies used (${proj.tech}) and the impact or result.\n\nProject Name: ${proj.name}\nOriginal Description:\n${targetText}\n\nProvide ONLY the rewritten bullet points, formatted as a markdown list (using '-' for bullets). Do not include introductory text.`;
      } else {
        return res.status(400).json({ error: 'Invalid field for enhancement' });
      }

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const enhancedText = response.text?.trim() || targetText;

      res.json({ enhancedText });
    } catch (error: any) {
      console.error('AI Enhancement Error:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  });

  // AI Career Roadmap Generation Route
  app.post('/api/roadmap/generate', async (req, res) => {
    try {
      const { currentSemester, currentSkills, dreamCareer } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert career coach and technical mentor. 
A student needs a career roadmap.
Current Semester/Year: ${currentSemester}
Current Skills: ${currentSkills}
Dream Career: ${dreamCareer}

Generate a comprehensive roadmap to help them achieve this dream career. 
Be realistic and specific.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          roadmap: {
            type: Type.ARRAY,
            description: "A chronological list of phases (e.g., quarters, semesters, or months) to reach the goal.",
            items: {
              type: Type.OBJECT,
              properties: {
                phaseName: { type: Type.STRING, description: "E.g., Month 1-2, or Current Semester" },
                focusArea: { type: Type.STRING, description: "The main theme of this phase" },
                goals: { type: Type.ARRAY, items: { type: Type.STRING } },
                resources: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["phaseName", "focusArea", "goals", "resources"]
            }
          },
          requiredSkills: {
            type: Type.ARRAY,
            description: "List of key skills required for this career",
            items: { type: Type.STRING }
          },
          recommendedProjects: {
            type: Type.ARRAY,
            description: "2-3 highly relevant portfolio projects",
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                skillsToUse: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "description", "skillsToUse"]
            }
          },
          certifications: {
            type: Type.ARRAY,
            description: "Recommended industry certifications",
            items: { type: Type.STRING }
          },
          interviewPrep: {
            type: Type.ARRAY,
            description: "Actionable steps for interview preparation for this specific role",
            items: { type: Type.STRING }
          }
        },
        required: ["roadmap", "requiredSkills", "recommendedProjects", "certifications", "interviewPrep"]
      };

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });

      const roadmapData = JSON.parse(response.text || '{}');
      res.json(roadmapData);
    } catch (error: any) {
      console.error('AI Roadmap Error:', error);
      res.status(500).json({ error: 'Failed to generate roadmap' });
    }
  });

  // AI Skill Gap Analysis Route
  app.post('/api/skills/analyze', async (req, res) => {
    try {
      const { targetJob, currentSkills } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert technical recruiter and career coach.
A candidate wants to become a: ${targetJob}
Their current skills are: ${currentSkills}

Analyze the gap between their current skills and the industry requirements for the target job.
Provide a structured analysis.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          skillGapPercentage: { 
            type: Type.INTEGER, 
            description: "An estimated percentage (0-100) representing how much of a gap exists. 100% means completely unprepared, 0% means perfectly ready." 
          },
          requiredSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of all core skills required for this job"
          },
          missingSkills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of skills the candidate is missing based on their current skills"
          },
          radarData: {
            type: Type.ARRAY,
            description: "Data for a radar chart comparing current vs required proficiency (1-10 scale) in key skill categories (e.g., Frontend, Backend, Tools, Soft Skills).",
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "Category name" },
                current: { type: Type.INTEGER, description: "Current proficiency (0-10)" },
                required: { type: Type.INTEGER, description: "Required proficiency (0-10)" }
              },
              required: ["subject", "current", "required"]
            }
          },
          recommendations: {
            type: Type.ARRAY,
            description: "Prioritized learning recommendations",
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                priority: { type: Type.STRING, description: "High, Medium, or Low" },
                estimatedTime: { type: Type.STRING, description: "E.g., 2 weeks, 1 month" },
                reason: { type: Type.STRING }
              },
              required: ["skill", "priority", "estimatedTime", "reason"]
            }
          }
        },
        required: ["skillGapPercentage", "requiredSkills", "missingSkills", "radarData", "recommendations"]
      };

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });

      const analysisData = JSON.parse(response.text || '{}');
      res.json(analysisData);
    } catch (error: any) {
      console.error('AI Skill Gap Error:', error);
      res.status(500).json({ error: 'Failed to analyze skill gap' });
    }
  });

  // AI Internship Match Route
  app.post('/api/internships/match', async (req, res) => {
    try {
      const { skills, projects, semester, interests } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert career advisor and technical recruiter. 
A student is looking for internship recommendations based on their profile.
Current Semester: ${semester}
Skills: ${skills}
Projects: ${projects}
Interests: ${interests}

Generate 4-5 realistic, tailored internship roles/opportunities that would be a great fit for this student. Invent plausible company names and roles that match their profile.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          recommendations: {
            type: Type.ARRAY,
            description: "List of recommended internships",
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                eligibility: { type: Type.STRING, description: "e.g. Juniors/Seniors, Must have portfolio" },
                requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                applicationDeadline: { type: Type.STRING, description: "e.g. Fall 2026, Rolling" },
                difficulty: { type: Type.STRING, description: "Low, Medium, High" },
                matchPercentage: { type: Type.INTEGER, description: "0-100 score" },
                description: { type: Type.STRING, description: "Brief overview of the role and why it's a match." }
              },
              required: ["company", "role", "eligibility", "requiredSkills", "applicationDeadline", "difficulty", "matchPercentage", "description"]
            }
          }
        },
        required: ["recommendations"]
      };

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });

      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('AI Internship Match Error:', error);
      res.status(500).json({ error: 'Failed to find internships' });
    }
  });

  // AI Interview Coach Route
  app.post('/api/interview/chat', async (req, res) => {
    try {
      const { role, type, currentQuestion, currentAnswer, isStart } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      if (isStart) {
         const prompt = `You are an expert AI Interviewer conducting a ${type} interview for a ${role} position.
Generate the FIRST interview question. Make it realistic and challenging but appropriate for the role. Do not include any introductory text, just the question itself.`;
         
         const response = await aiInstance.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: prompt,
         });
         return res.json({ nextQuestion: response.text?.trim() });
      }

      const prompt = `You are an expert AI Interviewer conducting a ${type} interview for a ${role} position.
The user just answered the following question:
"${currentQuestion}"

User's Answer:
"${currentAnswer}"

Evaluate this answer. Provide a communication score, confidence score (based on phrasing/hesitation words in text), and grammar score (out of 100).
Provide 2-3 specific improvement tips.
Finally, provide the NEXT interview question to continue the interview.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          evaluation: {
            type: Type.OBJECT,
            properties: {
              communicationScore: { type: Type.INTEGER },
              confidenceScore: { type: Type.INTEGER },
              grammarScore: { type: Type.INTEGER },
              improvementTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              overallFeedback: { type: Type.STRING }
            },
            required: ["communicationScore", "confidenceScore", "grammarScore", "improvementTips", "overallFeedback"]
          },
          nextQuestion: { type: Type.STRING }
        },
        required: ["evaluation", "nextQuestion"]
      };

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('AI Interview Error:', error);
      res.status(500).json({ error: 'Failed to process interview chat' });
    }
  });

  // AI LinkedIn Optimizer Route
  app.post('/api/linkedin/optimize', async (req, res) => {
    try {
      const { profileText } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert LinkedIn profile optimizer and recruiter.
Analyze the following LinkedIn profile details (which may include headline, summary, skills, projects, experience).
Provide a profile score (out of 100), analyze each section, suggest improvements, and generate an optimized version of the profile.

Profile Details:
${profileText}`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          profileScore: { type: Type.INTEGER, description: "Overall profile score (0-100)" },
          analysis: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              experience: { type: Type.STRING },
              skills: { type: Type.STRING }
            }
          },
          improvements: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable improvement tips"
          },
          optimizedProfile: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              experienceText: { type: Type.STRING, description: "Optimized experience/projects section" }
            },
            required: ["headline", "summary", "experienceText"]
          }
        },
        required: ["profileScore", "analysis", "improvements", "optimizedProfile"]
      };

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('AI LinkedIn Error:', error);
      res.status(500).json({ error: 'Failed to process LinkedIn profile' });
    }
  });

  // AI Project Generator Route
  app.post('/api/projects/generate', async (req, res) => {
    try {
      const { technology, difficulty, domain, careerGoal } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key is not configured' });
      }

      const { GoogleGenAI, Type } = await import('@google/genai');
      const aiInstance = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert software architect and career mentor.
A student wants a project idea with the following parameters:
Technology: ${technology}
Difficulty: ${difficulty}
Domain: ${domain}
Career Goal: ${careerGoal}

Generate a comprehensive project specification.`;

      const schema = {
        type: Type.OBJECT,
        properties: {
          projectName: { type: Type.STRING },
          projectIdea: { type: Type.STRING },
          architecture: { type: Type.STRING },
          techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
          timeline: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                week: { type: Type.STRING },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["week", "tasks"]
            }
          },
          githubStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
          deploymentGuide: { type: Type.STRING },
          resumeDescription: { type: Type.ARRAY, items: { type: Type.STRING } },
          portfolioDescription: { type: Type.STRING }
        },
        required: ["projectName", "projectIdea", "architecture", "techStack", "timeline", "githubStructure", "deploymentGuide", "resumeDescription", "portfolioDescription"]
      };

      const response = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 0.7
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (error: any) {
      console.error('AI Project Generator Error:', error);
      res.status(500).json({ error: 'Failed to generate project' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.post("/api/career-copilot", async (req, res) => {
    try {
      if (!ai) {
        return res.status(500).json({ error: "Gemini API key is not configured" });
      }

      const { targetRole, currentSkills, experienceLevel } = req.body;
      
      const prompt = `You are an AI Career Copilot. A user wants to become a: ${targetRole}.
Their current skills: ${currentSkills || 'None specified'}
Experience Level: ${experienceLevel || 'Beginner'}

Analyze their profile and generate a comprehensive career roadmap in strictly JSON format matching this schema:
{
  "currentSkillsAnalysis": ["skill 1", "skill 2"],
  "missingSkills": ["skill 1", "skill 2"],
  "learningRoadmap": [
    { "phase": 1, "title": "Phase Title", "duration": "e.g. 2 months", "description": "What to learn" }
  ],
  "certifications": [
    { "name": "Cert Name", "provider": "Provider Name", "relevance": "Why it helps" }
  ],
  "projects": [
    { "title": "Project Name", "description": "What to build", "techStack": ["tech 1", "tech 2"] }
  ],
  "interviewQuestions": [
    { "question": "Question text", "type": "technical/behavioral", "hint": "How to answer" }
  ],
  "internships": [
    { "title": "Internship Role", "type": "e.g. Summer/Remote", "focus": "Key responsibilities" }
  ],
  "weeklySchedule": [
    { "day": "Monday", "focus": "What to study", "hours": 2 }
  ],
  "readinessScore": 25
}

Return ONLY the raw JSON object, without any markdown formatting, backticks, or additional text. Ensure the readinessScore is an integer between 0 and 100 representing their current estimated readiness for the role.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      let jsonStr = response.text || "{}";
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/, "").replace(/```$/, "").trim();
      } else if (jsonStr.startsWith("```")) {
         jsonStr = jsonStr.replace(/```\n?/, "").replace(/```$/, "").trim();
      }

      const result = JSON.parse(jsonStr);
      res.json(result);
    } catch (error) {
      console.error("Career Copilot API Error:", error);
      res.status(500).json({ error: "Failed to generate career copilot data" });
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
