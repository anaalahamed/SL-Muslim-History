import { supabase } from '../supabase'
import { Author } from '../types'

const mockAuthors: Author[] = [
  { id: '1', name: 'Admin', name_ta: 'நிர்வாகி', bio: '', profile_link: '', avatar_url: '', created_at: new Date().toISOString() },
]

export async function getAuthors(): Promise<Author[]> {
  if (!supabase) return mockAuthors
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true })
  if (error || !data) return mockAuthors
  return data as Author[]
}

export async function getAuthorById(id: string): Promise<Author | null> {
  if (!supabase) return mockAuthors.find((a) => a.id === id) ?? null
  const { data, error } = await supabase.from('authors').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Author
}

export async function saveAuthor(author: Partial<Author>): Promise<{ data: Author | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase not configured' }
  if (author.id) {
    const { id, ...rest } = author
    const { data, error } = await supabase.from('authors').update(rest).eq('id', id).select().single()
    return { data: data as Author | null, error: error?.message ?? null }
  }
  const payload = { ...author, created_at: new Date().toISOString() }
  const { data, error } = await supabase.from('authors').insert(payload).select().single()
  return { data: data as Author | null, error: error?.message ?? null }
}

export async function deleteAuthor(id: string): Promise<string | null> {
  if (!supabase) return 'Supabase not configured'
  const { error } = await supabase.from('authors').delete().eq('id', id)
  return error?.message ?? null
}
