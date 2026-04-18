import { request } from './api'

export function getLeads(token, status = null) {
  const query = status ? `?status=${status}` : ''
  return request('GET', `/leads${query}`, null, token)
}

export function createLead(data, token) {
  return request('POST', '/leads', data, token)
}

export function updateLead(id, data, token) {
  return request('PUT', `/leads/${id}`, data, token)
}

export function deleteLead(id, token) {
  return request('DELETE', `/leads/${id}`, null, token)
}

export function updateLeadStatus(id, status, token) {
  return request('PUT', `/leads/${id}/status`, { status }, token)
}

export function getLeadStats(token) {
  return request('GET', '/leads/stats', null, token)
}

export function getMessages(leadId, token) {
  return request('GET', `/leads/${leadId}/messages`, null, token)
}

export function addMessage(leadId, content, token) {
  return request('POST', `/leads/${leadId}/messages`, { content }, token)
}

export function getFollowups(leadId, token) {
  return request('GET', `/leads/${leadId}/followups`, null, token)
}

export function createFollowup(leadId, scheduled_at, token) {
  return request('POST', `/leads/${leadId}/followups`, { scheduled_at }, token)
}

export function updateFollowup(leadId, fId, data, token) {
  return request('PUT', `/leads/${leadId}/followups/${fId}`, data, token)
}