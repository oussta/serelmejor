import { request } from './api'

export function login(email, password) {
  return request('POST', '/login', { email, password })
}

export function register(name, email, password, business_name) {
  return request('POST', '/register', { name, email, password, business_name, plan: 'pending' })
}

export function getMe(token) {
  return request('GET', '/me', null, token)
}

export function selectPlan(plan, token) {
  return request('PUT', '/business/subscription', { plan }, token)
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}