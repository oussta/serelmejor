// Path: frontend/src/services/stockService.js

const API = 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('token')
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  }
}

// ── Products ──────────────────────────────────────────────

export async function getProducts() {
  const res = await fetch(`${API}/products`, { headers: headers() })
  if (!res.ok) throw new Error('Error obteniendo productos')
  return res.json()
}

export async function getLowStockProducts() {
  const res = await fetch(`${API}/products/low-stock`, { headers: headers() })
  if (!res.ok) throw new Error('Error obteniendo productos con stock bajo')
  return res.json()
}

export async function getProduct(id) {
  const res = await fetch(`${API}/products/${id}`, { headers: headers() })
  if (!res.ok) throw new Error('Producto no encontrado')
  return res.json()
}

export async function createProduct(data) {
  const res = await fetch(`${API}/products`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error creando producto')
  return json
}

export async function updateProduct(id, data) {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error actualizando producto')
  return json
}

export async function deleteProduct(id) {
  const res = await fetch(`${API}/products/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error eliminando producto')
  return json
}

export async function registerSale(id, quantity, note = '') {
  const res = await fetch(`${API}/products/${id}/sale`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ quantity, note }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error registrando venta')
  return json
}

export async function registerRestock(id, quantity, note = '') {
  const res = await fetch(`${API}/products/${id}/restock`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ quantity, note }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error registrando restock')
  return json
}

export async function getMovements(id) {
  const res = await fetch(`${API}/products/${id}/movements`, { headers: headers() })
  if (!res.ok) throw new Error('Error obteniendo movimientos')
  return res.json()
}

// ── Suppliers ─────────────────────────────────────────────

export async function getSuppliers() {
  const res = await fetch(`${API}/suppliers`, { headers: headers() })
  if (!res.ok) throw new Error('Error obteniendo proveedores')
  return res.json()
}

export async function getSupplier(id) {
  const res = await fetch(`${API}/suppliers/${id}`, { headers: headers() })
  if (!res.ok) throw new Error('Proveedor no encontrado')
  return res.json()
}

export async function createSupplier(data) {
  const res = await fetch(`${API}/suppliers`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error creando proveedor')
  return json
}

export async function updateSupplier(id, data) {
  const res = await fetch(`${API}/suppliers/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error actualizando proveedor')
  return json
}

export async function deleteSupplier(id) {
  const res = await fetch(`${API}/suppliers/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error eliminando proveedor')
  return json
}

// ── Orders ────────────────────────────────────────────────

export async function getOrders() {
  const res = await fetch(`${API}/orders`, { headers: headers() })
  if (!res.ok) throw new Error('Error obteniendo pedidos')
  return res.json()
}

export async function getOrder(id) {
  const res = await fetch(`${API}/orders/${id}`, { headers: headers() })
  if (!res.ok) throw new Error('Pedido no encontrado')
  return res.json()
}

export async function createOrder(data) {
  const res = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error creando pedido')
  return json
}

export async function deleteOrder(id) {
  const res = await fetch(`${API}/orders/${id}`, {
    method: 'DELETE',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error eliminando pedido')
  return json
}

export async function sendOrder(id) {
  const res = await fetch(`${API}/orders/${id}/send`, {
    method: 'POST',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error enviando pedido')
  return json
}

export async function confirmOrder(id) {
  const res = await fetch(`${API}/orders/${id}/confirm`, {
    method: 'PUT',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error confirmando pedido')
  return json
}

export async function deliverOrder(id) {
  const res = await fetch(`${API}/orders/${id}/deliver`, {
    method: 'PUT',
    headers: headers(),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Error marcando pedido como entregado')
  return json
}