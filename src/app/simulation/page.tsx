"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

import {
  clientStatusLabels,
  clientTypeLabels,
  contractTypeLabels,
  getClientStatusBadgeClass,
  getClientTypeBadgeClass,
  getContractBadgeClass,
  getStockBadgeClass,
  stockStatusLabels,
} from "@/lib/badge-styles"
import { formatNumber, formatRupiah } from "@/lib/utils"
import type { Client, ClientStatus, ClientType, ContractType, SKU, SkuCategory, SkuSizeCategory, StockStatus } from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SimClient = Client
type SimSku = SKU

interface ClientFormState {
  name: string
  type: ClientType | ""
  contractType: ContractType | ""
  contactPerson: string
  phone: string
  areaM2: string
  rackLevels: string
  ratePerM2: string
  status: ClientStatus | ""
}

interface SkuFormState {
  clientId: string
  skuCode: string
  name: string
  category: SkuCategory | ""
  unit: string
  stockQty: string
  minStock: string
}

const CLIENTS_KEY = "sim_clients"
const SKUS_KEY = "sim_skus"

const defaultClientForm: ClientFormState = {
  name: "",
  type: "",
  contractType: "reguler",
  contactPerson: "",
  phone: "",
  areaM2: "",
  rackLevels: "3",
  ratePerM2: "38000",
  status: "active",
}

const defaultSkuForm: SkuFormState = {
  clientId: "",
  skuCode: "",
  name: "",
  category: "buku",
  unit: "pcs",
  stockQty: "",
  minStock: "",
}

function getSeedClients(): SimClient[] {
  return [
    {
      id: "c1",
      name: "Tokobuku Nusantara",
      type: "fulfillment",
      contractType: "reguler",
      contactPerson: "Budi Santoso",
      phone: "081234567890",
      address: "-",
      areaM2: 120,
      rackLevels: 3,
      ratePerM2: 38000,
      status: "active",
      joinDate: "2025-05-01",
      contractStart: "2025-05-01",
      contractEnd: "2026-04-30",
      minimumBilling: 5000000,
    },
    {
      id: "c2",
      name: "PT Maju Bersama",
      type: "space",
      contractType: "reguler",
      contactPerson: "Sari Dewi",
      phone: "082345678901",
      address: "-",
      areaM2: 200,
      rackLevels: 3,
      ratePerM2: 38000,
      status: "active",
      joinDate: "2025-05-01",
      contractStart: "2025-05-01",
      contractEnd: "2026-04-30",
      minimumBilling: 0,
    },
    {
      id: "c3",
      name: "Gramedia Wilayah Jatim",
      type: "hybrid",
      contractType: "group",
      contactPerson: "Rudi Hartono",
      phone: "083456789012",
      address: "-",
      areaM2: 180,
      rackLevels: 3,
      ratePerM2: 36000,
      status: "active",
      joinDate: "2025-05-01",
      contractStart: "2025-05-01",
      contractEnd: "2026-12-31",
      minimumBilling: 8000000,
    },
  ]
}

function getSeedSkus(): SimSku[] {
  return [
    {
      id: "s1",
      clientId: "c1",
      skuCode: "BK-001",
      name: "Buku SD Kelas 1",
      category: "buku",
      unit: "pcs",
      stockQty: 2400,
      minStock: 500,
      status: "aman",
      lastUpdated: "2025-05-01",
      weightKg: 0.35,
      dimensionCm3: 1200,
      sizeCategory: "small",
    },
    {
      id: "s2",
      clientId: "c1",
      skuCode: "BK-002",
      name: "Buku SMP IPA",
      category: "buku",
      unit: "pcs",
      stockQty: 850,
      minStock: 800,
      status: "menipis",
      lastUpdated: "2025-05-01",
      weightKg: 0.5,
      dimensionCm3: 1800,
      sizeCategory: "small",
    },
    {
      id: "s3",
      clientId: "c3",
      skuCode: "MD-001",
      name: "Modul Digital SD",
      category: "modul_digital",
      unit: "pcs",
      stockQty: 120,
      minStock: 200,
      status: "kritis",
      lastUpdated: "2025-05-01",
      weightKg: 0.15,
      dimensionCm3: 400,
      sizeCategory: "small",
    },
  ]
}

function calculateSkuStatus(stockQty: number, minStock: number): StockStatus {
  if (stockQty <= minStock * 0.5) {
    return "kritis"
  }

  if (stockQty <= minStock) {
    return "menipis"
  }

  return "aman"
}

// Badge helpers now imported from @/lib/badge-styles

function persistData(clients: SimClient[], skus: SimSku[]) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
  localStorage.setItem(SKUS_KEY, JSON.stringify(skus))
}

export default function SimulationPage() {
  const [clients, setClients] = useState<SimClient[]>([])
  const [skus, setSkus] = useState<SimSku[]>([])
  const [clientForm, setClientForm] = useState<ClientFormState>(defaultClientForm)
  const [skuForm, setSkuForm] = useState<SkuFormState>(defaultSkuForm)
  const [editingClientId, setEditingClientId] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<SimClient | null>(null)

  useEffect(() => {
    const initialClients = localStorage.getItem(CLIENTS_KEY)
    const initialSkus = localStorage.getItem(SKUS_KEY)

    const seededClients = initialClients ? (JSON.parse(initialClients) as SimClient[]) : getSeedClients()
    const seededSkus = initialSkus ? (JSON.parse(initialSkus) as SimSku[]) : getSeedSkus()

    if (!initialClients) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(seededClients))
    }

    if (!initialSkus) {
      localStorage.setItem(SKUS_KEY, JSON.stringify(seededSkus))
    }

    queueMicrotask(() => {
      setClients(seededClients)
      setSkus(seededSkus)
    })
  }, [])

  const clientMap = useMemo(
    () => new Map(clients.map((client) => [client.id, client])),
    [clients]
  )

  const clientStats = {
    total: clients.length,
    active: clients.filter((client) => client.status === "active").length,
    inactive: clients.filter((client) => client.status === "inactive").length,
  }

  const skuStats = {
    total: skus.length,
    aman: skus.filter((sku) => sku.status === "aman").length,
    menipis: skus.filter((sku) => sku.status === "menipis").length,
    kritis: skus.filter((sku) => sku.status === "kritis").length,
  }

  function handleAddClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!clientForm.name.trim() || !clientForm.type || !clientForm.areaM2.trim()) {
      alert("Nama klien, tipe, dan area wajib diisi.")
      return
    }

    const today = new Date().toISOString().slice(0, 10)
    const oneYearLater = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const newClient: SimClient = {
      id: `c${Date.now()}`,
      name: clientForm.name.trim(),
      type: clientForm.type,
      contractType: clientForm.contractType || "reguler",
      contactPerson: clientForm.contactPerson.trim(),
      phone: clientForm.phone.trim(),
      address: "-",
      areaM2: Number(clientForm.areaM2),
      rackLevels: Number(clientForm.rackLevels || "3"),
      ratePerM2: Number(clientForm.ratePerM2 || "38000"),
      status: clientForm.status || "active",
      joinDate: today,
      contractStart: today,
      contractEnd: oneYearLater,
      minimumBilling: clientForm.type === "space" ? 0 : 3000000,
    }

    const nextClients = [...clients, newClient]
    setClients(nextClients)
    persistData(nextClients, skus)
    setClientForm(defaultClientForm)
    alert("Klien baru berhasil ditambahkan.")
  }

  function handleAddSku(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!skuForm.clientId || !skuForm.skuCode.trim() || !skuForm.name.trim() || !skuForm.stockQty.trim() || !skuForm.minStock.trim()) {
      alert("Klien, SKU Code, nama produk, stok awal, dan min. stok wajib diisi.")
      return
    }

    const stockQty = Number(skuForm.stockQty)
    const minStock = Number(skuForm.minStock)

    const newSku: SimSku = {
      id: `s${Date.now()}`,
      clientId: skuForm.clientId,
      skuCode: skuForm.skuCode.trim(),
      name: skuForm.name.trim(),
      category: skuForm.category || "buku",
      unit: skuForm.unit.trim() || "pcs",
      stockQty,
      minStock,
      status: calculateSkuStatus(stockQty, minStock),
      lastUpdated: new Date().toISOString().slice(0, 10),
      weightKg: 0.5,
      dimensionCm3: 1500,
      sizeCategory: "small" as SkuSizeCategory,
    }

    const nextSkus = [...skus, newSku]
    setSkus(nextSkus)
    persistData(clients, nextSkus)
    setSkuForm(defaultSkuForm)
    alert("SKU baru berhasil ditambahkan.")
  }

  function startEditClient(client: SimClient) {
    setEditingClientId(client.id)
    setEditingClient({ ...client })
  }

  function saveEditClient() {
    if (!editingClient) {
      return
    }

    if (!editingClient.name.trim() || !editingClient.type || !editingClient.areaM2) {
      alert("Nama klien, tipe, dan area wajib diisi.")
      return
    }

    const nextClients = clients.map((client) =>
      client.id === editingClient.id ? editingClient : client
    )

    setClients(nextClients)
    persistData(nextClients, skus)
    setEditingClientId(null)
    setEditingClient(null)
  }

  function cancelEditClient() {
    setEditingClientId(null)
    setEditingClient(null)
  }

  function deleteClient(clientId: string) {
    if (!window.confirm("Hapus klien ini?")) {
      return
    }

    const nextClients = clients.filter((client) => client.id !== clientId)
    const nextSkus = skus.filter((sku) => sku.clientId !== clientId)
    setClients(nextClients)
    setSkus(nextSkus)
    persistData(nextClients, nextSkus)
  }

  function updateSkuStock(sku: SimSku) {
    const nextValue = window.prompt("Masukkan stok terbaru:", String(sku.stockQty))

    if (nextValue === null) {
      return
    }

    const numericValue = Number(nextValue)

    if (Number.isNaN(numericValue)) {
      alert("Nilai stok harus berupa angka.")
      return
    }

    const nextSkus = skus.map((item) =>
      item.id === sku.id
        ? {
            ...item,
            stockQty: numericValue,
            status: calculateSkuStatus(numericValue, item.minStock),
            lastUpdated: new Date().toISOString().slice(0, 10),
          }
        : item
    )

    setSkus(nextSkus)
    persistData(clients, nextSkus)
  }

  function deleteSku(skuId: string) {
    if (!window.confirm("Hapus SKU ini?")) {
      return
    }

    const nextSkus = skus.filter((sku) => sku.id !== skuId)
    setSkus(nextSkus)
    persistData(clients, nextSkus)
  }

  function resetSimulationData() {
    if (!window.confirm("Reset semua data ke default?")) {
      return
    }

    const seededClients = getSeedClients()
    const seededSkus = getSeedSkus()

    localStorage.removeItem(CLIENTS_KEY)
    localStorage.removeItem(SKUS_KEY)
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(seededClients))
    localStorage.setItem(SKUS_KEY, JSON.stringify(seededSkus))

    setClients(seededClients)
    setSkus(seededSkus)
    setClientForm(defaultClientForm)
    setSkuForm(defaultSkuForm)
    setEditingClientId(null)
    setEditingClient(null)
  }

  return (
    <section className="space-y-6">
      <div className="space-y-4 animate-fade-in-up">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            <span className="section-dot" />
            Simulation Playground
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Simulasi Data
          </h2>
          <p className="text-sm leading-6 text-slate-600">
            CRUD demo — data tersimpan di localStorage browser
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-xl border-l-4 border-l-orange-500 border border-orange-200/60 bg-gradient-to-r from-orange-50/60 to-white px-4 py-3 text-sm text-orange-800">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>
            Ini adalah halaman simulasi prototype. Data tersimpan di browser dan
            tidak terhubung ke server.
          </p>
        </div>
      </div>

      <Tabs defaultValue="clients" className="gap-6">
        <TabsList variant="default" className="w-fit">
          <TabsTrigger value="clients">Kelola Klien</TabsTrigger>
          <TabsTrigger value="skus">Kelola SKU</TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-200/60 bg-white/80 px-3 py-1 text-slate-700 backdrop-blur-sm">
              Total Klien: {clientStats.total}
            </Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              Aktif: {clientStats.active}
            </Badge>
            <Badge variant="outline" className="border-red-200 bg-red-50 px-3 py-1 text-red-700">
              Tidak Aktif: {clientStats.inactive}
            </Badge>
          </div>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle><span className="section-dot" />Tambah Klien Baru</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleAddClient} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Input
                    placeholder="Nama Klien"
                    value={clientForm.name}
                    onChange={(event) => setClientForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-10 border-slate-200/60 bg-white/60 backdrop-blur-sm"
                  />
                  <Select
                    value={clientForm.type || undefined}
                    onValueChange={(value) => { if (value) setClientForm((prev) => ({ ...prev, type: value as ClientType })) }}
                  >
                    <SelectTrigger className="h-10 w-full border-slate-200/60 bg-white/60 backdrop-blur-sm">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="space">space</SelectItem>
                      <SelectItem value="fulfillment">fulfillment</SelectItem>
                      <SelectItem value="hybrid">hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={clientForm.contractType || undefined}
                    onValueChange={(value) => { if (value) setClientForm((prev) => ({ ...prev, contractType: value as ContractType })) }}
                  >
                    <SelectTrigger className="h-10 w-full border-slate-200/60 bg-white/60 backdrop-blur-sm">
                      <SelectValue placeholder="Pilih Kontrak" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reguler">reguler</SelectItem>
                      <SelectItem value="group">group</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Contact Person"
                    value={clientForm.contactPerson}
                    onChange={(event) => setClientForm((prev) => ({ ...prev, contactPerson: event.target.value }))}
                    className="h-10 border-slate-200/60 bg-white/60 backdrop-blur-sm"
                  />
                  <Input
                    placeholder="Phone"
                    value={clientForm.phone}
                    onChange={(event) => setClientForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="h-10 border-slate-200/60 bg-white/60 backdrop-blur-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Area m²"
                    value={clientForm.areaM2}
                    onChange={(event) => setClientForm((prev) => ({ ...prev, areaM2: event.target.value }))}
                    className="h-10 border-slate-200/60 bg-white/60 backdrop-blur-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Rack Levels"
                    value={clientForm.rackLevels}
                    onChange={(event) => setClientForm((prev) => ({ ...prev, rackLevels: event.target.value }))}
                    className="h-10 border-slate-200/60 bg-white/60 backdrop-blur-sm"
                  />
                  <Input
                    type="number"
                    placeholder="Rate/m²"
                    value={clientForm.ratePerM2}
                    onChange={(event) => setClientForm((prev) => ({ ...prev, ratePerM2: event.target.value }))}
                    className="h-10 border-slate-200/60 bg-white/60 backdrop-blur-sm"
                  />
                  <Select
                    value={clientForm.status || undefined}
                    onValueChange={(value) => { if (value) setClientForm((prev) => ({ ...prev, status: value as ClientStatus })) }}
                  >
                    <SelectTrigger className="h-10 w-full border-slate-200/60 bg-white/60 backdrop-blur-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">active</SelectItem>
                      <SelectItem value="inactive">inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="h-10 w-full cursor-pointer bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700">
                  Tambah Klien
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle><span className="section-dot" />Daftar Klien Simulasi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5 py-3 text-slate-500">Nama</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Tipe</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Kontrak</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Area</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Rate</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Tagihan/Bulan</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                    <TableHead className="px-5 py-3 text-right text-slate-500">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => {
                    const isEditing = editingClientId === client.id && editingClient

                    if (isEditing && editingClient) {
                      return (
                        <TableRow key={client.id} className="border-slate-100/80 bg-blue-50/30">
                          <TableCell className="px-5 py-4">
                            <Input
                              value={editingClient.name}
                              onChange={(event) => setEditingClient({ ...editingClient, name: event.target.value })}
                              className="h-9 border-slate-200/60 bg-white/60"
                            />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Select
                              value={editingClient.type}
                              onValueChange={(value) => { if (value) setEditingClient({ ...editingClient, type: value as ClientType }) }}
                            >
                              <SelectTrigger className="h-9 w-full border-slate-200/60 bg-white/60">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="space">space</SelectItem>
                                <SelectItem value="fulfillment">fulfillment</SelectItem>
                                <SelectItem value="hybrid">hybrid</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Select
                              value={editingClient.contractType}
                              onValueChange={(value) => { if (value) setEditingClient({ ...editingClient, contractType: value as ContractType }) }}
                            >
                              <SelectTrigger className="h-9 w-full border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reguler">reguler</SelectItem>
                                <SelectItem value="group">group</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Input
                              type="number"
                              value={String(editingClient.areaM2)}
                              onChange={(event) => setEditingClient({ ...editingClient, areaM2: Number(event.target.value) })}
                              className="h-9 border-slate-200"
                            />
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Input
                              type="number"
                              value={String(editingClient.ratePerM2)}
                              onChange={(event) => setEditingClient({ ...editingClient, ratePerM2: Number(event.target.value) })}
                              className="h-9 border-slate-200"
                            />
                          </TableCell>
                          <TableCell className="px-5 py-4 font-medium text-slate-900">
                            {formatRupiah(editingClient.areaM2 * editingClient.rackLevels * editingClient.ratePerM2)}
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Select
                              value={editingClient.status}
                              onValueChange={(value) => { if (value) setEditingClient({ ...editingClient, status: value as ClientStatus }) }}
                            >
                              <SelectTrigger className="h-9 w-full border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">active</SelectItem>
                                <SelectItem value="inactive">inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-5 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button type="button" size="sm" className="cursor-pointer bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700" onClick={saveEditClient}>
                                Save
                              </Button>
                              <Button type="button" size="sm" variant="outline" className="cursor-pointer" onClick={cancelEditClient}>
                                Cancel
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    }

                    return (
                      <TableRow key={client.id} className="border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30">
                        <TableCell className="px-5 py-4 font-medium text-slate-900">{client.name}</TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge variant="outline" className={getClientTypeBadgeClass(client.type)}>
                            {clientTypeLabels[client.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge variant="outline" className={getContractBadgeClass(client.contractType)}>
                            {contractTypeLabels[client.contractType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600">
                          {formatNumber(client.areaM2)} m²
                        </TableCell>
                        <TableCell className="px-5 py-4 text-slate-600">
                          {formatRupiah(client.ratePerM2)}
                        </TableCell>
                        <TableCell className="px-5 py-4 font-medium text-slate-900">
                          {formatRupiah(client.areaM2 * client.rackLevels * client.ratePerM2)}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <Badge variant="outline" className={getClientStatusBadgeClass(client.status)}>
                            {clientStatusLabels[client.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button type="button" size="sm" variant="outline" className="cursor-pointer" onClick={() => startEditClient(client)}>
                              Edit
                            </Button>
                            <Button type="button" size="sm" variant="destructive" className="cursor-pointer" onClick={() => deleteClient(client.id)}>
                              Hapus
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skus" className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-slate-200/60 bg-white/80 px-3 py-1 text-slate-700 backdrop-blur-sm">
              Total SKU: {skuStats.total}
            </Badge>
            <Badge variant="outline" className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
              Aman: {skuStats.aman}
            </Badge>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
              Menipis: {skuStats.menipis}
            </Badge>
            <Badge variant="outline" className="border-red-200 bg-red-50 px-3 py-1 text-red-700">
              Kritis: {skuStats.kritis}
            </Badge>
          </div>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle><span className="section-dot" />Tambah SKU Baru</CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <form onSubmit={handleAddSku} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Select
                    value={skuForm.clientId || undefined}
                    onValueChange={(value) => { if (value) setSkuForm((prev) => ({ ...prev, clientId: value })) }}
                  >
                    <SelectTrigger className="h-10 w-full border-slate-200">
                      <SelectValue placeholder="Pilih Klien" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="SKU Code"
                    value={skuForm.skuCode}
                    onChange={(event) => setSkuForm((prev) => ({ ...prev, skuCode: event.target.value }))}
                    className="h-10 border-slate-200"
                  />
                  <Input
                    placeholder="Nama Produk"
                    value={skuForm.name}
                    onChange={(event) => setSkuForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-10 border-slate-200"
                  />
                  <Select
                    value={skuForm.category || undefined}
                    onValueChange={(value) => { if (value) setSkuForm((prev) => ({ ...prev, category: value as SkuCategory })) }}
                  >
                    <SelectTrigger className="h-10 w-full border-slate-200">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buku">buku</SelectItem>
                      <SelectItem value="atk">atk</SelectItem>
                      <SelectItem value="modul_digital">modul_digital</SelectItem>
                      <SelectItem value="elektronik">elektronik</SelectItem>
                      <SelectItem value="lainnya">lainnya</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Unit"
                    value={skuForm.unit}
                    onChange={(event) => setSkuForm((prev) => ({ ...prev, unit: event.target.value }))}
                    className="h-10 border-slate-200"
                  />
                  <Input
                    type="number"
                    placeholder="Stok Awal"
                    value={skuForm.stockQty}
                    onChange={(event) => setSkuForm((prev) => ({ ...prev, stockQty: event.target.value }))}
                    className="h-10 border-slate-200"
                  />
                  <Input
                    type="number"
                    placeholder="Min. Stok"
                    value={skuForm.minStock}
                    onChange={(event) => setSkuForm((prev) => ({ ...prev, minStock: event.target.value }))}
                    className="h-10 border-slate-200"
                  />
                </div>

                <Button type="submit" className="h-10 w-full cursor-pointer bg-blue-600 text-white transition-colors duration-200 hover:bg-blue-700">
                  Tambah SKU
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="card-glass">
            <CardHeader className="border-b border-slate-100/80">
              <CardTitle><span className="section-dot" />Daftar SKU Simulasi</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table className="min-w-[980px]">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="px-5 py-3 text-slate-500">SKU Code</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Nama</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Klien</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Kategori</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Stok</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Min. Stok</TableHead>
                    <TableHead className="px-5 py-3 text-slate-500">Status</TableHead>
                    <TableHead className="px-5 py-3 text-right text-slate-500">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skus.map((sku) => (
                    <TableRow key={sku.id} className="border-slate-100/80 transition-colors duration-150 hover:bg-blue-50/30">
                      <TableCell className="px-5 py-4 font-medium text-slate-900">{sku.skuCode}</TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">{sku.name}</TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">
                        {clientMap.get(sku.clientId)?.name ?? "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">{sku.category}</TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">
                        {formatNumber(sku.stockQty)} {sku.unit}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-slate-600">
                        {formatNumber(sku.minStock)}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Badge variant="outline" className={getStockBadgeClass(sku.status)}>
                          {stockStatusLabels[sku.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" size="sm" variant="outline" className="cursor-pointer" onClick={() => updateSkuStock(sku)}>
                            Edit Stok
                          </Button>
                          <Button type="button" size="sm" variant="destructive" className="cursor-pointer" onClick={() => deleteSku(sku.id)}>
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
          onClick={resetSimulationData}
        >
          <RotateCcw className="size-4" />
          Reset Semua Data ke Default
        </Button>
      </div>
    </section>
  )
}
