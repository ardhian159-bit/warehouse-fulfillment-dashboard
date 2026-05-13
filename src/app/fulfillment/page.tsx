"use client"

import { useEffect, useState, useMemo } from "react"
import { CheckCircle2, ClipboardList, Info, PackagePlus, PackageMinus, RefreshCcw, HandHeart, Trash2, CheckCircle } from "lucide-react"

import clientsData from "@/data/mock/clients.json"
import skusData from "@/data/mock/skus.json"
import { formatRupiah, formatNumber } from "@/lib/utils"
import type { 
  Client, SKU, InboundRecord, OutboundRecord, ReturnRecord, 
  WithdrawalRecord, ExpiredRecord, InboundStatus, OutboundStatus, 
  ReturnStatus, WithdrawalStatus, ExpiredStatus, ExpiredAction 
} from "@/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

const clients = clientsData as Client[]
const allSkus = skusData as SKU[]

function InboundTab({ clients, allSkus, data, onSave, onSuccess }: any) {
  const [clientId, setClientId] = useState("")
  const [skuId, setSkuId] = useState("")
  const [batchCode, setBatchCode] = useState(`BATCH-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`)
  const [qtyPallet, setQtyPallet] = useState("")
  const [qtyUnit, setQtyUnit] = useState("")
  const [receivedAt, setReceivedAt] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const filteredSkus = useMemo(() => allSkus.filter((s: SKU) => s.clientId === clientId), [clientId, allSkus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !skuId || !batchCode || !qtyPallet || !qtyUnit || !receivedAt) return
    
    const client = clients.find((c: Client) => c.id === clientId)
    const sku = allSkus.find((s: SKU) => s.id === skuId)
    
    const newRecord: InboundRecord = {
      id: 'in-' + Date.now(),
      clientId,
      clientName: client?.name || "",
      skuId,
      skuName: sku?.name || "",
      batchCode,
      qtyPallet: Number(qtyPallet),
      qtyUnit: Number(qtyUnit),
      notes,
      receivedAt,
      status: 'diterima'
    }
    
    onSave([newRecord, ...data])
    onSuccess("Data berhasil dicatat")
    
    setClientId("")
    setSkuId("")
    setBatchCode(`BATCH-${new Date().toISOString().split("T")[0].replace(/-/g, "")}`)
    setQtyPallet("")
    setQtyUnit("")
    setNotes("")
  }

  const markComplete = (id: string) => {
    onSave(data.map((d: InboundRecord) => d.id === id ? { ...d, status: 'selesai' } : d))
  }

  return (
    <>
      <Card className="card-glass border-blue-100">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Form Penerimaan Barang</CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Rp 100.000/batch</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Klien</label>
                <Select value={clientId} onValueChange={(val) => val && setClientId(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                  <SelectContent>{clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih SKU</label>
                <Select value={skuId} onValueChange={(val) => val && setSkuId(val)} disabled={!clientId} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder={clientId ? "Pilih SKU" : "Pilih klien terlebih dahulu"} /></SelectTrigger>
                  <SelectContent>{filteredSkus.map((s: SKU) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Batch Code</label>
                <Input value={batchCode} onChange={(e) => setBatchCode(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty Palet</label>
                <Input type="number" min="0" value={qtyPallet} onChange={(e) => setQtyPallet(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty Unit</label>
                <Input type="number" min="0" value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Tanggal Terima</label>
                <Input type="date" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2 col-span-4">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50" 
                />
              </div>
              <Button type="submit" className="w-full col-span-4 bg-blue-600 hover:bg-blue-700 text-white mt-2">Catat Inbound</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <CardTitle>Riwayat Inbound</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada data Inbound</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Batch Code</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty Palet</TableHead>
                  <TableHead className="text-right">Qty Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: InboundRecord) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.receivedAt}</TableCell>
                    <TableCell className="font-medium">{row.batchCode}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.skuName}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qtyPallet)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qtyUnit)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={row.status === 'selesai' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}>
                        {row.status === 'selesai' ? 'Selesai' : 'Diterima'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status !== 'selesai' && (
                        <Button variant="outline" size="sm" onClick={() => markComplete(row.id)} className="h-8 text-xs">Selesaikan</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function OutboundTab({ clients, allSkus, data, onSave, onSuccess }: any) {
  const [clientId, setClientId] = useState("")
  const [skuId, setSkuId] = useState("")
  const [orderRef, setOrderRef] = useState("")
  const [destination, setDestination] = useState("")
  const [courier, setCourier] = useState("")
  const [qty, setQty] = useState("")
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split("T")[0])

  const filteredSkus = useMemo(() => allSkus.filter((s: SKU) => s.clientId === clientId), [clientId, allSkus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !skuId || !orderRef || !destination || !courier || !qty || !createdAt) return
    
    const client = clients.find((c: Client) => c.id === clientId)
    const sku = allSkus.find((s: SKU) => s.id === skuId)
    
    const newRecord: OutboundRecord = {
      id: 'out-' + Date.now(),
      clientId,
      clientName: client?.name || "",
      skuId,
      skuName: sku?.name || "",
      orderRef,
      destination,
      courier,
      qty: Number(qty),
      status: 'pending',
      createdAt
    }
    
    onSave([newRecord, ...data])
    onSuccess("Data berhasil dicatat")
    
    setClientId("")
    setSkuId("")
    setOrderRef("")
    setDestination("")
    setCourier("")
    setQty("")
  }

  const advanceStatus = (id: string, current: OutboundStatus) => {
    const nextStatus: Record<string, OutboundStatus> = {
      'pending': 'picking',
      'picking': 'packing',
      'packing': 'siap_kirim',
      'siap_kirim': 'terkirim'
    }
    const next = nextStatus[current]
    if (next) {
      onSave(data.map((d: OutboundRecord) => d.id === id ? { ...d, status: next, shippedAt: next === 'terkirim' ? new Date().toISOString().split("T")[0] : d.shippedAt } : d))
    }
  }

  const getStatusBadge = (status: OutboundStatus) => {
    switch (status) {
      case 'pending': return "bg-slate-50 text-slate-700 border-slate-200"
      case 'picking': return "bg-blue-50 text-blue-700 border-blue-200"
      case 'packing': return "bg-purple-50 text-purple-700 border-purple-200"
      case 'siap_kirim': return "bg-orange-50 text-orange-700 border-orange-200"
      case 'terkirim': return "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
  }

  const getStatusLabel = (status: OutboundStatus) => {
    switch (status) {
      case 'pending': return "Pending"
      case 'picking': return "Picking"
      case 'packing': return "Packing"
      case 'siap_kirim': return "Siap Kirim"
      case 'terkirim': return "Terkirim"
    }
  }

  const getNextActionLabel = (status: OutboundStatus) => {
    switch (status) {
      case 'pending': return "Mulai Picking"
      case 'picking': return "Konfirm Packing"
      case 'packing': return "Siap Kirim"
      case 'siap_kirim': return "Tandai Terkirim"
      default: return ""
    }
  }

  return (
    <>
      <Card className="card-glass border-orange-100">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Form Pengiriman Barang</CardTitle>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Rp 2.500/order + Rp 2.000/item picking & packing</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Klien</label>
                <Select value={clientId} onValueChange={(val) => val && setClientId(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                  <SelectContent>{clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih SKU</label>
                <Select value={skuId} onValueChange={(val) => val && setSkuId(val)} disabled={!clientId} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder={clientId ? "Pilih SKU" : "Pilih klien terlebih dahulu"} /></SelectTrigger>
                  <SelectContent>{filteredSkus.map((s: SKU) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Order Ref</label>
                <Input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tujuan Pengiriman</label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Kurir</label>
                <Select value={courier} onValueChange={(val) => val && setCourier(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih kurir" /></SelectTrigger>
                  <SelectContent>
                    {["JNE", "J&T", "SiCepat", "AnterAja", "Wahana", "Internal"].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty</label>
                <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-slate-700">Tanggal</label>
                <Input type="date" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} required className="bg-white/60" />
              </div>
              <Button type="submit" className="w-full col-span-4 bg-orange-500 hover:bg-orange-600 text-white mt-2">Buat Order Outbound</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <CardTitle>Riwayat Outbound</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada data Outbound</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Order Ref</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tujuan</TableHead>
                  <TableHead>Kurir</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: OutboundRecord) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell className="font-medium">{row.orderRef}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.skuName}</TableCell>
                    <TableCell>{row.destination}</TableCell>
                    <TableCell>{row.courier}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qty)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadge(row.status)}>
                        {getStatusLabel(row.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status !== 'terkirim' ? (
                        <Button variant="outline" size="sm" onClick={() => advanceStatus(row.id, row.status)} className="h-8 text-xs">{getNextActionLabel(row.status)}</Button>
                      ) : (
                        <span className="text-xs font-medium text-slate-500 mr-2">Selesai</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ReturnTab({ clients, allSkus, data, onSave, onSuccess }: any) {
  const [clientId, setClientId] = useState("")
  const [skuId, setSkuId] = useState("")
  const [orderRef, setOrderRef] = useState("")
  const [reason, setReason] = useState("")
  const [qtyReturned, setQtyReturned] = useState("")
  const [createdAt, setCreatedAt] = useState(new Date().toISOString().split("T")[0])

  const filteredSkus = useMemo(() => allSkus.filter((s: SKU) => s.clientId === clientId), [clientId, allSkus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !skuId || !orderRef || !reason || !qtyReturned || !createdAt) return
    
    const client = clients.find((c: Client) => c.id === clientId)
    const sku = allSkus.find((s: SKU) => s.id === skuId)
    
    const newRecord: ReturnRecord = {
      id: 'ret-' + Date.now(),
      clientId,
      clientName: client?.name || "",
      skuId,
      skuName: sku?.name || "",
      orderRef,
      reason,
      qtyReturned: Number(qtyReturned),
      status: 'diterima',
      createdAt
    }
    
    onSave([newRecord, ...data])
    onSuccess("Data berhasil dicatat")
    
    setClientId("")
    setSkuId("")
    setOrderRef("")
    setReason("")
    setQtyReturned("")
  }

  const advanceStatus = (id: string, current: ReturnStatus) => {
    const nextStatus: Record<string, ReturnStatus> = {
      'diterima': 'diproses',
      'diproses': 'selesai'
    }
    const next = nextStatus[current]
    if (next) {
      onSave(data.map((d: ReturnRecord) => d.id === id ? { ...d, status: next } : d))
    }
  }

  return (
    <>
      <Card className="card-glass border-purple-100">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Form Retur Barang</CardTitle>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Rp 2.000/item</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Klien</label>
                <Select value={clientId} onValueChange={(val) => val && setClientId(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                  <SelectContent>{clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih SKU</label>
                <Select value={skuId} onValueChange={(val) => val && setSkuId(val)} disabled={!clientId} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder={clientId ? "Pilih SKU" : "Pilih klien terlebih dahulu"} /></SelectTrigger>
                  <SelectContent>{filteredSkus.map((s: SKU) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Order Ref asal</label>
                <Input value={orderRef} onChange={(e) => setOrderRef(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Alasan Retur</label>
                <Select value={reason} onValueChange={(val) => val && setReason(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih alasan" /></SelectTrigger>
                  <SelectContent>
                    {["Barang Rusak", "Salah Kirim", "Kelebihan Qty", "Expired", "Lainnya"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty Dikembalikan</label>
                <Input type="number" min="1" value={qtyReturned} onChange={(e) => setQtyReturned(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2 col-span-3">
                <label className="text-sm font-medium text-slate-700">Tanggal</label>
                <Input type="date" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} required className="bg-white/60" />
              </div>
              <Button type="submit" className="w-full col-span-4 bg-purple-600 hover:bg-purple-700 text-white mt-2">Catat Retur</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <CardTitle>Riwayat Retur</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada data Return</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Order Ref</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Alasan</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: ReturnRecord) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.createdAt}</TableCell>
                    <TableCell className="font-medium">{row.orderRef}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.skuName}</TableCell>
                    <TableCell>{row.reason}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qtyReturned)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={row.status === 'selesai' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : row.status === 'diproses' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"}>
                        {row.status === 'selesai' ? 'Selesai' : row.status === 'diproses' ? 'Diproses' : 'Diterima'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status !== 'selesai' && (
                        <Button variant="outline" size="sm" onClick={() => advanceStatus(row.id, row.status)} className="h-8 text-xs">
                          {row.status === 'diterima' ? 'Proses' : 'Selesaikan'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function WithdrawalTab({ clients, allSkus, data, onSave, onSuccess }: any) {
  const [clientId, setClientId] = useState("")
  const [skuId, setSkuId] = useState("")
  const [qtyPallet, setQtyPallet] = useState("")
  const [qtyUnit, setQtyUnit] = useState("")
  const [requestedAt, setRequestedAt] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const filteredSkus = useMemo(() => allSkus.filter((s: SKU) => s.clientId === clientId), [clientId, allSkus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !skuId || !qtyPallet || !qtyUnit || !requestedAt) return
    
    const client = clients.find((c: Client) => c.id === clientId)
    const sku = allSkus.find((s: SKU) => s.id === skuId)
    
    const newRecord: WithdrawalRecord = {
      id: 'wd-' + Date.now(),
      clientId,
      clientName: client?.name || "",
      skuId,
      skuName: sku?.name || "",
      qtyPallet: Number(qtyPallet),
      qtyUnit: Number(qtyUnit),
      notes,
      requestedAt,
      status: 'pending'
    }
    
    onSave([newRecord, ...data])
    onSuccess("Data berhasil dicatat")
    
    setClientId("")
    setSkuId("")
    setQtyPallet("")
    setQtyUnit("")
    setNotes("")
  }

  const advanceStatus = (id: string, current: WithdrawalStatus) => {
    const nextStatus: Record<string, WithdrawalStatus> = {
      'pending': 'diproses',
      'diproses': 'selesai'
    }
    const next = nextStatus[current]
    if (next) {
      onSave(data.map((d: WithdrawalRecord) => d.id === id ? { ...d, status: next } : d))
    }
  }

  return (
    <>
      <Card className="card-glass border-sky-100">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Form Penarikan Stok</CardTitle>
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">Rp 500/palet</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Klien</label>
                <Select value={clientId} onValueChange={(val) => val && setClientId(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                  <SelectContent>{clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih SKU</label>
                <Select value={skuId} onValueChange={(val) => val && setSkuId(val)} disabled={!clientId} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder={clientId ? "Pilih SKU" : "Pilih klien terlebih dahulu"} /></SelectTrigger>
                  <SelectContent>{filteredSkus.map((s: SKU) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty Palet</label>
                <Input type="number" min="0" value={qtyPallet} onChange={(e) => setQtyPallet(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty Unit</label>
                <Input type="number" min="0" value={qtyUnit} onChange={(e) => setQtyUnit(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2 col-span-4">
                <label className="text-sm font-medium text-slate-700">Tanggal Request</label>
                <Input type="date" value={requestedAt} onChange={(e) => setRequestedAt(e.target.value)} required className="bg-white/60 max-w-xs" />
              </div>
              <div className="space-y-2 col-span-4">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50" 
                />
              </div>
              <Button type="submit" className="w-full col-span-4 bg-sky-600 hover:bg-sky-700 text-white mt-2">Ajukan Penarikan</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <CardTitle>Riwayat Penarikan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada data Withdrawal</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty Palet</TableHead>
                  <TableHead className="text-right">Qty Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: WithdrawalRecord) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.requestedAt}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.skuName}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qtyPallet)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qtyUnit)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={row.status === 'selesai' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : row.status === 'diproses' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-slate-50 text-slate-700 border-slate-200"}>
                        {row.status === 'selesai' ? 'Selesai' : row.status === 'diproses' ? 'Diproses' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status !== 'selesai' && (
                        <Button variant="outline" size="sm" onClick={() => advanceStatus(row.id, row.status)} className="h-8 text-xs">
                          {row.status === 'pending' ? 'Proses' : 'Selesaikan'}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ExpiredTab({ clients, allSkus, data, onSave, onSuccess }: any) {
  const [clientId, setClientId] = useState("")
  const [skuId, setSkuId] = useState("")
  const [qty, setQty] = useState("")
  const [action, setAction] = useState("")
  const [handledAt, setHandledAt] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")

  const filteredSkus = useMemo(() => allSkus.filter((s: SKU) => s.clientId === clientId), [clientId, allSkus])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !skuId || !qty || !action || !handledAt) return
    
    const client = clients.find((c: Client) => c.id === clientId)
    const sku = allSkus.find((s: SKU) => s.id === skuId)
    
    const newRecord: ExpiredRecord = {
      id: 'exp-' + Date.now(),
      clientId,
      clientName: client?.name || "",
      skuId,
      skuName: sku?.name || "",
      qty: Number(qty),
      action: action as ExpiredAction,
      notes,
      handledAt,
      status: 'pending'
    }
    
    onSave([newRecord, ...data])
    onSuccess("Data berhasil dicatat")
    
    setClientId("")
    setSkuId("")
    setQty("")
    setAction("")
    setNotes("")
  }

  const markComplete = (id: string) => {
    onSave(data.map((d: ExpiredRecord) => d.id === id ? { ...d, status: 'selesai' } : d))
  }

  return (
    <>
      <Card className="card-glass border-rose-100">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Form Barang Kedaluwarsa</CardTitle>
            <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">Rp 2.000/item</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih Klien</label>
                <Select value={clientId} onValueChange={(val) => val && setClientId(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih klien" /></SelectTrigger>
                  <SelectContent>{clients.map((c: Client) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Pilih SKU</label>
                <Select value={skuId} onValueChange={(val) => val && setSkuId(val)} disabled={!clientId} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder={clientId ? "Pilih SKU" : "Pilih klien terlebih dahulu"} /></SelectTrigger>
                  <SelectContent>{filteredSkus.map((s: SKU) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Qty</label>
                <Input type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} required className="bg-white/60" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tindakan</label>
                <Select value={action} onValueChange={(val) => val && setAction(val)} required>
                  <SelectTrigger className="bg-white/60"><SelectValue placeholder="Pilih tindakan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pemusnahan">Pemusnahan</SelectItem>
                    <SelectItem value="pengembalian">Pengembalian ke Klien</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-4">
                <label className="text-sm font-medium text-slate-700">Tanggal</label>
                <Input type="date" value={handledAt} onChange={(e) => setHandledAt(e.target.value)} required className="bg-white/60 max-w-xs" />
              </div>
              <div className="space-y-2 col-span-4">
                <label className="text-sm font-medium text-slate-700">Notes</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white/60 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50" 
                />
              </div>
              <Button type="submit" className="w-full col-span-4 bg-rose-600 hover:bg-rose-700 text-white mt-2">Catat Expired</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="card-glass">
        <CardHeader className="border-b border-slate-100/80 pb-4">
          <CardTitle>Riwayat Expired</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {data.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Belum ada data Expired</div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Klien</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tindakan</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row: ExpiredRecord) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.handledAt}</TableCell>
                    <TableCell>{row.clientName}</TableCell>
                    <TableCell>{row.skuName}</TableCell>
                    <TableCell className="capitalize">{row.action}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.qty)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={row.status === 'selesai' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-700 border-slate-200"}>
                        {row.status === 'selesai' ? 'Selesai' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {row.status !== 'selesai' && (
                        <Button variant="outline" size="sm" onClick={() => markComplete(row.id)} className="h-8 text-xs">Selesaikan</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}

export default function FulfillmentPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("inbound")
  const [successMsg, setSuccessMsg] = useState("")

  const [inboundData, setInboundData] = useState<InboundRecord[]>([])
  const [outboundData, setOutboundData] = useState<OutboundRecord[]>([])
  const [returnData, setReturnData] = useState<ReturnRecord[]>([])
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalRecord[]>([])
  const [expiredData, setExpiredData] = useState<ExpiredRecord[]>([])

  useEffect(() => {
    setIsMounted(true)
    const iData = localStorage.getItem("ff_inbound")
    if (iData) setInboundData(JSON.parse(iData))
    const oData = localStorage.getItem("ff_outbound")
    if (oData) setOutboundData(JSON.parse(oData))
    const rData = localStorage.getItem("ff_return")
    if (rData) setReturnData(JSON.parse(rData))
    const wData = localStorage.getItem("ff_withdrawal")
    if (wData) setWithdrawalData(JSON.parse(wData))
    const eData = localStorage.getItem("ff_expired")
    if (eData) setExpiredData(JSON.parse(eData))
  }, [])

  const saveInbound = (data: InboundRecord[]) => {
    setInboundData(data)
    localStorage.setItem("ff_inbound", JSON.stringify(data))
  }
  const saveOutbound = (data: OutboundRecord[]) => {
    setOutboundData(data)
    localStorage.setItem("ff_outbound", JSON.stringify(data))
  }
  const saveReturn = (data: ReturnRecord[]) => {
    setReturnData(data)
    localStorage.setItem("ff_return", JSON.stringify(data))
  }
  const saveWithdrawal = (data: WithdrawalRecord[]) => {
    setWithdrawalData(data)
    localStorage.setItem("ff_withdrawal", JSON.stringify(data))
  }
  const saveExpired = (data: ExpiredRecord[]) => {
    setExpiredData(data)
    localStorage.setItem("ff_expired", JSON.stringify(data))
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  const [selClientId, setSelClientId] = useState("")
  const filteredSkus = useMemo(() => allSkus.filter(s => s.clientId === selClientId), [selClientId])

  if (!isMounted) return null

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between animate-fade-in-up">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-600">
            <span className="section-dot" />
            Fulfillment Operations
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
            Fulfillment Operations
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            Kelola aktivitas operasional gudang harian
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 animate-fade-in-up">
          <CheckCircle className="size-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-800">{successMsg}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full animate-fade-in-up">
        <TabsList className="mb-6 grid w-full grid-cols-5 bg-white/60 p-1 backdrop-blur-sm border border-slate-200/60 rounded-xl h-auto">
          <TabsTrigger value="inbound" className="rounded-lg py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Inbound
          </TabsTrigger>
          <TabsTrigger value="outbound" className="rounded-lg py-2.5 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Outbound
          </TabsTrigger>
          <TabsTrigger value="return" className="rounded-lg py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Return
          </TabsTrigger>
          <TabsTrigger value="withdrawal" className="rounded-lg py-2.5 data-[state=active]:bg-sky-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Withdrawal
          </TabsTrigger>
          <TabsTrigger value="expired" className="rounded-lg py-2.5 data-[state=active]:bg-rose-600 data-[state=active]:text-white data-[state=active]:shadow-sm">
            Expired
          </TabsTrigger>
        </TabsList>
        <TabsContent value="inbound" className="space-y-6 mt-0">
          <InboundTab 
            clients={clients} 
            allSkus={allSkus} 
            data={inboundData} 
            onSave={saveInbound} 
            onSuccess={showSuccess} 
          />
        </TabsContent>

        <TabsContent value="outbound" className="space-y-6 mt-0">
          <OutboundTab 
            clients={clients} 
            allSkus={allSkus} 
            data={outboundData} 
            onSave={saveOutbound} 
            onSuccess={showSuccess} 
          />
        </TabsContent>
        <TabsContent value="return" className="space-y-6 mt-0">
          <ReturnTab clients={clients} allSkus={allSkus} data={returnData} onSave={saveReturn} onSuccess={showSuccess} />
        </TabsContent>

        <TabsContent value="withdrawal" className="space-y-6 mt-0">
          <WithdrawalTab clients={clients} allSkus={allSkus} data={withdrawalData} onSave={saveWithdrawal} onSuccess={showSuccess} />
        </TabsContent>

        <TabsContent value="expired" className="space-y-6 mt-0">
          <ExpiredTab clients={clients} allSkus={allSkus} data={expiredData} onSave={saveExpired} onSuccess={showSuccess} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
