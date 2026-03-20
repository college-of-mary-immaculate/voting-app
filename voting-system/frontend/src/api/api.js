const API_URL = "http://localhost:3000";
const token = () => localStorage.getItem("token");

//////////////////////////////////////////
// GLOBAL FETCH HANDLER (SAFE)
//////////////////////////////////////////

const handleJSON = async (res) => {
  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("Invalid JSON response");
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

//////////////////////////////////////////
// AUTH
//////////////////////////////////////////

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleJSON(res);
};

export const register = async (name, email, password) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleJSON(res);
};

//////////////////////////////////////////
// PUBLIC APIs
//////////////////////////////////////////

export const getElections = async () => {
  const res = await fetch(`${API_URL}/api/elections`);
  return handleJSON(res);
};

export const getCandidatesByElection = async (electionId) => {
  const res = await fetch(`${API_URL}/api/elections/${electionId}/candidates`);
  return handleJSON(res);
};

export const getResults = async (electionId) => {
  const res = await fetch(`${API_URL}/api/results/${electionId}`);
  return handleJSON(res);
};

//////////////////////////////////////////
// USER ACTIONS
//////////////////////////////////////////

export const voteCandidate = async (candidate_id, election_id) => {
  const res = await fetch(`${API_URL}/api/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ candidate_id, election_id }),
  });

  return handleJSON(res);
};

export const checkVote = async (electionId) => {
  const res = await fetch(`${API_URL}/api/vote/check/${electionId}`, {
    headers: { Authorization: `Bearer ${token()}` },
  });

  return handleJSON(res);
};

//////////////////////////////////////////
// ADMIN ELECTION APIs
//////////////////////////////////////////

export const getAdminElections = async () => {
  const res = await fetch(`${API_URL}/api/admin/elections`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return handleJSON(res);
};

export const addElection = async ({ title, start_date, end_date, description = "" }) => {
  const res = await fetch(`${API_URL}/api/admin/elections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ title, start_date, end_date, description }),
  });

  return handleJSON(res);
};

export const updateElection = async (id, { title, start_date, end_date, description = "" }) => {
  const res = await fetch(`${API_URL}/api/admin/elections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ title, start_date, end_date, description }),
  });

  return handleJSON(res);
};

export const deleteElection = async (id) => {
  const res = await fetch(`${API_URL}/api/admin/elections/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  });

  return handleJSON(res);
};

export const startElectionNow = async (id, start_date) => {
  const res = await fetch(`${API_URL}/api/admin/elections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ start_date }),
  });

  return handleJSON(res);
};

export const endElectionNow = async (id, end_date) => {
  const res = await fetch(`${API_URL}/api/admin/elections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ end_date }),
  });

  return handleJSON(res);
};

//////////////////////////////////////////
// ADMIN CANDIDATE APIs
//////////////////////////////////////////

export const addCandidate = async ({ name, party, election_id, position_id, photo }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("party", party);
  formData.append("election_id", election_id);
  formData.append("position_id", position_id);
  if (photo) formData.append("photo", photo);

  const res = await fetch(`${API_URL}/api/admin/candidates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  });

  return handleJSON(res);
};

export const updateCandidate = async (id, { name, party, election_id, position_id, photo }) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("party", party);
  formData.append("election_id", election_id);
  formData.append("position_id", position_id);
  if (photo) formData.append("photo", photo);

  const res = await fetch(`${API_URL}/api/admin/candidates/${id}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token()}` },
    body: formData,
  });

  return handleJSON(res);
};

export const deleteCandidate = async (id) => {
  const res = await fetch(`${API_URL}/api/admin/candidates/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  });

  return handleJSON(res);
};

//////////////////////////////////////////
// ADMIN POSITION APIs
//////////////////////////////////////////

export const getPositions = async () => {
  const res = await fetch(`${API_URL}/api/admin/positions`, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  return handleJSON(res);
};

export const addPosition = async ({ name, election_id }) => {
  const res = await fetch(`${API_URL}/api/admin/positions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ name, election_id }),
  });

  return handleJSON(res);
};

export const updatePosition = async (id, { name, election_id }) => {
  const res = await fetch(`${API_URL}/api/admin/positions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token()}`,
    },
    body: JSON.stringify({ name, election_id }),
  });

  return handleJSON(res);
};

export const deletePosition = async (id) => {
  const res = await fetch(`${API_URL}/api/admin/positions/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token()}` },
  });

  return handleJSON(res);
};

//////////////////////////////////////////
// VOTE PAGE HELPERS
//////////////////////////////////////////

export const getElectionData = async (electionId) => {
  const [candidates, voteData] = await Promise.all([
    getCandidatesByElection(electionId),
    checkVote(electionId),
  ]);

  const voteMap = {};

  if (voteData && Array.isArray(voteData.votedPositions)) {
    voteData.votedPositions.forEach(id => {
      voteMap[id] = id;
    });
  }

  return {
    candidates: candidates || [],
    votedPositions: voteMap,
  };
};

export const getElectionStatus = (start, end) => {
  const now = new Date();
  const startD = new Date(start);
  const endD = new Date(end);

  if (now < startD) return "Upcoming";
  if (now >= startD && now <= endD) return "Ongoing";
  if (now > endD) return "Ended";
  return "Unknown";
};