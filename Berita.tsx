import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const BASE_URL = 'https://jsonplaceholder.typicode.com'
const ENDPOINT = '/posts' 


const ENDPOINT_UJI: Record<string, string> = {
  kosong: '/posts?userId=999999', // 200 + array kosong
  '404': '/posts/999999', // HTTP 404
}

type Post = { id: number; userId: number; title: string; body: string }

type Hasil =
  | { status: 'success'; posts: Post[] }
  | { status: 'empty' }
  | { status: 'error'; jenis: 'http' | 'jaringan' | 'data'; pesan: string }

function Berita() {
  const [params] = useSearchParams()
  const uji = params.get('uji') ?? ''
  const path = ENDPOINT_UJI[uji] ?? ENDPOINT
  const url = BASE_URL + path

  // reloadKey dinaikkan saat tombol "Muat ulang" ditekan.
  const [reloadKey, setReloadKey] = useState(0)
  const requestId = `${url}#${reloadKey}`

  // Hasil disimpan bersama id request-nya. Selama id hasil belum sama dengan
  // request yang sedang aktif, halaman dianggap masih memuat.
  const [hasil, setHasil] = useState<{ id: string; data: Hasil } | null>(null)
  const memuat = hasil === null || hasil.id !== requestId

  useEffect(() => {
    const controller = new AbortController()

    async function muat() {
      let data: Hasil
      try {
        const res = await fetch(url, { signal: controller.signal })

        // Periksa status SEBELUM mengolah data.
        if (!res.ok) {
          data = {
            status: 'error',
            jenis: 'http',
            pesan: `Server menjawab dengan status HTTP ${res.status}. Data yang diminta tidak dapat diambil.`,
          }
        } else {
          const json: unknown = await res.json()
          if (!Array.isArray(json)) {
            data = { status: 'error', jenis: 'data', pesan: 'Format data dari server tidak sesuai (bukan daftar berita).' }
          } else if (json.length === 0) {
            data = { status: 'empty' }
          } else {
            data = { status: 'success', posts: (json as Post[]).slice(0, 10) }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return // komponen ditutup / request diganti
        data =
          err instanceof TypeError
            ? {
                status: 'error',
                jenis: 'jaringan',
                pesan: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.',
              }
            : { status: 'error', jenis: 'data', pesan: 'Respons dari server tidak dapat dibaca sebagai data JSON.' }
      }
      setHasil({ id: requestId, data })
    }

    muat()
    return () => controller.abort()
  }, [url, requestId])

  return (
    <>
      <h2>Berita</h2>
      <p className="meta sumber">Data latihan dari JSONPlaceholder</p>
      {uji in ENDPOINT_UJI && <p className="mode-uji">Mode uji aktif: {BASE_URL + path}</p>}

      {memuat && <p className="status" role="status">Data sedang dimuat...</p>}

      {!memuat && hasil.data.status === 'empty' && (
        <p className="status tidak-ada" role="status">Belum ada berita.</p>
      )}

      {!memuat && hasil.data.status === 'error' && (
        <div className="status gagal" role="alert">
          <strong>{hasil.data.jenis === 'jaringan' ? 'Koneksi gagal' : 'Gagal memuat berita'}</strong>
          <p>{hasil.data.pesan}</p>
          <button type="button" className="tombol" onClick={() => setReloadKey((k) => k + 1)}>Muat ulang</button>
        </div>
      )}

      {!memuat && hasil.data.status === 'success' && (
        <>
          <div className="info-hasil">Menampilkan {hasil.data.posts.length} berita</div>
          {hasil.data.posts.map((post) => (
            <article className="pengumuman" key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <div className="meta">ID penulis: {post.userId} · Tanggal terbit: Tidak tersedia</div>
            </article>
          ))}
        </>
      )}
    </>
  )
}

export default Berita
