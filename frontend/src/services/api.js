const API_URL = 'http://localhost:8000'

export async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' }
  
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const res = await fetch(`${API_URL}${path}`, options)
  const data = await res.json()

  if (!res.ok) throw new Error(data.error || 'Something went wrong')

  return data
}