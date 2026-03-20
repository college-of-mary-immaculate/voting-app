const API_URL = "/api";

//////////////////////////////////////////
// Helpers
//////////////////////////////////////////
const getToken = () => localStorage.getItem("token");

const getHeaders = (isJson = true) => {
  const headers = {};
  if (isJson) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return headers;
};

const request = async (url, options = {}, isJson = true) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(isJson),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

//////////////////////////////////////////
// AUTH
//////////////////////////////////////////
export const login = (email, password) =>
  request(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const register = (name, email, password) =>
  request(`${API_URL}/auth/register`, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

//////////////////////////////////////////
// PUBLIC
//////////////////////////////////////////
export const getElections = () =>
  request(`${API_URL}/elections`, { method: "GET" }, false);

export const getCandidatesByElection = (id) =>
  request(`${API_URL}/elections/${id}/candidates`, { method: "GET" }, false);

export const getResults = (id) =>
  request(`${API_URL}/results/${id}`, { method: "GET" }, false);

//////////////////////////////////////////
// VOTING
//////////////////////////////////////////
export const voteCandidate = (candidate_id, election_id) =>
  request(`${API_URL}/vote`, {
    method: "POST",
    body: JSON.stringify({ candidate_id, election_id }),
  });

export const checkVote = (electionId) =>
  request(`${API_URL}/vote/check/${electionId}`, { method: "GET" });

//////////////////////////////////////////
// ADMIN - ELECTIONS
//////////////////////////////////////////
export const getAdminElections = () =>
  request(`${API_URL}/admin/elections`, { method: "GET" }, false);

export const createElection = (data) =>
  request(`${API_URL}/admin/elections`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateElection = (id, data) =>
  request(`${API_URL}/admin/elections/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteElection = (id) =>
  request(`${API_URL}/admin/elections/${id}`, { method: "DELETE" });

export const startElection = (id) =>
  request(`${API_URL}/admin/elections/${id}/start`, { method: "PUT" });

export const endElection = (id) =>
  request(`${API_URL}/admin/elections/${id}/end`, { method: "PUT" });

//////////////////////////////////////////
// ADMIN - POSITIONS
//////////////////////////////////////////
export const getPositions = () =>
  request(`${API_URL}/admin/positions`, { method: "GET" }, false);

// Backward-compatible alias for AdminDashboard
export const getAdminPositions = getPositions;

export const createPosition = (data) =>
  request(`${API_URL}/admin/positions`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updatePosition = (id, data) =>
  request(`${API_URL}/admin/positions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletePosition = (id) =>
  request(`${API_URL}/admin/positions/${id}`, { method: "DELETE" });

//////////////////////////////////////////
// ADMIN - CANDIDATES
//////////////////////////////////////////
export const getCandidates = () =>
  request(`${API_URL}/admin/candidates`, { method: "GET" }, false);

// Backward-compatible alias for AdminDashboard
export const getAdminCandidates = getCandidates;

export const createCandidate = (formData) =>
  request(`${API_URL}/admin/candidates`, {
    method: "POST",
    body: formData,
  }, false);

export const updateCandidate = (id, formData) =>
  request(`${API_URL}/admin/candidates/${id}`, {
    method: "PUT",
    body: formData,
  }, false);

export const deleteCandidate = (id) =>
  request(`${API_URL}/admin/candidates/${id}`, { method: "DELETE" });