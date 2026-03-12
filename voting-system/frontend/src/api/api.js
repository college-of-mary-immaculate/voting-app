const API_URL = "http://localhost:3000";

// LOGIN
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return res.json();
};

// REGISTER
export const register = async (name, email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ name, email, password })
  });

  return res.json();
};

// GET CANDIDATES (PUBLIC)
export const getCandidates = async () => {
  const res = await fetch(`${API_URL}/candidates`);

  if (!res.ok) {
    throw new Error(`Failed to fetch candidates: ${res.status}`);
  }

  return res.json();
};

// VOTE
export const voteCandidate = async (candidate_id, election_id) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      candidate_id,
      election_id
    })
  });

  return res.json();
};

// GET RESULTS
export const getResults = async (electionId) => {
  const res = await fetch(`${API_URL}/api/results/${electionId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch results");
  }

  return res.json();
};

// GET ELECTIONS (ADMIN ROUTE)
export const getElections = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/api/admin/elections`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch elections: ${res.status}`);
  }

  return res.json();
};