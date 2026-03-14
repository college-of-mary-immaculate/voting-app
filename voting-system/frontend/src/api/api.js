const API_URL = "http://localhost:3000";

//////////////////////////////////////////
// AUTH
//////////////////////////////////////////

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const register = async (name, email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
};

//////////////////////////////////////////
// PUBLIC APIs (NO TOKEN)
//////////////////////////////////////////

export const getElections = async () => {
  const res = await fetch(`${API_URL}/api/elections`);
  if (!res.ok) throw new Error(`Failed to fetch elections: ${res.status}`);
  return res.json();
};

export const getCandidatesByElection = async (electionId) => {
  const res = await fetch(`${API_URL}/api/elections/${electionId}/candidates`);
  if (!res.ok) throw new Error(`Failed to fetch candidates: ${res.status}`);
  return res.json();
};

export const getResults = async (electionId) => {
  const res = await fetch(`${API_URL}/api/results/${electionId}`);
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
};

//////////////////////////////////////////
// USER ACTIONS (TOKEN REQUIRED)
//////////////////////////////////////////

export const voteCandidate = async (candidate_id, election_id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ candidate_id, election_id }),
  });

  return res.json();
};

//////////////////////////////////////////
// CHECK IF USER ALREADY VOTED
//////////////////////////////////////////

export const checkVote = async (electionId) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/vote/check/${electionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to check vote");

  return res.json();
};

//////////////////////////////////////////
// ADMIN APIs (TOKEN REQUIRED)
//////////////////////////////////////////

export const getAdminElections = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/admin/elections`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error(`Failed to fetch elections: ${res.status}`);
  return res.json();
};