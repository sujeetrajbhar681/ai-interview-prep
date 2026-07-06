// utils/promptBuilder.js

export const buildQuestionPrompt = (jobRole, difficulty, category, askedBefore = []) => {
  const avoidBlock = askedBefore.length > 0
    ? `\n\nDo NOT repeat any of these already-asked questions:\n${askedBefore
        .map((q, i) => `${i + 1}. ${q}`)
        .join("\n")}`
    : "";

  const categoryGuide = {
    technical:
      "a technical question testing hands-on coding knowledge, algorithms, or technology-specific concepts",
    behavioral:
      "a behavioral question using the STAR format (Situation, Task, Action, Result)",
    situational:
      'a situational "what would you do if..." scenario question',
    "system-design":
      "a system design question about architecture, scalability, or infrastructure",
  };

  const difficultyGuide = {
    easy: "suitable for a junior-level candidate with 0-2 years experience",
    medium: "suitable for a mid-level candidate with 2-5 years experience",
    hard: "suitable for a senior-level candidate with 5+ years experience",
  };

  return `You are an expert technical interviewer conducting a real job interview for a ${jobRole} position.

Generate exactly ONE ${
    categoryGuide[category] || "interview question"
  } that is ${
    difficultyGuide[difficulty] || difficultyGuide.medium
  }.

Rules:
- Ask only the question itself — no preamble, no "Here is a question:", no numbering
- The question should be specific and realistic, not generic
- For technical questions, include relevant technologies used in ${jobRole} roles
- End with a question mark${avoidBlock}

Output only the question text.`;
};

export const buildEvalPrompt = (
  jobRole,
  question,
  answer,
  difficulty,
  category
) => {
  return `You are an expert technical interviewer evaluating a candidate for a ${jobRole} position.

Interview Question:
"${question}"

Candidate's Answer:
"${answer}"

Evaluate the answer and respond with a JSON object in this exact format (no markdown, no code block, raw JSON only):
{"score":<integer 1-10>,"summary":"<2-3 sentence overall assessment>","strengths":["<strength 1>","<strength 2>"],"improvements":["<improvement 1>","<improvement 2>"],"modelAnswer":"<a concise ideal answer in 3-5 sentences>","tips":"<one actionable tip for next time>"}

Scoring guide:
- 1-3: Poor — major gaps, incorrect, or irrelevant
- 4-6: Average — correct basics but missing depth or structure
- 7-8: Good — solid answer with minor gaps
- 9-10: Excellent — comprehensive, well-structured, shows deep knowledge

Adjust expectations for difficulty level: ${difficulty}.
Category context: ${category}.
Be specific and constructive.

Output only the raw JSON, nothing else.`;
};

export const buildResumePrompt = (resumeText, jobRole) => {
  return `Analyse this resume for a ${jobRole} position and respond with JSON only.

RESUME TEXT:
${resumeText.slice(0, 2500)}

YOUR RESPONSE MUST:
1. Start with { character
2. End with } character
3. Contain no text before or after the JSON
4. Use this exact structure:

{"fitScore":7,"summary":"2-3 sentence assessment.","strongPoints":["point 1","point 2","point 3"],"gaps":["gap 1","gap 2"],"suggestedRoles":["role 1","role 2"],"topSkillsFound":["skill 1","skill 2","skill 3"],"missingSkills":["missing 1","missing 2"]}

Rules:
- Give fitScore as an integer from 1 to 10.
- Summary should be 2-3 concise sentences.
- Include 3 strong points.
- Include at least 2 gaps.
- Suggested roles should match the candidate's profile.
- Extract the top skills actually found in the resume.
- Missing skills should be relevant for a ${jobRole} position.

DO NOT write anything before {. DO NOT write anything after }. JSON only.`;
};