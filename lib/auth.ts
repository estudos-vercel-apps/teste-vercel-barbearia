import { supabase } from "./supabase"

export async function signUp(email: string, password: string, fullName: string, phone: string) {
  // Primeiro, fazer o signup no Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  })

  if (error) throw error

  // O trigger handle_new_user() deve criar automaticamente o perfil
  // Mas vamos verificar se foi criado e criar manualmente se necessário
  if (data.user) {
    // Aguardar um pouco para o trigger executar
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Verificar se o perfil foi criado
    const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", data.user.id).single()

    // Se não existe, tentar criar manualmente
    if (!existingProfile) {
      try {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          phone: phone,
        })

        if (profileError) {
          console.warn("Manual profile creation failed:", profileError)
          // Não lançar erro, pois o usuário foi criado com sucesso
        }
      } catch (profileErr) {
        console.warn("Manual profile creation error:", profileErr)
      }
    }
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

    if (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }

    return data
  } catch (err) {
    console.error("Error in getUserProfile:", err)
    throw err
  }
}
